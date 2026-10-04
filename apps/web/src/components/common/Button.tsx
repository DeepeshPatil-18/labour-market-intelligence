import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm font-medium',
  }[size];

  const variantStyles = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 border border-primary-800 shadow-subtle',
    secondary: 'bg-govt-100 text-govt-800 hover:bg-govt-200 active:bg-govt-300 border border-govt-300',
    outline: 'bg-white text-govt-700 hover:bg-govt-50 active:bg-govt-100 border border-govt-300 shadow-subtle',
    ghost: 'bg-transparent text-govt-600 hover:bg-govt-100 active:bg-govt-200 border border-transparent',
    danger: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 border border-red-800',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-govt font-sans font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
