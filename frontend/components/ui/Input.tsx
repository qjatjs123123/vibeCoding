'use client';

import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          w-full px-4 py-2 text-base
          border-2 border-slate-300 dark:border-slate-600
          rounded-lg
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900
          placeholder-slate-400 dark:placeholder-slate-500
          transition-colors duration-150
          disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
          ${className}
        `}
        {...props}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}
