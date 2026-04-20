'use client';

import React, { memo } from 'react';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Comment } from '../model/comment';

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
  isEmpty?: boolean;
  currentUserId?: string;
  onEditComment?: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onReplyComment?: (parentCommentId: string) => void;
}

/**
 * 댓글 목록 컴포넌트
 * - 대댓글 구조 지원
 * - soft-delete 상태 표시
 * - 로딩 스켈레톤
 */
export const CommentList = memo(function CommentList({
  comments,
  isLoading = false,
  isEmpty = false,
  currentUserId,
  onEditComment,
  onDeleteComment,
  onReplyComment,
}: CommentListProps) {
  // 대댓글 구조 구성: parentCommentId별로 그룹화
  const groupedComments = comments.reduce(
    (acc, comment) => {
      if (!comment.parentCommentId) {
        // 부모 댓글
        acc.parents.push(comment);
      } else {
        // 대댓글
        if (!acc.replies[comment.parentCommentId]) {
          acc.replies[comment.parentCommentId] = [];
        }
        acc.replies[comment.parentCommentId].push(comment);
      }
      return acc;
    },
    { parents: [] as Comment[], replies: {} as Record<string, Comment[]> }
  );

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="comment-list-loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty || comments.length === 0) {
    return (
      <div
        className="rounded-lg bg-slate-50 p-6 text-center dark:bg-slate-900/50"
        data-testid="comment-list-empty"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="comment-list">
      {groupedComments.parents.map((parentComment) => (
        <div key={parentComment.id}>
          {/* 부모 댓글 */}
          <CommentItem
            comment={parentComment}
            currentUserId={currentUserId}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
            onReply={onReplyComment}
          />

          {/* 대댓글 */}
          {groupedComments.replies[parentComment.id] && (
            <div className="mt-4 space-y-4">
              {groupedComments.replies[parentComment.id].map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  currentUserId={currentUserId}
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  onReply={onReplyComment}
                />
              ))}
            </div>
          )}

          {/* 구분선 */}
          <div className="mt-6 border-b border-slate-200 dark:border-slate-700" />
        </div>
      ))}
    </div>
  );
});

CommentList.displayName = 'CommentList';
