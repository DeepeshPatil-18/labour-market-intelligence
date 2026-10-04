import React from 'react';
import { Tray } from '@phosphor-icons/react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found matching filters',
  description = 'Try broadening your geographic scope or resetting the sector filter.',
  actionText,
  onAction,
  className = 'py-12'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-govt-100 flex items-center justify-center text-govt-400 mb-3 border border-govt-200">
        <Tray size={20} />
      </div>
      <h4 className="text-sm font-semibold text-govt-800 mb-1">{title}</h4>
      <p className="text-xs text-govt-500 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
