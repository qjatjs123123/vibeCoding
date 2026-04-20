'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { TagRepository } from '../repository/tagRepository';
import type { TagList } from '../model/tag';

// Repository 인스턴스
const tagRepository = new TagRepository(axiosInstance);

/**
 * useTags — 전체 태그 목록 조회
 */
export function useTags(params?: {
  sort?: 'popular' | 'recent';
  limit?: number;
}) {
  return useSuspenseQuery<TagList>({
    queryKey: queryKeys.tags.list(params),
    queryFn: () => tagRepository.getAll(params),
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60, // 1시간
  });
}
