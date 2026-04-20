/**
 * DI 컨테이너의 타입 심볼 정의
 * inversify 사용 시 interface 대신 Symbol 사용
 */
export const TYPES = {
  // Repositories
  PostRepository: Symbol('PostRepository'),
  UserRepository: Symbol('UserRepository'),
  CommentRepository: Symbol('CommentRepository'),
  TagRepository: Symbol('TagRepository'),
  SeriesRepository: Symbol('SeriesRepository'),
  UploadRepository: Symbol('UploadRepository'),
  SearchRepository: Symbol('SearchRepository'),
};
