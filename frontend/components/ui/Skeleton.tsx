import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  count?: number;
}

export function Skeleton({
  className = '',
  variant = 'rect',
  count = 1,
}: SkeletonProps) {
  const variants: Record<string, string> = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  };

  const baseClass = `
    bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
    dark:from-slate-700 dark:via-slate-600 dark:to-slate-700
    animate-pulse
  `;

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`
        ${baseClass}
        ${variants[variant]}
        ${variant === 'circle' ? 'w-10 h-10' : variant === 'text' ? 'w-full' : 'w-full h-32'}
        ${i > 0 ? 'mt-2' : ''}
        ${className}
      `}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
}
