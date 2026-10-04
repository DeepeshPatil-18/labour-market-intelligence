import React from 'react';

interface Point {
  period: string;
  historical?: number;
  projectedDemand?: number;
  projectedSupply?: number;
  confidenceUpper?: number;
  confidenceLower?: number;
}

interface SimpleLineChartProps {
  data: Point[];
  height?: number;
  className?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  height = 220,
  className = ''
}) => {
  if (!data || data.length === 0) return null;

  const width = 600;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const allVals = data.flatMap(d => [
    d.historical,
    d.projectedDemand,
    d.projectedSupply,
    d.confidenceUpper,
    d.confidenceLower
  ]).filter((v): v is number => typeof v === 'number');

  const minVal = Math.max(0, Math.floor(Math.min(...allVals, 30) / 10) * 10);
  const maxVal = Math.ceil(Math.max(...allVals, 100) / 10) * 10;
  const valRange = maxVal - minVal || 1;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minVal) / valRange) * chartHeight;

  // Paths
  let histPath = '';
  let demandPath = '';
  let supplyPath = '';
  let confidencePath = '';

  data.forEach((p, i) => {
    const x = getX(i);
    if (typeof p.historical === 'number') {
      const y = getY(p.historical);
      histPath += `${histPath ? ' L ' : 'M '}${x},${y}`;
    }
    if (typeof p.projectedDemand === 'number') {
      const y = getY(p.projectedDemand);
      demandPath += `${demandPath ? ' L ' : 'M '}${x},${y}`;
    }
    if (typeof p.projectedSupply === 'number') {
      const y = getY(p.projectedSupply);
      supplyPath += `${supplyPath ? ' L ' : 'M '}${x},${y}`;
    }
  });

  // Confidence area path
  const projectedPoints = data.map((p, i) => ({ p, i })).filter(({ p }) => typeof p.confidenceUpper === 'number');
  if (projectedPoints.length > 0) {
    const upperStr = projectedPoints.map(({ p, i }) => `${getX(i)},${getY(p.confidenceUpper!)}`).join(' L ');
    const lowerStr = [...projectedPoints].reverse().map(({ p, i }) => `${getX(i)},${getY(p.confidenceLower!)}`).join(' L ');
    confidencePath = `M ${upperStr} L ${lowerStr} Z`;
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Y Axis Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * ratio;
          const val = Math.round(maxVal - ratio * valRange);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-govt-400 font-mono">
                {val}
              </text>
            </g>
          );
        })}

        {/* Confidence interval band */}
        {confidencePath && (
          <path d={confidencePath} fill="#EFF6FF" opacity="0.7" />
        )}

        {/* Historical line */}
        {histPath && (
          <path d={histPath} fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Projected Demand line (Dashed red/blue) */}
        {demandPath && (
          <path d={demandPath} fill="none" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
        )}

        {/* Projected Supply line (Dashed green) */}
        {supplyPath && (
          <path d={supplyPath} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
        )}

        {/* X Axis Labels */}
        {data.map((p, i) => (
          <text key={i} x={getX(i)} y={height - 8} textAnchor="middle" className="text-[10px] fill-govt-500 font-sans">
            {p.period}
          </text>
        ))}

        {/* Points circles */}
        {data.map((p, i) => {
          const x = getX(i);
          return (
            <g key={i}>
              {typeof p.historical === 'number' && (
                <circle cx={x} cy={getY(p.historical)} r="3.5" fill="#1E293B" />
              )}
              {typeof p.projectedDemand === 'number' && (
                <circle cx={x} cy={getY(p.projectedDemand)} r="3.5" fill="#DC2626" />
              )}
              {typeof p.projectedSupply === 'number' && (
                <circle cx={x} cy={getY(p.projectedSupply)} r="3.5" fill="#16A34A" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-govt-600 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-govt-800" />
          <span>Historical Velocity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-red-600" />
          <span className="text-red-700 font-medium">Projected Demand</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-600" />
          <span className="text-emerald-700 font-medium">Projected Supply</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 bg-blue-100 border border-blue-200" />
          <span className="text-blue-800">Confidence Band (95%)</span>
        </div>
      </div>
    </div>
  );
};
