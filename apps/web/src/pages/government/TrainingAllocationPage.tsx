import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { trainingService } from '../../services/trainingService';
import { labourMarketService, StateSkillGapRecord } from '../../services/labourMarketService';
import { TrainingRecommendationItem } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

export const TrainingAllocationPage: React.FC = () => {
  const { filters, setGeography, availableStates } = useFilters();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<TrainingRecommendationItem[]>([]);
  const [skillGaps, setSkillGaps] = useState<StateSkillGapRecord[]>([]);
  const [skillSector, setSkillSector] = useState('ALL');
  const [budgetScenario, setBudgetScenario] = useState('1.0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [recRes, gapRes] = await Promise.all([
          trainingService.getRecommendations({
            state: filters.state,
            district: filters.district,
            targetSkill: skillSector !== 'ALL' ? skillSector : undefined,
            budgetMultiplier: parseFloat(budgetScenario)
          }),
          labourMarketService.getStateSkillGaps(filters.state)
        ]);
        setRecommendations(recRes);
        setSkillGaps(gapRes);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters.state, filters.district, skillSector, budgetScenario]);

  const totalCurrent = recommendations.reduce((acc, r) => acc + r.currentSeats, 0);
  const totalRecommended = recommendations.reduce((acc, r) => acc + r.recommendedSeats, 0);
  const totalChange = totalRecommended - totalCurrent;

  const scopeLabel = filters.state === 'ALL'
    ? t('header.scopeAllIndia')
    : filters.district === 'ALL'
    ? filters.state
    : `${filters.state} · ${filters.district}`;

  if (loading) {
    return <LoadingState message={t('training.loading')} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            {t('training.title')}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-govt-600">
            <span>{t('header.scope')}:</span>
            <span className="font-semibold text-navy-900 bg-govt-100 px-2 py-0.5 rounded text-xs">
              {scopeLabel}
            </span>
          </div>
        </div>

        <ProvenanceBadge
          source={`${t('common.data')}: SIH Development Dataset`}
          dataStatus="DEVELOPMENT"
        />
      </div>

      {/* Controls: State Filter, Skill Sector, Budget Scenario */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white border border-govt-200 rounded-card shadow-subtle text-xs">
        <div>
          <label className="text-govt-500 font-semibold block mb-1">{t('training.stateFilter')}</label>
          <select
            value={filters.state}
            onChange={(e) => setGeography(e.target.value, 'ALL')}
            className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-1.5 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
          >
            <option value="ALL">{t('training.allStates')}</option>
            {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-govt-500 font-semibold block mb-1">{t('training.competencySector')}</label>
          <select
            value={skillSector}
            onChange={(e) => setSkillSector(e.target.value)}
            className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-1.5 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
          >
            <option value="ALL">{t('training.allCompetencies')}</option>
            <option value="CNC">CNC & Machining</option>
            <option value="AutoCAD">AutoCAD / Design</option>
            <option value="EV">EV & Battery</option>
            <option value="Welding">Welding & Fabrication</option>
            <option value="Electrical">Electrical</option>
          </select>
        </div>

        <div>
          <label className="text-govt-500 font-semibold block mb-1">{t('training.budgetScenario')}</label>
          <select
            value={budgetScenario}
            onChange={(e) => setBudgetScenario(e.target.value)}
            className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-1.5 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
          >
            <option value="0.8">{t('training.budgetConstrained')}</option>
            <option value="1.0">{t('training.budgetBaseline')}</option>
            <option value="1.3">{t('training.budgetExpansion')}</option>
          </select>
        </div>
      </div>

      {/* Seat Summary Line */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white border border-govt-200 rounded-card shadow-subtle">
          <span className="text-govt-500 font-semibold block">{t('training.currentSupply')}</span>
          <div className="text-2xl font-bold text-navy-900 font-mono mt-1">
            {totalCurrent.toLocaleString()} {t('training.seats')}
          </div>
        </div>

        <div className="p-4 bg-white border border-govt-200 rounded-card shadow-subtle">
          <span className="text-govt-500 font-semibold block">{t('training.recommendedCap')}</span>
          <div className="text-2xl font-bold text-navy-900 font-mono mt-1">
            {totalRecommended.toLocaleString()} {t('training.seats')}
          </div>
        </div>

        <div className="p-4 bg-white border border-govt-200 rounded-card shadow-subtle">
          <span className="text-govt-500 font-semibold block">{t('training.netChange')}</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${totalChange >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {totalChange >= 0 ? `+${totalChange.toLocaleString()}` : totalChange.toLocaleString()} {t('training.seats')}
          </div>
        </div>
      </div>

      {/* Skill Gap Derivation Table (Demand - Supply = Gap) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">{t('training.gapCalcTitle')}</h2>
            <span className="text-xs text-govt-500">{t('training.gapCalcSub')}</span>
          </div>
          <ProvenanceBadge source={`${t('common.data')}: SIH Development Dataset`} dataStatus="DEVELOPMENT" />
        </div>

        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">{t('training.colState')}</th>
                <th className="py-3 px-4">{t('training.colSkill')}</th>
                <th className="py-3 px-4">{t('training.colRelatedSector')}</th>
                <th className="py-3 px-4 text-right">{t('training.colDemandUnits')}</th>
                <th className="py-3 px-4 text-right">{t('training.colSupplyUnits')}</th>
                <th className="py-3 px-4 text-right">{t('training.colGapUnits')}</th>
                <th className="py-3 px-4">{t('training.colMarketStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govt-100">
              {skillGaps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-govt-500">
                    {t('training.noRecords')}
                  </td>
                </tr>
              ) : (
                skillGaps.slice(0, 12).map((g, idx) => (
                  <tr key={`${g.geography}-${g.skill}-${idx}`} className="hover:bg-govt-50/50">
                    <td className="py-3 px-4 font-bold text-govt-900">{g.geography}</td>
                    <td className="py-3 px-4 font-bold text-navy-900">{g.skill}</td>
                    <td className="py-3 px-4 text-govt-600 capitalize">{g.related_sectors}</td>
                    <td className="py-3 px-4 text-right font-mono text-navy-900">{g.demand_units}</td>
                    <td className="py-3 px-4 text-right font-mono text-govt-600">{g.effective_supply_units}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${g.gap_units > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                      {g.gap_units > 0 ? `+${g.gap_units}` : g.gap_units}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        g.status === 'CRITICAL SHORTAGE' ? 'bg-red-100 text-red-800 border border-red-200' :
                        g.status === 'SHORTAGE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {g.status === 'CRITICAL SHORTAGE' ? t('map.statusCriticalShortage') :
                         g.status === 'SHORTAGE' ? t('map.statusShortage') :
                         t('map.statusBalanced')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">{t('training.recsTitle')}</h2>
        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">{t('training.colCentre')}</th>
                <th className="py-3 px-4">{t('training.colCourse')}</th>
                <th className="py-3 px-4 text-right">{t('training.colCurrentSeats')}</th>
                <th className="py-3 px-4 text-right">{t('training.colRecSeats')}</th>
                <th className="py-3 px-4 text-right">{t('training.colDiff')}</th>
                <th className="py-3 px-4 max-w-sm">{t('training.colImpact')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govt-100">
              {recommendations.slice(0, 10).map((rec) => (
                <tr key={rec.programId} className="hover:bg-govt-50/50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-govt-900">{rec.centreName}</div>
                    <div className="text-govt-500 text-[11px]">{rec.district}, {rec.state}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-govt-800">{rec.courseName}</div>
                    <div className="text-govt-500 text-[11px]">{rec.skillName} · NSQF L{rec.nsqfLevel}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-govt-600">{rec.currentSeats}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-navy-900">{rec.recommendedSeats}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={rec.seatDifference > 0 ? 'text-emerald-700' : rec.seatDifference < 0 ? 'text-red-700' : 'text-govt-500'}>
                      {rec.seatDifference > 0 ? `+${rec.seatDifference}` : rec.seatDifference}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-govt-600 leading-relaxed max-w-sm">{rec.estimatedImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

