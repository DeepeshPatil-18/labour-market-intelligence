import plfsData from '../data/plfs2025Indicators.json';

export interface PLFSIndicatorItem {
  indicator: string;
  year: number;
  geography: string;
  age_group: string;
  sex: string;
  category: string;
  unit: string;
  value: number;
  source_page?: number;
}

export const plfsService = {
  getNationalBaseline2025() {
    return {
      lfpr: 59.3,
      wpr: 57.4,
      unemploymentRate: 3.1,
      agricultureShare: 43.0,
      manufacturingShare: 12.1,
      constructionShare: 12.0,
      servicesShare: 31.8,
      selfEmployedShare: 56.2,
      regularSalariedShare: 23.6,
      casualLabourShare: 20.2,
      provenance: 'Source: MoSPI — PLFS 2025'
    };
  },

  getRawIndicators(): PLFSIndicatorItem[] {
    return plfsData as PLFSIndicatorItem[];
  },

  getIndustryShares2025() {
    const items = (plfsData as PLFSIndicatorItem[]).filter(
      d => d.indicator === 'Industry employment share' && d.year === 2025 && d.geography === 'All India' && d.sex === 'Person'
    );
    return items.map(i => ({
      industry: i.category,
      sharePercent: i.value
    }));
  },

  getEmploymentStatusShares2025() {
    const items = (plfsData as PLFSIndicatorItem[]).filter(
      d => d.indicator === 'Employment status share' && d.year === 2025 && d.geography === 'All India' && d.sex === 'Person'
    );
    return items.map(i => ({
      status: i.category,
      sharePercent: i.value
    }));
  }
};
