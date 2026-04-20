/**
 * Series DTO — 백엔드 API 응답을 그대로 매핑
 * snake_case 유지
 */

export interface SeriesDto {
  id: string;
  name: string;
  description?: string | null;
  slug?: string;
  author_id: string;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  post_count?: number;
}

/**
 * 시리즈 목록 응답
 */
export interface SeriesListResponseDto {
  series: SeriesDto[];
  total_count: number;
}

/**
 * 시리즈 생성 요청
 */
export interface CreateSeriesRequestDto {
  name: string;
  description?: string;
}

/**
 * 시리즈 수정 요청
 */
export interface UpdateSeriesRequestDto {
  name?: string;
  description?: string;
}
