import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'right',
  loading = false,
  disabled,
  type = 'button',
  className = '',
  onClick,
  children,
}) => {
  const base = 'btn-touch font-semibold transition-all duration-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none';

  const variants = {
    primary:   'bg-amber text-page hover:bg-amber-glow active:scale-[0.97] shadow-sm amber-glow-shadow',
    secondary: 'bg-card border border-white/[0.12] text-fg hover:bg-white/[0.08] active:scale-[0.97]',
    outline:   'bg-transparent border border-white/[0.18] text-fg hover:border-white/[0.30] hover:bg-white/[0.05] active:scale-[0.97]',
    ghost:     'bg-transparent text-fg-muted hover:text-fg hover:bg-white/[0.05] active:scale-[0.97]',
    danger:    'bg-error text-white hover:bg-error/90 active:scale-[0.97] shadow-sm',
    success:   'bg-live text-page hover:bg-live-dim active:scale-[0.97] shadow-sm',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left'  && <Icon size={18} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={18} />}
        </>
      )}
    </motion.button>
  );
};
