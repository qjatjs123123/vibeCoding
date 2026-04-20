import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagRepository } from '../repository/tagRepository';
import type { AxiosInstance } from 'axios';

/**
 * Mock data
 */
const mockTagDto1 = {
  name: 'react',
  post_count: 45,
};

const mockTagDto2 = {
  name: 'typescript',
  post_count: 32,
};

const mockTagDto3 = {
  name: 'nextjs',
  post_count: 28,
};

/**
 * Tests
 */
describe('TagRepository', () => {
  let mockAxios: AxiosInstance;
  let repo: TagRepository;

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

    repo = new TagRepository(mockAxios);
  });

  describe('getAll', () => {
    it('should fetch all tags with default options', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          tags: [mockTagDto1, mockTagDto2, mockTagDto3],
          total_count: 3,
        },
      } as any);

      const list = await repo.getAll();

      expect(list.items).toHaveLength(3);
      expect(list.totalCount).toBe(3);
      expect(list.items[0].name).toBe('react');
      expect(mockAxios.get).toHaveBeenCalledWith('/api/tags', {
        params: { sort: 'popular', limit: 50 },
      });
    });

    it('should fetch tags with custom options', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          tags: [mockTagDto1],
          total_count: 1,
        },
      } as any);

      const list = await repo.getAll({ sort: 'recent', limit: 10 });

      expect(list.items).toHaveLength(1);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/tags', {
        params: { sort: 'recent', limit: 10 },
      });
    });

    it('should map snake_case to camelCase', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          tags: [mockTagDto1],
          total_count: 1,
        },
      } as any);

      const list = await repo.getAll();

      expect(list.items[0].postCount).toBe(mockTagDto1.post_count);
    });

    it('should handle tags without post count', async () => {
      const tagWithoutCount = { name: 'newTag' };

      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          tags: [tagWithoutCount],
          total_count: 1,
        },
      } as any);

      const list = await repo.getAll();

      expect(list.items[0].postCount).toBeUndefined();
    });

    it('should throw error on API failure', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(repo.getAll()).rejects.toThrow();
    });

    it('should throw Not found on 404', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };

      vi.mocked(mockAxios.get).mockRejectedValueOnce(error);

      await expect(repo.getAll()).rejects.toThrow('Not found');
    });

    it('should handle empty tag list', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          tags: [],
          total_count: 0,
        },
      } as any);

      const list = await repo.getAll();

      expect(list.items).toHaveLength(0);
      expect(list.totalCount).toBe(0);
    });
  });
});
