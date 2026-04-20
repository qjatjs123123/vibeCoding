import { z } from 'zod';
import type { CommentDto, CommentListResponseDto, CreateCommentRequestDto, UpdateCommentRequestDto } from './commentDto';

export const CommentDtoSchema: z.ZodType<CommentDto> = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
  post_id: z.string().uuid(),
  author: z.object({
    username: z.string(),
    avatar_url: z.string().url(),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  parent_comment_id: z.string().uuid().nullable().optional(),
  is_deleted: z.boolean().optional(),
});

export const CommentListResponseDtoSchema: z.ZodType<CommentListResponseDto> = z.object({
  comments: z.array(CommentDtoSchema),
  total_count: z.number().int().nonnegative(),
});

export const CreateCommentRequestDtoSchema: z.ZodType<CreateCommentRequestDto> = z.object({
  content: z.string().min(1),
  parent_comment_id: z.string().uuid().optional(),
});

export const UpdateCommentRequestDtoSchema: z.ZodType<UpdateCommentRequestDto> = z.object({
  content: z.string().min(1),
});
