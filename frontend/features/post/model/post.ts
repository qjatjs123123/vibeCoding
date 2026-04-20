/**
 * Post Domain Model — 프론트엔드 친화적 타입
 */

export interface PostAuthor {
  username: string;
  avatarUrl: string;
}

export interface PostTag {
  name: string;
}

/**
 * 포스트 응답 모델
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: Date;
  readingTime: number;
  viewCount: number;
  author: PostAuthor;
  tags: PostTag[];
  likeCount: number;
  commentCount: number;
}

/**
 * 포스트 피드 모델
 */
export interface PostFeed {
  items: Post[];
  totalCount: number;
  nextCursor?: string;
}

/**
 * 포스트 생성 입력
 */
export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  tags: string[];
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 포스트 수정 입력
 */
export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tags?: string[];
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 좋아요 토글 결과
 */
export interface ToggleLikeResult {
  liked: boolean;
}
