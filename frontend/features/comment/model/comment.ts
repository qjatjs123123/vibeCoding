/**
 * Comment Domain Model — 프론트엔드 친화적 타입
 */

export interface Comment {
  id: string;
  content: string; // "[삭제된 댓글입니다]"일 수도 있음 (soft-delete)
  postId: string;
  author: {
    username: string;
    avatarUrl: string;
  };
  createdAt: Date; // Date 객체로 변환
  updatedAt: Date;
  parentCommentId?: string; // 대댓글인 경우 부모 댓글 ID
  isDeleted?: boolean; // soft-delete 상태 (true면 content는 고정 문구)
}

/**
 * 댓글 목록 응답
 */
export interface CommentList {
  items: Comment[];
  totalCount: number;
}

/**
 * 댓글 생성 입력
 */
export interface CreateCommentInput {
  content: string;
  parentCommentId?: string; // 대댓글인 경우만
}

/**
 * 댓글 수정 입력
 */
export interface UpdateCommentInput {
  content: string;
}
