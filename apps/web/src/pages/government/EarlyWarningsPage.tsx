import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { alertService } from '../../services/alertService';
import { EarlyWarningAlert } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const EarlyWarningsPage: React.FC = () => {
  const { filters } = useFilters();
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await alertService.getEarlyWarnings({
          state: filters.state,
          district: filters.district,
          type: selectedTab !== 'ALL' ? selectedTab : undefined
        });
        setAlerts(res);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters.state, filters.district, selectedTab]);

  const handleAcknowledge = async (id: string) => {
    await alertService.acknowledgeAlert(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const scopeLabel = filters.state === 'ALL'
    ? 'All India'
    : filters.district === 'ALL'
    ? filters.state
    : `${filters.state} · ${filters.district}`;

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'CRITICAL_SHORTAGE', label: 'Critical Shortage' },
    { id: 'EMERGING_SKILL', label: 'Emerging Skill' },
    { id: 'DEMAND_ACCELERATION', label: 'Demand Acceleration' },
    { id: 'OVERSUPPLY_RISK', label: 'Oversupply Risk' },
    { id: 'DEMAND_DECLINE', label: 'Demand Decline' },
  ];

  if (loading) {
    return <LoadingState message="Loading early warnings..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Early Warnings
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
          dataStatus="MODELED"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-govt-200 pb-2 text-xs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-navy-900 text-white font-semibold'
                : 'text-govt-600 hover:text-govt-900 hover:bg-govt-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clean Table / List of Warnings */}
      {alerts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-card border border-govt-200 text-xs text-govt-500">
          No early warning signals detected for this category and scope.
        </div>
      ) : (
        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">Skill / Trade</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Signal Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 max-w-sm">Supporting Evidence</th>
                <th className="py-3 px-4 max-w-sm">Recommended Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govt-100">
              {alerts.map((alert) => (
                <tr key={alert.id} className={`hover:bg-govt-50/50 ${alert.acknowledged ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4 font-bold text-govt-900">{alert.entityName}</td>
                  <td className="py-3 px-4 text-govt-600">{alert.district}, {alert.state}</td>
                  <td className="py-3 px-4 font-medium text-govt-700">{alert.type.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                      alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-800 border border-red-200' :
                      alert.severity === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-govt-600 leading-relaxed max-w-xs">{alert.evidence}</td>
                  <td className="py-3 px-4 text-govt-800 leading-relaxed max-w-xs font-medium">{alert.recommendedAction}</td>
                  <td className="py-3 px-4 text-right">
                    {alert.acknowledged ? (
                      <span className="text-[11px] text-emerald-700 font-medium">✓ Acknowledged</span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-2.5 py-1 rounded border border-govt-300 hover:bg-govt-100 text-govt-700 font-medium text-xs"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
