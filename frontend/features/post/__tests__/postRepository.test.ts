import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostRepository } from '../repository/postRepository';
import type { AxiosInstance } from 'axios';

/**
 * Mock data
 */
const mockPostDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'Test excerpt',
  cover_image: 'https://example.com/image.jpg',
  published_at: '2024-01-01T00:00:00Z',
  reading_time: 5,
  view_count: 100,
  author: {
    username: 'john',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  tags: [{ name: 'test' }],
  like_count: 10,
  comment_count: 5,
};

const mockPostDto2 = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Second Post',
  slug: 'second-post',
  excerpt: 'Second excerpt',
  cover_image: null,
  published_at: '2024-01-02T00:00:00Z',
  reading_time: 3,
  view_count: 50,
  author: {
    username: 'jane',
    avatar_url: 'https://example.com/jane.jpg',
  },
  tags: [{ name: 'tutorial' }],
  like_count: 5,
  comment_count: 2,
};

/**
 * Tests
 */
describe('PostRepository', () => {
  let mockAxios: AxiosInstance;
  let repo: PostRepository;

  beforeEach(() => {
    // Create a mock axios instance
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

    repo = new PostRepository(mockAxios);
  });

  describe('getFeedRecent', () => {
    it('should fetch recent feed successfully', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          posts: [mockPostDto, mockPostDto2],
          total_count: 2,
          next_cursor: null,
        },
      } as any);

      const feed = await repo.getFeedRecent({ limit: 12 });

      expect(feed.items).toHaveLength(2);
      expect(feed.totalCount).toBe(2);
      expect(feed.items[0].title).toBe('Test Post');
      expect(feed.items[0].slug).toBe('test-post');
      expect(feed.items[0].publishedAt).toBeInstanceOf(Date);
    });

    it('should map DTO to domain model correctly', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          posts: [mockPostDto],
          total_count: 1,
          next_cursor: null,
        },
      } as any);

      const feed = await repo.getFeedRecent({ limit: 1 });
      const post = feed.items[0];

      expect(post.id).toBe(mockPostDto.id);
      expect(post.title).toBe(mockPostDto.title);
      expect(post.author.avatarUrl).toBe(mockPostDto.author.avatar_url);
      expect(post.coverImage).toBe(mockPostDto.cover_image);
      expect(post.likeCount).toBe(mockPostDto.like_count);
    });
  });

  describe('getFeedTrending', () => {
    it('should fetch trending feed with period', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          posts: [mockPostDto, mockPostDto2],
          total_count: 2,
          next_cursor: null,
        },
      } as any);

      const feed = await repo.getFeedTrending({
        period: 'week',
        limit: 12,
      });

      expect(feed.items).toHaveLength(2);
      expect(feed.totalCount).toBe(2);
    });
  });

  describe('getFeedByTag', () => {
    it('should fetch posts by tag', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          posts: [mockPostDto],
          total_count: 1,
          next_cursor: null,
        },
      } as any);

      const feed = await repo.getFeedByTag('test', { limit: 12 });

      expect(feed.items).toHaveLength(1);
      expect(feed.items[0].tags[0].name).toBe('test');
    });
  });

  describe('getById', () => {
    it('should fetch post by ID', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: mockPostDto,
      } as any);

      const post = await repo.getById(mockPostDto.id);

      expect(post.id).toBe(mockPostDto.id);
      expect(post.title).toBe('Test Post');
      expect(post.likeCount).toBe(10);
    });

    it('should throw error on not found', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(
        new Error('Not Found')
      );

      await expect(
        repo.getById('550e8400-e29b-41d4-a716-446655440999')
      ).rejects.toThrow();
    });
  });

  describe('getBySlug', () => {
    it('should fetch post by username and slug', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: mockPostDto,
      } as any);

      const post = await repo.getBySlug('john', 'test-post');

      expect(post.id).toBe(mockPostDto.id);
      expect(post.author.username).toBe('john');
    });

    it('should throw error on not found', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(
        new Error('Not Found')
      );

      await expect(
        repo.getBySlug('unknown', 'slug')
      ).rejects.toThrow();
    });
  });

  describe('getMyDrafts', () => {
    it('should fetch user drafts', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          posts: [mockPostDto],
          total_count: 1,
          next_cursor: null,
        },
      } as any);

      const feed = await repo.getMyDrafts({ limit: 12 });

      expect(feed.items).toHaveLength(1);
      expect(feed.totalCount).toBe(1);
    });
  });

  describe('create', () => {
    it('should create new post', async () => {
      vi.mocked(mockAxios.post).mockResolvedValueOnce({
        data: {
          id: '550e8400-e29b-41d4-a716-446655440099',
          title: 'New Post',
          slug: 'new-post',
          excerpt: '',
          cover_image: null,
          published_at: new Date().toISOString(),
          reading_time: 3,
          view_count: 0,
          author: {
            username: 'current-user',
            avatar_url: 'https://example.com/current.jpg',
          },
          tags: [{ name: 'new' }, { name: 'post' }],
          like_count: 0,
          comment_count: 0,
        },
      } as any);

      const post = await repo.create({
        title: 'New Post',
        content: 'Content here',
        published: false,
        tags: ['new', 'post'],
      });

      expect(post.title).toBe('New Post');
      expect(post.id).toBe('550e8400-e29b-41d4-a716-446655440099');
      expect(post.tags).toHaveLength(2);
    });

    it('should throw error if title missing', async () => {
      vi.mocked(mockAxios.post).mockRejectedValueOnce(
        new Error('Validation error')
      );

      await expect(
        repo.create({
          title: '',
          content: 'Content',
          published: false,
          tags: [],
        })
      ).rejects.toThrow();
    });

    it('should throw error if content missing', async () => {
      vi.mocked(mockAxios.post).mockRejectedValueOnce(
        new Error('Validation error')
      );

      await expect(
        repo.create({
          title: 'Title',
          content: '',
          published: false,
          tags: [],
        })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update post', async () => {
      vi.mocked(mockAxios.patch).mockResolvedValueOnce({
        data: {
          ...mockPostDto,
          title: 'Updated Title',
        },
      } as any);

      const post = await repo.update(mockPostDto.id, {
        title: 'Updated Title',
      });

      expect(post.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should delete post', async () => {
      vi.mocked(mockAxios.delete).mockResolvedValueOnce({
        data: { success: true },
      } as any);

      await expect(
        repo.delete(mockPostDto.id)
      ).resolves.toBeUndefined();
    });
  });

  describe('toggleLike', () => {
    it('should toggle like successfully', async () => {
      vi.mocked(mockAxios.post).mockResolvedValueOnce({
        data: { liked: true },
      } as any);

      const result = await repo.toggleLike(mockPostDto.id);

      expect(result.liked).toBe(true);
    });
  });
});
