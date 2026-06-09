import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const cls: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  secondary: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm',
  outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600',
};

const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all press disabled:opacity-50 disabled:cursor-not-allowed ${cls[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
