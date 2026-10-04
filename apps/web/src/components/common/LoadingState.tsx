import React from 'react';
import { Spinner } from '@phosphor-icons/react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading verified labour market records...',
  className = 'py-16'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center text-govt-500 ${className}`}>
      <Spinner size={28} className="animate-spin text-primary-700 mb-2" />
      <p className="text-xs font-medium text-govt-600">{message}</p>
      <p className="text-[11px] text-govt-400 mt-0.5">National Classification of Occupations & Intelligence Engine</p>
    </div>
  );
};
