'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold font-display text-[--color-danger] mb-2">
            Oops!
          </h1>
          <p className="text-[--color-text-secondary] text-lg">
            Something went wrong
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-[--color-surface] border border-[--color-border] rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-[--color-muted] font-mono break-words">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Try again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full">
              Go home
            </Button>
          </Link>
        </div>

        {/* Debug Info (dev only) */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <p className="mt-6 text-xs text-[--color-muted]">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
