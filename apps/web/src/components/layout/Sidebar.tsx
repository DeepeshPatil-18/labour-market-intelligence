import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChartPie,
  Briefcase,
  TrendUp,
  WarningCircle,
  ShareNetwork,
  SlidersHorizontal,
  Compass,
  Path,
  SignOut,
  Robot,
  MapPin,
  Lock,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUserProfile } from '../../context/UserProfileContext';

interface SidebarProps {
  className?: string;
}

const ROLE_DOT: Record<string, string> = {
  DISTRICT_OFFICER: 'bg-blue-600',
  STATE_PLANNER: 'bg-emerald-600',
  NATIONAL_MSDE: 'bg-navy-900',
  SSC: 'bg-amber-600',
};

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { logout } = useFilters();
  const { t, lang } = useLanguage();
  const { userProfile, logoutProfile, canChangeGeography } = useUserProfile();
  const navigate = useNavigate();
  const isHI = lang === 'HI';
  const isGeoLocked = userProfile && !canChangeGeography();

  const handleSignOut = () => {
    logout();
    logoutProfile();
    navigate('/');
  };

  const governmentNav = [
    { to: '/overview', label: t('nav.overview'), icon: ChartPie },
    { to: '/labour-market', label: t('nav.labourMarket'), icon: Briefcase },
    { to: '/forecasts', label: t('nav.forecasts'), icon: TrendUp },
    { to: '/early-warnings', label: t('nav.earlyWarnings'), icon: WarningCircle },
    { to: '/skill-transitions', label: t('nav.skillTransitions'), icon: ShareNetwork },
    { to: '/training-allocation', label: t('nav.trainingAllocation'), icon: SlidersHorizontal },
    { to: '/copilot', label: t('nav.copilot'), icon: Robot },
  ];

  const publicNav = [
    { to: '/skill-finder', label: t('nav.skillFinder'), icon: Compass },
    { to: '/my-roadmap', label: t('nav.myRoadmap'), icon: Path },
  ];

  // Scope string derived from profile
  const scopeString = userProfile
    ? userProfile.jurisdiction.assignedDistrict !== 'ALL'
      ? `${userProfile.jurisdiction.assignedDistrict}, ${userProfile.jurisdiction.assignedState}`
      : userProfile.jurisdiction.assignedState !== 'ALL'
      ? userProfile.jurisdiction.assignedState
      : isHI ? 'अखिल भारतीय' : 'All India'
    : isHI ? 'अखिल भारतीय' : 'All India';

  return (
    <aside className={`w-56 bg-white border-r border-govt-200 flex flex-col shrink-0 select-none ${className}`}>
      {/* ── User Identity Card ── */}
      {userProfile && (
        <div className="px-3 pt-4 pb-3 border-b border-govt-100">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ROLE_DOT[userProfile.role] ?? 'bg-govt-500'}`} />
            <span className="text-[11px] font-bold text-navy-900 leading-tight truncate">
              {userProfile.displayName}
            </span>
          </div>
          <div className="text-[10px] text-govt-500 pl-4 mb-1.5 font-medium truncate">
            {userProfile.roleLabel}
          </div>
          {/* Jurisdiction chip */}
          <div className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium
            ${isGeoLocked ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-govt-50 border border-govt-200 text-govt-600'}`}
          >
            {isGeoLocked
              ? <Lock size={9} className="shrink-0 text-amber-600" />
              : <MapPin size={9} className="shrink-0" />}
            <span className="truncate">{scopeString}</span>
          </div>
          {/* Demo badge */}
          {userProfile.isDemo && (
            <div className="mt-1.5 text-[10px] text-amber-700 flex items-center gap-1">
              <ShieldCheck size={9} className="shrink-0" />
              <span>{isHI ? 'डेमो खाता — प्रोटोटाइप' : 'Demo account — Prototype'}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation Sections ── */}
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
          id="sidebar-signout-btn"
          onClick={handleSignOut}
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
