import type {
  Post,
  PostFeed,
  CreatePostInput,
  UpdatePostInput,
  ToggleLikeResult,
} from '../model/post';

/**
 * Post Repository Interface
 * 모든 Post 관련 데이터 접근 메서드 정의
 */
export interface IPostRepository {
  /**
   * 최신 피드 조회
   */
  getFeedRecent(options: {
    limit?: number;
    cursor?: string;
  }): Promise<PostFeed>;

  /**
   * 트렌딩 피드 조회
   */
  getFeedTrending(options: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    cursor?: string;
  }): Promise<PostFeed>;

  /**
   * 태그별 피드 조회
   */
  getFeedByTag(
    tagName: string,
    options?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<PostFeed>;

  /**
   * ID로 포스트 조회
   */
  getById(postId: string): Promise<Post>;

  /**
   * username + slug로 포스트 조회
   */
  getBySlug(username: string, slug: string): Promise<Post>;

  /**
   * 내 임시저장 포스트 목록
   */
  getMyDrafts(options?: {
    limit?: number;
    cursor?: string;
  }): Promise<PostFeed>;

  /**
   * 포스트 생성
   */
  create(input: CreatePostInput): Promise<Post>;

  /**
   * 포스트 수정
   */
  update(postId: string, input: UpdatePostInput): Promise<Post>;

  /**
   * 포스트 삭제
   */
  delete(postId: string): Promise<void>;

  /**
   * 좋아요 토글
   */
  toggleLike(postId: string): Promise<ToggleLikeResult>;
}
