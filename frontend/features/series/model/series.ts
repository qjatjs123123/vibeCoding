/**
 * Series Domain Model — 프론트엔드 친화적 타입
 */

export interface Series {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  authorId: string;
  createdAt: Date; // Date 객체로 변환
  updatedAt: Date;
  postCount?: number;
}

/**
 * 시리즈 목록 응답
 */
export interface SeriesList {
  items: Series[];
  totalCount: number;
}

/**
 * 시리즈 생성 입력
 */
export interface CreateSeriesInput {
  name: string;
  description?: string;
}

/**
 * 시리즈 수정 입력
 */
export interface UpdateSeriesInput {
  name?: string;
  description?: string;
}
