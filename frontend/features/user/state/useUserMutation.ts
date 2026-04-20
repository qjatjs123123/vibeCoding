'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { UserRepository } from '../repository/userRepository';
import type { UpdateUserInput } from '../model/user';

// Repository 인스턴스
const userRepository = new UserRepository(axiosInstance);

/**
 * useUpdateUserProfile — 사용자 정보 수정
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => userRepository.updateMe(input),
    onSuccess: (result) => {
      // 현재 사용자 캐시 업데이트
      queryClient.setQueryData(queryKeys.users.me, {
        user: result.user,
        needsUsername: false,
      });
    },
  });
}
