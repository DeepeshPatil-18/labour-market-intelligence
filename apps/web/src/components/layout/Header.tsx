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
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  productName?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  productName = 'KUSHAL' 
}) => {
  const { filters, setIsSearchOpen, logout, userEmail } = useFilters();
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Scope label formatting
  const scopeLabel = filters.state === 'ALL'
    ? 'All India'
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

      {/* Center: Current Scope Display (Read-Only indicator; Map is the interactive scope control) */}
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
          <span className="hidden md:inline">Search...</span>
          <span className="hidden lg:inline text-[10px] font-mono bg-white border border-govt-200 px-1 rounded text-govt-400">Ctrl+K</span>
        </button>
      </div>

      {/* Right: Language, Notifications, Officer Profile */}
      <div className="flex items-center gap-3 text-xs">
        {/* Language */}
        <button
          onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
          className="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-govt-600 hover:text-govt-900"
          title="Toggle Language"
        >
          <Globe size={14} className="text-govt-400" />
          <span>{lang}</span>
        </button>

        {/* Notifications */}
        <Link
          to="/early-warnings"
          className="p-1.5 rounded text-govt-600 hover:text-govt-900 hover:bg-govt-100 relative"
          title="Early Warning Alerts"
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
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
