import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentRepository } from '../repository/commentRepository';
import type { AxiosInstance } from 'axios';

/**
 * Mock data
 */
const mockCommentDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  content: 'Great post!',
  post_id: '550e8400-e29b-41d4-a716-446655440100',
  author: { username: 'john', avatar_url: 'https://example.com/avatar1.jpg' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  parent_comment_id: null,
  is_deleted: false,
};

const mockCommentDto2 = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  content: 'Reply to comment 1',
  post_id: '550e8400-e29b-41d4-a716-446655440100',
  author: { username: 'jane', avatar_url: 'https://example.com/avatar2.jpg' },
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  parent_comment_id: '550e8400-e29b-41d4-a716-446655440000',
  is_deleted: false,
};

const mockCommentDto3 = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  content: '[삭제된 댓글입니다]',
  post_id: '550e8400-e29b-41d4-a716-446655440100',
  author: { username: 'deleted_user', avatar_url: 'https://example.com/avatar3.jpg' },
  created_at: '2024-01-03T00:00:00Z',
  updated_at: '2024-01-03T00:00:00Z',
  parent_comment_id: null,
  is_deleted: true,
};

/**
 * Tests
 */
describe('CommentRepository', () => {
  let mockAxios: AxiosInstance;
  let repo: CommentRepository;

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

    repo = new CommentRepository(mockAxios);
  });

  describe('getByPostId', () => {
    it('should fetch comments by post ID', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          comments: [mockCommentDto, mockCommentDto2, mockCommentDto3],
          total_count: 3,
        },
      } as any);

      const list = await repo.getByPostId('post-1');

      expect(list.items).toHaveLength(3);
      expect(list.totalCount).toBe(3);
      expect(list.items[0].content).toBe('Great post!');
    });

    it('should map snake_case to camelCase', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          comments: [mockCommentDto],
          total_count: 1,
        },
      } as any);

      const list = await repo.getByPostId('post-1');

      expect(list.items[0].postId).toBe(mockCommentDto.post_id);
      expect(list.items[0].createdAt).toBeInstanceOf(Date);
      expect(list.items[0].parentCommentId).toBeUndefined();
    });

    it('should handle parent comment ID', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          comments: [mockCommentDto2],
          total_count: 1,
        },
      } as any);

      const list = await repo.getByPostId('post-1');

      expect(list.items[0].parentCommentId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should handle soft-deleted comments', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          comments: [mockCommentDto3],
          total_count: 1,
        },
      } as any);

      const list = await repo.getByPostId('post-1');

      expect(list.items[0].isDeleted).toBe(true);
      expect(list.items[0].content).toBe('[삭제된 댓글입니다]');
    });

    it('should throw error on API failure', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(repo.getByPostId('post-1')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const newComment = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        content: 'New comment',
        post_id: '550e8400-e29b-41d4-a716-446655440100',
        author: { username: 'test_user', avatar_url: 'https://example.com/avatar4.jpg' },
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
        parent_comment_id: null,
        is_deleted: false,
      };

      vi.mocked(mockAxios.post).mockResolvedValueOnce({
        data: newComment,
      } as any);

      const comment = await repo.create('post-1', {
        content: 'New comment',
      });

      expect(comment.id).toBe(newComment.id);
      expect(comment.content).toBe('New comment');
      expect(comment.postId).toBe(newComment.post_id);
    });

    it('should create a reply comment with parent comment ID', async () => {
      const replyComment = {
        ...mockCommentDto2,
        id: '550e8400-e29b-41d4-a716-446655440004',
      };

      vi.mocked(mockAxios.post).mockResolvedValueOnce({
        data: replyComment,
      } as any);

      const comment = await repo.create('post-1', {
        content: 'Reply to comment',
        parentCommentId: '1',
      });

      expect(comment.parentCommentId).toBe(replyComment.parent_comment_id);
    });

    it('should throw Unauthorized on 401', async () => {
      const error = new Error('Unauthorized');
      (error as any).response = { status: 401 };

      vi.mocked(mockAxios.post).mockRejectedValueOnce(error);

      await expect(
        repo.create('post-1', { content: 'Comment' })
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        repo.create('post-1', { content: 'Comment' })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updatedComment = {
        ...mockCommentDto,
        content: 'Updated comment',
        updated_at: '2024-01-05T00:00:00Z',
      };

      vi.mocked(mockAxios.patch).mockResolvedValueOnce({
        data: updatedComment,
      } as any);

      const comment = await repo.update('post-1', '1', {
        content: 'Updated comment',
      });

      expect(comment.id).toBe(updatedComment.id);
      expect(comment.content).toBe('Updated comment');
    });

    it('should throw Forbidden on 403', async () => {
      const error = new Error('Forbidden');
      (error as any).response = { status: 403 };

      vi.mocked(mockAxios.patch).mockRejectedValueOnce(error);

      await expect(
        repo.update('post-1', '1', { content: 'Updated' })
      ).rejects.toThrow('Forbidden');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.patch).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        repo.update('post-1', '1', { content: 'Updated' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a comment', async () => {
      vi.mocked(mockAxios.delete).mockResolvedValueOnce({});

      await expect(repo.delete('post-1', '1')).resolves.toBeUndefined();
    });

    it('should throw Forbidden on 403', async () => {
      const error = new Error('Forbidden');
      (error as any).response = { status: 403 };

      vi.mocked(mockAxios.delete).mockRejectedValueOnce(error);

      await expect(repo.delete('post-1', '1')).rejects.toThrow('Forbidden');
    });

    it('should throw Not found on 404', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };

      vi.mocked(mockAxios.delete).mockRejectedValueOnce(error);

      await expect(repo.delete('post-1', '999')).rejects.toThrow('Not found');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.delete).mockRejectedValueOnce(new Error('Network error'));

      await expect(repo.delete('post-1', '1')).rejects.toThrow();
    });
  });
});
