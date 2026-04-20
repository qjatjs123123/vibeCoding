'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { PostRepository } from '../repository/postRepository';
import type { PostFeed, Post } from '../model/post';

// Repository 인스턴스 (싱글톤)
const postRepository = new PostRepository(axiosInstance);

/**
 * usePostFeedRecent — 최신 피드 조회
 */
export function usePostFeedRecent(params?: { limit?: number; cursor?: string }) {
  return useSuspenseQuery<PostFeed>({
    queryKey: queryKeys.posts.feed({ feed: 'recent', ...params }),
    queryFn: () => postRepository.getFeedRecent(params),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분 캐시
  });
}

/**
 * usePostFeedTrending — 트렌딩 피드 조회
 */
export function usePostFeedTrending(params?: {
  period?: 'day' | 'week' | 'month';
  limit?: number;
  cursor?: string;
}) {
  return useSuspenseQuery<PostFeed>({
    queryKey: queryKeys.posts.feed({ feed: 'trending', ...params }),
    queryFn: () => postRepository.getFeedTrending(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * usePost — 포스트 상세 조회 (ID 기반)
 */
export function usePost(postId: string) {
  return useSuspenseQuery<Post>({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postRepository.getById(postId),
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * usePostBySlug — 포스트 상세 조회 (slug 기반)
 */
export function usePostBySlug(username: string, slug: string) {
  return useSuspenseQuery<Post>({
    queryKey: queryKeys.posts.bySlug(username, slug),
    queryFn: () => postRepository.getBySlug(username, slug),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * usePostsByTag — 태그별 포스트 피드
 */
export function usePostsByTag(tagName: string, params?: { limit?: number; cursor?: string }) {
  return useSuspenseQuery<PostFeed>({
    queryKey: queryKeys.posts.byTag(tagName, params),
    queryFn: () => postRepository.getFeedByTag(tagName, params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * usePostDrafts — 내 임시저장 포스트 조회
 */
export function usePostDrafts(params?: { limit?: number; cursor?: string }) {
  return useSuspenseQuery<PostFeed>({
    queryKey: queryKeys.posts.drafts,
    queryFn: () => postRepository.getMyDrafts(params),
    staleTime: 1000 * 60, // 1분 (변경이 많을 수 있음)
    gcTime: 1000 * 60 * 10,
  });
}
