/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '../useCommentMutation';

describe('useCommentMutation', () => {
  it('should have useCreateComment hook', () => {
    expect(useCreateComment).toBeDefined();
    expect(typeof useCreateComment).toBe('function');
  });

  it('should have useUpdateComment hook', () => {
    expect(useUpdateComment).toBeDefined();
    expect(typeof useUpdateComment).toBe('function');
  });

  it('should have useDeleteComment hook', () => {
    expect(useDeleteComment).toBeDefined();
    expect(typeof useDeleteComment).toBe('function');
  });
});
