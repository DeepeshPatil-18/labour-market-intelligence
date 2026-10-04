import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { labourMarketService } from '../../services/labourMarketService';
import { skillService } from '../../services/skillService';
import { Button } from '../../components/common/Button';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { ArrowRight } from '@phosphor-icons/react';

export const SkillFinderPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters, setGeography, availableStates, availableDistricts } = useFilters();
  const { t } = useLanguage();

  const [education, setEducation] = useState('ITI / Diploma');
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

  const geoLabel = filters.district !== 'ALL'
    ? filters.district
    : filters.state !== 'ALL'
    ? filters.state
    : t('finder.inIndia');

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-govt-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            {t('finder.title')}
          </h1>
          <p className="text-sm text-govt-600 mt-1">
            {t('finder.subtitle')}
          </p>
        </div>

        <ProvenanceBadge
          source={`Inputs: NCO 2015 + SIH ${t('common.syntheticDev')}`}
          dataStatus="DEVELOPMENT"
        />
      </div>

      {/* Simple User Flow: Location, Current Skill, Education/Experience */}
      <div className="p-6 bg-white border border-govt-200 rounded-card shadow-subtle space-y-4 text-xs">
        <h2 className="text-base font-bold text-navy-900">{t('finder.profileTitle')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-govt-700 block mb-1">{t('finder.state')}</label>
            <select
              value={filters.state}
              onChange={(e) => setGeography(e.target.value, 'ALL')}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
            >
              <option value="ALL">{t('finder.allStates')}</option>
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-govt-700 block mb-1">{t('finder.district')}</label>
            <select
              value={filters.district}
              onChange={(e) => setGeography(filters.state, e.target.value)}
              disabled={filters.state === 'ALL'}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600 disabled:opacity-50"
            >
              <option value="ALL">{t('finder.allDistricts')}</option>
              {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-govt-700 block mb-1">{t('finder.primarySkill')}</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
            >
              {availableSkillsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-govt-700 block mb-1">{t('finder.educationLevel')}</label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full bg-govt-50 border border-govt-300 rounded px-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
            >
              <option value="10th Pass">{t('finder.edu10th')}</option>
              <option value="12th Pass">{t('finder.edu12th')}</option>
              <option value="ITI / Diploma">{t('finder.eduIti')}</option>
              <option value="Graduate">{t('finder.eduGraduate')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section: High Demand Skills & Shortages */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-navy-900">
          {t('finder.opportunitiesIn')} {geoLabel}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* High Demand Skills */}
          <div className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-navy-900">{t('finder.highDemandTitle')}</h3>
            <div className="space-y-2">
              {highDemandSkills.slice(0, 4).map(sk => (
                <div key={sk.skill} className="p-2 bg-govt-50 rounded border border-govt-100 flex items-center justify-between">
                  <span className="font-semibold text-govt-900">{sk.skill}</span>
                  <span className="font-mono font-bold text-navy-900">{t('finder.demandLabel')} {sk.demandIndex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shortage & Emerging Skills */}
          <div className="p-5 bg-white border border-govt-200 rounded-card shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-navy-900">{t('finder.shortageTitle')}</h3>
            <div className="space-y-2">
              {[
                { name: 'PLC & Automation Control', type: t('finder.criticalShortage') },
                { name: 'Battery Management Systems (BMS)', type: t('finder.emergingSkill') },
                { name: 'Solar PV Maintenance', type: t('finder.emergingSkill') },
                { name: 'CNC 5-Axis Operation', type: t('finder.shortage') },
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
            <h3 className="font-bold text-sm text-navy-900">{t('finder.roadmapBannerTitle')}</h3>
            <p className="text-xs text-govt-600">
              {t('finder.roadmapBannerDesc').replace('{skill}', selectedSkill)}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            iconRight={<ArrowRight size={14} />}
            onClick={handleGenerateRoadmap}
            className="shrink-0"
          >
            {t('finder.viewRoadmap')}
          </Button>
        </div>
      </div>
    </div>
  );
};

