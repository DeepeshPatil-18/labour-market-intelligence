import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { Button } from '../../components/common/Button';
import { ArrowLeft } from '@phosphor-icons/react';

export const MyRoadmapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { filters } = useFilters();
  const { t } = useLanguage();
  const skill = searchParams.get('skill') || 'AutoCAD';
  const education = searchParams.get('education') || 'ITI / Diploma';

  const steps = [
    {
      title: t('roadmap.step1Title'),
      desc: t('roadmap.step1Desc').replace('{skill}', skill).replace('{education}', education),
      status: t('roadmap.step1Status')
    },
    {
      title: t('roadmap.step2Title'),
      desc: t('roadmap.step2Desc'),
      status: t('roadmap.step2Status')
    },
    {
      title: t('roadmap.step3Title'),
      desc: t('roadmap.step3Desc'),
      status: t('roadmap.step3Status')
    },
    {
      title: t('roadmap.step4Title'),
      desc: t('roadmap.step4Desc'),
      status: t('roadmap.step4Status')
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-govt-200 pb-4">
        <div>
          <Link to="/skill-finder" className="text-xs text-govt-500 hover:text-govt-800 flex items-center gap-1 mb-1">
            <ArrowLeft size={12} />
            <span>{t('roadmap.back')}</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            {t('roadmap.title')}
          </h1>
          <p className="text-xs text-govt-600 mt-0.5">
            {t('roadmap.subtitle').replace('{skill}', skill)}
          </p>
        </div>

        <ProvenanceBadge
          source={`Source: Directorate General of Employment — NCO 2015`}
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
        <h3 className="font-bold text-sm text-navy-900">{t('roadmap.trainingCentresTitle')}</h3>
        <p className="text-govt-600 leading-relaxed">
          {t('roadmap.trainingCentresDesc')} ({filters.district !== 'ALL' ? filters.district : 'Nashik'})
        </p>
        <div className="pt-2 flex gap-3">
          <Link to="/skill-finder">
            <Button variant="outline" size="sm">
              {t('roadmap.searchAnother')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

