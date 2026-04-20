'use client';

import React from 'react';
import Link from 'next/link';

interface SeriesPost {
  /** 포스트 ID */
  id: string;

  /** 포스트 제목 */
  title: string;

  /** 포스트 슬러그 */
  slug: string;

  /** 포스트 작성자 */
  author: {
    username: string;
  };

  /** 시리즈 순서 */
  seriesOrder: number;

  /** 현재 포스트인지 여부 */
  isCurrent?: boolean;
}

interface SeriesBoxProps {
  /** 시리즈 제목 */
  seriesTitle: string;

  /** 시리즈의 포스트 목록 */
  posts: SeriesPost[];

  /** 현재 포스트 ID */
  currentPostId?: string;

  /** 시리즈 페이지 링크 (선택) */
  seriesLink?: string;

  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 시리즈 박스 컴포넌트
 * - 포스트 상세 페이지에 표시
 * - 시리즈 내 다른 포스트 네비게이션
 * - 현재 포스트 하이라이트
 * - 순서 표시
 */
export function SeriesBox({
  seriesTitle,
  posts,
  currentPostId,
  seriesLink,
  className = '',
}: SeriesBoxProps) {
  // 순서대로 정렬
  const sortedPosts = [...posts].sort(
    (a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0)
  );

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${className}`}
      data-testid="series-box"
    >
      {/* 헤더: 시리즈 제목 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {seriesTitle}
        </h3>
        {seriesLink && (
          <Link
            href={seriesLink}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            data-testid="series-link"
          >
            전체 보기
          </Link>
        )}
      </div>

      {/* 포스트 목록 */}
      <div className="space-y-2" data-testid="series-posts">
        {sortedPosts.map((post, index) => {
          const isCurrent = currentPostId ? post.id === currentPostId : false;

          return (
            <div
              key={post.id}
              className={`rounded-md px-3 py-2 transition-colors ${
                isCurrent
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              data-testid={`series-post-${post.id}`}
            >
              <Link
                href={`/${post.author.username}/${post.slug}`}
                className={`flex gap-3 transition-colors ${
                  isCurrent
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-slate-900 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                {/* 순서 번호 */}
                <span
                  className={`min-w-fit font-medium ${
                    isCurrent ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                  data-testid={`series-order-${post.id}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* 포스트 제목 */}
                <span
                  className="flex-1 truncate text-sm"
                  data-testid={`series-title-${post.id}`}
                >
                  {post.title}
                </span>

                {/* 현재 포스트 배지 */}
                {isCurrent && (
                  <span
                    className="min-w-fit text-xs font-semibold text-blue-700 dark:text-blue-400"
                    data-testid={`series-current-badge-${post.id}`}
                  >
                    읽는 중
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* 진행률 */}
      {currentPostId && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>진행률</span>
            <span data-testid="series-progress-text">
              {Math.round(
                ((sortedPosts.findIndex((p) => p.id === currentPostId) + 1) /
                  sortedPosts.length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 transition-all"
              style={{
                width: `${
                  ((sortedPosts.findIndex((p) => p.id === currentPostId) + 1) /
                    sortedPosts.length) *
                  100
                }%`,
              }}
              data-testid="series-progress-bar"
            />
          </div>
        </div>
      )}
    </div>
  );
}
