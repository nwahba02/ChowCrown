import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  multiline = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const base = 'w-full bg-page border border-white/[0.10] rounded-xl px-4 py-3 text-fg placeholder:text-fg-dim focus:border-amber/60 focus:ring-1 focus:ring-amber/20 outline-none transition-smooth text-sm';
  const errorStyle = error ? 'border-error focus:border-error' : '';
  const combined = `${base} ${errorStyle} ${className}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          rows={rows}
          className={combined}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={combined}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
};
