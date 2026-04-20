'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface CommentFormProps {
  /** 현재 로그인한 사용자 ID (없으면 로그인 필수) */
  currentUserId?: string;

  /** 대댓글일 경우 부모 댓글 ID */
  parentCommentId?: string;

  /** 댓글 작성 핸들러 */
  onSubmit: (content: string, parentCommentId?: string) => Promise<void>;

  /** 로그인 페이지로 이동 핸들러 */
  onLoginRequired?: () => void;

  /** 취소 핸들러 */
  onCancel?: () => void;
}

/**
 * 댓글 작성 폼 컴포넌트
 * - 비로그인: 로그인 유도 메시지
 * - 로그인: 텍스트 입력 + 제출 버튼
 * - 로딩/에러 상태 처리
 * - 대댓글 지원
 */
export function CommentForm({
  currentUserId,
  parentCommentId,
  onSubmit,
  onLoginRequired,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('댓글을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(content, parentCommentId);
      setContent(''); // 성공 시 입력창 초기화
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '댓글 작성에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 비로그인 상태
  if (!currentUserId) {
    return (
      <div
        className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-900/50"
        data-testid="comment-form-login-required"
      >
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
        <Button
          size="sm"
          onClick={onLoginRequired}
          data-testid="comment-form-login-button"
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      data-testid="comment-form"
    >
      {/* 텍스트 입력 */}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null); // 입력 시 에러 초기화
        }}
        placeholder={parentCommentId ? '답글을 입력해주세요...' : '댓글을 입력해주세요...'}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        rows={3}
        disabled={isLoading}
        data-testid="comment-form-textarea"
      />

      {/* 에러 메시지 */}
      {error && (
        <div
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
          role="alert"
          data-testid="comment-form-error"
        >
          {error}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            data-testid="comment-form-cancel-button"
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !content.trim()}
          data-testid="comment-form-submit-button"
        >
          {isLoading ? '작성 중...' : parentCommentId ? '답글 작성' : '댓글 작성'}
        </Button>
      </div>
    </form>
  );
}
