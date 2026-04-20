'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface LikeButtonProps {
  /** 포스트 ID */
  postId: string;

  /** 초기 좋아요 상태 */
  initialLiked?: boolean;

  /** 초기 좋아요 개수 */
  initialCount?: number;

  /** 좋아요 토글 핸들러 (낙관적 업데이트용) */
  onToggle: (postId: string, liked: boolean) => Promise<{ liked: boolean }>;

  /** 로그인 필요 시 콜백 */
  onLoginRequired?: () => void;

  /** 현재 로그인 사용자 ID */
  currentUserId?: string;

  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 좋아요 버튼 컴포넌트
 * - 하트 애니메이션
 * - 낙관적 업데이트 (UI 먼저 업데이트)
 * - 비로그인 사용자는 로그인 유도
 * - 좋아요 개수 표시
 */
export function LikeButton({
  postId,
  initialLiked = false,
  initialCount = 0,
  onToggle,
  onLoginRequired,
  currentUserId,
  className = '',
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기값 변경 감지
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleClick = async () => {
    // 비로그인 사용자
    if (!currentUserId) {
      onLoginRequired?.();
      return;
    }

    // 이미 로딩 중이면 무시
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    // 낙관적 업데이트
    const previousLiked = liked;
    const previousCount = count;
    const newLiked = !liked;

    setLiked(newLiked);
    setCount(previousCount + (newLiked ? 1 : -1));

    try {
      await onToggle(postId, newLiked);
    } catch (err) {
      // 롤백
      setLiked(previousLiked);
      setCount(previousCount);
      setError(
        err instanceof Error ? err.message : '좋아요 처리에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="like-button-container">
      <Button
        onClick={handleClick}
        disabled={isLoading || !currentUserId}
        variant="ghost"
        size="sm"
        className={`${
          liked
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-600 dark:text-slate-400'
        } hover:text-red-500 dark:hover:text-red-400 transition-colors ${
          isLoading ? 'opacity-50' : ''
        } ${liked ? 'animate-pulse' : ''}`}
        data-testid="like-button"
        aria-pressed={liked}
        aria-label={liked ? '좋아요 취소' : '좋아요'}
      >
        <svg
          className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </Button>

      {/* 좋아요 개수 */}
      <span
        className="text-sm text-slate-600 dark:text-slate-400 font-medium"
        data-testid="like-count"
      >
        {count > 0 ? count : ''}
      </span>

      {/* 에러 메시지 (선택적) */}
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400" data-testid="like-error">
          {error}
        </span>
      )}
    </div>
  );
}
