'use client';

import React, { memo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { Comment } from '../model/comment';

interface CommentItemProps {
  comment: Comment;
  isOwner?: boolean;
  isReply?: boolean;
  currentUserId?: string;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (parentCommentId: string) => void;
}

/**
 * 댓글 아이템 컴포넌트
 * - 댓글 내용, 작성자, 날짜
 * - soft-delete 상태 표시
 * - 대댓글 표시 (들여쓰기)
 * - 본인만 수정/삭제 가능
 */
export const CommentItem = memo(function CommentItem({
  comment,
  isOwner = false,
  isReply = false,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
}: CommentItemProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit = currentUserId === comment.author.username || isOwner;

  return (
    <div
      className={`${
        isReply ? 'ml-8 border-l-2 border-slate-200 dark:border-slate-700 pl-4' : ''
      } py-4`}
      data-testid={`comment-${comment.id}`}
    >
      {/* 댓글 헤더 */}
      <div className="flex items-start gap-3">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-2 flex-1">
          <Avatar
            src={comment.author.avatarUrl}
            alt={comment.author.username}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {comment.author.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        {canEdit && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit?.(comment.id)}
              disabled={comment.isDeleted}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(comment.id)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* 댓글 내용 */}
      <div className="mt-3">
        {comment.isDeleted ? (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            [삭제된 댓글입니다]
          </p>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>

      {/* 대댓글 버튼 */}
      {!isReply && (
        <div className="mt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReply?.(comment.id)}
          >
            Reply
          </Button>
        </div>
      )}
    </div>
  );
});

CommentItem.displayName = 'CommentItem';
