import { z } from 'zod';
import type { TagDto, TagListResponseDto } from './tagDto';

export const TagDtoSchema: z.ZodType<TagDto> = z.object({
  name: z.string().min(1),
  post_count: z.number().int().nonnegative().optional(),
});

export const TagListResponseDtoSchema: z.ZodType<TagListResponseDto> = z.object({
  tags: z.array(TagDtoSchema),
  total_count: z.number().int().nonnegative(),
});
