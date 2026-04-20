import { createQueryKeyStore } from '@lukemorales/query-key-factory';

/**
 * Centralized query key factory for all domains
 * 모든 도메인의 query key를 한곳에서 관리합니다.
 * 사용: queryKeys.posts.feed({ feed: 'recent' })
 */
export const queryKeys = createQueryKeyStore({
  posts: {
    all: null,
    feed: (params: { feed: 'recent' | 'trending'; limit?: number; cursor?: string }) => [
      { scope: 'feed', ...params },
    ],
    detail: (postId: string) => [{ scope: 'detail', postId }],
    bySlug: (username: string, slug: string) => [
      { scope: 'bySlug', username, slug },
    ],
    byTag: (tagName: string, params?: { limit?: number; cursor?: string }) => [
      { scope: 'byTag', tagName, ...params },
    ],
    drafts: null,
  },

  comments: {
    all: null,
    byPostId: (postId: string) => [{ scope: 'byPostId', postId }],
  },

  users: {
    all: null,
    profile: (username: string) => [{ scope: 'profile', username }],
    me: null,
  },

  tags: {
    all: null,
    list: (params?: { sort?: 'popular' | 'recent'; limit?: number }) => [
      { scope: 'list', ...params },
    ],
  },

  series: {
    all: null,
    byUsername: (username: string) => [{ scope: 'byUsername', username }],
  },

  search: {
    all: null,
    results: (query: string) => [{ scope: 'results', query }],
  },
});
