'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { CommentRepository } from '../repository/commentRepository';
import type { CreateCommentInput, UpdateCommentInput } from '../model/comment';

// Repository 인스턴스
const commentRepository = new CommentRepository(axiosInstance);

/**
 * useCreateComment — 댓글 작성
 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      commentRepository.create(postId, input),
    onSuccess: () => {
      // 댓글 목록 무효화 (새로 조회)
      queryClient.invalidateQueries({
        queryKey: ['comments', 'byPostId', { scope: 'byPostId', postId }],
      });
    },
  });
}

/**
 * useUpdateComment — 댓글 수정
 */
export function useUpdateComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCommentInput) =>
      commentRepository.update(postId, commentId, input),
    onSuccess: () => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ['comments', 'byPostId', { scope: 'byPostId', postId }],
      });
    },
  });
}

/**
 * useDeleteComment — 댓글 삭제 (soft-delete)
 * 삭제된 댓글은 content가 "[삭제된 댓글입니다]"로 변경됨
 */
export function useDeleteComment(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => commentRepository.delete(postId, commentId),
    onSuccess: () => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ['comments', 'byPostId', { scope: 'byPostId', postId }],
      });
    },
  });
}
