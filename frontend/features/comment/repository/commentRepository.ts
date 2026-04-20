import axios, { AxiosInstance, isAxiosError } from 'axios';
import { CommentListResponseDtoSchema } from '../dto/commentSchema';
import { CommentDtoSchema } from '../dto/commentSchema';
import { CommentMapper } from '../model/commentMapper';
import type { ICommentRepository } from './ICommentRepository';
import type { Comment, CommentList, CreateCommentInput, UpdateCommentInput } from '../model/comment';

export class CommentRepository implements ICommentRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getByPostId(postId: string): Promise<CommentList> {
    try {
      const { data } = await this.axiosInstance.get(`/api/posts/${postId}/comments`);

      const validated = CommentListResponseDtoSchema.parse(data);
      return CommentMapper.toDomainList(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch comments');
    }
  }

  async create(postId: string, input: CreateCommentInput): Promise<Comment> {
    try {
      const payload = CommentMapper.toDto(input);
      const { data } = await this.axiosInstance.post(
        `/api/posts/${postId}/comments`,
        payload
      );

      const validated = CommentDtoSchema.parse(data);
      return CommentMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to create comment');
    }
  }

  async update(
    postId: string,
    commentId: string,
    input: UpdateCommentInput
  ): Promise<Comment> {
    try {
      const payload = CommentMapper.toUpdateDto(input);
      const { data } = await this.axiosInstance.patch(
        `/api/posts/${postId}/comments/${commentId}`,
        payload
      );

      const validated = CommentDtoSchema.parse(data);
      return CommentMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to update comment');
    }
  }

  async delete(postId: string, commentId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(
        `/api/posts/${postId}/comments/${commentId}`
      );
    } catch (error) {
      throw this.handleError(error, 'Failed to delete comment');
    }
  }

  private handleError(error: unknown, message: string): Error {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      if (error.response?.status === 403) {
        throw new Error('Forbidden');
      }
      if (error.response?.status === 404) {
        throw new Error('Not found');
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(message);
  }
}
