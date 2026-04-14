# Domain Layer Pattern — Phase 1 가이드

백엔드 API를 프론트엔드 도메인 레이어로 변환하는 패턴. **각 도메인마다 8단계 반복**.

---

## 워크플로우 개요

```
Step 1. 백엔드 API 스키마 확인
        ↓
Step 2. DTO (백엔드 응답 그대로)
        ↓
Step 3. Zod Schema (런타임 검증)
        ↓
Step 4. Domain Model (프론트 친화적 타입)
        ↓
Step 5. Mapper (DTO → Domain 변환)
        ↓
Step 6. Repository Interface (추상화)
        ↓
Step 7. Repository Impl (axios 구현)
        ↓
Step 8. MSW Mock 테스트 (검증)
```

---

## Step 1: 백엔드 API 스키마 확인

**목표**: 백엔드에서 이 도메인이 반환하는 모든 응답 형식을 파악한다.

**확인 사항:**
1. `backend/CLAUDE.md`의 해당 도메인 섹션 읽기
2. 모든 GET, POST, PATCH, DELETE 엔드포인트의 request/response 스키마 기록
3. 인증 필요 여부, 에러 코드 확인
4. snake_case vs camelCase, 날짜 형식(ISO8601) 등 데이터 형식 확인

**예시 (Post 도메인):**
```
GET /api/posts (피드) → 응답:
{
  "posts": [{
    "id": string,
    "title": string,
    "slug": string,
    "excerpt": string,
    "coverImage": string,
    "publishedAt": ISO8601,
    "readingTime": number,
    "viewCount": number,
    "author": { username, avatarUrl },
    "tags": [{ name }],
    "likeCount": number,
    "commentCount": number
  }],
  "totalCount": number,
  "nextCursor": string
}

POST /api/posts (작성) → 요청:
{
  "title": string (max 255),
  "content": string (markdown),
  "excerpt": string (optional),
  "coverImage": string (optional),
  "published": boolean,
  "tags": string[] (max 10),
  "seriesId": string (optional),
  "seriesOrder": number (optional)
}
```

---

## Step 2: DTO (백엔드 응답 그대로)

**목표**: 백엔드 응답을 TypeScript interface로 1:1 매핑한다. **절대 변형하지 않음.**

**규칙:**
- 파일명: `src/features/{domain}/dto/{domain}Dto.ts`
- 백엔드에서 snake_case면 그대로 유지 (`created_at`)
- 필드 이름, 타입, 선택성 모두 백엔드와 동일
- 주석: 백엔드에서 정의한 의미만 기록

**예시:**
```typescript
// src/features/post/dto/postDto.ts
export interface PostDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;  // ISO8601, 문자열 그대로
  readingTime: number;
  viewCount: number;
  author: {
    username: string;
    avatarUrl: string;
  };
  tags: Array<{ name: string }>;
  likeCount: number;
  commentCount: number;
}

// 다른 엔드포인트 응답도 필요하면 추가
export interface PostFeedResponseDto {
  posts: PostDto[];
  totalCount: number;
  nextCursor?: string;
}

export interface CreatePostRequestDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  tags: string[];
  seriesId?: string;
  seriesOrder?: number;
}
```

---

## Step 3: Zod Schema (런타임 검증)

**목표**: 백엔드 응답이 예상한 형식인지 런타임에 검증한다. **Zod로 DTO 스키마 정의.**

**규칙:**
- 파일명: `src/features/{domain}/dto/{domain}Schema.ts`
- 각 DTO interface마다 대응하는 Zod schema 작성
- `.parse()` 또는 `.safeParse()` 호출 위치: Repository에서
- Zod 체인에 `.describe()` 추가 (문서화용)

