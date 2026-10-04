import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChartPie, 
  Briefcase, 
  TrendUp, 
  WarningCircle, 
  ShareNetwork, 
  SlidersHorizontal,
  Compass,
  Path,
  SignOut
} from '@phosphor-icons/react';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { logout } = useFilters();
  const { t } = useLanguage();

  const governmentNav = [
    { to: '/overview', label: t('nav.overview'), icon: ChartPie },
    { to: '/labour-market', label: t('nav.labourMarket'), icon: Briefcase },
    { to: '/forecasts', label: t('nav.forecasts'), icon: TrendUp },
    { to: '/early-warnings', label: t('nav.earlyWarnings'), icon: WarningCircle },
    { to: '/skill-transitions', label: t('nav.skillTransitions'), icon: ShareNetwork },
    { to: '/training-allocation', label: t('nav.trainingAllocation'), icon: SlidersHorizontal },
  ];

  const publicNav = [
    { to: '/skill-finder', label: t('nav.skillFinder'), icon: Compass },
    { to: '/my-roadmap', label: t('nav.myRoadmap'), icon: Path },
  ];

  return (
    <aside className={`w-56 bg-white border-r border-govt-200 flex flex-col shrink-0 select-none ${className}`}>
      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* GOVERNMENT Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-govt-400 uppercase">
            {t('nav.sectionGov')}
          </div>
          <nav className="space-y-0.5">
            {governmentNav.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors
                    ${isActive 
                      ? 'bg-govt-100 text-navy-900 font-semibold border-l-2 border-primary-700' 
                      : 'text-govt-600 hover:text-govt-900 hover:bg-govt-50'}
                  `}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* PUBLIC Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-govt-400 uppercase">
            {t('nav.sectionPublic')}
          </div>
          <nav className="space-y-0.5">
            {publicNav.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors
                    ${isActive 
                      ? 'bg-govt-100 text-navy-900 font-semibold border-l-2 border-primary-700' 
                      : 'text-govt-600 hover:text-govt-900 hover:bg-govt-50'}
                  `}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-govt-200 bg-govt-50/50 flex items-center justify-between text-xs">
        <span className="text-[11px] text-govt-400">SIH 2026 PS 26246</span>
        <button
          onClick={logout}
          className="text-[11px] text-govt-500 hover:text-red-700 flex items-center gap-1 font-medium"
          title={t('nav.exit')}
        >
          <SignOut size={12} />
          <span>{t('nav.exit')}</span>
        </button>
      </div>
    </aside>
  );
};
