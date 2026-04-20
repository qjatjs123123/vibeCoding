import { AxiosInstance, isAxiosError } from 'axios';
import type { SearchResultDto } from '../dto/searchDto';

export class SearchRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async search(query: string): Promise<SearchResultDto> {
    try {
      if (!query.trim()) {
        return { posts: [], tags: [] };
      }

      const { data } = await this.axiosInstance.get<SearchResultDto>(
        '/api/search',
        {
          params: { q: query },
        }
      );

      return data;
    } catch (error) {
      throw this.handleError(error, 'Search failed');
    }
  }

  private handleError(error: unknown, message: string): Error {
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 400) {
        throw new Error('Invalid search query');
      }
      throw error;
    }
    throw new Error(message);
  }
}
