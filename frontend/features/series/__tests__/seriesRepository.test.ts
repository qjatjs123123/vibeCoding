import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SeriesRepository } from '../repository/seriesRepository';
import type { AxiosInstance } from 'axios';

/**
 * Mock data
 */
const mockSeriesDto1 = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'React Series',
  description: 'Deep dive into React',
  slug: 'react-series',
  author_id: '550e8400-e29b-41d4-a716-446655440100',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  post_count: 10,
};

const mockSeriesDto2 = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Next.js Advanced',
  description: null,
  slug: 'nextjs-advanced',
  author_id: '550e8400-e29b-41d4-a716-446655440100',
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  post_count: 5,
};

/**
 * Tests
 */
describe('SeriesRepository', () => {
  let mockAxios: AxiosInstance;
  let repo: SeriesRepository;

  beforeEach(() => {
    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    } as any;

    repo = new SeriesRepository(mockAxios);
  });

  describe('getByUsername', () => {
    it('should fetch series by username', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          series: [mockSeriesDto1, mockSeriesDto2],
          total_count: 2,
        },
      } as any);

      const list = await repo.getByUsername('john');

      expect(list.items).toHaveLength(2);
      expect(list.totalCount).toBe(2);
      expect(list.items[0].name).toBe('React Series');
      expect(mockAxios.get).toHaveBeenCalledWith('/api/users/john/series');
    });

    it('should map snake_case to camelCase', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          series: [mockSeriesDto1],
          total_count: 1,
        },
      } as any);

      const list = await repo.getByUsername('john');

      expect(list.items[0].authorId).toBe(mockSeriesDto1.author_id);
      expect(list.items[0].createdAt).toBeInstanceOf(Date);
    });

    it('should handle null description', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          series: [mockSeriesDto2],
          total_count: 1,
        },
      } as any);

      const list = await repo.getByUsername('john');

      expect(list.items[0].description).toBeUndefined();
    });

    it('should throw error on API failure', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(repo.getByUsername('john')).rejects.toThrow();
    });

    it('should throw Not found on 404', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };

      vi.mocked(mockAxios.get).mockRejectedValueOnce(error);

      await expect(repo.getByUsername('nonexistent')).rejects.toThrow(
        'Not found'
      );
    });

    it('should handle empty series list', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          series: [],
          total_count: 0,
        },
      } as any);

      const list = await repo.getByUsername('john');

      expect(list.items).toHaveLength(0);
      expect(list.totalCount).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a new series', async () => {
      const newSeries = {
        ...mockSeriesDto1,
        id: '550e8400-e29b-41d4-a716-446655440002',
      };

      vi.mocked(mockAxios.post).mockResolvedValueOnce({
        data: newSeries,
      } as any);

      const series = await repo.create({
        name: 'React Series',
        description: 'Deep dive into React',
      });

      expect(series.id).toBe(newSeries.id);
      expect(series.name).toBe('React Series');
      expect(series.description).toBe('Deep dive into React');
    });

    it('should throw Unauthorized on 401', async () => {
      const error = new Error('Unauthorized');
      (error as any).response = { status: 401 };

      vi.mocked(mockAxios.post).mockRejectedValueOnce(error);

      await expect(
        repo.create({ name: 'Series', description: 'Desc' })
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.post).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        repo.create({ name: 'Series' })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a series', async () => {
      const updatedSeries = {
        ...mockSeriesDto1,
        name: 'Updated React Series',
        updated_at: '2024-01-05T00:00:00Z',
      };

      vi.mocked(mockAxios.patch).mockResolvedValueOnce({
        data: updatedSeries,
      } as any);

      const series = await repo.update(
        '550e8400-e29b-41d4-a716-446655440000',
        {
          name: 'Updated React Series',
        }
      );

      expect(series.id).toBe(updatedSeries.id);
      expect(series.name).toBe('Updated React Series');
    });

    it('should throw Forbidden on 403', async () => {
      const error = new Error('Forbidden');
      (error as any).response = { status: 403 };

      vi.mocked(mockAxios.patch).mockRejectedValueOnce(error);

      await expect(
        repo.update('series-id', { name: 'Updated' })
      ).rejects.toThrow('Forbidden');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.patch).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        repo.update('series-id', { name: 'Updated' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a series', async () => {
      vi.mocked(mockAxios.delete).mockResolvedValueOnce({});

      await expect(
        repo.delete('550e8400-e29b-41d4-a716-446655440000')
      ).resolves.toBeUndefined();
    });

    it('should throw Forbidden on 403', async () => {
      const error = new Error('Forbidden');
      (error as any).response = { status: 403 };

      vi.mocked(mockAxios.delete).mockRejectedValueOnce(error);

      await expect(repo.delete('series-id')).rejects.toThrow('Forbidden');
    });

    it('should throw Not found on 404', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };

      vi.mocked(mockAxios.delete).mockRejectedValueOnce(error);

      await expect(repo.delete('nonexistent-id')).rejects.toThrow(
        'Not found'
      );
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.delete).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(repo.delete('series-id')).rejects.toThrow();
    });
  });
});
