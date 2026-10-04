import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { forecastService } from '../../services/forecastService';
import { ForecastSummary } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { SimpleLineChart } from '../../components/charts/SimpleLineChart';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const ForecastPage: React.FC = () => {
  const { filters, setTimeHorizon } = useFilters();
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
    ? 'All India'
    : filters.district === 'ALL'
    ? filters.state
    : `${filters.state} · ${filters.district}`;

  if (loading || !forecast) {
    return <LoadingState message="Generating labour demand forecast..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Labour Demand Forecast
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-govt-600">
            <span className="font-semibold text-navy-900">{scopeLabel}</span>
            <span className="text-govt-300">·</span>
            <Link to="/scope-select" className="text-primary-700 hover:underline text-xs flex items-center gap-1 font-medium">
              <ArrowsClockwise size={12} />
              <span>Change scope</span>
            </Link>
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
          <span className="text-govt-600 font-semibold">Forecast Horizon:</span>
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
                {h.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="text-govt-500">
          Confidence: <strong className="text-navy-900">{forecast.confidence} ({(forecast.confidenceScore * 100).toFixed(0)}%)</strong>
        </div>
      </div>

      {/* Main Visualization: Demand and Supply Outlook */}
      <div className="bg-white border border-govt-200 rounded-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900">Demand and supply outlook</h2>
          <span className="text-xs text-govt-500">Velocity baseline & trajectory</span>
        </div>
        <SimpleLineChart data={forecast.trendPoints} />
      </div>

      {/* Projected Shortages Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Projected shortages</h2>
        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4 text-right">Current Demand</th>
                <th className="py-3 px-4 text-right">Projected Demand</th>
                <th className="py-3 px-4 text-right">Current Supply</th>
                <th className="py-3 px-4 text-right">Projected Supply</th>
                <th className="py-3 px-4 text-right">Projected Gap</th>
                <th className="py-3 px-4">Market Outlook</th>
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
                      {sec.status}
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
