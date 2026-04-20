'use client';

import React from 'react';
import Link from 'next/link';

interface TagBadgeProps {
  /** 태그 이름 */
  name: string;

  /** 태그 관련 포스트 수 (선택) */
  count?: number;

  /** 클릭 핸들러 (Link 대신 사용) */
  onClick?: (tagName: string) => void;

  /** 링크로 이동할지 여부 */
  href?: string;

  /** 크기 */
  size?: 'sm' | 'md';

  /** 스타일 변형 */
  variant?: 'default' | 'outline' | 'subtle';

  /** 제거 버튼 표시 */
  removable?: boolean;

  /** 제거 핸들러 */
  onRemove?: (tagName: string) => void;

  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 태그 뱃지 컴포넌트
 * - 링크 또는 클릭 이벤트
 * - 포스트 개수 표시
 * - 제거 가능 옵션
 * - 다양한 스타일 변형
 */
export function TagBadge({
  name,
  count,
  onClick,
  href,
  size = 'md',
  variant = 'default',
  removable = false,
  onRemove,
  className = '',
}: TagBadgeProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5 px-3 py-1 rounded-full
    font-medium transition-colors truncate
  `;

  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  const variantStyles = {
    default:
      'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-900/30',
    subtle:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-900/70',
  };

  const classes = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const handleClick = () => {
    onClick?.(name);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(name);
  };

  const content = (
    <>
      <span data-testid={`tag-name-${name}`}>{name}</span>
      {count !== undefined && (
        <span
          className="text-xs opacity-75 font-semibold"
          data-testid={`tag-count-${name}`}
        >
          ({count})
        </span>
      )}
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${name} tag`}
          data-testid={`tag-remove-${name}`}
        >
          ✕
        </button>
      )}
    </>
  );

  // Link로 이동하는 경우
  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        data-testid={`tag-badge-link-${name}`}
      >
        {content}
      </Link>
    );
  }

  // 클릭 핸들러로 처리
  return (
    <button
      onClick={handleClick}
      className={`${classes} ${!onClick ? 'cursor-default' : ''}`}
      data-testid={`tag-badge-${name}`}
      disabled={!onClick && !href}
    >
      {content}
    </button>
  );
}
