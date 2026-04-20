/**
 * Tag DTO — 백엔드 API 응답을 그대로 매핑
 * snake_case 유지
 */

export interface TagDto {
  name: string;
  post_count?: number; // 해당 태그의 포스트 개수
}

/**
 * 태그 목록 응답
 */
export interface TagListResponseDto {
  tags: TagDto[];
  total_count: number;
}
