'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { CommentRepository } from '../repository/commentRepository';
import type { CommentList } from '../model/comment';

// Repository 인스턴스
const commentRepository = new CommentRepository(axiosInstance);

/**
 * useComments — 포스트별 댓글 목록 조회
 */
export function useComments(postId: string) {
  return useSuspenseQuery<CommentList>({
    queryKey: ['comments', 'byPostId', { scope: 'byPostId', postId }],
    queryFn: () => commentRepository.getByPostId(postId),
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 15,
  });
}
