/**
 * Post DTO — 백엔드 API 응답을 그대로 매핑
 * snake_case 유지, 절대 변형 금지
 */

export interface PostDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string | null;
  published_at: string; // ISO8601 datetime
  reading_time: number; // 분 단위
  view_count: number;
  author: {
    username: string;
    avatar_url: string;
  };
  tags: Array<{ name: string }>;
  like_count: number;
  comment_count: number;
}

/**
 * 피드 응답 (목록 조회)
 */
export interface PostFeedResponseDto {
  posts: PostDto[];
  total_count: number;
  next_cursor?: string | null;
}

/**
 * 포스트 생성 요청
 */
export interface CreatePostRequestDto {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  published: boolean;
  tags: string[];
  series_id?: string;
  series_order?: number;
}

/**
 * 포스트 수정 요청
 */
export interface UpdatePostRequestDto {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  published?: boolean;
  tags?: string[];
  series_id?: string;
  series_order?: number;
}

/**
 * 좋아요 토글 응답
 */
export interface ToggleLikeResponseDto {
  liked: boolean;
}
