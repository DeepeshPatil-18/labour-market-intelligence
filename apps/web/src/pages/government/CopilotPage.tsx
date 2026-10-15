import React, { useState, useRef, useCallback } from 'react';
import {
  Robot,
  PaperPlaneTilt,
  Sparkle,
  Database,
  Info,
  Warning,
  CheckCircle,
  ArrowClockwise,
  CaretRight,
  ChartBar,
  Lock,
} from '@phosphor-icons/react';
import { useLanguage } from '../../context/LanguageContext';
import { useFilters } from '../../context/FilterContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  parseIntent,
  validatePlan,
  executePlan,
  CopilotResult,
  CopilotMetric,
} from '../../services/copilotService';

// ─── Translation keys ─────────────────────────────────────────────────────────
// (Inline translations so existing LanguageContext is not hard-required for each key,
//  but we still call useLanguage for lang + t which covers all registered keys)

const TRANSLATIONS = {
  EN: {
    title: 'Planning Copilot',
    subtitle: 'Ask a question in plain English or Hindi and get an instant, evidence-based answer derived from the national labour market datasets.',
    inputPlaceholder: 'Type your question here… (English or Hindi)',
    submit: 'Ask',
    loading: 'Analysing your query…',
    suggestedTitle: 'Suggested Questions',
    queryPlanTitle: 'Query Plan',
    intent: 'Intent',
    scope: 'Scope',
    answerTitle: 'Answer',
    metricsTitle: 'Key Metrics',
    tableTitle: 'Data Table',
    chartTitle: 'Visual Summary',
    sourcesTitle: 'Data Source & Provenance',
    methodTitle: 'Methodology',
    disclaimerTitle: 'Disclaimer',
    unsupportedTitle: 'Query not supported',
    suggestAlternative: 'Try one of the supported questions below:',
    newQuery: 'New Query',
    detectedLang: 'Detected Language',
    emptyTitle: 'Start by asking a question',
    emptyDesc: 'The Copilot analyses labour market data from PLFS, NCO 2015, synthetic development datasets and the KUSHAL intelligence engine to answer planning questions.',
    chartDemand: 'Demand',
    chartSupply: 'Supply',
    errorTitle: 'Something went wrong',
    errorDesc: 'Unable to complete the query. Please try a different phrasing.',
  },
  HI: {
    title: 'योजना सहायक (Copilot)',
    subtitle: 'अपना प्रश्न सामान्य हिंदी या अंग्रेज़ी में लिखें और राष्ट्रीय श्रम बाज़ार डेटासेट से तुरंत साक्ष्य-आधारित उत्तर पाएं।',
    inputPlaceholder: 'अपना प्रश्न यहाँ लिखें… (हिंदी या English)',
    submit: 'पूछें',
    loading: 'आपका प्रश्न विश्लेषण हो रहा है…',
    suggestedTitle: 'सुझाए गए प्रश्न',
    queryPlanTitle: 'प्रश्न योजना',
    intent: 'इरादा',
    scope: 'कार्यक्षेत्र',
    answerTitle: 'उत्तर',
    metricsTitle: 'मुख्य संकेतक',
    tableTitle: 'डेटा तालिका',
    chartTitle: 'दृश्य सारांश',
    sourcesTitle: 'डेटा स्रोत एवं प्रमाण',
    methodTitle: 'पद्धति',
    disclaimerTitle: 'अस्वीकरण',
    unsupportedTitle: 'प्रश्न समर्थित नहीं',
    suggestAlternative: 'नीचे दिए गए समर्थित प्रश्नों में से एक आज़माएं:',
    newQuery: 'नया प्रश्न',
    detectedLang: 'पहचानी गई भाषा',
    emptyTitle: 'प्रश्न पूछकर शुरू करें',
    emptyDesc: 'Copilot PLFS, NCO 2015, सिंथेटिक विकास डेटासेट और KUSHAL इंटेलिजेंस इंजन से श्रम बाज़ार डेटा का विश्लेषण करके योजना प्रश्नों का उत्तर देता है।',
    chartDemand: 'मांग',
    chartSupply: 'आपूर्ति',
    errorTitle: 'कुछ गड़बड़ हुई',
    errorDesc: 'प्रश्न पूर्ण नहीं हो सका। कृपया अलग शब्दों में पूछें।',
  },
} as const;

