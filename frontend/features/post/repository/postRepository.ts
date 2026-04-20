import { AxiosInstance } from 'axios';
import {
  PostDtoSchema,
  PostFeedResponseDtoSchema,
  ToggleLikeResponseDtoSchema,
} from '../dto/postSchema';
import { PostMapper } from '../model/postMapper';
import type {
  Post,
  PostFeed,
  CreatePostInput,
  UpdatePostInput,
  ToggleLikeResult,
} from '../model/post';
import type { IPostRepository } from './IPostRepository';

export class PostRepository implements IPostRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getFeedRecent(options: {
    limit?: number;
    cursor?: string;
  }): Promise<PostFeed> {
    try {
      const { data } = await this.axiosInstance.get('/api/posts', {
        params: {
          feed: 'recent',
          limit: options.limit ?? 12,
          cursor: options.cursor,
        },
      });

      const validated = PostFeedResponseDtoSchema.parse(data);
      return PostMapper.toDomainFeed(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent feed');
    }
  }

  async getFeedTrending(options: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    cursor?: string;
  }): Promise<PostFeed> {
    try {
      const { data } = await this.axiosInstance.get('/api/posts', {
        params: {
          feed: 'trending',
          period: options.period ?? 'week',
          limit: options.limit ?? 12,
          cursor: options.cursor,
        },
      });

      const validated = PostFeedResponseDtoSchema.parse(data);
      return PostMapper.toDomainFeed(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch trending feed');
    }
  }

  async getFeedByTag(
    tagName: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<PostFeed> {
    try {
      const { data } = await this.axiosInstance.get('/api/posts', {
        params: {
          tag: tagName,
          limit: options?.limit ?? 12,
          cursor: options?.cursor,
        },
      });

      const validated = PostFeedResponseDtoSchema.parse(data);
      return PostMapper.toDomainFeed(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch tag feed');
    }
  }

  async getById(postId: string): Promise<Post> {
    try {
      const { data } = await this.axiosInstance.get(`/api/posts/${postId}`);
      const validated = PostDtoSchema.parse(data);
      return PostMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch post');
    }
  }

  async getBySlug(username: string, slug: string): Promise<Post> {
    try {
      // Note: Backend might use different endpoint, adjust if needed
      const { data } = await this.axiosInstance.get(
        `/api/users/${username}/posts/${slug}`
      );
      const validated = PostDtoSchema.parse(data);
      return PostMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch post by slug');
    }
  }

  async getMyDrafts(options?: {
    limit?: number;
    cursor?: string;
  }): Promise<PostFeed> {
    try {
      const { data } = await this.axiosInstance.get('/api/me/posts', {
        params: {
          limit: options?.limit ?? 12,
          cursor: options?.cursor,
        },
      });

      const validated = PostFeedResponseDtoSchema.parse(data);
      return PostMapper.toDomainFeed(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch drafts');
    }
  }

  async create(input: CreatePostInput): Promise<Post> {
    try {
      const payload = PostMapper.toCreateDto(input);
      const { data } = await this.axiosInstance.post('/api/posts', payload);
      const validated = PostDtoSchema.parse(data);
      return PostMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to create post');
    }
  }

  async update(postId: string, input: UpdatePostInput): Promise<Post> {
    try {
      const payload = PostMapper.toUpdateDto(input);
      const { data } = await this.axiosInstance.patch(
        `/api/posts/${postId}`,
        payload
      );
      const validated = PostDtoSchema.parse(data);
      return PostMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to update post');
    }
  }

  async delete(postId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/posts/${postId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete post');
    }
  }

  async toggleLike(postId: string): Promise<ToggleLikeResult> {
    try {
      const { data } = await this.axiosInstance.post(
        `/api/posts/${postId}/like`
      );
      const validated = ToggleLikeResponseDtoSchema.parse(data);
      return { liked: validated.liked };
    } catch (error) {
      throw this.handleError(error, 'Failed to toggle like');
    }
  }

  private handleError(error: unknown, message: string): Error {
    if (error instanceof Error) {
      // Zod validation error
      if (error.message.includes('Zod')) {
        return new Error(`Domain Layer Error: ${error.message}`);
      }
      return error;
    }
    return new Error(message);
  }
}
