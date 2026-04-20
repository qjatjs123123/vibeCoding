import 'reflect-metadata';
import { Container } from 'inversify';
import { axiosInstance } from '@/lib/axios';
import { TYPES } from './types';
import { PostRepository } from '@/features/post/repository/postRepository';
import { UserRepository } from '@/features/user/repository/userRepository';
import { CommentRepository } from '@/features/comment/repository/commentRepository';
import { TagRepository } from '@/features/tag/repository/tagRepository';
import { SeriesRepository } from '@/features/series/repository/seriesRepository';
import { UploadRepository } from '@/features/upload/repository/uploadRepository';
import { SearchRepository } from '@/features/search/repository/searchRepository';

export const container = new Container();

// axios instance
container.bind('axios').toConstantValue(axiosInstance);

// Repositories 바인딩
container.bind(TYPES.PostRepository).toDynamicValue(() => {
  return new PostRepository(axiosInstance);
});

container.bind(TYPES.UserRepository).toDynamicValue(() => {
  return new UserRepository(axiosInstance);
});

container.bind(TYPES.CommentRepository).toDynamicValue(() => {
  return new CommentRepository(axiosInstance);
});

container.bind(TYPES.TagRepository).toDynamicValue(() => {
  return new TagRepository(axiosInstance);
});

container.bind(TYPES.SeriesRepository).toDynamicValue(() => {
  return new SeriesRepository(axiosInstance);
});

container.bind(TYPES.UploadRepository).toDynamicValue(() => {
  return new UploadRepository(axiosInstance);
});

container.bind(TYPES.SearchRepository).toDynamicValue(() => {
  return new SearchRepository(axiosInstance);
});
