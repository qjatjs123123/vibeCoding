import { AxiosInstance, isAxiosError } from 'axios';
import { TagListResponseDtoSchema } from '../dto/tagSchema';
import { TagMapper } from '../model/tagMapper';
import type { ITagRepository } from './ITagRepository';
import type { TagList } from '../model/tag';

export class TagRepository implements ITagRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getAll(options?: {
    sort?: 'popular' | 'recent';
    limit?: number;
  }): Promise<TagList> {
    try {
      const { data } = await this.axiosInstance.get('/api/tags', {
        params: {
          sort: options?.sort ?? 'popular',
          limit: options?.limit ?? 50,
        },
      });

      const validated = TagListResponseDtoSchema.parse(data);
      return TagMapper.toDomainList(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch tags');
    }
  }

  private handleError(error: unknown, message: string): Error {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Not found');
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(message);
  }
}
