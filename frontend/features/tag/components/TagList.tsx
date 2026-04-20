'use client';

import React from 'react';
import { TagBadge } from './TagBadge';

interface Tag {
  name: string;
  count?: number;
}

interface TagListProps {
  /** 태그 목록 */
  tags: Tag[];

  /** 태그 클릭 핸들러 */
  onTagClick?: (tagName: string) => void;

  /** 태그 제거 핸들러 */
  onTagRemove?: (tagName: string) => void;

  /** 링크로 이동할 기본 경로 (예: /tags/) */
  basePath?: string;

  /** 크기 */
  size?: 'sm' | 'md';

  /** 스타일 변형 */
  variant?: 'default' | 'outline' | 'subtle';

  /** 제거 가능 여부 */
  removable?: boolean;

  /** 태그가 없을 때 표시할 텍스트 */
  emptyMessage?: string;

  /** 최대 표시 태그 개수 */
  maxTags?: number;

  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 태그 목록 컴포넌트
 * - 여러 태그를 배열로 표시
 * - 각 태그의 포스트 개수 표시
 * - 클릭 또는 제거 기능
 * - 반응형 레이아웃
 */
export function TagList({
  tags,
  onTagClick,
  onTagRemove,
  basePath,
  size = 'md',
  variant = 'default',
  removable = false,
  emptyMessage = '태그가 없습니다.',
  maxTags,
  className = '',
}: TagListProps) {
  // 최대 태그 개수 제한
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hiddenCount = tags.length - displayTags.length;

  // 태그가 없는 경우
  if (tags.length === 0) {
    return (
      <div
        className="text-sm text-slate-500 dark:text-slate-400"
        data-testid="tag-list-empty"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      data-testid="tag-list"
    >
      {displayTags.map((tag) => (
        <TagBadge
          key={tag.name}
          name={tag.name}
          count={tag.count}
          href={basePath ? `${basePath}${encodeURIComponent(tag.name)}` : undefined}
          onClick={onTagClick}
          size={size}
          variant={variant}
          removable={removable}
          onRemove={onTagRemove}
        />
      ))}

      {/* 숨겨진 태그 개수 표시 */}
      {hiddenCount > 0 && (
        <span
          className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1"
          data-testid="tag-list-hidden-count"
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
