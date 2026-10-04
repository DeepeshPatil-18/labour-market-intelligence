import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFilters } from '../../context/FilterContext';
import { mapDataService, StateLabourMetric, DistrictLabourMetric } from '../../services/mapDataService';
import { geoMercator, geoPath } from 'd3-geo';
import { MapPin, ArrowLeft, CheckCircle, Info, SpinnerGap, ArrowSquareOut } from '@phosphor-icons/react';

interface TooltipInfo {
  title: string;
  subtitle?: string;
  status: string;
  demandLevel: string;
  metric1Label: string;
  metric1Value: string | number;
  metric2Label: string;
  metric2Value: string | number;
  industries?: string;
  x: number;
  y: number;
}

export const IndiaChoroplethMap: React.FC = () => {
  const { filters, setGeography } = useFilters();
  const containerRef = useRef<HTMLDivElement>(null);

  // GeoJSON state
  const [indiaGeoJson, setIndiaGeoJson] = useState<any>(null);
  const [stateDistrictsGeoJson, setStateDistrictsGeoJson] = useState<any>(null);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);

  // Tooltip & hover
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  // Labour data metrics
  const stateLabourMetrics = useMemo(() => {
    return mapDataService.getAllStateLabourMetrics();
  }, []);

  const districtLabourMetrics = useMemo(() => {
    if (filters.state === 'ALL') return {};
    return mapDataService.getDistrictLabourMetrics(filters.state);
  }, [filters.state]);

  // Load All-India States GeoJSON once on mount
  useEffect(() => {
    let isMounted = true;
    mapDataService.loadIndiaStatesGeoJSON().then(data => {
      if (isMounted) {
        setIndiaGeoJson(data);
        setLoadingMap(false);
      }
    }).catch(err => {
      console.error('Failed to load India states GeoJSON:', err);
      if (isMounted) setLoadingMap(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Load State Districts GeoJSON when state changes
  useEffect(() => {
    if (filters.state === 'ALL') {
      setStateDistrictsGeoJson(null);
      return;
    }

    let isMounted = true;
    setLoadingDistricts(true);
    mapDataService.loadStateDistrictsGeoJSON(filters.state).then(data => {
      if (isMounted) {
        setStateDistrictsGeoJson(data);
        setLoadingDistricts(false);
      }
    }).catch(err => {
      console.error('Failed to load state districts GeoJSON:', err);
      if (isMounted) {
        setStateDistrictsGeoJson(null);
        setLoadingDistricts(false);
      }
    });

    return () => { isMounted = false; };
  }, [filters.state]);

  // Dimensions for SVG projection
  const width = 460;
  const height = 480;

  // Compute D3 paths
  const { paths } = useMemo(() => {
    if (filters.state === 'ALL') {
      if (!indiaGeoJson) return { paths: [] };
      const projection = geoMercator().fitSize([width, height - 20], indiaGeoJson);
      const pathGen = geoPath().projection(projection);

      const generatedPaths = indiaGeoJson.features.map((feature: any) => {
        const stateCode = feature.properties.state_code;
        const stateName = feature.properties.state_name;
        const metric: StateLabourMetric = stateLabourMetrics[stateCode] || stateLabourMetrics[stateName] || {
          stateCode,
          stateName,
          hasData: false,
          status: 'Insufficient Data',
          demandLevel: 'Insufficient Data',
          criticalShortages: 0,
          totalPostings: 0,
          activeEmployers: 0,
          growthPct: 0,
          topSkill: null,
          dominantSector: null
        };

        return {
          id: stateCode,
          name: stateName,
          path: pathGen(feature) || '',
          metric,
          feature
        };
      });

      return { paths: generatedPaths };
    } else {
      if (!stateDistrictsGeoJson) return { paths: [] };
      const projection = geoMercator().fitSize([width, height - 20], stateDistrictsGeoJson);
      const pathGen = geoPath().projection(projection);

      const generatedPaths = stateDistrictsGeoJson.features.map((feature: any) => {
        const distName = feature.properties.district_name;
        const metric: DistrictLabourMetric = districtLabourMetrics[distName] || districtLabourMetrics[distName.toLowerCase()] || {
          districtName: distName,
          stateCode: feature.properties.state_code,
          stateName: feature.properties.state_name,
          hasData: false,
          status: 'Insufficient Data',
          demandLevel: 'Insufficient Data',
          topShortage: null,
          trainingGap: null,
          totalPostings: 0,
          activeEmployers: 0
        };

        return {
          id: distName,
          name: distName,
          path: pathGen(feature) || '',
          metric,
          feature
        };
      });

      return { paths: generatedPaths };
    }
  }, [filters.state, indiaGeoJson, stateDistrictsGeoJson, stateLabourMetrics, districtLabourMetrics]);

  // Color styles based on labour market shortage status
  const getColorScheme = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return { fill: '#DBEAFE', stroke: '#1E40AF', strokeWidth: '2.5' };
    }
    switch (status) {
      case 'Critical Shortage':
        return { fill: '#FCA5A5', stroke: '#DC2626', strokeWidth: '1.2' };
      case 'Shortage':
        return { fill: '#FED7AA', stroke: '#EA580C', strokeWidth: '1.2' };
      case 'Balanced':
        return { fill: '#BBF7D0', stroke: '#16A34A', strokeWidth: '1.2' };
      case 'Oversupply':
        return { fill: '#BAE6FD', stroke: '#0284C7', strokeWidth: '1.2' };
      case 'Critical Oversupply':
        return { fill: '#93C5FD', stroke: '#1E3A8A', strokeWidth: '1.2' };
      case 'Insufficient Data':
      default:
        return { fill: '#F1F5F9', stroke: '#CBD5E1', strokeWidth: '0.8' };
    }
  };

  const handleMouseMove = (e: React.MouseEvent, item: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (filters.state === 'ALL') {
      const m = item.metric as StateLabourMetric;
      setTooltip({
        title: item.name,
        subtitle: m.hasData ? `${m.stateCode} · State Labour Signal` : 'No active development signals',
        status: m.status,
        demandLevel: m.demandLevel,
        metric1Label: 'Active Job Requisitions',
        metric1Value: m.hasData ? `${m.totalPostings.toLocaleString()} reqs` : '0',
        metric2Label: 'Top Shortage Skill',
        metric2Value: m.topSkill || 'None',
        industries: m.primaryIndustries,
        x,
        y
      });
    } else {
      const m = item.metric as DistrictLabourMetric;
      setTooltip({
        title: `${item.name} District`,
        subtitle: `${m.stateName} · Administrative Geography`,
        status: m.status,
        demandLevel: m.demandLevel,
        metric1Label: 'Posting Volume',
        metric1Value: m.hasData ? `${m.totalPostings} requisitions` : 'Insufficient Data',
        metric2Label: 'Top Shortage Skill',
        metric2Value: m.topShortage || 'Insufficient Data',
        x,
        y
      });
    }
  };

  return (
    <div className="bg-white border border-govt-200 rounded-card p-5 shadow-card space-y-4" ref={containerRef}>
      {/* Scope Navigation Bar (The Single Unified Scope Drilldown Control) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-govt-100">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-govt-700" />
          <span className="text-xs font-semibold text-govt-500 uppercase tracking-wider">Analysis Scope:</span>
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setGeography('ALL', 'ALL')}
              className={`font-semibold hover:underline px-1.5 py-0.5 rounded transition-colors ${
                filters.state === 'ALL'
                  ? 'bg-primary-50 text-primary-800 font-bold'
                  : 'text-govt-600 hover:text-navy-900'
              }`}
            >
              India
            </button>
            {filters.state !== 'ALL' && (
              <>
                <span className="text-govt-300">/</span>
                <button
                  onClick={() => setGeography(filters.state, 'ALL')}
                  className={`font-semibold hover:underline px-1.5 py-0.5 rounded transition-colors ${
                    filters.district === 'ALL'
                      ? 'bg-primary-50 text-primary-800 font-bold'
                      : 'text-govt-600 hover:text-navy-900'
                  }`}
                >
                  {filters.state}
                </button>
              </>
            )}
            {filters.district !== 'ALL' && (
              <>
                <span className="text-govt-300">/</span>
                <span className="font-bold text-navy-900 bg-govt-100 px-1.5 py-0.5 rounded">
                  {filters.district}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-govt-600">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-300 border border-red-600" />
            <span>Critical shortage</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 border border-amber-500" />
            <span>Shortage</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 border border-emerald-600" />
            <span>Balanced</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-200 border border-sky-600" />
            <span>Oversupply</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300" />
            <span className="text-govt-400">Insufficient data</span>
          </div>
        </div>
      </div>

      {/* Grid: Map Area + District Drilldown List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Map Container */}
        <div className="lg:col-span-7 bg-govt-50/40 rounded border border-govt-200 p-4 flex flex-col items-center justify-center min-h-[460px] relative">
          {loadingMap || loadingDistricts ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-govt-500 text-xs">
              <SpinnerGap size={24} className="animate-spin text-primary-700" />
              <span>Rendering DataMeet spatial boundaries...</span>
            </div>
          ) : paths.length === 0 ? (
            <div className="text-center py-16 text-xs text-govt-500 space-y-2">
              <Info size={28} className="mx-auto text-govt-400" />
              <p>No spatial boundary file available for {filters.state}.</p>
              <button
                onClick={() => setGeography('ALL', 'ALL')}
                className="text-primary-700 font-semibold hover:underline"
              >
                Return to All India Map
              </button>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full max-w-[440px] h-[420px] select-none"
            >
              {paths.map((item: any) => {
                const isSelected =
                  filters.state === 'ALL'
                    ? filters.state === item.name || filters.state === item.id
                    : filters.district === item.name || filters.district === item.id;

                const { fill, stroke, strokeWidth } = getColorScheme(item.metric.status, isSelected);

                return (
                  <path
                    key={item.id}
                    d={item.path}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    className="cursor-pointer transition-all duration-150 hover:opacity-85"
                    onClick={() => {
                      if (filters.state === 'ALL') {
                        setGeography(item.name, 'ALL');
                      } else {
                        setGeography(filters.state, item.name);
                      }
                    }}
                    onMouseEnter={(e) => handleMouseMove(e, item)}
                    onMouseMove={(e) => handleMouseMove(e, item)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </svg>
          )}

          {/* Floating Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 pointer-events-none bg-navy-900 text-white rounded shadow-lg p-3 text-xs max-w-[260px] space-y-1.5 transition-transform"
              style={{
                left: Math.min(tooltip.x + 12, width - 220),
                top: Math.max(tooltip.y - 80, 10)
              }}
            >
              <div className="font-bold text-sm text-white flex items-center justify-between gap-2 border-b border-navy-700 pb-1">
                <span>{tooltip.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    tooltip.status === 'Critical Shortage'
                      ? 'bg-red-900 text-red-200'
                      : tooltip.status === 'Shortage'
                      ? 'bg-amber-900 text-amber-200'
                      : tooltip.status === 'Balanced'
                      ? 'bg-emerald-900 text-emerald-200'
                      : tooltip.status === 'Oversupply'
                      ? 'bg-sky-900 text-sky-200'
                      : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  {tooltip.status}
                </span>
              </div>

              {tooltip.subtitle && (
                <div className="text-[10px] text-slate-400">{tooltip.subtitle}</div>
              )}

              <div className="space-y-1 pt-0.5 text-[11px]">
                <div className="flex justify-between gap-2 text-slate-300">
                  <span className="text-slate-400">{tooltip.metric1Label}:</span>
                  <span className="font-semibold text-white">{tooltip.metric1Value}</span>
                </div>
                <div className="flex justify-between gap-2 text-slate-300">
                  <span className="text-slate-400">{tooltip.metric2Label}:</span>
                  <span className="font-semibold text-white truncate max-w-[130px]" title={String(tooltip.metric2Value)}>
                    {tooltip.metric2Value}
                  </span>
                </div>
                {tooltip.industries && (
                  <div className="pt-1 border-t border-navy-800 text-[10px] text-slate-300">
                    <span className="text-slate-400 block font-semibold">Key Sectors:</span>
                    <span className="truncate block capitalize">{tooltip.industries.replace(/;/g, ' · ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Low-Visibility Provenance Attribution */}
          <div className="w-full flex items-center justify-between text-[10px] text-govt-400 border-t border-govt-200/60 pt-2 mt-2">
            <span>
              Geographic boundaries: <strong className="font-normal text-govt-600">DataMeet India spatial data</strong> (Census 2011 & Survey of India)
            </span>
            <a
              href="https://github.com/datameet/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 hover:underline flex items-center gap-0.5"
            >
              <span>Repository</span>
              <ArrowSquareOut size={10} />
            </a>
          </div>
        </div>

        {/* Right Side: District Selection Panel & Regional Summary */}
        <div className="lg:col-span-5 space-y-3">
          {filters.state !== 'ALL' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-govt-100">
                <div>
                  <h4 className="font-bold text-sm text-navy-900">{filters.state}</h4>
                  <span className="text-xs text-govt-500">
                    {paths.length} DataMeet administrative districts
                  </span>
                </div>
                <button
                  onClick={() => setGeography('ALL', 'ALL')}
                  className="text-xs text-primary-700 hover:underline flex items-center gap-1 font-medium bg-govt-50 px-2 py-1 rounded border border-govt-200"
                >
                  <ArrowLeft size={11} />
                  <span>Return to India</span>
                </button>
              </div>

              {/* District Options */}
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {/* State Overview Option */}
                <div
                  onClick={() => setGeography(filters.state, 'ALL')}
                  className={`p-2.5 rounded border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    filters.district === 'ALL'
                      ? 'bg-primary-50 border-primary-600 font-semibold text-primary-900'
                      : 'bg-white border-govt-200 hover:bg-govt-50 text-govt-700'
                  }`}
                >
                  <div>
                    <span className="font-bold">All {filters.state} Districts (Aggregated)</span>
                    <span className="text-[11px] text-govt-500 block">State-wide labour market view</span>
                  </div>
                  {filters.district === 'ALL' && <CheckCircle size={15} className="text-primary-700" />}
                </div>

                {/* Individual Districts from spatial data */}
                {paths.map((p: any) => {
                  const isDistSelected = filters.district === p.name;
                  const m = p.metric as DistrictLabourMetric;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setGeography(filters.state, p.name)}
                      className={`p-2.5 rounded border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                        isDistSelected
                          ? 'bg-primary-50 border-primary-600 font-semibold text-primary-900'
                          : m.hasData
                          ? 'bg-white border-govt-200 hover:bg-govt-50 text-navy-900'
                          : 'bg-govt-50/50 border-govt-200/60 hover:bg-govt-100/50 text-govt-400'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${m.hasData ? 'text-navy-900' : 'text-govt-500'}`}>
                            {p.name}
                          </span>
                          {m.hasData ? (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                m.status === 'Critical Shortage'
                                  ? 'bg-red-100 text-red-700'
                                  : m.status === 'Shortage'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {m.status}
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-govt-400">
                              Insufficient data
                            </span>
                          )}
                        </div>
                        {m.hasData && m.topShortage && (
                          <div className="text-[11px] text-govt-500">
                            Key demand: <span className="text-govt-800">{m.topShortage}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        {m.hasData ? (
                          <>
                            <span className="font-mono font-bold text-navy-900 block">
                              {m.totalPostings} reqs
                            </span>
                            <span className="text-[10px] text-govt-500">
                              {m.trainingGap !== null ? `${m.trainingGap > 0 ? '+' : ''}${m.trainingGap} seats` : ''}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-govt-400 italic">No signals</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-govt-50 rounded border border-govt-200 text-xs space-y-3">
              <h4 className="font-bold text-sm text-navy-900">National Analysis (28 States + 8 UTs)</h4>
              <p className="text-govt-600 leading-relaxed">
                Click any state polygon on the DataMeet map to filter the entire intelligence platform to that state or administrative district.
              </p>
              
              <div className="pt-2 border-t border-govt-200 space-y-2">
                <span className="font-semibold text-govt-700 block">Industrial Hub Highlights:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { name: 'Maharashtra', code: 'MH', desc: 'Finance, IT, Automotive, Engineering' },
                    { name: 'Gujarat', code: 'GJ', desc: 'Chemicals, Pharma, Textiles, Ports' },
                    { name: 'Karnataka', code: 'KA', desc: 'IT Services, Electronics, Aerospace' },
                    { name: 'Tamil Nadu', code: 'TN', desc: 'Automotive, Electronics, Textiles' },
                    { name: 'Telangana', code: 'TG', desc: 'IT Services, Pharma, Biotech' },
                    { name: 'Uttar Pradesh', code: 'UP', desc: 'Agri-Food, Electronics, Leather' }
                  ].map(cluster => (
                    <button
                      key={cluster.code}
                      onClick={() => setGeography(cluster.name, 'ALL')}
                      className="p-2 bg-white hover:bg-primary-50 border border-govt-200 rounded text-left transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-navy-900 block">{cluster.name}</span>
                        <span className="text-[10px] text-govt-500">{cluster.desc}</span>
                      </div>
                      <span className="text-[10px] text-primary-700 font-semibold">Drilldown →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
