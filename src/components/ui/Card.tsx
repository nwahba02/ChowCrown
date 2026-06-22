import React from 'react';
import { motion } from 'motion/react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  hover?: boolean;
  hover3d?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hover = false,
  hover3d = false,
  clickable = false,
  onClick,
  className = '',
  noPadding = false,
}) => {
  const baseStyles = 'rounded-[2.5rem] transition-smooth overflow-hidden';

  const variantStyles = {
    default:  'bg-card border border-white/[0.07] shadow-lg',
    glass:    'soft-card',
    elevated: 'bg-card border border-amber/[0.15] shadow-2xl',
    outlined: 'bg-transparent border-2 border-white/[0.12]',
  };

  const paddingStyle = noPadding ? '' : 'p-6 md:p-8';
  const hoverStyle = hover ? 'card-hover cursor-pointer' : '';
  const hover3dStyle = hover3d ? 'card-3d cursor-pointer' : '';
  const clickableStyle = clickable ? 'cursor-pointer active:scale-95' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyle} ${hoverStyle} ${hover3dStyle} ${clickableStyle} ${className}`;

  if (clickable || onClick) {
    return (
      <motion.div
        whileHover={{ scale: hover || hover3d ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={combinedClassName}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={combinedClassName}>{children}</div>;
};
