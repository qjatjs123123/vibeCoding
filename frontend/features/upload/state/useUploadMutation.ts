'use client';

import { useMutation } from '@tanstack/react-query';
import { container } from '@/di/container';
import { TYPES } from '@/di/types';
import type { UploadRepository } from '../repository/uploadRepository';

interface UseUploadMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * 이미지 업로드 뮤테이션 훅
 */
export function useUploadMutation(options?: UseUploadMutationOptions) {
  const uploadRepo = container.get<UploadRepository>(TYPES.UploadRepository);

  return useMutation({
    mutationFn: (file: File) => uploadRepo.uploadImage(file),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
