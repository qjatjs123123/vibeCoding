import type { CommentDto, CommentListResponseDto, CreateCommentRequestDto, UpdateCommentRequestDto } from '../dto/commentDto';
import type { Comment, CommentList, CreateCommentInput, UpdateCommentInput } from './comment';

export class CommentMapper {
  // DTO → Domain
  static toDomain(dto: CommentDto): Comment {
    return {
      id: dto.id,
      content: dto.content,
      postId: dto.post_id,
      author: {
        username: dto.author.username,
        avatarUrl: dto.author.avatar_url,
      },
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      parentCommentId: dto.parent_comment_id || undefined,
      isDeleted: dto.is_deleted || false,
    };
  }

  static toDomainList(dto: CommentListResponseDto): CommentList {
    return {
      items: dto.comments.map(c => this.toDomain(c)),
      totalCount: dto.total_count,
    };
  }

  // Domain → DTO (POST/PATCH 요청용)
  static toDto(input: CreateCommentInput): CreateCommentRequestDto {
    return {
      content: input.content,
      parent_comment_id: input.parentCommentId,
    };
  }

  static toUpdateDto(input: UpdateCommentInput): UpdateCommentRequestDto {
    return {
      content: input.content,
    };
  }
}
