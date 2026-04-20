import type {
  Series,
  SeriesList,
  CreateSeriesInput,
  UpdateSeriesInput,
} from '../model/series';

export interface ISeriesRepository {
  // 조회
  getByUsername(username: string): Promise<SeriesList>;

  // 작성/수정
  create(input: CreateSeriesInput): Promise<Series>;
  update(seriesId: string, input: UpdateSeriesInput): Promise<Series>;

  // 삭제
  delete(seriesId: string): Promise<void>;
}
