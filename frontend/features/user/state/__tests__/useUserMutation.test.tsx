/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import { useUpdateUserProfile } from '../useUserMutation';

describe('useUserMutation', () => {
  it('should have useUpdateUserProfile hook', () => {
    expect(useUpdateUserProfile).toBeDefined();
    expect(typeof useUpdateUserProfile).toBe('function');
  });
});
