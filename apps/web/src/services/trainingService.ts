import trainingCentresData from '../data/trainingCentres.json';
import trainingProgramsData from '../data/trainingPrograms.json';
import demandSignalsData from '../data/demandSignals.json';
import { TrainingRecommendationItem } from '../types';

export const trainingService = {
  async getCentres(filter?: { state?: string; district?: string }) {
    let list = trainingCentresData as any[];
    if (filter?.state && filter.state !== 'ALL') {
      list = list.filter(c => c.state.toLowerCase() === filter.state!.toLowerCase());
    }
    if (filter?.district && filter.district !== 'ALL') {
      list = list.filter(c => c.district.toLowerCase() === filter.district!.toLowerCase());
    }
    return list;
  },

  async getRecommendations(filter?: {
    state?: string;
    district?: string;
    targetSkill?: string;
    budgetMultiplier?: number;
  }): Promise<TrainingRecommendationItem[]> {
    const programs = trainingProgramsData as any[];
    const centres = trainingCentresData as any[];
    const demands = demandSignalsData as any[];

    let targetPrograms = [...programs];
    if (filter?.state && filter.state !== 'ALL') {
      targetPrograms = targetPrograms.filter(p => p.state.toLowerCase() === filter.state!.toLowerCase());
    }
    if (filter?.district && filter.district !== 'ALL') {
      targetPrograms = targetPrograms.filter(p => p.district.toLowerCase() === filter.district!.toLowerCase());
    }
    if (filter?.targetSkill && filter.targetSkill !== 'ALL') {
      targetPrograms = targetPrograms.filter(p => p.skillName.toLowerCase().includes(filter.targetSkill!.toLowerCase()));
    }

    const mult = filter?.budgetMultiplier || 1.0;

    return targetPrograms.slice(0, 30).map(p => {
      const centre = centres.find(c => c.centreId === p.centreId) || {
        centreName: `${p.district} Skill Development Centre`,
        annualCapacity: 350
      };

      // Find matching demand signal
      const dem = demands.find(d => 
        d.district.toLowerCase() === p.district.toLowerCase() && 
        d.skill.toLowerCase() === p.skillName.toLowerCase()
      );
      const demandIndex = dem ? dem.demandIndex : 50;

      // Recommended seat calculation: based on demand index & placement rate
      let seatDiff = 0;
      let reason = '';
      let impact = '';

      if (demandIndex >= 65 && p.placementRate >= 0.65) {
        seatDiff = Math.round(p.annualSeats * 0.45 * mult);
        reason = `Local industry demand index is high (${demandIndex}/100) with robust historical placement (${Math.round(p.placementRate * 100)}%). Scaling capacity reduces hiring bottlenecks.`;
        impact = `Projected to increase annual qualified cohort by ${seatDiff} skilled workers, raising cluster placement conversion.`;
      } else if (demandIndex >= 45) {
        seatDiff = Math.round(p.annualSeats * 0.20 * mult);
        reason = `Moderate demand growth observed in cluster. Current seats adequate; modest expansion recommended to track anticipated MoM hiring.`;
        impact = `Supplies +${seatDiff} technicians to local supply chain suppliers.`;
      } else if (demandIndex < 25 || p.placementRate < 0.45) {
        seatDiff = -Math.round(p.annualSeats * 0.30);
        reason = `Low local employer absorption and sub-target placement (${Math.round(p.placementRate * 100)}%). Recommend seat rationalization and curriculum pivot.`;
        impact = `Frees ₹${Math.round((p.annualBudgetInr * 0.25) / 100000)} Lakh in training budget for redeployment to high-deficit trades.`;
      } else {
        seatDiff = 0;
        reason = `Current intake well-aligned with steady baseline replacement demand. Maintain current allocations with quality enhancements.`;
        impact = `Maintains equilibrium intake of ${p.annualSeats} trainees per annum.`;
      }

      const recommendedSeats = Math.max(20, p.annualSeats + seatDiff);
      const actualDiff = recommendedSeats - p.annualSeats;

      return {
        programId: p.programId,
        centreId: p.centreId,
        centreName: centre.centreName,
        state: p.state,
        district: p.district,
        courseName: p.courseName,
        skillName: p.skillName,
        nsqfLevel: p.nsqfLevel,
        currentSeats: p.annualSeats,
        recommendedSeats,
        seatDifference: actualDiff,
        annualBudgetInr: Math.round(p.annualBudgetInr * (1 + (actualDiff / p.annualSeats) * 0.8)),
        estimatedImpact: impact,
        reason,
        placementRate: p.placementRate,
        completionRate: p.completionRate
      };
    });
  }
};
