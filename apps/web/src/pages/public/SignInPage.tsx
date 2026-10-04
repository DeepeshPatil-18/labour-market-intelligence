import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { LockKey, EnvelopeSimple, ArrowRight, ShieldCheck, ArrowLeft, Globe } from '@phosphor-icons/react';
import { Button } from '../../components/common/Button';

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('officer.planning@msde.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const { login, setGeography } = useFilters();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('signin.errorEmpty'));
      return;
    }
    login(email);
    // Reset to All India default
    setGeography('ALL', 'ALL');
    // Direct navigation to Dashboard
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-govt-50 text-govt-900 font-sans flex flex-col justify-between">
      {/* Simple Header */}
      <header className="h-16 bg-white border-b border-govt-200 px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-govt-600 hover:text-govt-900 font-medium">
          <ArrowLeft size={14} />
          <span>{t('header.backOverview')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-govt-50 hover:bg-govt-100 border border-govt-200 text-govt-800 transition-colors"
            title={t('header.toggleLang')}
          >
            <Globe size={14} className="text-govt-500" />
            <span>{lang === 'EN' ? 'हिन्दी' : 'English'}</span>
          </button>
          <span className="font-bold text-xs text-navy-900 tracking-wider">{t('brand.name')}</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-govt-200 rounded-card shadow-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="w-10 h-10 rounded-full bg-govt-100 flex items-center justify-center text-navy-900 mx-auto mb-2 border border-govt-200">
              <ShieldCheck size={22} />
            </div>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {t('signin.title')}
            </h1>
            <p className="text-xs text-govt-500">
              {t('signin.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="font-semibold text-govt-700 block mb-1">
                {t('signin.emailLabel')}
              </label>
              <div className="relative">
                <EnvelopeSimple size={15} className="absolute left-3 top-2.5 text-govt-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer.planning@msde.gov.in"
                  className="w-full bg-govt-50 border border-govt-300 rounded pl-9 pr-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-govt-700">{t('signin.passwordLabel')}</label>
                <button
                  type="button"
                  onClick={() => alert('Password reset requests must be submitted to your ministry department IT coordinator.')}
                  className="text-primary-700 hover:underline text-[11px]"
                >
                  {t('signin.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <LockKey size={15} className="absolute left-3 top-2.5 text-govt-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-govt-50 border border-govt-300 rounded pl-9 pr-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              iconRight={<ArrowRight size={14} />}
              className="w-full py-2.5 mt-2"
            >
              {t('signin.submit')}
            </Button>
          </form>

          <div className="pt-4 border-t border-govt-100 text-center">
            <p className="text-[11px] text-govt-400">
              {t('signin.restricted')}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-govt-400">
        <span>{t('signin.footerNote')}</span>
      </footer>
    </div>
  );
};
