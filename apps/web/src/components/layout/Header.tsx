import React, { useState } from 'react';
import { 
  MagnifyingGlass, 
  Bell, 
  MapPin, 
  Globe, 
  UserCircle,
  SignOut
} from '@phosphor-icons/react';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  productName?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  productName = 'KUSHAL' 
}) => {
  const { filters, setIsSearchOpen, logout, userEmail } = useFilters();
  const { lang, setLang, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Scope label formatting
  const scopeLabel = filters.state === 'ALL'
    ? t('header.scopeAllIndia')
    : filters.district === 'ALL'
    ? filters.state
    : `${filters.state} · ${filters.district}`;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-14 bg-white border-b border-govt-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-subtle">
      {/* Left: Text-only Brand Name Placeholder */}
      <div className="flex items-center gap-3">
        <Link to="/overview" className="font-bold text-sm tracking-tight text-navy-900 hover:text-govt-700">
          {productName}
        </Link>
      </div>

      {/* Center: Current Scope Display */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-govt-50 border border-govt-200 rounded text-xs text-govt-800">
          <MapPin size={13} className="text-govt-500 shrink-0" />
          <span className="font-semibold text-navy-900">{scopeLabel}</span>
        </div>

        {/* Global Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded text-xs bg-govt-50 border border-govt-200 text-govt-500 hover:text-govt-800 hover:bg-govt-100 transition-colors"
        >
          <MagnifyingGlass size={13} className="text-govt-400" />
          <span className="hidden md:inline">{t('header.search')}</span>
          <span className="hidden lg:inline text-[10px] font-mono bg-white border border-govt-200 px-1 rounded text-govt-400">{t('header.searchShortcut')}</span>
        </button>
      </div>

      {/* Right: Language, Notifications, Officer Profile */}
      <div className="flex items-center gap-3 text-xs">
        {/* Language selector toggle */}
        <button
          onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-govt-50 hover:bg-govt-100 border border-govt-200 text-govt-800 transition-colors"
          title={t('header.toggleLang')}
        >
          <Globe size={14} className="text-govt-500" />
          <span>{lang === 'EN' ? 'हिन्दी' : 'English'}</span>
        </button>

        {/* Notifications */}
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
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded hover:bg-govt-100 text-govt-700 font-medium"
          >
            <UserCircle size={18} className="text-govt-500" />
            <span className="hidden xl:inline text-xs truncate max-w-[120px]">
              {userEmail.split('@')[0]}
            </span>
          </button>

          {showProfileMenu && (
            <div 
              className="absolute right-0 mt-1 w-48 bg-white border border-govt-200 rounded-card shadow-lg p-2 z-50 text-xs"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="px-2 py-1.5 border-b border-govt-100 text-govt-500 text-[11px] truncate">
                {userEmail}
              </div>
              <button
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
