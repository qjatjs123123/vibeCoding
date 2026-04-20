import type { TagDto, TagListResponseDto } from '../dto/tagDto';
import type { Tag, TagList } from './tag';

export class TagMapper {
  // DTO → Domain
  static toDomain(dto: TagDto): Tag {
    return {
      name: dto.name,
      postCount: dto.post_count,
    };
  }

  static toDomainList(dto: TagListResponseDto): TagList {
    return {
      items: dto.tags.map(t => this.toDomain(t)),
      totalCount: dto.total_count,
    };
  }
}
