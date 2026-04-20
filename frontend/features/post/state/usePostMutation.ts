'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { PostRepository } from '../repository/postRepository';
import type { Post, CreatePostInput, UpdatePostInput } from '../model/post';

// Repository 인스턴스
const postRepository = new PostRepository(axiosInstance);

/**
 * useCreatePost — 포스트 생성
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => postRepository.create(input),
    onSuccess: () => {
      // 임시저장 목록 무효화
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts.drafts] });
    },
  });
}

/**
 * useUpdatePost — 포스트 수정
 */
export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePostInput) => postRepository.update(postId, input),
    onSuccess: (updatedPost) => {
      // 상세 페이지 캐시 업데이트
      queryClient.setQueryData([queryKeys.posts.detail(postId)], updatedPost);

      // 피드 캐시 무효화 (새로 조회)
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/**
 * useDeletePost — 포스트 삭제
 */
export function useDeletePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postRepository.delete(postId),
    onSuccess: () => {
      // 상세 페이지 캐시 제거
      queryClient.removeQueries({ queryKey: [queryKeys.posts.detail(postId)] });

      // 피드 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/**
 * useToggleLike — 포스트 좋아요 토글 (낙관적 업데이트)
 */
export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postRepository.toggleLike(postId),
    onMutate: async () => {
      // 진행 중인 요청 취소
      await queryClient.cancelQueries({ queryKey: [queryKeys.posts.detail(postId)] });

      // 이전 데이터 백업
      const previousPost = queryClient.getQueryData<Post>(
        [queryKeys.posts.detail(postId)]
      );

      // 낙관적 업데이트: 좋아요 상태 토글
      if (previousPost) {
        queryClient.setQueryData<Post>([queryKeys.posts.detail(postId)], {
          ...previousPost,
          likeCount: previousPost.likeCount + 1, // 또는 UI에서 판단하여 +1 또는 -1
        });
      }

      return { previousPost };
    },
    onError: (error, variables, context) => {
      // 실패 시 이전 상태로 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(
          [queryKeys.posts.detail(postId)],
          context.previousPost
        );
      }
    },
    onSettled: () => {
      // 최종적으로 서버 상태와 동기화
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts.detail(postId)] });
    },
  });
}