**예시:**
```typescript
// src/features/post/dto/postSchema.ts
import { z } from 'zod';
import { PostDto, PostFeedResponseDto } from './postDto';

const PostDtoSchema: z.ZodType<PostDto> = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string(),
  excerpt: z.string(),
  coverImage: z.string().url().optional().nullable(),
  publishedAt: z.string().datetime(),  // ISO8601 문자열
  readingTime: z.number().int().nonnegative(),
  viewCount: z.number().int().nonnegative(),
  author: z.object({
    username: z.string(),
    avatarUrl: z.string().url(),
  }),
  tags: z.array(z.object({ name: z.string() })),
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
});

export const PostFeedResponseDtoSchema: z.ZodType<PostFeedResponseDto> = z.object({
  posts: z.array(PostDtoSchema),
  totalCount: z.number().int().nonnegative(),
  nextCursor: z.string().optional(),
});

export const CreatePostRequestDtoSchema: z.ZodType<CreatePostRequestDto> = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional(),
  published: z.boolean(),
  tags: z.array(z.string()).max(10),
  seriesId: z.string().uuid().optional(),
  seriesOrder: z.number().int().positive().optional(),
});
```

---

## Step 4: Domain Model (프론트 친화적 타입)

**목표**: 프론트엔드가 실제로 사용할 깔끔한 타입. **DTO와는 별개.**

**규칙:**
- 파일명: `src/features/{domain}/model/{domain}.ts`
- camelCase, Date 객체, 한국어/영어 명확성
- 백엔드 필드명과 다를 수 있음 (body → content, created_at → createdAt 등)
- 응답과 요청 분리 (Response model, Create/Update Input type)
- 이넘이나 union 타입은 프론트 관점으로 정의

**예시:**
```typescript
// src/features/post/model/post.ts

// 응답 모델
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: Date;        // 날짜 객체로 변환
  readingTime: number;      // 분 단위
  viewCount: number;
  author: {
    username: string;
    avatarUrl: string;
  };
  tags: Tag[];              // 도메인 참조
  likeCount: number;
  commentCount: number;
}

export interface PostFeed {
  items: Post[];
  totalCount: number;
  nextCursor?: string;
}

// 요청 모델
export interface CreatePostInput {
  title: string;
  content: string;          // body → content
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  tags: string[];           // 태그 문자열 배열
  seriesId?: string;
  seriesOrder?: number;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tags?: string[];
  seriesId?: string;
  seriesOrder?: number;
}

// 참고: Tag, Series 도메인도 정의되면 여기서 import
```

---

## Step 5: Mapper (DTO → Domain 변환)

**목표**: 백엔드 DTO를 도메인 모델로 변환. **순수 함수, 부수효과 없음.**

**규칙:**
- 파일명: `src/features/{domain}/model/{domain}Mapper.ts`
- static 메서드 또는 namespace 패턴 (싱글톤 인스턴스 불필요)
- `toDomain(dto)` → Model 변환
- 필요하면 `toDto(model)` → DTO 변환 (서버 전송용)
- 날짜, 문자열, 값 변환 로직만 포함

**예시:**
```typescript
// src/features/post/model/postMapper.ts
import type { PostDto, CreatePostRequestDto } from '../dto/postDto';
import type { Post, PostFeed, CreatePostInput } from './post';

export class PostMapper {
  // DTO → Domain
  static toDomain(dto: PostDto): Post {
    return {
      id: dto.id,
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      coverImage: dto.coverImage || undefined,
      publishedAt: new Date(dto.publishedAt),  // ISO 문자열 → Date
      readingTime: dto.readingTime,
      viewCount: dto.viewCount,
      author: dto.author,  // 중첩 객체는 그대로
      tags: dto.tags.map(t => ({ name: t.name })),  // Tag 도메인 참조로 변환 (나중에)
      likeCount: dto.likeCount,
      commentCount: dto.commentCount,
    };
  }

  static toDomainFeed(dto: PostFeedResponseDto): PostFeed {
    return {
      items: dto.posts.map(this.toDomain),
      totalCount: dto.totalCount,
      nextCursor: dto.nextCursor,
    };
  }

  // Domain → DTO (POST/PATCH 요청용)
  static toDto(input: CreatePostInput): CreatePostRequestDto {
    return {
      title: input.title,
      content: input.content,  // content → body로 변환하지 않음. input이 이미 정규화됨
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      published: input.published,
      tags: input.tags,
      seriesId: input.seriesId,
      seriesOrder: input.seriesOrder,
    };
  }
}
```

