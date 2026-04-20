/**
 * Search DTO — 백엔드 API 응답
 */

export interface SearchResultDto {
  posts: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  tags: Array<{
    name: string;
  }>;
}
