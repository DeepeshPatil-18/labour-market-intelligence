import rollupData from '../data/stateLabourMarketRollup.json';
import profileData from '../data/stateProfiles.json';
import crosswalk from '../data/geographyCrosswalk.json';
import demandSignals from '../data/demandSignals.json';
import supplySignals from '../data/supplySignals.json';

export interface StateLabourMetric {
  stateCode: string;
  stateName: string;
  hasData: boolean;
  status: 'Critical Shortage' | 'Shortage' | 'Balanced' | 'Oversupply' | 'Critical Oversupply' | 'Insufficient Data';
  demandLevel: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
  criticalShortages: number;
  totalPostings: number;
  activeEmployers: number;
  growthPct: number;
  topSkill: string | null;
  dominantSector: string | null;
  primaryIndustries?: string;
  labourClusters?: string;
}

export interface DistrictLabourMetric {
  districtName: string;
  stateCode: string;
  stateName: string;
  hasData: boolean;
  status: 'Critical Shortage' | 'Shortage' | 'Balanced' | 'Oversupply' | 'Critical Oversupply' | 'Insufficient Data';
  demandLevel: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
  topShortage: string | null;
  trainingGap: number | null;
  totalPostings: number;
  activeEmployers: number;
}

// State code mapping helper
const STATE_TO_CODE: Record<string, string> = {
  ...crosswalk.state_code_aliases,
  'Maharashtra': 'MH',
  'Karnataka': 'KA',
  'Tamil Nadu': 'TN',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Madhya Pradesh': 'MP',
  'Telangana': 'TG',
  'Uttar Pradesh': 'UP',
  'West Bengal': 'WB',
  'Andhra Pradesh': 'AP',
  'Delhi': 'DL',
  'NCT of Delhi': 'DL',
  'Andaman & Nicobar Islands': 'AN',
  'Andaman and Nicobar Islands': 'AN',
  'Dadra & Nagar Haveli and Daman & Diu': 'DN',
  'Jammu & Kashmir': 'JK',
  'Jammu and Kashmir': 'JK',
  'Arunachal Pradesh': 'AR',
  'Himachal Pradesh': 'HP',
  'Chhattisgarh': 'CT',
  'Jharkhand': 'JH',
  'Uttarakhand': 'UT',
  'Odisha': 'OD',
  'Orissa': 'OD',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tripura': 'TR',
  'Meghalaya': 'ML',
  'Manipur': 'MN',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Goa': 'GA',
  'Kerala': 'KL',
  'Chandigarh': 'CH',
  'Puducherry': 'PY',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD'
};

const CODE_TO_STATE: Record<string, string> = {};
crosswalk.states.forEach(s => {
  CODE_TO_STATE[s.state_code] = s.state_name;
});
// Add extra explicit mappings
CODE_TO_STATE['LA'] = 'Ladakh';
CODE_TO_STATE['LD'] = 'Lakshadweep';

