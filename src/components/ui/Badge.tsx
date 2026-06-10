import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'amber';

const cls: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-700',
};

interface Props {
  variant?: Variant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', dot, children, className = '' }: Props) {
  const dotColors: Record<Variant, string> = {
    default: 'bg-slate-400', success: 'bg-emerald-500', warning: 'bg-amber-500',
    error: 'bg-red-500', info: 'bg-blue-500', amber: 'bg-amber-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cls[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