// ─── Suggested queries ────────────────────────────────────────────────────────
const SUGGESTED_EN = [
  'Which skills have the highest demand in Maharashtra?',
  'What are the critical skill shortages in Nashik?',
  'Which occupations show a critical skill shortage?',
  'Compare skill demand across Maharashtra and Gujarat.',
  'Which skills are approaching oversupply?',
  'What training allocation should be prioritized in Maharashtra?',
  'Show the forecast for the next six months.',
  'What are the early warning alerts for Karnataka?',
  'Give me a national labour market overview.',
];

const SUGGESTED_HI = [
  'महाराष्ट्र में किन कौशलों की मांग सबसे अधिक है?',
  'नाशिक में किन कौशलों की गंभीर कमी है?',
  'किन व्यवसायों में कौशल की गंभीर कमी है?',
  'महाराष्ट्र और गुजरात में कौशल की मांग की तुलना करें।',
  'किन कौशलों में अधिक आपूर्ति होने का जोखिम है?',
  'चयनित राज्य में किन प्रशिक्षण कार्यक्रमों को प्राथमिकता देनी चाहिए?',
  'अगले छह महीनों का पूर्वानुमान दिखाएं।',
  'कर्नाटक के लिए प्रारंभिक चेतावनी अलर्ट क्या हैं?',
  'राष्ट्रीय श्रम बाज़ार का सारांश दें।',
];

// Human-readable intent labels
const INTENT_LABELS_EN: Record<string, string> = {
  SKILL_DEMAND_BY_STATE: 'Skill Demand by State',
  CRITICAL_SKILL_SHORTAGE: 'Critical Skill Shortage Analysis',
  COMPARE_STATES: 'State Comparison',
  OVERSUPPLY_RISK: 'Oversupply Risk Analysis',
  TRAINING_PRIORITY: 'Training Allocation Priority',
  FORECAST: 'Labour Demand Forecast',
  EARLY_WARNINGS: 'Early Warning Alerts',
  STATE_OVERVIEW: 'State Labour Market Overview',
  NATIONAL_OVERVIEW: 'National Overview',
  UNSUPPORTED: 'Unsupported Query',
};

const INTENT_LABELS_HI: Record<string, string> = {
  SKILL_DEMAND_BY_STATE: 'राज्य अनुसार कौशल मांग',
  CRITICAL_SKILL_SHORTAGE: 'गंभीर कौशल कमी विश्लेषण',
  COMPARE_STATES: 'राज्य तुलना',
  OVERSUPPLY_RISK: 'अधिशेष जोखिम विश्लेषण',
  TRAINING_PRIORITY: 'प्रशिक्षण आवंटन प्राथमिकता',
  FORECAST: 'श्रम मांग पूर्वानुमान',
  EARLY_WARNINGS: 'प्रारंभिक चेतावनी अलर्ट',
  STATE_OVERVIEW: 'राज्य श्रम बाज़ार सिंहावलोकन',
  NATIONAL_OVERVIEW: 'राष्ट्रीय सिंहावलोकन',
  UNSUPPORTED: 'असमर्थित प्रश्न',
};

// ─── Badge colour helper ──────────────────────────────────────────────────────
function metricBadgeClass(badge?: string): string {
  switch (badge) {
    case 'critical': return 'bg-red-50 border-red-200 text-red-800';
    case 'warning':  return 'bg-amber-50 border-amber-200 text-amber-800';
    case 'healthy':  return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    case 'info':     return 'bg-blue-50 border-blue-200 text-blue-800';
    default:         return 'bg-govt-50 border-govt-200 text-govt-700';
  }
}

// ─── Simple Bar Chart ─────────────────────────────────────────────────────────
interface MiniBarChartProps {
  data: Array<{ label: string; value: number; value2?: number }>;
  label1: string;
  label2?: string;
}

