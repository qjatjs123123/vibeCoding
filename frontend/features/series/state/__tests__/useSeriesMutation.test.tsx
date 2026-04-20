/// <vitest config="{ environment: 'jsdom' }" />

import { describe, it, expect } from 'vitest';
import {
  useCreateSeries,
  useUpdateSeries,
  useDeleteSeries,
} from '../useSeriesMutation';

describe('useSeriesMutation', () => {
  it('should have useCreateSeries hook', () => {
    expect(useCreateSeries).toBeDefined();
    expect(typeof useCreateSeries).toBe('function');
  });

  it('should have useUpdateSeries hook', () => {
    expect(useUpdateSeries).toBeDefined();
    expect(typeof useUpdateSeries).toBe('function');
  });

  it('should have useDeleteSeries hook', () => {
    expect(useDeleteSeries).toBeDefined();
    expect(typeof useDeleteSeries).toBe('function');
  });
});
