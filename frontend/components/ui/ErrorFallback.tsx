import React from 'react';
import { Button } from './Button';

interface ErrorFallbackProps {
  error?: Error | string;
  resetError?: () => void;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  resetError,
  showDetails = false,
}: ErrorFallbackProps) {
  const errorMessage =
    typeof error === 'string' ? error : error?.message || 'Something went wrong';
  const errorStack = error instanceof Error ? error.stack : null;

  return (
    <div className="flex items-center justify-center p-4 min-h-64 bg-red-50 dark:bg-red-950 rounded-lg border-2 border-red-200 dark:border-red-800">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-sm text-red-700 dark:text-red-300 mb-4">{errorMessage}</p>

        {showDetails && errorStack && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 rounded text-xs text-left font-mono text-red-900 dark:text-red-100 overflow-auto max-h-32">
            {errorStack}
          </div>
        )}

        {resetError && (
          <Button
            onClick={resetError}
            variant="primary"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
