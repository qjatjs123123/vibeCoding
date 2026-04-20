/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import { useTags } from '../useTagQuery';

describe('useTagQuery', () => {
  it('should have useTags hook', () => {
    expect(useTags).toBeDefined();
    expect(typeof useTags).toBe('function');
  });
});