const MiniBarChart: React.FC<MiniBarChartProps> = ({ data, label1, label2 }) => {
  const max = Math.max(...data.map(d => Math.max(d.value, d.value2 ?? 0)), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-32 shrink-0 text-right text-govt-600 truncate" title={d.label}>
            {d.label}
          </div>
          <div className="flex-1 flex gap-1 items-center min-w-0">
            {/* Bar 1 */}
            <div
              className="h-5 bg-primary-600 rounded-sm transition-all"
              style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? '4px' : '0' }}
              title={`${label1}: ${d.value}`}
            />
            {/* Bar 2 (optional) */}
            {d.value2 !== undefined && (
              <div
                className="h-5 bg-govt-300 rounded-sm transition-all"
                style={{ width: `${(d.value2 / max) * 100}%`, minWidth: d.value2 > 0 ? '4px' : '0' }}
                title={`${label2}: ${d.value2}`}
              />
            )}
          </div>
          <div className="w-14 shrink-0 text-govt-600 font-mono">{d.value}</div>
        </div>
      ))}
      {/* Legend */}
      <div className="flex gap-4 text-[11px] text-govt-500 pt-1 border-t border-govt-100">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-600 inline-block" />{label1}
        </span>
        {label2 && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-govt-300 inline-block" />{label2}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Result Panel ─────────────────────────────────────────────────────────────
interface ResultPanelProps {
  result: CopilotResult;
  uiLang: 'EN' | 'HI';
  onNewQuery: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result, uiLang, onNewQuery }) => {
  const tx = TRANSLATIONS[uiLang];
  const intentLabels = uiLang === 'HI' ? INTENT_LABELS_HI : INTENT_LABELS_EN;
  const isUnsupported = !result.isValid;

  const provenanceStatus =
    result.dataStatus === 'MODELED_FORECAST' ? 'FORECAST' :
    result.dataStatus === 'SYNTHETIC_DEVELOPMENT' ? 'DEVELOPMENT' : 'REFERENCE';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Query Plan bar ── */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-govt-50 border border-govt-200 rounded-card px-4 py-2.5">
        <span className="text-govt-500 font-medium">{tx.queryPlanTitle}:</span>
        <span className="bg-white border border-govt-200 px-2 py-0.5 rounded font-medium text-govt-800">
          {intentLabels[result.plan.intent] || result.plan.intent}
        </span>
        {result.plan.stateA && (
          <span className="bg-primary-50 border border-primary-200 px-2 py-0.5 rounded text-primary-800">
            {result.plan.stateA}
          </span>
        )}
        {result.plan.stateB && (
          <>
            <CaretRight size={12} className="text-govt-400" />
            <span className="bg-primary-50 border border-primary-200 px-2 py-0.5 rounded text-primary-800">
              {result.plan.stateB}
            </span>
          </>
        )}
        {result.plan.horizon && (
          <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-blue-800">
            {result.plan.horizon}
          </span>
        )}
        <span className="ml-auto text-govt-400">
          {tx.detectedLang}: <span className="font-semibold text-govt-700">{result.plan.detectedLang === 'HI' ? 'हिंदी' : 'English'}</span>
        </span>
      </div>

      {/* ── Unsupported ── */}
      {isUnsupported && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
            <Warning size={16} />
            <span>{tx.unsupportedTitle}</span>
          </div>
          <p className="text-sm text-amber-700">{result.headline}</p>
          <p className="text-xs text-amber-600">{result.methodology}</p>
        </div>
      )}

      {/* ── Headline answer ── */}
      {!isUnsupported && (
        <div className="bg-primary-50 border border-primary-200 rounded-card p-4 flex gap-3">
          <CheckCircle size={20} className="text-primary-700 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-navy-900 leading-relaxed">{result.headline}</p>
        </div>
      )}

      {/* ── Metric tiles ── */}
      {result.metrics && result.metrics.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-govt-600 uppercase tracking-wider mb-2">{tx.metricsTitle}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {result.metrics.map((m: CopilotMetric, i: number) => (
              <div
                key={i}
                className={`border rounded-card p-3 ${metricBadgeClass(m.badge)}`}
              >
                <div className="text-[11px] font-medium leading-snug mb-1 opacity-80">{m.label}</div>
                <div className="text-xl font-bold font-mono">{m.value}{m.unit && <span className="text-sm ml-1 font-normal opacity-70">{m.unit}</span>}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chart ── */}
      {result.chartData && result.chartData.length > 0 && (
        <Card
          title={tx.chartTitle}
          action={<ChartBar size={14} className="text-govt-400" />}
        >
          <MiniBarChart
            data={result.chartData}
            label1={tx.chartDemand}
            label2={result.chartData.some(d => d.value2 !== undefined) ? tx.chartSupply : undefined}
          />
        </Card>
      )}

      {/* ── Data table ── */}
      {result.tableRows && result.tableRows.length > 0 && result.tableColumns && (
        <Card title={tx.tableTitle} noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-govt-50 border-b border-govt-200">
                <tr>
                  {result.tableColumns.map(col => (
                    <th key={col} className="py-2.5 px-4 font-semibold text-govt-600 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-govt-100">
                {result.tableRows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-govt-50/50 transition-colors">
                    {result.tableColumns!.map(col => {
                      const val = row[col];
                      const isStatus = col.toLowerCase().includes('status') || col.includes('स्थिति');
                      const strVal = String(val);
                      let statusClass = '';
                      if (isStatus) {
                        if (strVal.includes('CRITICAL') || strVal.includes('Critical')) statusClass = 'text-red-700 font-semibold';
                        else if (strVal.includes('SHORTAGE') || strVal.includes('Shortage')) statusClass = 'text-amber-700 font-semibold';
                        else if (strVal.includes('OVERSUPPLY') || strVal.includes('Oversupply')) statusClass = 'text-blue-700 font-semibold';
                        else if (strVal.includes('Balanced')) statusClass = 'text-emerald-700';
                      }
                      return (
                        <td key={col} className={`py-2.5 px-4 text-govt-800 ${statusClass}`}>
                          {strVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Scope + Provenance + Methodology ── */}
      <Card title={tx.sourcesTitle}>
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-govt-500 font-medium w-24 shrink-0">{tx.scope}:</span>
            <span className="text-navy-900 font-semibold">{result.scope}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-govt-500 font-medium w-24 shrink-0">
              <Database size={12} className="inline mr-1" />Dataset:
            </span>
            <span className="text-govt-700">{result.dataSource}</span>
          </div>
          <div>
            <ProvenanceBadge source={result.dataSource.split(' ')[0]} dataStatus={provenanceStatus as any} />
          </div>
          <div className="pt-2 border-t border-govt-100">
            <div className="font-medium text-govt-700 mb-1 flex items-center gap-1">
              <Info size={12} />
              <span>{tx.methodTitle}</span>
            </div>
            <p className="text-govt-600 leading-relaxed">{result.methodology}</p>
          </div>
          {result.disclaimer && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2.5">
              <div className="font-semibold text-amber-800 mb-0.5">{tx.disclaimerTitle}</div>
              <p className="text-amber-700">{result.disclaimer}</p>
            </div>
          )}
        </div>
      </Card>

      {/* ── New query button ── */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" icon={<ArrowClockwise size={14} />} onClick={onNewQuery}>
          {tx.newQuery}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const CopilotPage: React.FC = () => {
  const { lang } = useLanguage();
  const { filters } = useFilters();
  const { userProfile, canAccessState, canCompareStates } = useUserProfile();
  const tx = TRANSLATIONS[lang];
  const suggested = lang === 'HI' ? SUGGESTED_HI : SUGGESTED_EN;

  // The copilot always operates within the user's assigned scope
  const contextState = filters.state !== 'ALL' ? filters.state : undefined;
  const contextDistrict = filters.district !== 'ALL' ? filters.district : undefined;
  const isGeoLocked = userProfile && (userProfile.role === 'DISTRICT_OFFICER' || userProfile.role === 'STATE_PLANNER');

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const plan = parseIntent(trimmed);

      // Always inject context state if not explicitly mentioned
      if (contextState && !plan.stateA && plan.intent !== 'NATIONAL_OVERVIEW' && plan.intent !== 'UNSUPPORTED') {
        plan.stateA = contextState;
      }

      // Jurisdiction enforcement: block queries targeting out-of-scope states
      if (plan.stateA && !canAccessState(plan.stateA)) {
        const scopeStr = contextState || (lang === 'HI' ? 'अखिल भारतीय' : 'All India');
        setError(
          lang === 'HI'
            ? `'${plan.stateA}' आपके अधिकार क्षेत्र से बाहर है। आपका निर्धारित क्षेत्र: ${scopeStr}`
            : `'${plan.stateA}' is outside your assigned jurisdiction (${scopeStr}). Please query within your scope.`
        );
        setIsLoading(false);
        return;
      }

      // Block national/compare for restricted roles
      if ((plan.intent === 'NATIONAL_OVERVIEW' || plan.intent === 'COMPARE_STATES') && !canCompareStates()) {
        setError(
          lang === 'HI'
            ? 'राष्ट्रीय सिंहावलोकन और राज्य तुलना आपकी भूमिका में उपलब्ध नहीं है।'
            : 'National overview and state comparison are not available for your role.'
        );
        setIsLoading(false);
        return;
      }

      const validationResult = validatePlan(plan);
      if (!validationResult.valid) {
        const errorResult = await executePlan(plan, lang);
        setResult(errorResult);
      } else {
        const res = await executePlan(plan, lang);
        setResult(res);
      }
    } catch (err) {
      console.error('Copilot execution error:', err);
      setError(tx.errorDesc);
    } finally {
      setIsLoading(false);
    }
  }, [lang, contextState, canAccessState, canCompareStates, tx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(query);
    }
  };

  const handleSuggestion = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
    handleSubmit(q);
  };

  const handleNewQuery = () => {
    setResult(null);
    setError(null);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Robot size={22} className="text-primary-700" />
            {tx.title}
          </h1>
          <p className="text-sm text-govt-500 mt-1 max-w-2xl">{tx.subtitle}</p>
        </div>
        <ProvenanceBadge source="KUSHAL Intelligence Engine" dataStatus="DEVELOPMENT" />
      </div>

      {/* ── Input area ── */}
      <div className="bg-white border border-govt-200 rounded-card shadow-card p-4 space-y-3">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              id="copilot-query-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tx.inputPlaceholder}
              rows={2}
              className="w-full border border-govt-200 rounded-govt px-3 py-2.5 text-sm text-govt-900 placeholder:text-govt-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none font-sans bg-govt-50"
              disabled={isLoading}
              aria-label={tx.inputPlaceholder}
            />
          </div>
          <Button
            id="copilot-submit-btn"
            variant="primary"
            size="md"
            loading={isLoading}
            disabled={!query.trim() || isLoading}
            onClick={() => handleSubmit(query)}
            icon={<PaperPlaneTilt size={16} />}
            aria-label={tx.submit}
          >
            {tx.submit}
          </Button>
        </div>

        {/* Jurisdiction scope banner */}
        {isGeoLocked && contextState ? (
          <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            <Lock size={11} className="shrink-0" />
            <span className="font-medium">
              {lang === 'HI'
                ? `आपके प्रश्न ${contextState}${contextDistrict ? ` · ${contextDistrict}` : ''} तक सीमित हैं।`
                : `Your queries are restricted to ${contextState}${contextDistrict ? ` · ${contextDistrict}` : ''}.`}
            </span>
          </div>
        ) : contextState ? (
          <p className="text-[11px] text-govt-400">
            {lang === 'HI'
              ? `संदर्भ: ${contextState} — यदि राज्य नाम न हो तो यही उपयोग होगा।`
              : `Context: ${contextState} — will be used if your query doesn't specify a state.`}
          </p>
        ) : null}
      </div>

      {/* ── Suggested questions ── */}
      {!result && !isLoading && !error && (
        <div>
          <h2 className="text-xs font-semibold text-govt-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkle size={13} className="text-primary-600" />
            {tx.suggestedTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {suggested.map((q, i) => (
              <button
                key={i}
                id={`copilot-suggestion-${i}`}
                onClick={() => handleSuggestion(q)}
                className="text-left px-3.5 py-2.5 text-xs text-govt-700 bg-white border border-govt-200 rounded-card hover:border-primary-400 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-start gap-2 group"
              >
                <CaretRight size={12} className="text-govt-400 group-hover:text-primary-600 shrink-0 mt-0.5" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-govt-500 space-y-3">
          <div className="flex items-center gap-3">
            <Robot size={24} className="text-primary-600 animate-pulse" />
            <span className="text-sm font-medium">{tx.loading}</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-card p-4">
          <div className="flex items-center gap-2 text-red-800 font-semibold text-sm mb-1">
            <Warning size={16} />
            {tx.errorTitle}
          </div>
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={handleNewQuery}>
            {tx.newQuery}
          </Button>
        </div>
      )}

      {/* ── Result panel ── */}
      {result && !isLoading && (
        <ResultPanel result={result} uiLang={lang} onNewQuery={handleNewQuery} />
      )}

      {/* ── Empty state ── */}
      {!result && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-10 text-center text-govt-400 space-y-2 border border-dashed border-govt-200 rounded-card">
          <Robot size={32} className="text-govt-300" />
          <p className="text-sm font-medium text-govt-600">{tx.emptyTitle}</p>
          <p className="text-xs text-govt-500 max-w-md">{tx.emptyDesc}</p>
        </div>
      )}
    </div>
  );
};
