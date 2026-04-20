'use client';

import Link from 'next/link';
import type { Series } from '../model/series';

interface SeriesCardProps {
  series: Series;
  username: string;
  className?: string;
}

/**
 * Series Card Component
 * - Display series info
 * - Link to series page
 * - Show post count
 */
export function SeriesCard({ series, username, className = '' }: SeriesCardProps) {
  return (
    <Link
      href={`/@${username}/series/${series.slug || series.name}`}
      className={`group rounded-lg border border-[--color-border] bg-[--color-surface] p-6 hover:border-[--color-accent] transition-colors ${className}`}
    >
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-xl font-bold text-[--color-text] group-hover:text-[--color-accent] transition-colors">
          {series.name}
        </h3>

        {/* Description */}
        {series.description && (
          <p className="text-sm text-[--color-text-secondary] line-clamp-2">
            {series.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-[--color-border]">
          <span className="text-xs font-medium text-[--color-text-secondary]">
            📝 {series.postCount || 0}개 포스트
          </span>
          <span className="text-xs text-[--color-muted]">
            {new Date(series.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
    </Link>
  );
}
