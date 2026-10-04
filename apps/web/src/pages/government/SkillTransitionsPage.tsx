import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { skillService } from '../../services/skillService';
import { SkillGraphNode } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { ArrowRight, ArrowDown } from '@phosphor-icons/react';

export const SkillTransitionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || 'AutoCAD';
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [nodes, setNodes] = useState<SkillGraphNode[]>([]);
  const [targetOccupation, setTargetOccupation] = useState<{ ncoCode: string; title: string; demandIndex: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillService.getAllSkills().then(list => {
      setAvailableSkills(list.map(s => s.skill_name));
    });
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await skillService.getSkillGraph(selectedSkill);
        setNodes(res.nodes);
        setTargetOccupation(res.targetOccupation);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedSkill]);

  if (loading) {
    return <LoadingState message="Loading skill transition pathways..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Skill Transitions
          </h1>
          <p className="text-sm text-govt-600 mt-1">
            Map workforce skills to target shortage occupations through structured bridge training.
          </p>
        </div>

        <ProvenanceBadge
          source="Source: Directorate General of Employment — NCO 2015"
          dataStatus="REFERENCE"
        />
      </div>

      {/* Selector */}
      <div className="flex items-center gap-3 p-4 bg-white border border-govt-200 rounded-card shadow-subtle text-xs">
        <label className="font-semibold text-govt-700">Select Starting Skill:</label>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="bg-govt-50 border border-govt-300 rounded px-3 py-1.5 text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-600"
        >
          {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Main Transition Pipeline: 4 Clean Steps */}
      <div className="bg-white border border-govt-200 rounded-card p-6 shadow-subtle space-y-6">
        <h2 className="text-base font-bold text-navy-900">Skill Progression Pathway</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {nodes.map((node, idx) => {
            const stepLabels = ['Current Skill', 'Related Competency', 'Bridge Skill', 'Target Specialization'];

            return (
              <div key={node.id} className="relative flex flex-col justify-between p-4 bg-govt-50 border border-govt-200 rounded">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-govt-500 uppercase tracking-wider block">
                    {stepLabels[idx] || node.type}
                  </span>
                  <h3 className="font-bold text-sm text-navy-900">{node.name}</h3>
                  <p className="text-xs text-govt-600">{node.category}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-govt-200 flex items-center justify-between text-xs">
                  <span className="text-govt-500">NSQF Level {node.nsqfLevel}</span>
                  <span className="font-semibold text-navy-900">Demand: {node.demandIndex}</span>
                </div>

                {/* Arrow */}
                {idx < nodes.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-govt-300 items-center justify-center text-govt-500">
                    <ArrowRight size={12} />
                  </div>
                )}
                {idx < nodes.length - 1 && (
                  <div className="md:hidden flex justify-center py-2 text-govt-400">
                    <ArrowDown size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Target Occupation Box */}
        {targetOccupation && (
          <div className="p-4 bg-govt-100 border border-govt-300 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-govt-500 uppercase tracking-wider block">
                Target NCO 2015 Occupation Goal
              </span>
              <h4 className="text-sm font-bold text-navy-900">{targetOccupation.title}</h4>
              <span className="font-mono text-govt-600">NCO Code: {targetOccupation.ncoCode}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-govt-500 block">Critical Deficit Index</span>
              <span className="text-base font-bold font-mono text-red-700">{targetOccupation.demandIndex} / 100</span>
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Summary */}
      <div className="bg-white border border-govt-200 rounded-card p-6 shadow-subtle space-y-3">
        <h2 className="text-base font-bold text-navy-900">Transition Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-govt-50 rounded border border-govt-100">
            <span className="text-govt-500 block">Competency Overlap</span>
            <span className="text-lg font-bold text-navy-900 font-mono mt-0.5">76.4%</span>
          </div>
          <div className="p-3 bg-govt-50 rounded border border-govt-100">
            <span className="text-govt-500 block">Estimated Bridge Duration</span>
            <span className="text-lg font-bold text-navy-900 font-mono mt-0.5">6 Weeks</span>
          </div>
          <div className="p-3 bg-govt-50 rounded border border-govt-100">
            <span className="text-govt-500 block">Projected Wage Premium</span>
            <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5">+38.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
