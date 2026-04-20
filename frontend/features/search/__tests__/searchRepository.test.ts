import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchRepository } from '../repository/searchRepository';
import type { AxiosInstance } from 'axios';

describe('SearchRepository', () => {
  let mockAxios: AxiosInstance;
  let repo: SearchRepository;

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

    repo = new SearchRepository(mockAxios);
  });

  describe('search', () => {
    it('should search posts and tags', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          posts: [
            { id: '1', title: 'React Tutorial', slug: 'react-tutorial' },
            { id: '2', title: 'React Hooks', slug: 'react-hooks' },
          ],
          tags: [{ name: 'react' }, { name: 'javascript' }],
        },
      } as any);

      const result = await repo.search('react');

      expect(result.posts).toHaveLength(2);
      expect(result.tags).toHaveLength(2);
      expect(result.posts[0].title).toBe('React Tutorial');
      expect(mockAxios.get).toHaveBeenCalledWith('/api/search', {
        params: { q: 'react' },
      });
    });

    it('should return empty result for empty query', async () => {
      const result = await repo.search('');

      expect(result.posts).toHaveLength(0);
      expect(result.tags).toHaveLength(0);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should return empty result for whitespace-only query', async () => {
      const result = await repo.search('   ');

      expect(result.posts).toHaveLength(0);
      expect(result.tags).toHaveLength(0);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should throw Invalid search query on 400', async () => {
      const error = new Error('Bad Request');
      (error as any).response = { status: 400 };

      vi.mocked(mockAxios.get).mockRejectedValueOnce(error);

      await expect(repo.search('invalid<>query')).rejects.toThrow(
        'Invalid search query'
      );
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(repo.search('react')).rejects.toThrow();
    });

    it('should handle empty search result', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          posts: [],
          tags: [],
        },
      } as any);

      const result = await repo.search('nonexistent');

      expect(result.posts).toHaveLength(0);
      expect(result.tags).toHaveLength(0);
    });
  });
});
