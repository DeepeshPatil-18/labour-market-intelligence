import React from 'react';

interface BarItem {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarItem[];
  maxValue?: number;
  height?: number;
  valueLabel?: string;
  className?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  maxValue,
  valueLabel = 'Index',
  className = ''
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 100);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {data.map((item, idx) => {
        const percent = Math.min(100, Math.round((item.value / max) * 100));
        const barColor = item.color || (item.value >= 70 ? 'bg-red-600' : item.value >= 50 ? 'bg-amber-500' : 'bg-primary-600');

        return (
          <div key={idx} className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-govt-700">
              <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{item.label}</span>
              <span className="font-semibold text-govt-900 font-mono">
                {item.value} <span className="text-[10px] text-govt-400 font-sans">{valueLabel}</span>
              </span>
            </div>
            {/* Bar track */}
            <div className="w-full h-2.5 bg-govt-100 rounded-sm overflow-hidden flex">
              <div 
                className={`h-full rounded-sm transition-all duration-300 ${barColor}`} 
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
