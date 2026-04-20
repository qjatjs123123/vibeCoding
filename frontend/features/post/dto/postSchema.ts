import { z } from 'zod';

/**
 * Post DTO Zod Schema — 백엔드 응답 검증
 */

const PostAuthorSchema = z.object({
  username: z.string().min(1),
  avatar_url: z.string().url(),
});

const PostTagSchema = z.object({
  name: z.string().min(1),
});

export const PostDtoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1),
  excerpt: z.string(),
  cover_image: z.string().url().nullable().optional(),
  published_at: z.string().datetime(),
  reading_time: z.number().int().nonnegative(),
  view_count: z.number().int().nonnegative(),
  author: PostAuthorSchema,
  tags: z.array(PostTagSchema),
  like_count: z.number().int().nonnegative(),
  comment_count: z.number().int().nonnegative(),
});

export type PostDtoType = z.infer<typeof PostDtoSchema>;

/**
 * 피드 응답 스키마
 */
export const PostFeedResponseDtoSchema = z.object({
  posts: z.array(PostDtoSchema),
  total_count: z.number().int().nonnegative(),
  next_cursor: z.string().optional().nullable(),
});

export type PostFeedResponseDtoType = z.infer<typeof PostFeedResponseDtoSchema>;

/**
 * 포스트 생성 요청 스키마
 */
export const CreatePostRequestDtoSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  cover_image: z.string().url().optional(),
  published: z.boolean(),
  tags: z.array(z.string()).max(10),
  series_id: z.string().uuid().optional(),
  series_order: z.number().int().positive().optional(),
});

export type CreatePostRequestDtoType = z.infer<
  typeof CreatePostRequestDtoSchema
>;

/**
 * 포스트 수정 요청 스키마
 */
export const UpdatePostRequestDtoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  cover_image: z.string().url().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).max(10).optional(),
  series_id: z.string().uuid().optional(),
  series_order: z.number().int().positive().optional(),
});

export type UpdatePostRequestDtoType = z.infer<
  typeof UpdatePostRequestDtoSchema
>;

/**
 * 좋아요 토글 응답 스키마
 */
export const ToggleLikeResponseDtoSchema = z.object({
  liked: z.boolean(),
});

export type ToggleLikeResponseDtoType = z.infer<
  typeof ToggleLikeResponseDtoSchema
>;
