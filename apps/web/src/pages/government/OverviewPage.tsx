import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { labourMarketService } from '../../services/labourMarketService';
import { LabourKPIs, SkillDemandItem } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { IndiaChoroplethMap } from '../../components/map/IndiaChoroplethMap';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { ArrowRight } from '@phosphor-icons/react';

export const OverviewPage: React.FC = () => {
  const { filters } = useFilters();
  const [kpis, setKpis] = useState<LabourKPIs | null>(null);
  const [skillsNeedingAttention, setSkillsNeedingAttention] = useState<SkillDemandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [kpiRes, skillsRes] = await Promise.all([
          labourMarketService.getKPIs({ state: filters.state, district: filters.district }),
          labourMarketService.getTopDemandedSkills({ state: filters.state, district: filters.district, limit: 6 })
        ]);
        setKpis(kpiRes);
        setSkillsNeedingAttention(skillsRes);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters.state, filters.district]);

  const scopeLabel = filters.state === 'ALL' 
    ? 'All India' 
    : filters.district === 'ALL' 
    ? filters.state 
    : `${filters.state} · ${filters.district}`;

  if (loading || !kpis) {
    return <LoadingState message="Loading labour market overview..." />;
  }

  return (
    <div className="space-y-8">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Labour Market Overview
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-govt-600">
            <span>Geographic scope:</span>
            <span className="font-semibold text-navy-900 bg-govt-100 px-2 py-0.5 rounded text-xs">
              {scopeLabel}
            </span>
          </div>
        </div>

        <ProvenanceBadge
          source="Inputs: NCO 2015 + PLFS + Development Dataset"
          dataStatus="DEVELOPMENT"
        />
      </div>

      {/* 2. Four Concise Clickable KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Critical Skill Shortages */}
        <div
          onClick={() => navigate('/labour-market')}
          className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle hover:border-govt-300 cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-govt-500">Critical Skill Shortages</span>
            <div className="text-3xl font-bold text-navy-900 font-mono mt-1">
              {kpis.criticalShortagesCount}
            </div>
          </div>
          <div className="text-xs font-medium text-primary-700 group-hover:underline flex items-center gap-1 mt-4">
            <span>View shortages</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* KPI 2: Emerging Skills */}
        <div
          onClick={() => navigate('/early-warnings')}
          className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle hover:border-govt-300 cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-govt-500">Emerging Skills</span>
            <div className="text-3xl font-bold text-navy-900 font-mono mt-1">
              {kpis.emergingSkillsCount}
            </div>
          </div>
          <div className="text-xs font-medium text-primary-700 group-hover:underline flex items-center gap-1 mt-4">
            <span>View emerging skills</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* KPI 3: Labour Demand */}
        <div
          onClick={() => navigate('/labour-market')}
          className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle hover:border-govt-300 cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-govt-500">Labour Demand Index</span>
            <div className="text-3xl font-bold text-navy-900 font-mono mt-1">
              {kpis.averageDemandIndex}
            </div>
          </div>
          <div className="text-xs font-medium text-primary-700 group-hover:underline flex items-center gap-1 mt-4">
            <span>Explore demand</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* KPI 4: Training Capacity Gap */}
        <div
          onClick={() => navigate('/training-allocation')}
          className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle hover:border-govt-300 cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-govt-500">Training Capacity Gap</span>
            <div className="text-3xl font-bold text-navy-900 font-mono mt-1">
              {kpis.trainingGapSeats.toLocaleString()} <span className="text-sm font-sans font-normal text-govt-500">seats</span>
            </div>
          </div>
          <div className="text-xs font-medium text-primary-700 group-hover:underline flex items-center gap-1 mt-4">
            <span>View capacity plan</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>

      {/* 3. Primary Dashboard Visual: Real DataMeet Analytical Choropleth Map */}
      <IndiaChoroplethMap />

      {/* 4. Secondary Dashboard Content: Clean Compact Skills Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900">Skills requiring attention</h2>
          <Link to="/labour-market" className="text-xs text-primary-700 hover:underline font-medium flex items-center gap-1">
            <span>View all</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">Skill</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Market Status</th>
                <th className="py-3 px-4 text-right">Demand Level</th>
                <th className="py-3 px-4 text-right">Trend (MoM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govt-100">
              {skillsNeedingAttention.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-govt-500">
                    No active skill signals for the selected geography.
                  </td>
                </tr>
              ) : (
                skillsNeedingAttention.map((sk) => (
                  <tr key={sk.skill} className="hover:bg-govt-50/50">
                    <td className="py-3 px-4 font-bold text-govt-900">{sk.skill}</td>
                    <td className="py-3 px-4 text-govt-600">{sk.topDistrict}, {sk.topState}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        sk.severity === 'Critical' ? 'bg-red-50 text-red-800 border border-red-200' :
                        sk.severity === 'Shortage' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-govt-100 text-govt-700'
                      }`}>
                        {sk.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-navy-900">
                      {sk.demandIndex}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-medium">
                      +{sk.growthMoM}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
