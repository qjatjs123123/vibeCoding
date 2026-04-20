/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import {
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useToggleLike,
} from '../usePostMutation';

/**
 * Mutation hooks 테스트
 * Hook 정의 및 기본 구조 검증
 */
describe('usePostMutation', () => {
  it('should have useCreatePost hook', () => {
    expect(useCreatePost).toBeDefined();
    expect(typeof useCreatePost).toBe('function');
  });

  it('should have useUpdatePost hook', () => {
    expect(useUpdatePost).toBeDefined();
    expect(typeof useUpdatePost).toBe('function');
  });

  it('should have useDeletePost hook', () => {
    expect(useDeletePost).toBeDefined();
    expect(typeof useDeletePost).toBe('function');
  });

  it('should have useToggleLike hook', () => {
    expect(useToggleLike).toBeDefined();
    expect(typeof useToggleLike).toBe('function');
  });
});
