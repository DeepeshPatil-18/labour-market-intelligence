import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserCircle } from '@phosphor-icons/react';
import { plfsService } from '../../services/plfsService';

export const LandingPage: React.FC = () => {
  const plfsBaseline = plfsService.getNationalBaseline2025();

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-slate-200">
      {/* 100VH HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-white border-b border-slate-200/80">
        {/* Full-Screen Edge-to-Edge Background Illustration */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/images/fullscreen-hero.jpg"
            alt="India National Labour Market Ecosystem"
            className="w-full h-full object-cover object-right md:object-right-center opacity-95"
          />
          {/* Soft horizontal legibility gradient on the far left */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent w-full md:w-3/5 pointer-events-none" />
        </div>

        {/* Minimal Transparent Header */}
        <header className="relative z-10 h-20 px-6 sm:px-12 lg:px-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-widest uppercase text-slate-900">
              KUSHAL
            </span>
          </div>

          <Link
            to="/sign-in"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <UserCircle size={15} />
            <span>Government Sign In</span>
          </Link>
        </header>

        {/* Hero Content on Left */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-12 sm:py-16 my-auto">
          <div className="max-w-xl space-y-6 text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
              NATIONAL LABOUR MARKET INTELLIGENCE
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-950 tracking-tight leading-[1.12]">
              Understand India's <br className="hidden sm:inline" />
              changing workforce.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Identify skill shortages, anticipate emerging demand, and plan training priorities across India.
            </p>

            <div className="pt-3">
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Government Sign In</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Abstract Labour-Market Signal Flow (Subtle visual bridge to India map) */}
            <div className="pt-6 sm:pt-8 pointer-events-none select-none max-w-lg">
              <svg
                viewBox="0 0 520 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto text-slate-900 opacity-80"
              >
                <defs>
                  <linearGradient id="heroSignalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                    <stop offset="45%" stopColor="#1e3a8a" stopOpacity="0.9" />
                    <stop offset="80%" stopColor="#2563eb" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="heroSecondaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* Secondary dashed trajectory line */}
                <path
                  d="M 15 68 C 90 68, 140 78, 230 58 C 320 38, 410 48, 495 30"
                  stroke="url(#heroSecondaryGrad)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />

                {/* Primary signal flow curve */}
                <path
                  d="M 10 52 C 85 52, 130 22, 220 35 C 310 48, 380 18, 500 24"
                  stroke="url(#heroSignalGrad)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />

                {/* Micro signal chart bars at Node 1 */}
                <rect x="75" y="44" width="2.5" height="7" rx="1" fill="#0f172a" opacity="0.5" />
                <rect x="80" y="39" width="2.5" height="12" rx="1" fill="#0f172a" opacity="0.65" />
                <rect x="85" y="42" width="2.5" height="9" rx="1" fill="#0f172a" opacity="0.55" />

                {/* Micro signal chart bars at Node 2 (Velocity Peak) */}
                <rect x="210" y="22" width="2.5" height="8" rx="1" fill="#1e3a8a" opacity="0.5" />
                <rect x="215" y="17" width="2.5" height="13" rx="1" fill="#1e3a8a" opacity="0.75" />
                <rect x="220" y="13" width="2.5" height="17" rx="1" fill="#2563eb" opacity="0.9" />
                <rect x="225" y="19" width="2.5" height="11" rx="1" fill="#2563eb" opacity="0.6" />

                {/* Micro signal chart bars at Node 3 */}
                <rect x="370" y="14" width="2.5" height="9" rx="1" fill="#2563eb" opacity="0.6" />
                <rect x="375" y="9" width="2.5" height="14" rx="1" fill="#2563eb" opacity="0.8" />

                {/* Interconnecting arc segments */}
                <path d="M 85 39 Q 120 20, 155 30" stroke="#64748b" strokeWidth="0.8" opacity="0.4" strokeDasharray="2 2" />
                <path d="M 220 35 Q 290 12, 375 14" stroke="#2563eb" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 3" />

                {/* Network Nodes */}
                <circle cx="10" cy="52" r="3" fill="#0f172a" />
                <circle cx="85" cy="39" r="3" fill="#1e293b" />
                <circle cx="155" cy="30" r="2.5" fill="#3b82f6" />
                
                {/* Location/Data Pin 1 */}
                <circle cx="220" cy="35" r="7.5" stroke="#2563eb" strokeWidth="1" fill="none" opacity="0.6" />
                <circle cx="220" cy="35" r="2.5" fill="#2563eb" />

                <circle cx="300" cy="42" r="2.5" fill="#475569" />

                {/* Location/Data Pin 2 */}
                <circle cx="375" cy="14" r="6.5" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.5" />
                <circle cx="375" cy="14" r="2" fill="#3b82f6" />

                <circle cx="440" cy="27" r="2.5" fill="#64748b" />

                {/* Terminal flow tip pointing towards India map */}
                <path d="M 494 20 L 502 24 L 494 28" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom bar of hero */}
        <div className="relative z-10 px-6 sm:px-12 lg:px-16 pb-6 text-xs text-slate-400 flex items-center justify-between">
          <span className="text-[11px]">Ministry of Skill Development & Entrepreneurship (MSDE)</span>
          <span className="text-[11px] font-medium tracking-wide text-slate-400">SIH 2026 · Problem Statement 26246</span>
        </div>
      </section>

      {/* RESTRAINED "INDIA AT A GLANCE" PLFS 2025 SECTION */}
      <section className="bg-slate-50/60 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200/60 pb-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              India at a glance
            </h2>
            <span className="text-xs text-slate-500 font-medium font-mono">
              {plfsBaseline.provenance}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {/* Metric 1 */}
            <div className="p-4 bg-white rounded border border-slate-200/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-950">
                {plfsBaseline.lfpr}%
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Labour Force Participation
              </div>
              <div className="text-[10px] text-slate-400">Usual status (15+ years)</div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 bg-white rounded border border-slate-200/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-950">
                {plfsBaseline.wpr}%
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Worker Population Ratio
              </div>
              <div className="text-[10px] text-slate-400">Usual status (15+ years)</div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 bg-white rounded border border-slate-200/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-950">
                {plfsBaseline.unemploymentRate}%
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Unemployment Rate
              </div>
              <div className="text-[10px] text-slate-400">Usual status (15+ years)</div>
            </div>

            {/* Metric 4 */}
            <div className="p-4 bg-white rounded border border-slate-200/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-950">
                {plfsBaseline.agricultureShare}%
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Employment in Agriculture
              </div>
              <div className="text-[10px] text-slate-400">National sector share</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIET WORKFLOW & POLICY EVIDENCE SECTION */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 space-y-10">
          <div className="space-y-2 text-left">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              IDENTIFY → FORECAST → PLAN
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              From labour-market signals to actionable workforce planning.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            <div className="space-y-2 bg-slate-50/50 p-6 rounded border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                01 / Identify
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Detect skill shortages and emerging demand across regional industry clusters using employer requisitions and NCO 2015 standards.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50/50 p-6 rounded border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                02 / Forecast
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Anticipate future labour-market gaps across 3, 6, and 12-month horizons by joining macro PLFS baselines with hiring growth velocity.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50/50 p-6 rounded border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                03 / Plan
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prioritize ITI seat capacity, accredited training sanctioning, and local skill development programs based on effective supply gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RESTRAINED FOOTER */}
      <footer className="py-6 px-6 sm:px-12 lg:px-16 text-xs text-slate-400 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>Smart India Hackathon 2026 · Problem Statement 26246</span>
        <span className="text-[11px] text-slate-400">National Labour Market Intelligence Decision Support Platform</span>
      </footer>
    </div>
  );
};
