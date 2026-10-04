import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  footer,
  className = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  return (
    <div className={`bg-white border border-govt-200 rounded-card shadow-card overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-govt-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div>
            {title && <h3 className="text-sm font-semibold text-govt-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-govt-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={noPadding ? bodyClassName : `p-5 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 border-t border-govt-100 bg-govt-50/70 text-xs text-govt-600 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
