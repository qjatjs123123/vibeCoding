/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import { useComments } from '../useCommentQuery';

describe('useCommentQuery', () => {
  it('should have useComments hook', () => {
    expect(useComments).toBeDefined();
    expect(typeof useComments).toBe('function');
  });
});
