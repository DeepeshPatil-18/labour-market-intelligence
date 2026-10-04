import { ForecastSummary } from '../types';

export const forecastService = {
  async getForecast(
    horizon: '3m' | '6m' | '12m' = '6m',
    filter?: { state?: string; district?: string }
  ): Promise<ForecastSummary> {
    // Multiplier based on horizon
    const horizonFactor = horizon === '3m' ? 1.0 : horizon === '6m' ? 1.8 : 3.2;
    
    // State/district specific baseline adjustment
    const isNashik = filter?.district?.toLowerCase() === 'nashik';
    const isMaha = filter?.state?.toLowerCase() === 'maharashtra' || isNashik;

    const baseDemand = isNashik ? 68.4 : isMaha ? 64.2 : 58.7;
    const baseSupply = isNashik ? 42.1 : isMaha ? 48.3 : 45.6;

    const demandGrowthRate = horizon === '3m' ? 4.2 : horizon === '6m' ? 9.8 : 19.5;
    const supplyGrowthRate = horizon === '3m' ? 2.1 : horizon === '6m' ? 4.5 : 8.9;

    const projectedDemand = Math.round((baseDemand * (1 + demandGrowthRate / 100)) * 10) / 10;
    const projectedSupply = Math.round((baseSupply * (1 + supplyGrowthRate / 100)) * 10) / 10;
    const projectedGap = Math.round((projectedDemand - projectedSupply) * 10) / 10;

    const confidence: 'High' | 'Medium' | 'Low' = horizon === '3m' ? 'High' : horizon === '6m' ? 'Medium' : 'Low';
    const confidenceScore = horizon === '3m' ? 0.84 : horizon === '6m' ? 0.72 : 0.58;

    // Time-series trend points for charts
    const periods = horizon === '3m' 
      ? ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26 (P)', 'May 26 (P)', 'Jun 26 (P)']
      : horizon === '6m'
      ? ['Q3 25', 'Q4 25', 'Q1 26', 'Q2 26 (P)', 'Q3 26 (P)', 'Q4 26 (P)']
      : ['2023', '2024', '2025', '2026 (P)', '2027 (P)'];

    const trendPoints = periods.map((period, index) => {
      const isProjected = period.includes('(P)');
      const histVal = isProjected ? undefined : Math.round((baseDemand - (3 - index) * 2.5) * 10) / 10;
      const projDem = isProjected ? Math.round((baseDemand + (index - 2) * (demandGrowthRate / 3)) * 10) / 10 : undefined;
      const projSup = isProjected ? Math.round((baseSupply + (index - 2) * (supplyGrowthRate / 3)) * 10) / 10 : undefined;
      const confidenceMargin = isProjected ? (index - 2) * 2.8 : undefined;

      return {
        period,
        historical: histVal,
        projectedDemand: projDem,
        projectedSupply: projSup,
        confidenceUpper: projDem ? Math.round((projDem + confidenceMargin!) * 10) / 10 : undefined,
        confidenceLower: projDem ? Math.round((projDem - confidenceMargin!) * 10) / 10 : undefined
      };
    });

    const sectors = [
      {
        sector: 'Automotive & Advanced Manufacturing',
        currentDemand: 72.4,
        projectedDemand: 84.6,
        currentSupply: 48.0,
        projectedSupply: 52.2,
        gapScore: 32.4,
        status: 'Critical Shortage' as const
      },
      {
        sector: 'Electronics & Electrical Hardware',
        currentDemand: 65.8,
        projectedDemand: 76.2,
        currentSupply: 42.5,
        projectedSupply: 47.0,
        gapScore: 29.2,
        status: 'Shortage' as const
      },
      {
        sector: 'Software & Information Technology',
        currentDemand: 81.2,
        projectedDemand: 89.5,
        currentSupply: 70.1,
        projectedSupply: 75.8,
        gapScore: 13.7,
        status: 'Shortage' as const
      },
      {
        sector: 'Renewable Energy & EV Infrastructure',
        currentDemand: 58.0,
        projectedDemand: 74.5,
        currentSupply: 24.0,
        projectedSupply: 31.0,
        gapScore: 43.5,
        status: 'Critical Shortage' as const
      },
      {
        sector: 'Logistics, Supply Chain & Warehousing',
        currentDemand: 52.1,
        projectedDemand: 56.4,
        currentSupply: 50.8,
        projectedSupply: 53.2,
        gapScore: 3.2,
        status: 'Balanced' as const
      },
      {
        sector: 'Traditional Textile & Garment Assembly',
        currentDemand: 38.4,
        projectedDemand: 34.0,
        currentSupply: 48.2,
        projectedSupply: 46.5,
        gapScore: -12.5,
        status: 'Oversupply' as const
      }
    ];

    return {
      horizon,
      currentDemand: baseDemand,
      projectedDemand,
      currentSupply: baseSupply,
      projectedSupply,
      projectedGap,
      confidence,
      confidenceScore,
      trendPoints,
      sectors
    };
  }
};
