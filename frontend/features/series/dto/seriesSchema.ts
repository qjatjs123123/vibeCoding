import { z } from 'zod';
import type {
  SeriesDto,
  SeriesListResponseDto,
  CreateSeriesRequestDto,
  UpdateSeriesRequestDto,
} from './seriesDto';

export const SeriesDtoSchema: z.ZodType<SeriesDto> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  slug: z.string().optional(),
  author_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  post_count: z.number().int().nonnegative().optional(),
});

export const SeriesListResponseDtoSchema: z.ZodType<SeriesListResponseDto> =
  z.object({
    series: z.array(SeriesDtoSchema),
    total_count: z.number().int().nonnegative(),
  });

export const CreateSeriesRequestDtoSchema: z.ZodType<
  CreateSeriesRequestDto
> = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateSeriesRequestDtoSchema: z.ZodType<
  UpdateSeriesRequestDto
> = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});
