import { AxiosInstance, isAxiosError } from 'axios';
import { SeriesListResponseDtoSchema, SeriesDtoSchema } from '../dto/seriesSchema';
import { SeriesMapper } from '../model/seriesMapper';
import type { ISeriesRepository } from './ISeriesRepository';
import type {
  Series,
  SeriesList,
  CreateSeriesInput,
  UpdateSeriesInput,
} from '../model/series';

export class SeriesRepository implements ISeriesRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getByUsername(username: string): Promise<SeriesList> {
    try {
      const { data } = await this.axiosInstance.get(
        `/api/users/${username}/series`
      );

      const validated = SeriesListResponseDtoSchema.parse(data);
      return SeriesMapper.toDomainList(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch series');
    }
  }

  async create(input: CreateSeriesInput): Promise<Series> {
    try {
      const payload = SeriesMapper.toCreateDto(input);
      const { data } = await this.axiosInstance.post('/api/series', payload);

      const validated = SeriesDtoSchema.parse(data);
      return SeriesMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to create series');
    }
  }

  async update(seriesId: string, input: UpdateSeriesInput): Promise<Series> {
    try {
      const payload = SeriesMapper.toUpdateDto(input);
      const { data } = await this.axiosInstance.patch(
        `/api/series/${seriesId}`,
        payload
      );

      const validated = SeriesDtoSchema.parse(data);
      return SeriesMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to update series');
    }
  }

  async delete(seriesId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/series/${seriesId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete series');
    }
  }

  private handleError(error: unknown, message: string): Error {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      if (error.response?.status === 403) {
        throw new Error('Forbidden');
      }
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
