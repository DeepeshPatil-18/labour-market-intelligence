import React from 'react';
import { Database } from '@phosphor-icons/react';
import { DataStatusLabel } from '../../types';

interface ProvenanceBadgeProps {
  source: string;
  dataStatus?: DataStatusLabel;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  source,
  dataStatus = 'DEVELOPMENT',
  className = ''
}) => {
  const getStatusColor = (status: DataStatusLabel) => {
    switch (status) {
      case 'REFERENCE':
      case 'OBSERVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'ESTIMATED':
      case 'MODELED':
      case 'FORECAST':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DEVELOPMENT':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-govt-600 bg-white border border-govt-200 px-2.5 py-1 rounded shadow-subtle ${className}`}>
      <span className="inline-flex items-center gap-1 font-medium text-govt-700">
        <Database size={13} className="text-govt-400" />
        <span>{source}</span>
      </span>

      <span className="text-govt-300">|</span>

      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getStatusColor(dataStatus)}`}>
        {dataStatus}
      </span>
    </div>
  );
};
