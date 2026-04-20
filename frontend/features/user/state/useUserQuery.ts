'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { UserRepository } from '../repository/userRepository';
import type { User } from '../model/user';

// Repository 인스턴스
const userRepository = new UserRepository(axiosInstance);

/**
 * useUserProfile — 유저 프로필 조회
 */
export function useUserProfile(username: string) {
  return useSuspenseQuery<User>({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => userRepository.getUserByUsername(username),
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * useCurrentUser — 현재 사용자 정보
 */
export function useCurrentUser() {
  return useSuspenseQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => userRepository.getMe(),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30,
  });
}
