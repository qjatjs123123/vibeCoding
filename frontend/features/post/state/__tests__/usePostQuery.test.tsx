/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import {
  usePostFeedRecent,
  usePostFeedTrending,
  usePost,
  usePostBySlug,
  usePostsByTag,
  usePostDrafts,
} from '../usePostQuery';

/**
 * Post Query Hooks 테스트
 * Hook 정의 및 기본 구조 검증
 */
describe('usePostQuery', () => {
  it('should have usePostFeedRecent hook', () => {
    expect(usePostFeedRecent).toBeDefined();
    expect(typeof usePostFeedRecent).toBe('function');
  });

  it('should have usePostFeedTrending hook', () => {
    expect(usePostFeedTrending).toBeDefined();
    expect(typeof usePostFeedTrending).toBe('function');
  });

  it('should have usePost hook', () => {
    expect(usePost).toBeDefined();
    expect(typeof usePost).toBe('function');
  });

  it('should have usePostBySlug hook', () => {
    expect(usePostBySlug).toBeDefined();
    expect(typeof usePostBySlug).toBe('function');
  });

  it('should have usePostsByTag hook', () => {
    expect(usePostsByTag).toBeDefined();
    expect(typeof usePostsByTag).toBe('function');
  });

  it('should have usePostDrafts hook', () => {
    expect(usePostDrafts).toBeDefined();
    expect(typeof usePostDrafts).toBe('function');
  });
});