export const mapDataService = {
  getCanonicalStateName(codeOrName: string): string {
    if (!codeOrName || codeOrName === 'ALL') return 'ALL';
    const upper = codeOrName.toUpperCase();
    if (CODE_TO_STATE[upper]) return CODE_TO_STATE[upper];
    const code = STATE_TO_CODE[codeOrName];
    if (code && CODE_TO_STATE[code]) return CODE_TO_STATE[code];
    return codeOrName;
  },

  getStateCode(codeOrName: string): string {
    if (!codeOrName || codeOrName === 'ALL') return 'ALL';
    const upper = codeOrName.toUpperCase();
    if (CODE_TO_STATE[upper]) return upper;
    return STATE_TO_CODE[codeOrName] || 'IN';
  },

  async loadIndiaStatesGeoJSON(): Promise<any> {
    try {
      const res = await fetch('/geography/india_states_simplified.geojson');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to load simplified states, falling back to full GeoJSON', err);
      const fallbackRes = await fetch('/geography/india_states.geojson');
      return await fallbackRes.json();
    }
  },

  async loadStateDistrictsGeoJSON(stateCodeOrName: string): Promise<any> {
    const code = this.getStateCode(stateCodeOrName);
    if (!code || code === 'ALL' || code === 'IN') return null;

    try {
      const res = await fetch(`/geography/districts/${code}.geojson`);
      if (!res.ok) {
        console.warn(`No district GeoJSON found for state code ${code}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error(`Error loading district GeoJSON for ${code}:`, err);
      return null;
    }
  },

  getAllStateLabourMetrics(): Record<string, StateLabourMetric> {
    const metrics: Record<string, StateLabourMetric> = {};

    (rollupData as any[]).forEach(r => {
      const stateName = r.geography;
      const stateCode = STATE_TO_CODE[stateName] || 'IN';
      const profile = (profileData as any[]).find(p => p.geography.toLowerCase() === stateName.toLowerCase());

      let status: 'Critical Shortage' | 'Shortage' | 'Balanced' | 'Oversupply' | 'Critical Oversupply' | 'Insufficient Data' = 'Balanced';
      const rawStatus = (r.labour_market_status || '').toUpperCase();
      if (rawStatus === 'CRITICAL SHORTAGE') status = 'Critical Shortage';
      else if (rawStatus === 'SHORTAGE') status = 'Shortage';
      else if (rawStatus === 'BALANCED') status = 'Balanced';
      else if (rawStatus === 'OVERSUPPLY') status = 'Oversupply';
      else if (rawStatus === 'CRITICAL OVERSUPPLY') status = 'Critical Oversupply';
      else if (rawStatus === 'INSUFFICIENT DATA') status = 'Insufficient Data';

      const totalPostings = Number(r.active_job_postings_90d) || 0;
      const metricObj: StateLabourMetric = {
        stateCode,
        stateName,
        hasData: status !== 'Insufficient Data',
        status,
        demandLevel: totalPostings > 2000 ? 'High' : totalPostings > 800 ? 'Medium' : 'Low',
        criticalShortages: Number(r.critical_shortage_skill_count) || 0,
        totalPostings,
        activeEmployers: Number(r.employer_count) || 0,
        growthPct: Number(r.weighted_demand_growth_pct) || 0,
        topSkill: r.top_shortage_skill || null,
        dominantSector: r.top_demand_sector || null,
        primaryIndustries: profile?.primary_industries || '',
        labourClusters: profile?.labour_clusters || ''
      };

      metrics[stateCode] = metricObj;
      metrics[stateName] = metricObj;
      metrics[stateName.toLowerCase()] = metricObj;
    });

    return metrics;
  },

  getDistrictLabourMetrics(stateCodeOrName: string): Record<string, DistrictLabourMetric> {
    const canonicalState = this.getCanonicalStateName(stateCodeOrName);
    const stateCode = this.getStateCode(stateCodeOrName);
    const metrics: Record<string, DistrictLabourMetric> = {};

    const stateDemand = (demandSignals as any[]).filter(
      s => s.state.toLowerCase() === canonicalState.toLowerCase() ||
           s.state.toLowerCase() === stateCode.toLowerCase()
    );

    const stateSupply = (supplySignals as any[]).filter(
      s => s.state.toLowerCase() === canonicalState.toLowerCase() ||
           s.state.toLowerCase() === stateCode.toLowerCase()
    );

    // Group demand by district
    const districtsDemandMap: Record<string, any[]> = {};
    stateDemand.forEach(d => {
      const distName = d.district.trim();
      if (!districtsDemandMap[distName]) districtsDemandMap[distName] = [];
      districtsDemandMap[distName].push(d);
    });

    // Compute metrics for known districts
    for (const [distName, dList] of Object.entries(districtsDemandMap)) {
      const totalPostings = dList.reduce((sum, item) => sum + (item.jobPostings || 0), 0);
      const totalEmployers = dList.reduce((sum, item) => sum + (item.employerCount || 0), 0);
      const sorted = [...dList].sort((a, b) => (b.jobPostings || 0) - (a.jobPostings || 0));
      const topShortage = sorted[0]?.skill || null;

      const distSupply = stateSupply.filter(s => s.district.toLowerCase() === distName.toLowerCase());
      const totalGap = distSupply.reduce((sum, item) => sum + (item.supplyGap || 0), 0);

      const isCritical = dList.some(item => item.severitySeed === 'Critical') || totalGap < -100;
      const isShortage = dList.some(item => item.severitySeed === 'Shortage') || totalGap < 0;

      const status: 'Critical Shortage' | 'Shortage' | 'Balanced' | 'Oversupply' | 'Critical Oversupply' | 'Insufficient Data' = 
        isCritical ? 'Critical Shortage' : isShortage ? 'Shortage' : 'Balanced';

      const metricObj: DistrictLabourMetric = {
        districtName: distName,
        stateCode,
        stateName: canonicalState,
        hasData: true,
        status,
        demandLevel: totalPostings > 300 ? 'High' : totalPostings > 100 ? 'Medium' : 'Low',
        topShortage,
        trainingGap: totalGap,
        totalPostings,
        activeEmployers: totalEmployers
      };

      metrics[distName] = metricObj;
      metrics[distName.toLowerCase()] = metricObj;

      if (distName === 'Mumbai') {
        metrics['Mumbai City'] = metricObj;
        metrics['Mumbai Suburban'] = metricObj;
        metrics['mumbai city'] = metricObj;
        metrics['mumbai suburban'] = metricObj;
      }
    }

    return metrics;
  }
};
