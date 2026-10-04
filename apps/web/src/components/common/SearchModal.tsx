import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlass, X, ArrowRight, Briefcase, IdentificationCard, MapPin, Tag } from '@phosphor-icons/react';
import { useFilters } from '../../context/FilterContext';
import { occupationService } from '../../services/occupationService';
import { skillService } from '../../services/skillService';
import { useNavigate } from 'react-router-dom';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setGeography, setSector } = useFilters();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    occupations: any[];
    skills: any[];
    districts: string[];
    sectors: string[];
  }>({ occupations: [], skills: [], districts: [], sectors: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ occupations: [], skills: [], districts: [], sectors: [] });
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ occupations: [], skills: [], districts: [], sectors: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const [occ, sk] = await Promise.all([
        occupationService.getOccupations(query, 'ALL', 5),
        skillService.getAllSkills(query, 'ALL')
      ]);

      const q = query.toLowerCase();
      const allDistricts = ['Nashik', 'Pune', 'Mumbai', 'Nagpur', 'Aurangabad', 'Bengaluru', 'Chennai', 'Gurugram', 'Hyderabad', 'Indore', 'Ahmedabad', 'Surat', 'Kanpur', 'Kolkata'];
      const matchedDistricts = allDistricts.filter(d => d.toLowerCase().includes(q));

      const allSectors = ['Automotive & Advanced Manufacturing', 'Software & IT', 'Electronics & Hardware', 'Renewable Energy', 'Logistics & Supply Chain', 'Healthcare & Pharma', 'Agriculture & Food Processing'];
      const matchedSectors = allSectors.filter(s => s.toLowerCase().includes(q));

      setResults({
        occupations: occ,
        skills: sk.slice(0, 5),
        districts: matchedDistricts.slice(0, 3),
        sectors: matchedSectors.slice(0, 3)
      });
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const totalResults = results.occupations.length + results.skills.length + results.districts.length + results.sectors.length;

  return (
    <div className="fixed inset-0 z-50 bg-govt-900/40 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div 
        className="w-full max-w-2xl bg-white border border-govt-200 rounded-card shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-govt-200 bg-govt-50/50">
          <MagnifyingGlass size={20} className="text-govt-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NCO codes (e.g. 1111.0100), skills, occupations, districts..."
            className="w-full bg-transparent px-3 text-sm text-govt-900 placeholder:text-govt-400 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-govt-400 hover:text-govt-700 hover:bg-govt-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-3 divide-y divide-govt-100 text-sm">
          {!query.trim() && (
            <div className="py-8 text-center text-xs text-govt-400">
              <p className="font-medium text-govt-600 mb-1">Quick Search across Canonical Datasets</p>
              <p>Type an NCO 2015 code, trade title, skill keyword, or district name</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {['React', 'CNC Operator', '1111.0100', 'Nashik', 'Manufacturing'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2 py-1 bg-govt-100 hover:bg-govt-200 rounded text-govt-700 text-xs font-mono"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && !loading && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-govt-400">
              No matching occupations, skills, or districts found for "{query}".
            </div>
          )}

          {/* Occupations */}
          {results.occupations.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-govt-400 px-2 block mb-1">
                Occupations (NCO 2015)
              </span>
              {results.occupations.map(occ => (
                <div
                  key={occ.ncoCode}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/labour-market?search=${encodeURIComponent(occ.ncoCode)}`);
                  }}
                  className="px-2.5 py-2 rounded hover:bg-primary-50 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-start gap-2.5">
                    <IdentificationCard size={18} className="text-primary-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-govt-900 group-hover:text-primary-800">
                        {occ.title}
                      </div>
                      <div className="text-xs text-govt-500 font-mono">
                        NCO: {occ.ncoCode} · {occ.divisionTitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-govt-300 group-hover:text-primary-700" />
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {results.skills.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-govt-400 px-2 block mb-1">
                Skills
              </span>
              {results.skills.map(sk => (
                <div
                  key={sk.skill_id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/skill-graph?skill=${encodeURIComponent(sk.skill_name)}`);
                  }}
                  className="px-2.5 py-2 rounded hover:bg-primary-50 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Tag size={18} className="text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-medium text-govt-900 group-hover:text-primary-800">
                        {sk.skill_name}
                      </div>
                      <div className="text-xs text-govt-500">
                        {sk.skill_category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-govt-300 group-hover:text-primary-700" />
                </div>
              ))}
            </div>
          )}

          {/* Districts */}
          {results.districts.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-govt-400 px-2 block mb-1">
                Geographic Districts
              </span>
              {results.districts.map(dist => (
                <div
                  key={dist}
                  onClick={() => {
                    setGeography('ALL', dist);
                    setIsSearchOpen(false);
                    navigate('/overview');
                  }}
                  className="px-2.5 py-2 rounded hover:bg-primary-50 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin size={18} className="text-amber-700 shrink-0" />
                    <span className="font-medium text-govt-900 group-hover:text-primary-800">
                      {dist} District
                    </span>
                  </div>
                  <span className="text-xs text-primary-700 font-medium">Filter Dashboard</span>
                </div>
              ))}
            </div>
          )}

          {/* Sectors */}
          {results.sectors.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-govt-400 px-2 block mb-1">
                Sectors
              </span>
              {results.sectors.map(sec => (
                <div
                  key={sec}
                  onClick={() => {
                    setSector(sec);
                    setIsSearchOpen(false);
                    navigate('/labour-market');
                  }}
                  className="px-2.5 py-2 rounded hover:bg-primary-50 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase size={18} className="text-indigo-700 shrink-0" />
                    <span className="font-medium text-govt-900 group-hover:text-primary-800">
                      {sec}
                    </span>
                  </div>
                  <span className="text-xs text-primary-700 font-medium">Filter Sector</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 border-t border-govt-200 bg-govt-50 text-[11px] text-govt-400 flex items-center justify-between">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-govt-300 rounded font-mono">ESC</kbd> to close</span>
          <span>SIH 2026 PS 26246 Knowledge Base</span>
        </div>
      </div>
    </div>
  );
};
