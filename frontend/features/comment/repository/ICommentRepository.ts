import type { Comment, CommentList, CreateCommentInput, UpdateCommentInput } from '../model/comment';

export interface ICommentRepository {
  // 조회
  getByPostId(postId: string): Promise<CommentList>;

  // 작성/수정
  create(postId: string, input: CreateCommentInput): Promise<Comment>;
  update(postId: string, commentId: string, input: UpdateCommentInput): Promise<Comment>;

  // 삭제 (soft-delete 처리)
  delete(postId: string, commentId: string): Promise<void>;
}
