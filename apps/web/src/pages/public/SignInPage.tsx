import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserProfile, DEMO_ACCOUNTS, UserRole } from '../../context/UserProfileContext';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageDropdown } from '../../components/common/LanguageDropdown';
import {
  LockKey,
  EnvelopeSimple,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Buildings,
  MapPin,
  Globe,
  Warning,
  UserCircle,
  CaretDown,
} from '@phosphor-icons/react';
import { Button } from '../../components/common/Button';

// ─── Role Card definitions ────────────────────────────────────────────────────
interface RoleCardDef {
  role: UserRole;
  email: string;
  labelEN: string;
  labelHI: string;
  descEN: string;
  descHI: string;
  scopeEN: string;
  scopeHI: string;
  orgEN: string;
}

const ROLE_CARDS: RoleCardDef[] = [
  {
    role: 'DISTRICT_OFFICER',
    email: 'district.nashik@dsdm.mh.gov.in',
    labelEN: 'District Officer',
    labelHI: 'जिला अधिकारी',
    descEN: 'DSC / DSDM — District Skill Development Mission',
    descHI: 'DSC / DSDM — जिला कौशल विकास मिशन',
    scopeEN: 'Nashik District, Maharashtra',
    scopeHI: 'नासिक जिला, महाराष्ट्र',
    orgEN: 'District Skill Development Mission',
  },
  {
    role: 'STATE_PLANNER',
    email: 'planner.maharashtra@ssdm.mh.gov.in',
    labelEN: 'State Planner / Auditor',
    labelHI: 'राज्य योजनाकार / लेखापरीक्षक',
    descEN: 'SSDM — State Skill Development Mission',
    descHI: 'SSDM — राज्य कौशल विकास मिशन',
    scopeEN: 'Maharashtra (All Districts)',
    scopeHI: 'महाराष्ट्र (सभी जिले)',
    orgEN: 'State Skill Development Mission',
  },
  {
    role: 'NATIONAL_MSDE',
    email: 'officer.planning@msde.gov.in',
    labelEN: 'National MSDE Officer',
    labelHI: 'राष्ट्रीय MSDE अधिकारी',
    descEN: 'Ministry of Skill Development & Entrepreneurship',
    descHI: 'कौशल विकास एवं उद्यमशीलता मंत्रालय',
    scopeEN: 'All India',
    scopeHI: 'अखिल भारतीय',
    orgEN: 'MSDE — Government of India',
  },
  {
    role: 'SSC',
    email: 'ssc.automotive@nsdc.gov.in',
    labelEN: 'Sector Skill Council',
    labelHI: 'सेक्टर कौशल परिषद',
    descEN: 'SSC — National Skills Development Corporation',
    descHI: 'SSC — राष्ट्रीय कौशल विकास निगम',
    scopeEN: 'Automotive & Electronics Sectors',
    scopeHI: 'ऑटोमोटिव एवं इलेक्ट्रॉनिक्स क्षेत्र',
    orgEN: 'Automotive Skills Development Council',
  },
];

const ROLE_ACCENT: Record<UserRole, string> = {
  DISTRICT_OFFICER: 'border-blue-300 bg-blue-50/50',
  STATE_PLANNER: 'border-emerald-300 bg-emerald-50/50',
  NATIONAL_MSDE: 'border-navy-700/40 bg-navy-900/5',
  SSC: 'border-amber-300 bg-amber-50/50',
};

const ROLE_ACTIVE_ACCENT: Record<UserRole, string> = {
  DISTRICT_OFFICER: 'border-blue-600 bg-blue-50 ring-2 ring-blue-200',
  STATE_PLANNER: 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200',
  NATIONAL_MSDE: 'border-navy-800 bg-govt-100 ring-2 ring-navy-200',
  SSC: 'border-amber-600 bg-amber-50 ring-2 ring-amber-200',
};

