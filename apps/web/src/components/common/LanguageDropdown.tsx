import React, { useState, useRef, useEffect } from 'react';
import { Globe, CaretDown, Check } from '@phosphor-icons/react';
import { useLanguage, Language } from '../../context/LanguageContext';

interface LanguageDropdownProps {
  className?: string;
  buttonClassName?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  className = '',
  buttonClassName = ''
}) => {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (selectedLang: Language) => {
    setLang(selectedLang);
    setIsOpen(false);
  };

  const currentLabel = lang === 'HI' ? 'हिन्दी' : 'English';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={t('header.toggleLang')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-govt-50 hover:bg-govt-100 border border-govt-200 text-govt-800 transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500 ${buttonClassName}`}
      >
        <Globe size={14} className="text-govt-500 shrink-0" />
        <span>{currentLabel}</span>
        <CaretDown size={11} className={`text-govt-500 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-36 bg-white border border-govt-200 rounded-card shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
          aria-label="Select Language"
        >
          {/* English Option */}
          <button
            type="button"
            role="option"
            aria-selected={lang === 'EN'}
            onClick={() => handleSelect('EN')}
            className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors ${
              lang === 'EN' 
                ? 'bg-primary-50/80 text-primary-900 font-bold' 
                : 'text-govt-700 hover:bg-govt-50 font-medium'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm leading-none" role="img" aria-label="UK Flag">🇬🇧</span>
              <span>English</span>
            </span>
            {lang === 'EN' && <Check size={14} weight="bold" className="text-primary-700 shrink-0" />}
          </button>

          {/* Hindi Option */}
          <button
            type="button"
            role="option"
            aria-selected={lang === 'HI'}
            onClick={() => handleSelect('HI')}
            className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors ${
              lang === 'HI' 
                ? 'bg-primary-50/80 text-primary-900 font-bold' 
                : 'text-govt-700 hover:bg-govt-50 font-medium'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm leading-none" role="img" aria-label="India Flag">🇮🇳</span>
              <span>हिन्दी</span>
            </span>
            {lang === 'HI' && <Check size={14} weight="bold" className="text-primary-700 shrink-0" />}
          </button>
        </div>
      )}
    </div>
  );
};
