import React from 'react';
import { motion } from 'motion/react';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeMap[size]} border-amber border-t-transparent rounded-full animate-spin`} />
      {text && (
        <p className="text-fg-muted font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-page/90 backdrop-blur-md z-50 flex items-center justify-center"
      >
        {loader}
      </motion.div>
    );
  }

  return loader;
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`skeleton rounded-2xl ${className}`} />;
};
