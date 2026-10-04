import React from 'react';

interface GaugeChartProps {
  score: number; // 0 to 100
  label?: string;
  size?: number;
  className?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  score,
  label = 'Job Readiness',
  size = 140,
  className = ''
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 50;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // semi-circle
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const color = clampedScore >= 75 ? '#16A34A' : clampedScore >= 50 ? '#2563EB' : '#D97706';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size * 0.65} viewBox="0 0 120 75" className="overflow-visible">
        {/* Track */}
        <path
          d="M 10,65 A 50,50 0 0,1 110,65"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active arc */}
        <path
          d="M 10,65 A 50,50 0 0,1 110,65"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        {/* Center score text */}
        <text
          x="60"
          y="56"
          textAnchor="middle"
          className="text-xl font-bold fill-navy-900 font-mono"
        >
          {clampedScore}%
        </text>
      </svg>
      {label && <span className="text-xs font-medium text-govt-600 mt-1">{label}</span>}
    </div>
  );
};
