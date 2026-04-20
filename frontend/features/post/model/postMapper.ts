import type {
  PostDto,
  PostFeedResponseDto,
  CreatePostRequestDto,
  UpdatePostRequestDto,
} from '../dto/postDto';
import type {
  Post,
  PostFeed,
  CreatePostInput,
  UpdatePostInput,
} from './post';

/**
 * Post Mapper — DTO ↔ Domain 변환
 */
export class PostMapper {
  /**
   * DTO → Domain
   */
  static toDomain(dto: PostDto): Post {
    return {
      id: dto.id,
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      coverImage: dto.cover_image || undefined,
      publishedAt: new Date(dto.published_at),
      readingTime: dto.reading_time,
      viewCount: dto.view_count,
      author: {
        username: dto.author.username,
        avatarUrl: dto.author.avatar_url,
      },
      tags: dto.tags.map((t) => ({ name: t.name })),
      likeCount: dto.like_count,
      commentCount: dto.comment_count,
    };
  }

  /**
   * DTO Feed → Domain Feed
   */
  static toDomainFeed(dto: PostFeedResponseDto): PostFeed {
    return {
      items: dto.posts.map((p) => this.toDomain(p)),
      totalCount: dto.total_count,
      nextCursor: dto.next_cursor || undefined,
    };
  }

  /**
   * Domain CreateInput → DTO
   */
  static toCreateDto(input: CreatePostInput): CreatePostRequestDto {
    return {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      cover_image: input.coverImage,
      published: input.published,
      tags: input.tags,
      series_id: input.seriesId,
      series_order: input.seriesOrder,
    };
  }

  /**
   * Domain UpdateInput → DTO
   */
  static toUpdateDto(input: UpdatePostInput): UpdatePostRequestDto {
    return {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      cover_image: input.coverImage,
      published: input.published,
      tags: input.tags,
      series_id: input.seriesId,
      series_order: input.seriesOrder,
    };
  }
}
