import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'orange' | 'red' | 'green' | 'trending';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  pulse = false,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full';

  const variantStyles = {
    default: 'bg-white/[0.08] text-fg border border-white/[0.12]',
    gold:    'bg-amber-glow/[0.20] text-amber-glow border border-amber/[0.30] shadow-sm',
    orange:  'bg-amber text-page shadow-sm',
    red:     'bg-error text-white shadow-sm',
    green:   'bg-live text-page shadow-sm',
    trending: 'bg-amber text-page shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const pulseStyle = pulse ? 'animate-pulse' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${pulseStyle} ${className}`;

  return (
    <span className={combinedClassName}>
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {children}
    </span>
  );
};
