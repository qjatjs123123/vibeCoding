import 'reflect-metadata';
import { Container } from 'inversify';
import { axiosInstance } from '@/lib/axios';

const container = new Container();

// axios instance
container.bind('axios').toConstantValue(axiosInstance);

// repositories 바인딩 (Phase 1에서 추가)
// container.bind(TYPES.PostRepository).to(PostRepository);

export default container;
