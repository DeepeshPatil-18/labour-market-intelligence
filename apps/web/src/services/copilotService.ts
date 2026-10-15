/**
 * KUSHAL Planning Copilot — Natural-Language Query Service (Phase 1)
 *
 * Architecture:
 *   1. normalise()   – lowercase + strip punctuation
 *   2. parseIntent() – deterministic keyword matching → QueryPlan
 *   3. validatePlan() – allowlist check; returns validation errors
 *   4. executePlan() – calls existing data services → CopilotResult
 *
 * No secrets, no external API calls, no fabricated data.
 * All results are derived from existing JSON datasets via the existing services.
 */

import { labourMarketService } from './labourMarketService';
import { forecastService } from './forecastService';
import { trainingService } from './trainingService';
import { alertService } from './alertService';
import { mapDataService } from './mapDataService';

// ─── Supported Intent Types ───────────────────────────────────────────────────
export type CopilotIntent =
  | 'SKILL_DEMAND_BY_STATE'         // top demanded skills in a state
  | 'CRITICAL_SKILL_SHORTAGE'       // occupations/skills with critical shortage
  | 'COMPARE_STATES'                // compare two states
  | 'OVERSUPPLY_RISK'               // skills approaching oversupply
  | 'TRAINING_PRIORITY'             // training allocation priority
  | 'FORECAST'                      // demand forecast for a horizon
  | 'EARLY_WARNINGS'                // active early warning alerts
  | 'STATE_OVERVIEW'                // state labour market overview
  | 'NATIONAL_OVERVIEW'             // all-India summary
  | 'UNSUPPORTED';                  // could not parse a supported intent

// ─── Query Plan ───────────────────────────────────────────────────────────────
export interface QueryPlan {
  intent: CopilotIntent;
  stateA?: string;           // primary state (or stateA for comparison)
  stateB?: string;           // secondary state (comparison only)
  district?: string;
  sector?: string;
  horizon?: '3m' | '6m' | '12m';
  limit?: number;
  rawQuery: string;
  detectedLang: 'EN' | 'HI';
}

// ─── Result Types ─────────────────────────────────────────────────────────────
export interface CopilotMetric {
  label: string;
  value: string | number;
  unit?: string;
  badge?: 'critical' | 'warning' | 'healthy' | 'info' | 'neutral';
}

export interface CopilotTableRow {
  [key: string]: string | number;
}

export interface CopilotResult {
  plan: QueryPlan;
  isValid: boolean;
  validationError?: string;

  // Answer
  headline: string;           // one-sentence direct answer
  metrics?: CopilotMetric[];  // KPI tiles
  tableColumns?: string[];    // column headers for table
  tableRows?: CopilotTableRow[];
  chartData?: Array<{ label: string; value: number; value2?: number }>; // bar chart

  // Provenance
  scope: string;              // e.g. "Maharashtra · All Sectors"
  dataSource: string;         // dataset name(s)
  dataStatus: 'SYNTHETIC_DEVELOPMENT' | 'MODELED_FORECAST' | 'REFERENCE';
  methodology: string;        // short explanation of derivation
  disclaimer?: string;
}

// ─── ALLOWLIST ────────────────────────────────────────────────────────────────
const SUPPORTED_INTENTS: CopilotIntent[] = [
  'SKILL_DEMAND_BY_STATE',
  'CRITICAL_SKILL_SHORTAGE',
  'COMPARE_STATES',
  'OVERSUPPLY_RISK',
  'TRAINING_PRIORITY',
  'FORECAST',
  'EARLY_WARNINGS',
  'STATE_OVERVIEW',
  'NATIONAL_OVERVIEW',
];

// All 36 Indian state/UT names (canonical lowercase for matching)
const ALL_STATES: string[] = [
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
  'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
  'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
  'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
  'andaman and nicobar islands', 'andaman & nicobar islands',
  'chandigarh', 'dadra & nagar haveli and daman & diu', 'delhi',
  'jammu & kashmir', 'jammu and kashmir', 'ladakh', 'lakshadweep', 'puducherry'
];

// Hindi → English state name map for parser
const HINDI_STATE_MAP: Record<string, string> = {
  'महाराष्ट्र': 'maharashtra',
  'गुजरात': 'gujarat',
  'कर्नाटक': 'karnataka',
  'तमिलनाडु': 'tamil nadu',
  'राजस्थान': 'rajasthan',
  'उत्तर प्रदेश': 'uttar pradesh',
  'मध्य प्रदेश': 'madhya pradesh',
  'पश्चिम बंगाल': 'west bengal',
  'बिहार': 'bihar',
  'तेलंगाना': 'telangana',
  'आंध्र प्रदेश': 'andhra pradesh',
  'दिल्ली': 'delhi',
  'हरियाणा': 'haryana',
  'पंजाब': 'punjab',
  'केरल': 'kerala',
  'झारखंड': 'jharkhand',
  'असम': 'assam',
  'उत्तराखंड': 'uttarakhand',
  'छत्तीसगढ़': 'chhattisgarh',
  'ओडिशा': 'odisha',
  'गोवा': 'goa',
};

