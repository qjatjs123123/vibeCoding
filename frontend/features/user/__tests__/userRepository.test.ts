import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '../repository/userRepository';
import type { AxiosInstance } from 'axios';

/**
 * Mock data
 */
const mockUserDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  username: 'john-doe',
  email: 'john@example.com',
  avatar_url: 'https://example.com/avatar.jpg',
  bio: 'Frontend developer',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

const mockUserDto2 = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  username: 'jane-smith',
  email: 'jane@example.com',
  avatar_url: null,
  bio: null,
  created_at: '2024-02-01T00:00:00Z',
  updated_at: '2024-02-10T12:00:00Z',
};

/**
 * Tests
 */
describe('UserRepository', () => {
  let mockAxios: AxiosInstance;
  let repo: UserRepository;

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

    repo = new UserRepository(mockAxios);
  });

  describe('getUserByUsername', () => {
    it('should fetch user profile by username successfully', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          user: mockUserDto,
        },
      } as any);

      const user = await repo.getUserByUsername('john-doe');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/users/john-doe');
      expect(user.id).toBe(mockUserDto.id);
      expect(user.username).toBe('john-doe');
      expect(user.email).toBe('john@example.com');
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(user.bio).toBe('Frontend developer');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle null optional fields', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          user: mockUserDto2,
        },
      } as any);

      const user = await repo.getUserByUsername('jane-smith');

      expect(user.username).toBe('jane-smith');
      expect(user.avatarUrl).toBeUndefined();
      expect(user.bio).toBeUndefined();
    });

    it('should throw error on 404 not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
        },
      };
      vi.mocked(mockAxios.get).mockRejectedValueOnce(errorResponse as any);

      await expect(repo.getUserByUsername('nonexistent')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(repo.getUserByUsername('john-doe')).rejects.toThrow(
        'Failed to fetch user profile'
      );
    });
  });

  describe('getMe', () => {
    it('should fetch current user info successfully', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          user: mockUserDto,
          needs_username: false,
        },
      } as any);

      const currentUser = await repo.getMe();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/users/me');
      expect(currentUser.user.id).toBe(mockUserDto.id);
      expect(currentUser.user.username).toBe('john-doe');
      expect(currentUser.needsUsername).toBe(false);
    });

    it('should return needsUsername=true on first login', async () => {
      vi.mocked(mockAxios.get).mockResolvedValueOnce({
        data: {
          user: mockUserDto,
          needs_username: true,
        },
      } as any);

      const currentUser = await repo.getMe();

      expect(currentUser.needsUsername).toBe(true);
    });

    it('should throw error on 401 unauthorized', async () => {
      const errorResponse = {
        response: {
          status: 401,
        },
      };
      vi.mocked(mockAxios.get).mockRejectedValueOnce(errorResponse as any);

      await expect(repo.getMe()).rejects.toThrow(
        'Unauthorized - Please login again'
      );
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(repo.getMe()).rejects.toThrow(
        'Failed to fetch current user info'
      );
    });
  });

  describe('updateMe', () => {
    it('should update user info successfully', async () => {
      const updateInput = {
        username: 'john-updated',
        bio: 'Full-stack developer',
      };

      vi.mocked(mockAxios.patch).mockResolvedValueOnce({
        data: {
          user: {
            ...mockUserDto,
            username: 'john-updated',
            bio: 'Full-stack developer',
          },
        },
      } as any);

      const result = await repo.updateMe(updateInput);

      expect(mockAxios.patch).toHaveBeenCalledWith('/api/users/me', {
        username: 'john-updated',
        email: undefined,
        bio: 'Full-stack developer',
        avatar_url: undefined,
      });

      expect(result.user.username).toBe('john-updated');
      expect(result.user.bio).toBe('Full-stack developer');
    });

    it('should update only provided fields', async () => {
      const updateInput = {
        bio: 'Updated bio',
      };

      vi.mocked(mockAxios.patch).mockResolvedValueOnce({
        data: {
          user: {
            ...mockUserDto,
            bio: 'Updated bio',
          },
        },
      } as any);

      await repo.updateMe(updateInput);

      expect(mockAxios.patch).toHaveBeenCalledWith('/api/users/me', {
        username: undefined,
        email: undefined,
        bio: 'Updated bio',
        avatar_url: undefined,
      });
    });

    it('should handle avatar URL update', async () => {
      const updateInput = {
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };

      vi.mocked(mockAxios.patch).mockResolvedValueOnce({
        data: {
          user: {
            ...mockUserDto,
            avatar_url: 'https://example.com/new-avatar.jpg',
          },
        },
      } as any);

      await repo.updateMe(updateInput);

      expect(mockAxios.patch).toHaveBeenCalledWith('/api/users/me', {
        username: undefined,
        email: undefined,
        bio: undefined,
        avatar_url: 'https://example.com/new-avatar.jpg',
      });
    });

    it('should throw error on 401 unauthorized', async () => {
      const errorResponse = {
        response: {
          status: 401,
        },
      };
      vi.mocked(mockAxios.patch).mockRejectedValueOnce(errorResponse as any);

      await expect(
        repo.updateMe({ bio: 'Updated bio' })
      ).rejects.toThrow('Unauthorized - Please login again');
    });

    it('should throw error on 403 forbidden', async () => {
      const errorResponse = {
        response: {
          status: 403,
        },
      };
      vi.mocked(mockAxios.patch).mockRejectedValueOnce(errorResponse as any);

      await expect(
        repo.updateMe({ bio: 'Updated bio' })
      ).rejects.toThrow('Forbidden - You do not have permission');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(mockAxios.patch).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(repo.updateMe({ bio: 'New bio' })).rejects.toThrow(
        'Failed to update user info'
      );
    });
  });
});
