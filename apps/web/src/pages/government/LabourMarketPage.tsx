import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { labourMarketService, StateProfileRecord } from '../../services/labourMarketService';
import { SkillDemandItem, JobPostingRecord } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { SimpleBarChart } from '../../components/charts/SimpleBarChart';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { CaretLeft, CaretRight, Buildings, Tag, MapPinLine } from '@phosphor-icons/react';

export const LabourMarketPage: React.FC = () => {
  const { filters, setSector, setTimeHorizon } = useFilters();
  const [skills, setSkills] = useState<SkillDemandItem[]>([]);
  const [sectors, setSectors] = useState<Array<{ sector: string; count: number; demandIndex: number }>>([]);
  const [jobPostings, setJobPostings] = useState<JobPostingRecord[]>([]);
  const [stateProfile, setStateProfile] = useState<StateProfileRecord | null>(null);
  const [totalPostings, setTotalPostings] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [skList, secList, jobsRes, profile] = await Promise.all([
          labourMarketService.getTopDemandedSkills({ state: filters.state, district: filters.district, limit: 10 }),
          labourMarketService.getSectorDemandDistribution({ state: filters.state, district: filters.district }),
          labourMarketService.getJobPostings({
            state: filters.state,
            district: filters.district,
            sector: filters.sector,
            page,
            pageSize: 6
          }),
          filters.state !== 'ALL' ? labourMarketService.getStateProfile(filters.state) : Promise.resolve(null)
        ]);
        setSkills(skList);
        setSectors(secList);
        setJobPostings(jobsRes.records);
        setTotalPostings(jobsRes.total);
        setStateProfile(profile);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters.state, filters.district, filters.sector, page]);

  const scopeLabel = filters.state === 'ALL'
    ? 'All India'
    : filters.district === 'ALL'
    ? filters.state
    : `${filters.state} · ${filters.district}`;

  if (loading) {
    return <LoadingState message="Loading labour market intelligence..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Labour Market Intelligence
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-govt-600">
            <span>Scope:</span>
            <span className="font-semibold text-navy-900 bg-govt-100 px-2 py-0.5 rounded text-xs">
              {scopeLabel}
            </span>
          </div>
        </div>

        <ProvenanceBadge
          source="Data: SIH Development Dataset"
          dataStatus="DEVELOPMENT"
        />
      </div>

      {/* State Profile Context Card (If a state is selected) */}
      {stateProfile && (
        <div className="bg-primary-50/50 border border-primary-200 rounded-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-primary-200/60 pb-2">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
              <Buildings size={16} className="text-primary-800" />
              <span>{stateProfile.geography} Economy & Labour Structure</span>
            </h3>
            <span className="text-[11px] font-mono font-medium text-primary-800 bg-white px-2 py-0.5 rounded border border-primary-200">
              Scale Factor: {stateProfile.market_scale_factor}x
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-govt-700 flex items-center gap-1">
                <Tag size={13} className="text-govt-500" />
                <span>Primary Specialization Sectors:</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {stateProfile.primary_industries.split(';').map(ind => (
                  <span key={ind} className="bg-white px-2 py-0.5 rounded border border-govt-200 text-navy-900 font-medium">
                    {ind.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-govt-700 flex items-center gap-1">
                <MapPinLine size={13} className="text-govt-500" />
                <span>Key Industrial Labour Clusters:</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {stateProfile.labour_clusters.split(';').map(cls => (
                  <span key={cls} className="bg-white px-2 py-0.5 rounded border border-govt-200 text-navy-900 font-medium">
                    {cls.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls: Scope, Sector, Time Period */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-govt-200 rounded-card shadow-subtle text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-govt-500 font-semibold block mb-1">Industry Sector</label>
            <select
              value={filters.sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
              className="bg-govt-50 border border-govt-300 rounded px-3 py-1.5 text-xs text-govt-800 focus:outline-none focus:border-primary-600"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map(s => <option key={s.sector} value={s.sector}>{s.sector}</option>)}
            </select>
          </div>

          <div>
            <label className="text-govt-500 font-semibold block mb-1">Time Horizon</label>
            <select
              value={filters.timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as any)}
              className="bg-govt-50 border border-govt-300 rounded px-3 py-1.5 text-xs text-govt-800 focus:outline-none focus:border-primary-600"
            >
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="12m">12 Months</option>
            </select>
          </div>
        </div>

        <div className="text-govt-500 text-right">
          Total Requisitions Observed: <strong className="text-navy-900 font-mono">{totalPostings.toLocaleString()}</strong>
        </div>
      </div>

      {/* Demand by Sector Bar Chart */}
      <div className="bg-white border border-govt-200 rounded-card p-6 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-navy-900">Demand Volume by Industry Sector</h2>
        <SimpleBarChart
          data={sectors.slice(0, 6).map(s => ({
            label: s.sector,
            value: s.count,
            color: s.count > 500 ? 'bg-red-600' : s.count > 200 ? 'bg-amber-500' : 'bg-primary-700'
          }))}
          valueLabel="Active Postings"
        />
      </div>

      {/* Top Demanded Skills Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Skill Shortages & Demand Signals</h2>
        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Skill</th>
                <th className="py-3 px-4">Category / Sector</th>
                <th className="py-3 px-4 text-right">Job Postings</th>
                <th className="py-3 px-4 text-right">Growth (MoM)</th>
                <th className="py-3 px-4">Market Status</th>
                <th className="py-3 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govt-100">
              {skills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-govt-500">
                    No active skill records for the selected scope.
                  </td>
                </tr>
              ) : (
                skills.map((sk) => (
                  <tr key={sk.skill} className="hover:bg-govt-50/50">
                    <td className="py-3 px-4 font-mono text-govt-400 font-medium">{sk.rank}</td>
                    <td className="py-3 px-4 font-bold text-govt-900">{sk.skill}</td>
                    <td className="py-3 px-4 text-govt-600">{sk.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-navy-900">{sk.jobPostings}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-medium">+{sk.growthMoM}%</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        sk.severity === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                        sk.severity === 'Shortage' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {sk.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-govt-600">{sk.topState}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthetic Job Evidence Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Synthetic Job Evidence</h2>
            <span className="text-xs text-govt-500">Development Dataset — Synthetic Requisition Evidence</span>
          </div>
          <ProvenanceBadge source="Data: SIH Development Dataset" dataStatus="DEVELOPMENT" />
        </div>

        <div className="bg-white border border-govt-200 rounded-card shadow-subtle overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-govt-50 text-govt-600 font-semibold border-b border-govt-200">
              <tr>
                <th className="py-3 px-4">Occupation</th>
                <th className="py-3 px-4">Synthetic Employer Name</th>
                <th className="py-3 px-4">City / Geography</th>
                <th className="py-3 px-4 text-right">Posting Volume</th>
                <th className="py-3 px-4 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govt-100">
              {jobPostings.map((job) => (
                <tr key={job.jobId} className="hover:bg-govt-50/50">
                  <td className="py-3 px-4 font-bold text-govt-900">{job.jobTitle}</td>
                  <td className="py-3 px-4 text-govt-600">
                    <div>{job.company}</div>
                    <span className="text-[10px] text-govt-400 italic">Synthetic employer record</span>
                  </td>
                  <td className="py-3 px-4 text-govt-600">{job.district}, {job.state}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-navy-900">
                    {job.skills[0] ? 'Active' : '1'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-govt-500">
                    {job.postedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-3 border-t border-govt-100 flex items-center justify-between text-xs text-govt-500 bg-govt-50/50">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-govt-300 bg-white hover:bg-govt-50 disabled:opacity-50 flex items-center gap-1"
            >
              <CaretLeft size={12} />
              <span>Previous</span>
            </button>
            <span>Showing {(page - 1) * 6 + 1}–{Math.min(page * 6, totalPostings)} of {totalPostings}</span>
            <button
              disabled={page * 6 >= totalPostings}
              onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1 rounded border border-govt-300 bg-white hover:bg-govt-50 disabled:opacity-50 flex items-center gap-1"
            >
              <span>Next</span>
              <CaretRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