// ─── Language Detection ───────────────────────────────────────────────────────
function detectLanguage(query: string): 'EN' | 'HI' {
  // Simple heuristic: presence of Devanagari script characters
  const devanagariPattern = /[\u0900-\u097F]/;
  return devanagariPattern.test(query) ? 'HI' : 'EN';
}

// ─── State Extractor ─────────────────────────────────────────────────────────
function extractStates(query: string, lang: 'EN' | 'HI'): { stateA?: string; stateB?: string } {
  const lower = query.toLowerCase();
  const found: string[] = [];

  if (lang === 'HI') {
    for (const [hi, en] of Object.entries(HINDI_STATE_MAP)) {
      if (query.includes(hi)) {
        found.push(en);
      }
    }
  }

  for (const state of ALL_STATES) {
    if (lower.includes(state)) {
      const canonical = toCanonical(state);
      if (!found.includes(state) && !found.includes(canonical)) {
        found.push(state);
      }
    }
  }

  const unique = [...new Set(found)];
  return {
    stateA: unique[0] ? toCanonical(unique[0]) : undefined,
    stateB: unique[1] ? toCanonical(unique[1]) : undefined,
  };
}

function toCanonical(lower: string): string {
  // Title-case helper to produce canonical state name
  return lower.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── District Extractor ───────────────────────────────────────────────────────
function extractDistrict(query: string): string | undefined {
  const lower = query.toLowerCase();
  if (lower.includes('nashik') || lower.includes('nasik') || lower.includes('नासिक') || lower.includes('नाशिक')) {
    return 'Nashik';
  }
  if (lower.includes('pune') || lower.includes('पुणे')) {
    return 'Pune';
  }
  if (lower.includes('mumbai') || lower.includes('मुंबई')) {
    return 'Mumbai';
  }
  if (lower.includes('nagpur') || lower.includes('नागपुर')) {
    return 'Nagpur';
  }
  return undefined;
}

// ─── Horizon Extractor ────────────────────────────────────────────────────────
function extractHorizon(query: string): '3m' | '6m' | '12m' {
  const lower = query.toLowerCase();
  if (lower.includes('12 month') || lower.includes('year') || lower.includes('annual') ||
      lower.includes('12 महीने') || lower.includes('वर्ष')) return '12m';
  if (lower.includes('3 month') || lower.includes('quarter') ||
      lower.includes('3 महीने') || lower.includes('तीन महीने')) return '3m';
  return '6m'; // default
}

// ─── Intent Parser ────────────────────────────────────────────────────────────
export function parseIntent(rawQuery: string): QueryPlan {
  const lang = detectLanguage(rawQuery);
  const lower = rawQuery.toLowerCase();
  let { stateA, stateB } = extractStates(rawQuery, lang);
  const district = extractDistrict(rawQuery);
  if (district && !stateA) {
    stateA = 'Maharashtra';
  }
  const horizon = extractHorizon(rawQuery);

  // ── COMPARE_STATES ──
  const isCompare =
    lower.includes('compare') || lower.includes('comparison') ||
    lower.includes('vs') || lower.includes('versus') ||
    lower.includes('तुलना');
  if (isCompare && stateA && stateB) {
    return { intent: 'COMPARE_STATES', stateA, stateB, district, horizon, rawQuery, detectedLang: lang };
  }

  // ── OVERSUPPLY_RISK ──
  const isOversupply =
    lower.includes('oversupply') || lower.includes('over supply') ||
    lower.includes('surplus') || lower.includes('saturated') || lower.includes('saturation') ||
    lower.includes('अधिशेष') || lower.includes('अधिक आपूर्ति') || lower.includes('अधिक supply');
  if (isOversupply) {
    return { intent: 'OVERSUPPLY_RISK', stateA, district, horizon, rawQuery, detectedLang: lang };
  }

  // ── TRAINING_PRIORITY ──
  const isTraining =
    lower.includes('training') || lower.includes('iti') || lower.includes('seat') ||
    lower.includes('allocation') || lower.includes('capacity') || lower.includes('pmkvy') ||
    lower.includes('प्रशिक्षण') || lower.includes('आवंटन') || lower.includes('क्षमता');
  if (isTraining) {
    return { intent: 'TRAINING_PRIORITY', stateA, district, horizon, rawQuery, detectedLang: lang };
  }

  // ── FORECAST ──
  const isForecast =
    lower.includes('forecast') || lower.includes('predict') || lower.includes('project') ||
    lower.includes('next') || lower.includes('future') || lower.includes('trend') ||
    lower.includes('month') || lower.includes('महीने') || lower.includes('पूर्वानुमान') ||
    lower.includes('भविष्य') || lower.includes('प्रक्षेपण');
  if (isForecast) {
    return { intent: 'FORECAST', stateA, district, horizon, rawQuery, detectedLang: lang };
  }

  // ── EARLY_WARNINGS ──
  const isWarning =
    lower.includes('warning') || lower.includes('alert') || lower.includes('early') ||
    lower.includes('चेतावनी') || lower.includes('अलर्ट');
  if (isWarning) {
    return { intent: 'EARLY_WARNINGS', stateA, district, horizon, rawQuery, detectedLang: lang };
  }

  // ── CRITICAL_SKILL_SHORTAGE ──
  const isCritical =
    lower.includes('critical') || lower.includes('shortage') || lower.includes('deficit') ||
    lower.includes('which occupation') || lower.includes('which skill') ||
    lower.includes('किन व्यवसायों') || lower.includes('किन कौशलों') ||
    lower.includes('गंभीर कमी') || lower.includes('कमी है');
  if (isCritical && !stateA) {
    return { intent: 'CRITICAL_SKILL_SHORTAGE', district, horizon, rawQuery, detectedLang: lang, limit: 10 };
  }

  // ── SKILL_DEMAND_BY_STATE ── (state present + demand/skill keywords)
  const isSkillDemand =
    lower.includes('demand') || lower.includes('skill') || lower.includes('high') ||
    lower.includes('top') || lower.includes('most') || lower.includes('highest') ||
    lower.includes('मांग') || lower.includes('कौशल') || lower.includes('सबसे') ||
    lower.includes('अधिक') || lower.includes('शीर्ष');
  if (stateA) {
    return {
      intent: isCritical ? 'CRITICAL_SKILL_SHORTAGE' : 'SKILL_DEMAND_BY_STATE',
      stateA,
      district,
      horizon,
      rawQuery,
      detectedLang: lang,
      limit: 10,
    };
  }

  // ── NATIONAL_OVERVIEW ──
  const isNational =
    lower.includes('national') || lower.includes('india') || lower.includes('all india') ||
    lower.includes('all state') || lower.includes('across') ||
    lower.includes('राष्ट्रीय') || lower.includes('भारत') || lower.includes('सभी राज्य');
  if (isNational) {
    return { intent: 'NATIONAL_OVERVIEW', horizon, rawQuery, detectedLang: lang };
  }

  // ── Generic CRITICAL_SKILL_SHORTAGE (fallback when no state) ──
  if (isCritical || isSkillDemand) {
    return { intent: 'CRITICAL_SKILL_SHORTAGE', district, rawQuery, detectedLang: lang, limit: 10 };
  }

  return { intent: 'UNSUPPORTED', rawQuery, detectedLang: lang };
}

// ─── Validator ────────────────────────────────────────────────────────────────
export function validatePlan(plan: QueryPlan): { valid: boolean; error?: string } {
  if (!SUPPORTED_INTENTS.includes(plan.intent)) {
    return { valid: false, error: 'UNSUPPORTED_INTENT' };
  }
  if (plan.intent === 'COMPARE_STATES' && (!plan.stateA || !plan.stateB)) {
    return { valid: false, error: 'COMPARE_NEEDS_TWO_STATES' };
  }
  return { valid: true };
}

// ─── Query Executor ───────────────────────────────────────────────────────────
export async function executePlan(plan: QueryPlan, lang: 'EN' | 'HI'): Promise<CopilotResult> {
  const isHI = lang === 'HI';

  const validation = validatePlan(plan);
  if (!validation.valid) {
    return buildUnsupported(plan, validation.error, lang);
  }

  switch (plan.intent) {
    case 'SKILL_DEMAND_BY_STATE':    return executeSkillDemand(plan, isHI);
    case 'CRITICAL_SKILL_SHORTAGE':  return executeCriticalShortage(plan, isHI);
    case 'COMPARE_STATES':           return executeCompare(plan, isHI);
    case 'OVERSUPPLY_RISK':          return executeOversupply(plan, isHI);
    case 'TRAINING_PRIORITY':        return executeTraining(plan, isHI);
    case 'FORECAST':                 return executeForecast(plan, isHI);
    case 'EARLY_WARNINGS':           return executeWarnings(plan, isHI);
    case 'STATE_OVERVIEW':           return executeStateOverview(plan, isHI);
    case 'NATIONAL_OVERVIEW':        return executeNationalOverview(plan, isHI);
    default:                         return buildUnsupported(plan, 'UNSUPPORTED_INTENT', lang);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scopeLabel(plan: QueryPlan, isHI: boolean): string {
  if (plan.district && plan.stateA) {
    return `${plan.stateA} · ${plan.district}`;
  }
  if (plan.stateA && plan.stateB) {
    return `${plan.stateA} ${isHI ? 'एवं' : '&'} ${plan.stateB}`;
  }
  if (plan.stateA) return plan.stateA;
  return isHI ? 'अखिल भारतीय' : 'All India';
}

function badgeForStatus(status: string): 'critical' | 'warning' | 'healthy' | 'neutral' {
  if (status === 'CRITICAL SHORTAGE' || status === 'Critical') return 'critical';
  if (status === 'SHORTAGE' || status === 'Shortage') return 'warning';
  if (status === 'OVERSUPPLY' || status === 'Balanced') return 'healthy';
  return 'neutral';
}

// ─── Executor: SKILL_DEMAND_BY_STATE ─────────────────────────────────────────
async function executeSkillDemand(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const skills = await labourMarketService.getTopDemandedSkills({
    state: plan.stateA || 'ALL',
    district: plan.district,
    limit: plan.limit || 10,
  });

  const tableRows: CopilotTableRow[] = skills.map((s, i) => ({
    [isHI ? 'क्रमांक' : 'Rank']: i + 1,
    [isHI ? 'कौशल' : 'Skill']: s.skill,
    [isHI ? 'क्षेत्र' : 'Sector']: s.category,
    [isHI ? 'मांग इकाइयां' : 'Demand Units']: s.jobPostings,
    [isHI ? 'मासिक वृद्धि %' : 'Growth MoM %']: `+${s.growthMoM}%`,
    [isHI ? 'स्थिति' : 'Status']: s.severity,
  }));

  const top = skills[0];
  const locationLabel = plan.district
    ? `${plan.district} (${plan.stateA})`
    : (plan.stateA || (isHI ? 'भारत' : 'India'));

  const headline = isHI
    ? `${locationLabel} में ${top?.skill || '—'} की मांग सबसे अधिक है (${top?.jobPostings || 0} मांग इकाइयां)`
    : `${top?.skill || '—'} is the highest-demand skill in ${locationLabel} (${top?.jobPostings || 0} demand units)`;

  const metrics: CopilotMetric[] = [
    { label: isHI ? 'शीर्ष मांग कौशल' : 'Top Demand Skill', value: top?.skill || '—', badge: 'critical' },
    { label: isHI ? 'कुल मांग इकाइयां' : 'Total Demand Units', value: skills.reduce((a, s) => a + s.jobPostings, 0) },
    { label: isHI ? 'गंभीर कमी' : 'Critical Shortages', value: skills.filter(s => s.severity === 'Critical').length, badge: 'critical' },
    { label: isHI ? 'मासिक वृद्धि (औसत)' : 'Avg Growth MoM', value: top?.growthMoM ? `+${top.growthMoM}%` : '—', badge: 'info' },
  ];

  return {
    plan,
    isValid: true,
    headline,
    metrics,
    tableColumns: Object.keys(tableRows[0] || {}),
    tableRows,
    chartData: skills.slice(0, 8).map(s => ({ label: s.skill.length > 22 ? s.skill.slice(0, 22) + '…' : s.skill, value: s.jobPostings })),
    scope: scopeLabel(plan, isHI),
    dataSource: 'state_skill_gaps.json (SIH Development Dataset)',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology: isHI
      ? 'मांग इकाइयां: state_skill_gaps.json में demand_units फ़ील्ड। वृद्धि: demand_growth_pct। स्थिति: gap status फ़ील्ड।'
      : 'Demand units sourced from demand_units field in state_skill_gaps.json. Growth from demand_growth_pct. Status from gap_status field.',
    disclaimer: isHI
      ? 'ये आंकड़े सिंथेटिक विकास डेटा हैं। वास्तविक श्रम बाज़ार आंकड़ों के लिए PLFS/MoSPI देखें।'
      : 'This data is SYNTHETIC_DEVELOPMENT. Do not present as observed headcount. Reference PLFS/MoSPI for official statistics.',
  };
}

// ─── Executor: CRITICAL_SKILL_SHORTAGE ───────────────────────────────────────
async function executeCriticalShortage(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const gaps = await labourMarketService.getStateSkillGaps(plan.stateA, plan.district);
  const critical = gaps
    .filter(g => g.status === 'CRITICAL SHORTAGE' || g.status === 'SHORTAGE')
    .sort((a, b) => b.gap_units - a.gap_units)
    .slice(0, plan.limit || 10);

  const tableRows: CopilotTableRow[] = critical.map((g, i) => ({
    [isHI ? 'क्रमांक' : 'Rank']: i + 1,
    [isHI ? 'कौशल' : 'Skill']: g.skill,
    [isHI ? 'राज्य' : 'State']: g.geography,
    [isHI ? 'मांग' : 'Demand']: g.demand_units,
    [isHI ? 'आपूर्ति' : 'Supply']: g.effective_supply_units,
    [isHI ? 'अंतराल' : 'Gap']: g.gap_units,
    [isHI ? 'स्थिति' : 'Status']: g.status,
  }));

  const top = critical[0];
  const headline = isHI
    ? `${top?.skill || '—'} (${top?.geography || plan.stateA || 'भारत'}) में सबसे गंभीर कमी है — अंतराल: ${top?.gap_units || 0} इकाइयां`
    : `${top?.skill || '—'} in ${top?.geography || plan.stateA || 'India'} has the most critical shortage — gap: ${top?.gap_units || 0} units`;

  const metrics: CopilotMetric[] = [
    { label: isHI ? 'गंभीर कमी' : 'Critical Shortages', value: critical.filter(g => g.status === 'CRITICAL SHORTAGE').length, badge: 'critical' },
    { label: isHI ? 'कुल कमी' : 'Total Shortage', value: critical.reduce((a, g) => a + g.gap_units, 0) },
    { label: isHI ? 'शीर्ष अंतराल कौशल' : 'Worst Gap Skill', value: top?.skill || '—', badge: 'critical' },
    { label: isHI ? 'प्रभावित राज्य' : 'States Affected', value: [...new Set(critical.map(g => g.geography))].length },
  ];

  return {
    plan,
    isValid: true,
    headline,
    metrics,
    tableColumns: Object.keys(tableRows[0] || {}),
    tableRows,
    chartData: critical.slice(0, 8).map(g => ({
      label: g.skill.length > 20 ? g.skill.slice(0, 20) + '…' : g.skill,
      value: g.demand_units,
      value2: g.effective_supply_units,
    })),
    scope: scopeLabel(plan, isHI),
    dataSource: 'state_skill_gaps.json (SIH Development Dataset)',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology: isHI
      ? 'अंतराल = demand_units − effective_supply_units। CRITICAL SHORTAGE = gap_pct > 30%। SHORTAGE = gap_pct > 10%।'
      : 'Gap = demand_units − effective_supply_units. CRITICAL SHORTAGE where gap_pct > 30%. Sorted by absolute gap_units descending.',
    disclaimer: isHI
      ? 'ये आंकड़े सिंथेटिक विकास डेटा हैं।'
      : 'Synthetic development data. Not official observed statistics.',
  };
}

// ─── Executor: COMPARE_STATES ─────────────────────────────────────────────────
async function executeCompare(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const [gapsA, gapsB, kpisA, kpisB] = await Promise.all([
    labourMarketService.getStateSkillGaps(plan.stateA),
    labourMarketService.getStateSkillGaps(plan.stateB),
    labourMarketService.getKPIs({ state: plan.stateA }),
    labourMarketService.getKPIs({ state: plan.stateB }),
  ]);

  const critA = gapsA.filter(g => g.status === 'CRITICAL SHORTAGE').length;
  const critB = gapsB.filter(g => g.status === 'CRITICAL SHORTAGE').length;
  const gapA = gapsA.reduce((a, g) => a + g.gap_units, 0);
  const gapB = gapsB.reduce((a, g) => a + g.gap_units, 0);

  const headline = isHI
    ? `${plan.stateA} (अंतराल: ${Math.round(gapA)}) और ${plan.stateB} (अंतराल: ${Math.round(gapB)}) की तुलना — ${gapA > gapB ? plan.stateA : plan.stateB} में अधिक दबाव है`
    : `Comparison: ${plan.stateA} (gap: ${Math.round(gapA)}) vs ${plan.stateB} (gap: ${Math.round(gapB)}) — ${gapA > gapB ? plan.stateA : plan.stateB} shows higher stress`;

  const metrics: CopilotMetric[] = [
    { label: `${plan.stateA} — ${isHI ? 'गंभीर कमी' : 'Critical Shortages'}`, value: critA, badge: critA > 3 ? 'critical' : 'warning' },
    { label: `${plan.stateB} — ${isHI ? 'गंभीर कमी' : 'Critical Shortages'}`, value: critB, badge: critB > 3 ? 'critical' : 'warning' },
    { label: `${plan.stateA} — ${isHI ? 'कुल अंतराल' : 'Total Gap'}`, value: Math.round(gapA) },
    { label: `${plan.stateB} — ${isHI ? 'कुल अंतराल' : 'Total Gap'}`, value: Math.round(gapB) },
    { label: `${plan.stateA} — ${isHI ? 'उभरते कौशल' : 'Emerging Skills'}`, value: kpisA.emergingSkillsCount, badge: 'info' },
    { label: `${plan.stateB} — ${isHI ? 'उभरते कौशल' : 'Emerging Skills'}`, value: kpisB.emergingSkillsCount, badge: 'info' },
  ];

  // Find common skills
  const skillsA = new Set(gapsA.map(g => g.skill));
  const commonSkills = gapsB
    .filter(g => skillsA.has(g.skill))
    .slice(0, 6);

  const tableRows: CopilotTableRow[] = commonSkills.map(g => {
    const matchA = gapsA.find(a => a.skill === g.skill);
    return {
      [isHI ? 'कौशल' : 'Skill']: g.skill,
      [`${plan.stateA} — ${isHI ? 'अंतराल' : 'Gap'}`]: matchA?.gap_units ?? '—',
      [`${plan.stateB} — ${isHI ? 'अंतराल' : 'Gap'}`]: g.gap_units,
      [`${plan.stateA} — ${isHI ? 'स्थिति' : 'Status'}`]: matchA?.status ?? '—',
      [`${plan.stateB} — ${isHI ? 'स्थिति' : 'Status'}`]: g.status,
    };
  });

  return {
    plan,
    isValid: true,
    headline,
    metrics,
    tableColumns: Object.keys(tableRows[0] || {}),
    tableRows,
    chartData: [
      { label: `${plan.stateA} — ${isHI ? 'अंतराल' : 'Gap'}`, value: Math.round(gapA) },
      { label: `${plan.stateB} — ${isHI ? 'अंतराल' : 'Gap'}`, value: Math.round(gapB) },
      { label: `${plan.stateA} — ${isHI ? 'गंभीर' : 'Critical'}`, value: critA },
      { label: `${plan.stateB} — ${isHI ? 'गंभीर' : 'Critical'}`, value: critB },
    ],
    scope: scopeLabel(plan, isHI),
    dataSource: 'state_skill_gaps.json (SIH Development Dataset)',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology: isHI
      ? 'दोनों राज्यों के state_skill_gaps.json डेटा की तुलना। अंतराल = demand_units − effective_supply_units।'
      : 'Side-by-side comparison from state_skill_gaps.json for both states. Gap = demand_units − effective_supply_units.',
    disclaimer: isHI ? 'सिंथेटिक विकास डेटा।' : 'Synthetic development data.',
  };
}

// ─── Executor: OVERSUPPLY_RISK ────────────────────────────────────────────────
async function executeOversupply(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const gaps = await labourMarketService.getStateSkillGaps(plan.stateA, plan.district);
  const oversupply = gaps
    .filter(g => g.status === 'OVERSUPPLY' || g.status === 'CRITICAL OVERSUPPLY' || g.gap_units < 0)
    .sort((a, b) => a.gap_units - b.gap_units)
    .slice(0, 10);

  const tableRows: CopilotTableRow[] = oversupply.map((g, i) => ({
    [isHI ? 'क्रमांक' : 'Rank']: i + 1,
    [isHI ? 'कौशल' : 'Skill']: g.skill,
    [isHI ? 'राज्य' : 'State']: g.geography,
    [isHI ? 'अधिशेष' : 'Surplus']: Math.abs(g.gap_units),
    [isHI ? 'आपूर्ति' : 'Supply']: g.effective_supply_units,
    [isHI ? 'मांग' : 'Demand']: g.demand_units,
  }));

  const top = oversupply[0];
  const headline = isHI
    ? `${top?.skill || '—'} में अधिक आपूर्ति का सर्वाधिक जोखिम है — अधिशेष: ${Math.abs(top?.gap_units || 0)} इकाइयां`
    : `${top?.skill || '—'} faces the highest oversupply risk — surplus: ${Math.abs(top?.gap_units || 0)} units`;

  return {
    plan,
    isValid: true,
    headline,
    metrics: [
      { label: isHI ? 'अधिशेष जोखिम कौशल' : 'Oversupply Risk Skills', value: oversupply.length, badge: 'warning' },
      { label: isHI ? 'सर्वाधिक अधिशेष' : 'Largest Surplus', value: top?.skill || '—', badge: 'warning' },
      { label: isHI ? 'औसत अधिशेष' : 'Avg Surplus', value: oversupply.length ? Math.round(oversupply.reduce((a, g) => a + Math.abs(g.gap_units), 0) / oversupply.length) : 0 },
    ],
    tableColumns: Object.keys(tableRows[0] || {}),
    tableRows,
    chartData: oversupply.slice(0, 6).map(g => ({
      label: g.skill.length > 20 ? g.skill.slice(0, 20) + '…' : g.skill,
      value: Math.abs(g.gap_units),
    })),
    scope: scopeLabel(plan, isHI),
    dataSource: 'state_skill_gaps.json (SIH Development Dataset)',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology: isHI
      ? 'अधिशेष = negative gap_units। स्रोत: state_skill_gaps.json।'
      : 'Oversupply identified where gap_units < 0 (effective supply exceeds demand). Sorted by surplus magnitude.',
    disclaimer: isHI ? 'सिंथेटिक विकास डेटा।' : 'Synthetic development data.',
  };
}

// ─── Executor: TRAINING_PRIORITY ──────────────────────────────────────────────
async function executeTraining(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const recs = await trainingService.getRecommendations({ state: plan.stateA, district: plan.district });
  const top = recs
    .filter(r => r.seatDifference > 0)
    .sort((a, b) => b.seatDifference - a.seatDifference)
    .slice(0, 8);

  const tableRows: CopilotTableRow[] = top.map((r, i) => ({
    [isHI ? 'क्रमांक' : 'Rank']: i + 1,
    [isHI ? 'केंद्र' : 'Centre']: r.centreName,
    [isHI ? 'पाठ्यक्रम' : 'Course']: r.courseName,
    [isHI ? 'कौशल' : 'Skill']: r.skillName,
    [isHI ? 'वर्तमान सीटें' : 'Current Seats']: r.currentSeats,
    [isHI ? 'अनुशंसित सीटें' : 'Rec. Seats']: r.recommendedSeats,
    [isHI ? 'परिवर्तन' : 'Change']: `+${r.seatDifference}`,
  }));

  const headline = isHI
    ? `${plan.stateA || 'चयनित राज्य'} में ${top[0]?.courseName || '—'} के लिए ${top[0]?.seatDifference || 0} अतिरिक्त सीटों की प्राथमिक सिफारिश है`
    : `Priority allocation: ${top[0]?.courseName || '—'} needs ${top[0]?.seatDifference || 0} additional seats in ${plan.stateA || 'selected state'}`;

  return {
    plan,
    isValid: true,
    headline,
    metrics: [
      { label: isHI ? 'अनुशंसित सीटें (कुल)' : 'Total Seats Recommended', value: top.reduce((a, r) => a + r.seatDifference, 0), badge: 'info' },
      { label: isHI ? 'प्रभावित केंद्र' : 'Centres Flagged', value: top.length },
      { label: isHI ? 'शीर्ष पाठ्यक्रम' : 'Top Priority Course', value: top[0]?.courseName || '—', badge: 'warning' },
    ],
    tableColumns: Object.keys(tableRows[0] || {}),
    tableRows,
    chartData: top.slice(0, 6).map(r => ({
      label: r.skillName.length > 18 ? r.skillName.slice(0, 18) + '…' : r.skillName,
      value: r.seatDifference,
    })),
    scope: scopeLabel(plan, isHI),
    dataSource: 'trainingPrograms.json + trainingCentres.json + demandSignals.json',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology: isHI
      ? 'अनुशंसित सीटें = वर्तमान सीटें × मांग-आधारित गुणक। मांग सूचकांक ≥ 65 और नियुक्ति दर ≥ 65% → +45% विस्तार।'
      : 'Recommended seats = current seats × demand-weighted multiplier. Demand index ≥ 65 & placement rate ≥ 65% → +45% expansion. From trainingService.getRecommendations().',
    disclaimer: isHI ? 'सिंथेटिक विकास डेटा।' : 'Synthetic development data. Not an official government allocation.',
  };
}

// ─── Executor: FORECAST ───────────────────────────────────────────────────────
async function executeForecast(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const forecast = await forecastService.getForecast(plan.horizon || '6m', { state: plan.stateA, district: plan.district });

  const horizonLabel: Record<string, string> = {
    '3m': isHI ? '3 महीने' : '3 Months',
    '6m': isHI ? '6 महीने' : '6 Months',
    '12m': isHI ? '12 महीने' : '12 Months',
  };

  const headline = isHI
    ? `${horizonLabel[forecast.horizon]} पूर्वानुमान: मांग ${forecast.projectedDemand} → आपूर्ति ${forecast.projectedSupply} (अंतराल: ${forecast.projectedGap})`
    : `${horizonLabel[forecast.horizon]} forecast: Demand ${forecast.projectedDemand} → Supply ${forecast.projectedSupply} (Gap: ${forecast.projectedGap})`;

  const metrics: CopilotMetric[] = [
    { label: isHI ? 'अनुमानित मांग' : 'Projected Demand', value: forecast.projectedDemand, badge: 'info' },
    { label: isHI ? 'अनुमानित आपूर्ति' : 'Projected Supply', value: forecast.projectedSupply },
    { label: isHI ? 'अनुमानित अंतराल' : 'Projected Gap', value: forecast.projectedGap, badge: forecast.projectedGap > 10 ? 'critical' : 'warning' },
    { label: isHI ? 'विश्वसनीयता' : 'Confidence', value: `${Math.round(forecast.confidenceScore * 100)}%`, badge: 'info' },
  ];

  const tableRows: CopilotTableRow[] = forecast.sectors.map(s => ({
    [isHI ? 'क्षेत्र' : 'Sector']: s.sector,
    [isHI ? 'वर्तमान मांग' : 'Current Demand']: s.currentDemand,
    [isHI ? 'अनुमानित मांग' : 'Projected Demand']: s.projectedDemand,
    [isHI ? 'अंतराल स्कोर' : 'Gap Score']: s.gapScore,
    [isHI ? 'स्थिति' : 'Status']: s.status,
  }));

  return {
    plan,
    isValid: true,
    headline,
    metrics,
    tableColumns: Object.keys(tableRows[0] || {}),
    tableRows,
    chartData: forecast.sectors.slice(0, 6).map(s => ({
      label: s.sector.split(' ')[0].slice(0, 18),
      value: s.projectedDemand,
      value2: s.projectedSupply,
    })),
    scope: `${scopeLabel(plan, false)} · ${horizonLabel[forecast.horizon]}`,
    dataSource: 'forecastService (PLFS baselines + hiring velocity model)',
    dataStatus: 'MODELED_FORECAST',
    methodology: isHI
      ? `पूर्वानुमान: PLFS बेसलाइन × (1 + वृद्धि दर)। मांग वृद्धि: ${plan.horizon === '3m' ? '4.2%' : plan.horizon === '6m' ? '9.8%' : '19.5%'}। विश्वास अंतराल: ${Math.round(forecast.confidenceScore * 100)}%।`
      : `Forecast = PLFS baseline × (1 + growth rate). Demand growth: ${plan.horizon === '3m' ? '4.2%' : plan.horizon === '6m' ? '9.8%' : '19.5%'}. Confidence: ${Math.round(forecast.confidenceScore * 100)}%.`,
    disclaimer: isHI
      ? 'यह मॉडल-आधारित पूर्वानुमान है, वास्तविक परिणाम भिन्न हो सकते हैं।'
      : 'Modelled forecast — actual outcomes may differ. Not an official government projection.',
  };
}

// ─── Executor: EARLY_WARNINGS ─────────────────────────────────────────────────
async function executeWarnings(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const alerts = await alertService.getEarlyWarnings({ state: plan.stateA, district: plan.district });
  const top = alerts.slice(0, 8);

  const tableRows: CopilotTableRow[] = top.map((a, i) => ({
    [isHI ? 'क्रमांक' : 'Rank']: i + 1,
    [isHI ? 'इकाई' : 'Entity']: a.entityName,
    [isHI ? 'राज्य' : 'State']: a.state,
    [isHI ? 'जिला' : 'District']: a.district,
    [isHI ? 'प्रकार' : 'Type']: a.type.replace(/_/g, ' '),
    [isHI ? 'गंभीरता' : 'Severity']: a.severity,
  }));

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const headline = isHI
    ? `${plan.stateA || 'भारत'} में ${criticalCount} गंभीर प्रारंभिक चेतावनी अलर्ट सक्रिय हैं`
    : `${criticalCount} critical early warning alerts active in ${plan.stateA || 'India'}`;

  return {
    plan,
    isValid: true,
    headline,
    metrics: [
      { label: isHI ? 'गंभीर अलर्ट' : 'Critical Alerts', value: criticalCount, badge: 'critical' },
      { label: isHI ? 'उच्च अलर्ट' : 'High Alerts', value: alerts.filter(a => a.severity === 'HIGH').length, badge: 'warning' },
      { label: isHI ? 'कुल अलर्ट' : 'Total Alerts', value: alerts.length },
    ],
    tableColumns: Object.keys(tableRows[0] || {}),
    tableRows,
    scope: scopeLabel(plan, isHI),
    dataSource: 'alertService (synthetic early warning signals)',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology: isHI
      ? 'प्रारंभिक चेतावनी: नौकरी-पोस्टिंग वृद्धि दर, आपूर्ति-मांग असंतुलन और प्रशिक्षण क्षमता विश्लेषण से।'
      : 'Early warnings generated from job-posting velocity, demand-supply imbalance thresholds and training capacity gaps.',
    disclaimer: isHI ? 'सिंथेटिक चेतावनी संकेत।' : 'Synthetic warning signals — not live monitoring.',
  };
}

// ─── Executor: STATE_OVERVIEW ─────────────────────────────────────────────────
async function executeStateOverview(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  return executeSkillDemand(plan, isHI); // reuse
}

// ─── Executor: NATIONAL_OVERVIEW ─────────────────────────────────────────────
async function executeNationalOverview(plan: QueryPlan, isHI: boolean): Promise<CopilotResult> {
  const [kpis, skills] = await Promise.all([
    labourMarketService.getKPIs(),
    labourMarketService.getTopDemandedSkills({ limit: 8 }),
  ]);

  const headline = isHI
    ? `राष्ट्रीय स्तर पर ${kpis.criticalShortagesCount} गंभीर कौशल कमियां, ${kpis.emergingSkillsCount} उभरते कौशल और ${kpis.totalPostingsObserved.toLocaleString()} सक्रिय मांग इकाइयां`
    : `National: ${kpis.criticalShortagesCount} critical shortages, ${kpis.emergingSkillsCount} emerging skills, ${kpis.totalPostingsObserved.toLocaleString()} active demand units`;

  const metrics: CopilotMetric[] = [
    { label: isHI ? 'गंभीर कमियां' : 'Critical Shortages', value: kpis.criticalShortagesCount, badge: 'critical' },
    { label: isHI ? 'उभरते कौशल' : 'Emerging Skills', value: kpis.emergingSkillsCount, badge: 'info' },
    { label: isHI ? 'कुल मांग इकाइयां' : 'Total Demand Units', value: kpis.totalPostingsObserved.toLocaleString() },
    { label: isHI ? 'प्रशिक्षण अंतराल (सीटें)' : 'Training Gap (Seats)', value: kpis.trainingGapSeats.toLocaleString(), badge: 'warning' },
  ];

  return {
    plan,
    isValid: true,
    headline,
    metrics,
    chartData: skills.map(s => ({ label: s.skill.length > 18 ? s.skill.slice(0, 18) + '…' : s.skill, value: s.jobPostings })),
    scope: isHI ? 'अखिल भारतीय' : 'All India',
    dataSource: 'state_skill_gaps.json + stateLabourMarketRollup.json',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology: isHI
      ? 'KPI: state_skill_gaps.json और stateLabourMarketRollup.json से संकलित।'
      : 'KPIs aggregated from state_skill_gaps.json and stateLabourMarketRollup.json via labourMarketService.getKPIs().',
    disclaimer: isHI ? 'सिंथेटिक विकास डेटा।' : 'Synthetic development data.',
  };
}

// ─── Unsupported ──────────────────────────────────────────────────────────────
function buildUnsupported(plan: QueryPlan, errorCode: string | undefined, lang: 'EN' | 'HI'): CopilotResult {
  const isHI = lang === 'HI';
  let headline: string;
  let methodology: string;

  if (errorCode === 'COMPARE_NEEDS_TWO_STATES') {
    headline = isHI
      ? 'तुलना के लिए दो राज्यों के नाम आवश्यक हैं। उदा: "महाराष्ट्र और गुजरात की तुलना करें।"'
      : 'Comparison requires two state names. Example: "Compare skill demand across Maharashtra and Gujarat."';
    methodology = isHI ? 'दो राज्यों का नाम स्पष्ट करें।' : 'Please mention two distinct state names in your query.';
  } else {
    headline = isHI
      ? 'यह प्रश्न वर्तमान डेटासेट से उत्तर देने में असमर्थ है। नीचे दिए गए समर्थित प्रश्न देखें।'
      : 'This query cannot be answered from the available datasets. Please see supported query types below.';
    methodology = isHI
      ? 'समर्थित प्रश्न: कौशल मांग, कमी विश्लेषण, राज्य तुलना, अधिशेष जोखिम, प्रशिक्षण प्राथमिकता, पूर्वानुमान, प्रारंभिक चेतावनी।'
      : 'Supported: skill demand by state, critical shortage, state comparison, oversupply risk, training priority, forecast, early warnings, national overview.';
  }

  return {
    plan: { ...plan, intent: 'UNSUPPORTED' },
    isValid: false,
    validationError: errorCode,
    headline,
    scope: isHI ? 'लागू नहीं' : 'N/A',
    dataSource: isHI ? 'लागू नहीं' : 'N/A',
    dataStatus: 'SYNTHETIC_DEVELOPMENT',
    methodology,
  };
}
