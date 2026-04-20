/**
 * Comment DTO — 백엔드 API 응답을 그대로 매핑
 * snake_case 유지, 절대 변형 금지
 */

export interface CommentDto {
  id: string;
  content: string;
  post_id: string;
  author: {
    username: string;
    avatar_url: string;
  };
  created_at: string; // ISO8601 datetime
  updated_at: string; // ISO8601 datetime
  parent_comment_id?: string | null; // 대댓글인 경우 부모 댓글 ID
  is_deleted?: boolean; // soft-delete 상태
}

/**
 * 댓글 목록 응답
 */
export interface CommentListResponseDto {
  comments: CommentDto[];
  total_count: number;
}

/**
 * 댓글 생성 요청
 */
export interface CreateCommentRequestDto {
  content: string;
  parent_comment_id?: string; // 대댓글인 경우만
}

/**
 * 댓글 수정 요청
 */
export interface UpdateCommentRequestDto {
  content: string;
}
