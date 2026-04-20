'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { SeriesRepository } from '../repository/seriesRepository';
import type { CreateSeriesInput, UpdateSeriesInput } from '../model/series';

// Repository 인스턴스
const seriesRepository = new SeriesRepository(axiosInstance);

/**
 * useCreateSeries — 시리즈 생성
 */
export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSeriesInput) => seriesRepository.create(input),
    onSuccess: () => {
      // 시리즈 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.series.all });
    },
  });
}

/**
 * useUpdateSeries — 시리즈 수정
 */
export function useUpdateSeries(seriesId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSeriesInput) =>
      seriesRepository.update(seriesId, input),
    onSuccess: () => {
      // 시리즈 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.series.all });
    },
  });
}

/**
 * useDeleteSeries — 시리즈 삭제
 */
export function useDeleteSeries(seriesId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => seriesRepository.delete(seriesId),
    onSuccess: () => {
      // 시리즈 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.series.all });
    },
  });
}
