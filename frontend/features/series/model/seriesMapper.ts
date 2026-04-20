import type {
  SeriesDto,
  SeriesListResponseDto,
  CreateSeriesRequestDto,
  UpdateSeriesRequestDto,
} from '../dto/seriesDto';
import type {
  Series,
  SeriesList,
  CreateSeriesInput,
  UpdateSeriesInput,
} from './series';

export class SeriesMapper {
  // DTO → Domain
  static toDomain(dto: SeriesDto): Series {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description || undefined,
      slug: dto.slug,
      authorId: dto.author_id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      postCount: dto.post_count,
    };
  }

  static toDomainList(dto: SeriesListResponseDto): SeriesList {
    return {
      items: dto.series.map(s => this.toDomain(s)),
      totalCount: dto.total_count,
    };
  }

  // Domain → DTO (POST/PATCH 요청용)
  static toCreateDto(input: CreateSeriesInput): CreateSeriesRequestDto {
    return {
      name: input.name,
      description: input.description,
    };
  }

  static toUpdateDto(input: UpdateSeriesInput): UpdateSeriesRequestDto {
    return {
      name: input.name,
      description: input.description,
    };
  }
}
