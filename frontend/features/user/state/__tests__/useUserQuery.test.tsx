/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import { useUserProfile, useCurrentUser } from '../useUserQuery';

describe('useUserQuery', () => {
  it('should have useUserProfile hook', () => {
    expect(useUserProfile).toBeDefined();
    expect(typeof useUserProfile).toBe('function');
  });

  it('should have useCurrentUser hook', () => {
    expect(useCurrentUser).toBeDefined();
    expect(typeof useCurrentUser).toBe('function');
  });
});
