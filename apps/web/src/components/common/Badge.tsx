import React from 'react';

export type BadgeVariant = 
  | 'critical' 
  | 'warning' 
  | 'healthy' 
  | 'info' 
  | 'neutral' 
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const variantStyles = {
    critical: 'bg-red-50 text-red-800 border border-red-200 font-medium',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-medium',
    healthy: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium',
    info: 'bg-blue-50 text-blue-800 border border-blue-200 font-medium',
    neutral: 'bg-govt-100 text-govt-700 border border-govt-200 font-medium',
    outline: 'bg-transparent text-govt-600 border border-govt-300 font-normal',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded font-sans leading-none ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
