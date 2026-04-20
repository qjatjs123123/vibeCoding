'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { SeriesRepository } from '../repository/seriesRepository';
import type { SeriesList } from '../model/series';

// Repository 인스턴스
const seriesRepository = new SeriesRepository(axiosInstance);

/**
 * useUserSeries — 유저의 시리즈 목록
 */
export function useUserSeries(username: string) {
  return useSuspenseQuery<SeriesList>({
    queryKey: queryKeys.series.byUsername(username),
    queryFn: () => seriesRepository.getByUsername(username),
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 30,
  });
}
