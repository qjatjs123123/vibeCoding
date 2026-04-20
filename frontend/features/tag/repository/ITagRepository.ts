import type { Tag, TagList } from '../model/tag';

export interface ITagRepository {
  // 조회
  getAll(options?: { sort?: 'popular' | 'recent'; limit?: number }): Promise<TagList>;
}
