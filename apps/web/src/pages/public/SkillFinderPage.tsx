import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { labourMarketService } from '../../services/labourMarketService';
import { skillService } from '../../services/skillService';
import { Button } from '../../components/common/Button';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';

export const SkillFinderPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters, setGeography, availableStates, availableDistricts } = useFilters();

  const [education, setEducation] = useState('ITI / Diploma');
  const [experience, setExperience] = useState('0–2 Years');
  const [selectedSkill, setSelectedSkill] = useState<string>('AutoCAD');
  const [availableSkillsList, setAvailableSkillsList] = useState<string[]>([]);
  const [highDemandSkills, setHighDemandSkills] = useState<any[]>([]);

  useEffect(() => {
    skillService.getAllSkills().then(list => {
      setAvailableSkillsList(list.map(s => s.skill_name));
    });
  }, []);

  useEffect(() => {
    labourMarketService.getTopDemandedSkills({
      state: filters.state,
      district: filters.district,
      limit: 6
    }).then(res => setHighDemandSkills(res));
  }, [filters.state, filters.district]);

  const handleGenerateRoadmap = () => {
    navigate(`/my-roadmap?skill=${encodeURIComponent(selectedSkill)}&education=${encodeURIComponent(education)}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Skill Finder
          </h1>
          <p className="text-sm text-govt-600 mt-1">
            Explore high-demand skills and career pathways in your district.
          </p>
        </div>

        <ProvenanceBadge
          source="Inputs: NCO 2015 + Development Dataset"
          dataStatus="DEVELOPMENT"
        />
      </div>

      {/* Simple User Flow: Location, Current Skill, Education/Experience */}
      <div className="p-6 bg-white border border-govt-200 rounded-card shadow-subtle space-y-4 text-xs">
        <h2 className="text-base font-bold text-navy-900">1. Your Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-govt-700 block mb-1">State</label>
            <select
              value={filters.state}
              onChange={(e) => setGeography(e.target.value, 'ALL')}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
            >
              <option value="ALL">All States</option>
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-govt-700 block mb-1">District</label>
            <select
              value={filters.district}
              onChange={(e) => setGeography(filters.state, e.target.value)}
              disabled={filters.state === 'ALL'}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600 disabled:opacity-50"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-govt-700 block mb-1">Your Primary Skill / Trade</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
            >
              {availableSkillsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-govt-700 block mb-1">Education Level</label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
            >
              <option value="10th Pass">10th Standard</option>
              <option value="12th Pass">12th Standard</option>
              <option value="ITI / Diploma">ITI / Polytechnic Diploma</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section: High Demand Skills & Shortages */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-navy-900">
          2. Opportunities in {filters.district !== 'ALL' ? filters.district : filters.state !== 'ALL' ? filters.state : 'India'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* High Demand Skills */}
          <div className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-navy-900">High-Demand Skills</h3>
            <div className="space-y-2">
              {highDemandSkills.slice(0, 4).map(sk => (
                <div key={sk.skill} className="p-2 bg-govt-50 rounded border border-govt-100 flex items-center justify-between">
                  <span className="font-semibold text-govt-900">{sk.skill}</span>
                  <span className="font-mono font-bold text-navy-900">Demand: {sk.demandIndex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shortage & Emerging Skills */}
          <div className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-navy-900">Shortage & Emerging Skills</h3>
            <div className="space-y-2">
              {[
                { name: 'PLC & Automation Control', type: 'Critical Shortage' },
                { name: 'Battery Management Systems (BMS)', type: 'Emerging Skill' },
                { name: 'Solar PV Maintenance', type: 'Emerging Skill' },
                { name: 'CNC 5-Axis Operation', type: 'Shortage' },
              ].map(item => (
                <div key={item.name} className="p-2 bg-govt-50 rounded border border-govt-100 flex items-center justify-between">
                  <span className="font-semibold text-govt-900">{item.name}</span>
                  <span className="text-[11px] font-medium text-primary-800">{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA to generate roadmap */}
        <div className="p-5 bg-govt-100 border border-govt-300 rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-navy-900">Generate your personalized learning roadmap</h3>
            <p className="text-xs text-govt-600">See step-by-step bridge skills from <strong className="text-navy-900">{selectedSkill}</strong> to target shortage occupations.</p>
          </div>
          <Button
            variant="primary"
            size="md"
            iconRight={<ArrowRight size={14} />}
            onClick={handleGenerateRoadmap}
            className="shrink-0"
          >
            View My Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
};
