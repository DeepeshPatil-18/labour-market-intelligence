import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { forecastService } from '../../services/forecastService';
import { ForecastSummary } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { SimpleLineChart } from '../../components/charts/SimpleLineChart';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const ForecastPage: React.FC = () => {
  const { filters, setTimeHorizon } = useFilters();
  const { t } = useLanguage();
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await forecastService.getForecast(filters.timeHorizon, {
          state: filters.state,
          district: filters.district
        });
        setForecast(res);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters.timeHorizon, filters.state, filters.district]);

  const scopeLabel = filters.state === 'ALL'
    ? t('header.scopeAllIndia')
    : filters.district === 'ALL'
    ? filters.state
    : `${filters.state} · ${filters.district}`;

  if (loading || !forecast) {
    return <LoadingState message={t('common.loading')} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            {t('forecast.title')}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-govt-600">
            <span>{t('header.scope')}:</span>
            <span className="font-semibold text-navy-900 bg-govt-100 px-2 py-0.5 rounded text-xs">
              {scopeLabel}
            </span>
          </div>
        </div>

        <ProvenanceBadge
          source="Method: Platform-derived estimate"
          dataStatus="FORECAST"
        />
      </div>

      {/* Horizon Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-govt-200 rounded-card shadow-subtle text-xs">
        <div className="flex items-center gap-2">
          <span className="text-govt-600 font-semibold">{t('forecast.horizonTitle')}:</span>
          <div className="flex items-center gap-1 p-0.5 bg-govt-100 rounded border border-govt-200">
            {(['3m', '6m', '12m'] as const).map(h => (
              <button
                key={h}
                onClick={() => setTimeHorizon(h)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  filters.timeHorizon === h
                    ? 'bg-white text-navy-900 shadow-subtle border border-govt-200'
                    : 'text-govt-600 hover:text-govt-900'
                }`}
              >
                {h === '3m' ? t('forecast.q1') : h === '6m' ? t('forecast.h1') : t('forecast.fy')}
              </button>
            ))}
          </div>
        </div>

        <div className="text-govt-500">
          {t('forecast.confidenceLevel')}
        </div>
      </div>

      {/* Main Visualization: Demand and Supply Outlook */}
      <div className="bg-white border border-govt-200 rounded-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900">{t('forecast.growthTrajectory')}</h2>
          <span className="text-xs text-govt-500">{t('forecast.subtitle')}</span>
        </div>
        <SimpleLineChart data={forecast.trendPoints} />
      </div>

      {/* Projected Shortages Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">{t('labour.sectorDemandTitle')}</h2>
        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">{t('overview.colSector')}</th>
                <th className="py-3 px-4 text-right">{t('overview.kpiDemand')}</th>
                <th className="py-3 px-4 text-right">{t('forecast.growthTrajectory')}</th>
                <th className="py-3 px-4 text-right">{t('overview.colSupply')}</th>
                <th className="py-3 px-4 text-right">{t('forecast.badgeForecast')} {t('overview.colSupply')}</th>
                <th className="py-3 px-4 text-right">{t('training.colGap')}</th>
                <th className="py-3 px-4">{t('overview.colGap')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govt-100">
              {forecast.sectors.map((sec) => (
                <tr key={sec.sector} className="hover:bg-govt-50/50">
                  <td className="py-3 px-4 font-bold text-govt-900">{sec.sector}</td>
                  <td className="py-3 px-4 text-right font-mono text-govt-600">{sec.currentDemand}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-red-700">{sec.projectedDemand}</td>
                  <td className="py-3 px-4 text-right font-mono text-govt-600">{sec.currentSupply}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{sec.projectedSupply}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-navy-900">
                    {sec.gapScore > 0 ? `+${sec.gapScore}` : sec.gapScore}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                      sec.status === 'Critical Shortage' ? 'bg-red-50 text-red-800 border border-red-200' :
                      sec.status === 'Shortage' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-govt-100 text-govt-700'
                    }`}>
                      {sec.status === 'Critical Shortage' ? t('map.statusCriticalShortage') :
                       sec.status === 'Shortage' ? t('map.statusShortage') :
                       t('common.balanced')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