---

## Step 6: Repository Interface (추상화)

**목표**: 도메인의 모든 CRUD/action 메서드를 정의한다. **구현체는 모름.**

**규칙:**
- 파일명: `src/features/{domain}/repository/I{Domain}Repository.ts`
- `I` prefix (interface convention)
- 모든 메서드는 async (Promise 반환)
- 에러는 throw하거나 Result 타입 사용 (기본: throw)
- 도메인 Model 타입만 사용 (DTO 노출 금지)

**예시:**
```typescript
// src/features/post/repository/IPostRepository.ts
import type { Post, PostFeed, CreatePostInput, UpdatePostInput } from '../model/post';

export interface IPostRepository {
  // 조회
  getFeed(options: { feed: 'recent' | 'trending'; limit?: number; cursor?: string }): Promise<PostFeed>;
  getById(postId: string): Promise<Post>;
  getBySlug(username: string, slug: string): Promise<Post>;
  getByTag(tagName: string, limit?: number; cursor?: string): Promise<PostFeed>;
  getMyDrafts(): Promise<PostFeed>;  // 내 임시저장

  // 작성/수정
  create(input: CreatePostInput): Promise<Post>;
  update(postId: string, input: UpdatePostInput): Promise<Post>;

  // 삭제
  delete(postId: string): Promise<void>;

  // 액션
  toggleLike(postId: string): Promise<{ liked: boolean }>;  // 낙관적 업데이트용 반환값
}
```

---

## Step 7: Repository 구현체 (axios 기반)

**목표**: IRepository를 axios로 구현한다. **Zod 검증, 에러 처리 포함.**

**규칙:**
- 파일명: `src/features/{domain}/repository/{Domain}Repository.ts`
- Constructor에서 axios instance 주입 (DI 패턴)
- 각 메서드에서 `ZodSchema.parse(data)` 호출
- 에러는 caught & re-thrown 또는 DataLayerError로 변환
- Response 매핑: Mapper 클래스 사용

**예시:**
```typescript
// src/features/post/repository/postRepository.ts
import axios, { AxiosInstance } from 'axios';
import { PostFeedResponseDtoSchema } from '../dto/postSchema';
import { PostMapper } from '../model/postMapper';
import type { IPostRepository } from './IPostRepository';
import type { Post, PostFeed, CreatePostInput, UpdatePostInput } from '../model/post';

export class PostRepository implements IPostRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getFeed(options: { 
    feed: 'recent' | 'trending'; 
    limit?: number; 
    cursor?: string;
  }): Promise<PostFeed> {
    try {
      const { data } = await this.axiosInstance.get('/api/posts', {
        params: {
          feed: options.feed,
          limit: options.limit ?? 12,
          cursor: options.cursor,
        },
      });
      
      // Zod 검증
      const validated = PostFeedResponseDtoSchema.parse(data);
      
      // DTO → Domain 변환
      return PostMapper.toDomainFeed(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch feed');
    }
  }

  async getById(postId: string): Promise<Post> {
    try {
      const { data } = await this.axiosInstance.get(`/api/posts/${postId}`);
      const validated = PostDtoSchema.parse(data);
      return PostMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch post');
    }
  }

  async create(input: CreatePostInput): Promise<Post> {
    try {
      const payload = PostMapper.toDto(input);
      const { data } = await this.axiosInstance.post('/api/posts', payload);
      const validated = PostDtoSchema.parse(data);
      return PostMapper.toDomain(validated);
    } catch (error) {
      throw this.handleError(error, 'Failed to create post');
    }
  }

  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    try {
      const { data } = await this.axiosInstance.post(
        `/api/posts/${postId}/like`
      );
      return { liked: data.liked ?? true };  // 응답 형식 추정
    } catch (error) {
      throw this.handleError(error, 'Failed to toggle like');
    }
  }

  // ... 나머지 메서드

  private handleError(error: unknown, message: string): Error {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      if (error.response?.status === 403) {
        throw new Error('Forbidden');
      }
    }
    throw new Error(message);
  }
}
```