const ROLE_DOT: Record<UserRole, string> = {
  DISTRICT_OFFICER: 'bg-blue-600',
  STATE_PLANNER: 'bg-emerald-600',
  NATIONAL_MSDE: 'bg-navy-900',
  SSC: 'bg-amber-600',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const SignInPage: React.FC = () => {
  const { loginWithProfile } = useUserProfile();
  const { login: legacyLogin, setGeography } = useFilters();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isHI = lang === 'HI';

  // Select demo role — auto-fill email
  const handleSelectRole = (card: RoleCardDef) => {
    setSelectedRole(card.role);
    setEmail(card.email);
    setPassword('demo1234');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('signin.errorEmpty'));
      return;
    }

    setSubmitting(true);
    setError('');

    // Small artificial delay so the button feels responsive
    await new Promise(r => setTimeout(r, 350));

    const result = loginWithProfile(email.trim().toLowerCase(), password);

    if (!result.success) {
      setError(
        isHI
          ? 'यह ईमेल किसी डेमो खाते से मेल नहीं खाती। नीचे दी गई भूमिकाओं में से एक चुनें।'
          : 'This email does not match any demo account. Please select a role above or use a listed demo email.'
      );
      setSubmitting(false);
      return;
    }

    // Also update FilterContext for backward-compat with legacy login
    const profile = DEMO_ACCOUNTS[email.trim().toLowerCase()];
    if (profile) {
      legacyLogin(email.trim().toLowerCase());
      setGeography(
        profile.jurisdiction.defaultGeoState,
        profile.jurisdiction.defaultGeoDistrict
      );
    }

    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-govt-50 text-govt-900 font-sans flex flex-col">
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-govt-200 px-6 sm:px-12 flex items-center justify-between shadow-subtle">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-govt-600 hover:text-govt-900 font-medium">
          <ArrowLeft size={14} />
          <span>{t('header.backOverview')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageDropdown />
          <span className="font-bold text-xs text-navy-900 tracking-wider">{t('brand.name')}</span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">

        {/* ── Title block ── */}
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-full bg-navy-900 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            {isHI ? 'सरकारी साइन इन' : t('signin.title')}
          </h1>
          <p className="text-xs text-govt-500 mt-1 max-w-sm mx-auto">
            {isHI
              ? 'अपनी भूमिका चुनें और डेमो खाते से साइन इन करें।'
              : 'Select your role, then sign in with a demo account.'}
          </p>
        </div>

        {/* ── Role Cards ── */}
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-govt-500 mb-3">
            {isHI ? 'चरण 1: अपनी भूमिका चुनें' : 'Step 1 — Select your role'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLE_CARDS.map(card => {
              const isActive = selectedRole === card.role;
              return (
                <button
                  key={card.role}
                  id={`role-card-${card.role.toLowerCase()}`}
                  type="button"
                  onClick={() => handleSelectRole(card)}
                  className={`text-left border rounded-card p-4 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${isActive ? ROLE_ACTIVE_ACCENT[card.role] : `${ROLE_ACCENT[card.role]} hover:border-govt-400`}
                  `}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${ROLE_DOT[card.role]}`} />
                      <span className="text-sm font-bold text-navy-900">
                        {isHI ? card.labelHI : card.labelEN}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-semibold text-white bg-primary-700 px-2 py-0.5 rounded shrink-0">
                        {isHI ? 'चुना गया' : 'Selected'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-govt-600 mb-1.5">{isHI ? card.descHI : card.descEN}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-govt-500">
                    <MapPin size={11} className="shrink-0 text-govt-400" />
                    <span className="font-medium">{isHI ? card.scopeHI : card.scopeEN}</span>
                  </div>
                  {isActive && (
                    <div className="mt-2 pt-2 border-t border-govt-200 text-[11px] text-govt-500 font-mono truncate">
                      {card.email}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Login Form ── */}
        <div className="bg-white border border-govt-200 rounded-card shadow-card p-5 sm:p-6 space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-govt-500">
            {isHI ? 'चरण 2: साइन इन करें' : 'Step 2 — Sign in'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2">
                <Warning size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-govt-700 block mb-1">{t('signin.emailLabel')}</label>
              <div className="relative">
                <EnvelopeSimple size={15} className="absolute left-3 top-2.5 text-govt-400" />
                <input
                  id="signin-email"
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder={isHI ? 'ईमेल / सरकारी ID' : 'officer.planning@msde.gov.in'}
                  className="w-full bg-govt-50 border border-govt-300 rounded pl-9 pr-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-govt-700">{t('signin.passwordLabel')}</label>
              </div>
              <div className="relative">
                <LockKey size={15} className="absolute left-3 top-2.5 text-govt-400" />
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-govt-50 border border-govt-300 rounded pl-9 pr-3 py-2 text-xs text-govt-900 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              {selectedRole && (
                <p className="text-[10px] text-govt-400 mt-1">
                  {isHI ? 'डेमो पासवर्ड स्वतः भरा गया है।' : 'Demo password pre-filled.'}
                </p>
              )}
            </div>

            <Button
              id="signin-submit"
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              disabled={!email.trim() || submitting}
              iconRight={<ArrowRight size={14} />}
              className="w-full py-2.5"
            >
              {isHI ? 'डैशबोर्ड में प्रवेश करें' : t('signin.submit')}
            </Button>
          </form>

          {/* Manual email toggle */}
          <div className="border-t border-govt-100 pt-3">
            <button
              type="button"
              onClick={() => setShowManual(!showManual)}
              className="text-[11px] text-govt-500 hover:text-govt-700 flex items-center gap-1"
            >
              <CaretDown size={11} className={`transition-transform ${showManual ? 'rotate-180' : ''}`} />
              <span>{isHI ? 'अन्य डेमो ईमेल देखें' : 'See all demo accounts'}</span>
            </button>
            {showManual && (
              <div className="mt-2 space-y-1 text-[11px]">
                {Object.values(DEMO_ACCOUNTS).map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('demo1234');
                      setSelectedRole(acc.role);
                      setError('');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded bg-govt-50 border border-govt-200 hover:bg-govt-100 font-mono text-govt-600 hover:text-govt-900 flex items-center justify-between gap-2"
                  >
                    <span>{acc.email}</span>
                    <span className="text-[10px] font-sans text-govt-400 shrink-0">{acc.roleLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Prototype disclaimer ── */}
        <div className="mt-4 flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          <Warning size={13} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{isHI ? 'प्रोटोटाइप: ' : 'Prototype: '}</span>
            <span>
              {isHI
                ? 'यह डेमो प्रमाणीकरण केवल SIH 2026 प्रदर्शन के लिए है। वास्तविक तैनाती में NIC-प्रमाणित बैकएंड सत्यापन आवश्यक है।'
                : 'Demo authentication for SIH 2026 demonstration only. Production deployment requires NIC-verified backend session management.'}
            </span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-govt-400">{t('signin.restricted')}</p>
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-xs text-govt-400">
        <span>{t('signin.footerNote')}</span>
      </footer>
    </div>
  );
};
