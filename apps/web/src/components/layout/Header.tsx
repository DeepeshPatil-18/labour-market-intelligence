import React, { useState } from 'react';
import {
  MagnifyingGlass,
  Bell,
  MapPin,
  UserCircle,
  SignOut,
  Lock,
  ShieldCheck,
  Buildings,
} from '@phosphor-icons/react';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { LanguageDropdown } from '../common/LanguageDropdown';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  productName?: string;
}

const ROLE_COLOURS: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  DISTRICT_OFFICER: { dot: 'bg-blue-600', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  STATE_PLANNER:    { dot: 'bg-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  NATIONAL_MSDE:   { dot: 'bg-navy-900', bg: 'bg-govt-100', text: 'text-navy-900', border: 'border-govt-300' },
  SSC:             { dot: 'bg-amber-600', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
};

export const Header: React.FC<HeaderProps> = ({
  productName = 'KUSHAL'
}) => {
  const { filters, setIsSearchOpen, logout, userEmail } = useFilters();
  const { logoutProfile, userProfile, canChangeGeography } = useUserProfile();
  const { lang, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const isHI = lang === 'HI';
  const isGeoLocked = userProfile && !canChangeGeography();

  // Scope label — always driven by FilterContext (which is constrained on login)
  const scopeLabel = filters.state === 'ALL'
    ? t('header.scopeAllIndia')
    : filters.district === 'ALL'
    ? filters.state
    : `${filters.state} · ${filters.district}`;

  const handleSignOut = () => {
    logout();
    logoutProfile();
    navigate('/');
  };

  const roleColour = userProfile ? (ROLE_COLOURS[userProfile.role] ?? ROLE_COLOURS.NATIONAL_MSDE) : null;

  return (
    <header className="h-14 bg-white border-b border-govt-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-subtle">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <Link to="/overview" className="font-bold text-sm tracking-tight text-navy-900 hover:text-govt-700">
          {productName}
        </Link>
      </div>

      {/* Center: Scope + search */}
      <div className="flex items-center gap-2">
        {/* Scope chip — locked if user is District/State level */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs border
          ${isGeoLocked
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-govt-50 border-govt-200 text-govt-800'
          }`}
        >
          {isGeoLocked
            ? <Lock size={11} className="text-amber-600 shrink-0" />
            : <MapPin size={13} className="text-govt-500 shrink-0" />}
          <span className="font-semibold text-navy-900">{scopeLabel}</span>
          {isGeoLocked && (
            <span className="text-[10px] text-amber-600 font-medium hidden sm:inline">
              {isHI ? '(बंद)' : '(locked)'}
            </span>
          )}
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded text-xs bg-govt-50 border border-govt-200 text-govt-500 hover:text-govt-800 hover:bg-govt-100 transition-colors"
        >
          <MagnifyingGlass size={13} className="text-govt-400" />
          <span className="hidden md:inline">{t('header.search')}</span>
          <span className="hidden lg:inline text-[10px] font-mono bg-white border border-govt-200 px-1 rounded text-govt-400">{t('header.searchShortcut')}</span>
        </button>
      </div>

      {/* Right: Lang, Bell, Profile */}
      <div className="flex items-center gap-3 text-xs">
        <LanguageDropdown />

        <Link
          to="/early-warnings"
          className="p-1.5 rounded text-govt-600 hover:text-govt-900 hover:bg-govt-100 relative"
          title={t('header.notifications')}
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full" />
        </Link>

        {/* User Profile / Menu */}
        <div className="relative">
          <button
            id="header-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded hover:bg-govt-100 text-govt-700 font-medium"
          >
            {roleColour
              ? <div className={`w-6 h-6 rounded-full flex items-center justify-center ${roleColour.bg} border ${roleColour.border}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${roleColour.dot}`} />
                </div>
              : <UserCircle size={18} className="text-govt-500" />
            }
            <span className="hidden xl:inline text-xs truncate max-w-[130px]">
              {userProfile ? userProfile.displayName.split(' ')[0] : (userEmail.split('@')[0])}
            </span>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-1 w-64 bg-white border border-govt-200 rounded-card shadow-lg p-2 z-50 text-xs"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              {userProfile ? (
                <>
                  {/* Profile card */}
                  <div className={`px-3 py-2.5 rounded mb-1 border ${roleColour?.bg} ${roleColour?.border}`}>
                    <div className={`font-bold text-sm ${roleColour?.text} truncate`}>
                      {userProfile.displayName}
                    </div>
                    <div className="text-[11px] text-govt-500 mt-0.5 truncate">{userProfile.email}</div>
                    <div className={`mt-1.5 text-[11px] font-semibold ${roleColour?.text}`}>
                      {userProfile.roleLabel}
                    </div>
                    <div className="text-[11px] text-govt-500 mt-0.5 flex items-center gap-1">
                      <Buildings size={10} className="shrink-0" />
                      <span className="truncate">{userProfile.organisation}</span>
                    </div>
                    <div className="text-[11px] text-govt-600 mt-1 flex items-center gap-1 font-medium">
                      <MapPin size={10} className="shrink-0" />
                      <span>{scopeLabel}</span>
                      {isGeoLocked && <Lock size={9} className="text-amber-600 shrink-0" />}
                    </div>
                  </div>

                  {/* Demo warning */}
                  {userProfile.isDemo && (
                    <div className="px-2 py-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded mb-1">
                      {isHI ? 'प्रोटोटाइप डेमो खाता — सुरक्षित प्राधिकरण नहीं।' : 'Prototype demo account — not secure authorisation.'}
                    </div>
                  )}
                </>
              ) : (
                <div className="px-2 py-1.5 border-b border-govt-100 text-govt-500 text-[11px] truncate">
                  {userEmail}
                </div>
              )}

              <button
                id="header-signout-btn"
                onClick={handleSignOut}
                className="w-full mt-1 px-2 py-1.5 text-left rounded text-red-700 hover:bg-red-50 flex items-center gap-1.5 font-medium"
              >
                <SignOut size={13} />
                <span>{t('header.signOut')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
