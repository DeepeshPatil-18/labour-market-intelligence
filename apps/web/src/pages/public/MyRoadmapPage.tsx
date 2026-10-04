import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { Button } from '../../components/common/Button';
import { ArrowLeft, CheckCircle, ArrowDown } from '@phosphor-icons/react';

export const MyRoadmapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { filters } = useFilters();
  const skill = searchParams.get('skill') || 'AutoCAD';
  const education = searchParams.get('education') || 'ITI / Diploma';

  const steps = [
    {
      title: 'Current Skill Baseline',
      desc: `Demonstrated competency in ${skill}. (Education: ${education})`,
      status: 'Current'
    },
    {
      title: 'Identified Skill Gap',
      desc: 'Missing industrial controller & PLC ladder logic modules required for Level 5 automation roles.',
      status: 'Gap'
    },
    {
      title: 'Recommended Bridge Skill',
      desc: 'PLC Programming & Industrial Telemetry (6 Weeks / 180 Hours structured training).',
      status: 'Bridge'
    },
    {
      title: 'Target Qualification Goal',
      desc: 'Industrial Automation Technician (NCO 2015 Code: 3115.0100 · High industry shortage).',
      status: 'Target'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-govt-200 pb-4">
        <div>
          <Link to="/skill-finder" className="text-xs text-govt-500 hover:text-govt-800 flex items-center gap-1 mb-1">
            <ArrowLeft size={12} />
            <span>Back to Skill Finder</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            My Learning Roadmap
          </h1>
          <p className="text-xs text-govt-600 mt-0.5">
            Path from <strong className="text-navy-900">{skill}</strong> to target shortage occupation
          </p>
        </div>

        <ProvenanceBadge
          source="Source: Directorate General of Employment — NCO 2015"
          dataStatus="REFERENCE"
        />
      </div>

      {/* Clean 4-Step Vertical Progression */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-govt-200 text-govt-700 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
              {idx + 1}
            </div>

            <div className="flex-1 p-5 bg-white border border-govt-200 rounded-card shadow-subtle text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-navy-900">{step.title}</h3>
                <span className="px-2 py-0.5 bg-govt-100 rounded text-[10px] font-semibold text-govt-700">
                  {step.status}
                </span>
              </div>
              <p className="text-govt-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Local ITI / Training Centre note */}
      <div className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle text-xs space-y-2">
        <h3 className="font-bold text-sm text-navy-900">Training Centres Offering This Bridge Program</h3>
        <p className="text-govt-600 leading-relaxed">
          Accredited Government and Aided ITIs in {filters.district !== 'ALL' ? filters.district : 'Nashik'} offering subsidized bridge courses under PMKVY and State Skill Mission schemes.
        </p>
        <div className="pt-2 flex gap-3">
          <Link to="/skill-finder">
            <Button variant="outline" size="sm">
              Search Another Skill
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
