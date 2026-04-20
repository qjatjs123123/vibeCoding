/**
 * Tag Domain Model — 프론트엔드 친화적 타입
 */

export interface Tag {
  name: string;
  postCount?: number; // camelCase로 변환
}

/**
 * 태그 목록 응답
 */
export interface TagList {
  items: Tag[];
  totalCount: number;
}