---

## Step 8: MSW Mock 테스트

**목표**: Repository의 모든 메서드를 MSW(Mock Service Worker)로 테스트한다.

**규칙:**
- 파일명: `src/features/{domain}/__tests__/{Domain}Repository.test.ts`
- MSW `http.get/post/patch/delete` handler로 API 모킹
- 각 메서드당 최소 2개 테스트 (성공, 실패)
- Zod 검증 실패 case도 테스트

**예시:**
```typescript
// src/features/post/__tests__/postRepository.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import axios from 'axios';
import { PostRepository } from '../repository/postRepository';

const mockPosts = [
  {
    id: '1',
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'Excerpt',
    coverImage: 'https://example.com/image.jpg',
    publishedAt: '2024-01-01T00:00:00Z',
    readingTime: 5,
    viewCount: 100,
    author: { username: 'john', avatarUrl: 'https://example.com/avatar.jpg' },
    tags: [{ name: 'test' }],
    likeCount: 10,
    commentCount: 5,
  },
];

const server = setupServer(
  http.get('/api/posts', () => {
    return HttpResponse.json({
      posts: mockPosts,
      totalCount: 1,
      nextCursor: null,
    });
  }),

  http.get('/api/posts/:postId', () => {
    return HttpResponse.json(mockPosts[0]);
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    if (!body.title || !body.content) {
      return HttpResponse.json({ error: 'Validation error' }, { status: 400 });
    }
    return HttpResponse.json({
      id: '2',
      ...body,
      publishedAt: new Date().toISOString(),
    });
  }),

  http.post('/api/posts/:postId/like', () => {
    return HttpResponse.json({ liked: true });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PostRepository', () => {
  const axiosInstance = axios.create({ baseURL: 'http://localhost' });
  const repo = new PostRepository(axiosInstance);

  describe('getFeed', () => {
    it('should fetch recent posts', async () => {
      const feed = await repo.getFeed({ feed: 'recent' });
      
      expect(feed.items).toHaveLength(1);
      expect(feed.items[0].title).toBe('Test Post');
      expect(feed.totalCount).toBe(1);
    });

    it('should throw error on API failure', async () => {
      server.use(
        http.get('/api/posts', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      await expect(repo.getFeed({ feed: 'recent' })).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const post = await repo.create({
        title: 'New Post',
        content: 'Content',
        published: true,
        tags: [],
      });

      expect(post.title).toBe('New Post');
      expect(post.id).toBe('2');
    });

    it('should throw error if title is missing', async () => {
      server.use(
        http.post('/api/posts', () => {
          return HttpResponse.json(
            { error: 'Title is required' },
            { status: 400 }
          );
        })
      );

      await expect(
        repo.create({
          title: '',
          content: 'Content',
          published: true,
          tags: [],
        })
      ).rejects.toThrow();
    });
  });

  describe('toggleLike', () => {
    it('should toggle like', async () => {
      const result = await repo.toggleLike('1');
      expect(result.liked).toBe(true);
    });
  });
});
```

---

## 파일 체크리스트

각 도메인마다 다음 8개 파일을 생성:

```
src/features/{domain}/
├── dto/
│   ├── {domain}Dto.ts          ✅ Step 2
│   └── {domain}Schema.ts       ✅ Step 3
├── model/
│   ├── {domain}.ts             ✅ Step 4
│   └── {domain}Mapper.ts       ✅ Step 5
├── repository/
│   ├── I{Domain}Repository.ts  ✅ Step 6
│   └── {Domain}Repository.ts   ✅ Step 7
└── __tests__/
    └── {Domain}Repository.test.ts  ✅ Step 8
```

모든 파일이 생성된 후 `npm run test` 통과 확인.
