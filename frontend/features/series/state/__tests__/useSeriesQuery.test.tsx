/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import { useUserSeries } from '../useSeriesQuery';

describe('useSeriesQuery', () => {
  it('should have useUserSeries hook', () => {
    expect(useUserSeries).toBeDefined();
    expect(typeof useUserSeries).toBe('function');
  });
});
