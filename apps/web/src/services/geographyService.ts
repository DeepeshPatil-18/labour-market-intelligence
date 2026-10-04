import crosswalk from '../data/geographyCrosswalk.json';
import demandSignals from '../data/demandSignals.json';
import { StateDistrictGeo } from '../types';

export const geographyService = {
  async getGeographies(): Promise<StateDistrictGeo[]> {
    return crosswalk.states.map(s => ({
      state: s.state_name,
      districts: []
    }));
  },

  async getStates(): Promise<string[]> {
    return crosswalk.states.map(s => s.state_name).sort();
  },

  async getDistricts(state: string): Promise<string[]> {
    if (!state || state === 'ALL') {
      return [];
    }
    // Read from state district GeoJSON or signals
    const signals = (demandSignals as any[]).filter(s => s.state.toLowerCase() === state.toLowerCase());
    const districtsFromSignals = [...new Set(signals.map(s => s.district))].sort();
    return districtsFromSignals;
  },

  async getDistrictStats(state?: string, district?: string): Promise<{
    hasData: boolean;
    avgDemand: number;
    totalPostings: number;
    topSkill: string | null;
    shortageLevel: 'Critical' | 'Shortage' | 'Moderate' | 'Balanced' | 'Insufficient Data';
  }> {
    let signals = demandSignals as any[];
    if (state && state !== 'ALL') {
      signals = signals.filter(s => s.state.toLowerCase() === state.toLowerCase());
    }
    if (district && district !== 'ALL') {
      signals = signals.filter(s => s.district.toLowerCase() === district.toLowerCase());
    }

    if (signals.length === 0) {
      return {
        hasData: false,
        avgDemand: 0,
        totalPostings: 0,
        topSkill: null,
        shortageLevel: 'Insufficient Data'
      };
    }

    const totalDemand = signals.reduce((sum, s) => sum + s.demandIndex, 0);
    const totalPostings = signals.reduce((sum, s) => sum + s.jobPostings, 0);
    const avgDemand = Math.round((totalDemand / signals.length) * 10) / 10;
    
    const sorted = [...signals].sort((a, b) => b.demandIndex - a.demandIndex);
    const topSkill = sorted[0]?.skill || null;

    let shortageLevel: 'Critical' | 'Shortage' | 'Moderate' | 'Balanced' | 'Insufficient Data' = 'Balanced';
    if (avgDemand > 50) shortageLevel = 'Critical';
    else if (avgDemand > 35) shortageLevel = 'Shortage';
    else if (avgDemand > 20) shortageLevel = 'Moderate';

    return { hasData: true, avgDemand, totalPostings, topSkill, shortageLevel };
  }
};
