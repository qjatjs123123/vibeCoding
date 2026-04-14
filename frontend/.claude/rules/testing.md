---
description: 테스트 파일(*.test.tsx, *.spec.ts) 작성 또는 Playwright E2E 작업 시
alwaysApply: false
---

# Testing Guide — Frontend

Vitest (단위) + Playwright (E2E) 기반 테스트 전략. RSC 테스트 방식에 유의.

---

## 테스트 환경 설정

### package.json

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitest/ui": "^1.0.0",
    "jsdom": "^23.0.0",
    "@playwright/test": "^1.40.0",
    "ts-node": "^10.0.0"
  }
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### vitest.setup.ts

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// 각 테스트 후 DOM 정리
afterEach(() => {
  cleanup();
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock IntersectionObserver (무한스크롤 테스트용)
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;
```

---

## 단위 테스트 (Vitest)

### Client Component 테스트

```typescript
// components/post/PostCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from './PostCard';
import type { Post } from '@/lib/types';

describe('PostCard', () => {
  const mockPost: Post = {
    id: '1',
    title: 'Test Post',
    slug: 'test-post',
    content: 'Content',
    excerpt: 'Excerpt',
    published: true,
    publishedAt: new Date('2024-01-01'),
    authorId: 'user-1',
    likeCount: 0,
    commentCount: 0,
  };

  it('should render post title', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('should call onLike when like button clicked', async () => {
    const onLike = vi.fn();
    const user = userEvent.setup();
    
    render(<PostCard post={mockPost} onLike={onLike} />);
    await user.click(screen.getByRole('button', { name: /like/i }));
    
    expect(onLike).toHaveBeenCalledWith('1');
  });

  it('should display excerpt correctly', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Excerpt')).toBeInTheDocument();
  });
});
```

### Hook 테스트 (TanStack Query)

```typescript
// hooks/usePost.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePost } from './usePost';
import * as api from '@/lib/api';

describe('usePost', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch post data', async () => {
    const mockPost = { id: '1', title: 'Test', content: 'Content' };
    vi.spyOn(api, 'fetchPost').mockResolvedValue(mockPost);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => usePost('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPost);
  });

  it('should handle error states', async () => {
    vi.spyOn(api, 'fetchPost').mockRejectedValue(
      new Error('Network error')
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => usePost('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

### Zustand Store 테스트

```typescript
// stores/postStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePostStore } from './postStore';

describe('usePostStore', () => {
  beforeEach(() => {
    const store = usePostStore();
    store.resetDraft();
  });

  it('should save draft', () => {
    const { result } = renderHook(() => usePostStore());

    act(() => {
      result.current.saveDraft('Test Title', 'Test Content');
    });

    expect(result.current.draft?.title).toBe('Test Title');
  });

  it('should clear draft', () => {
    const { result } = renderHook(() => usePostStore());

    act(() => {
      result.current.saveDraft('Title', 'Content');
      result.current.resetDraft();
    });

    expect(result.current.draft).toBeNull();
  });
});
```

### Server Component 테스트 (제한적)

```typescript
// app/__tests__/feed.test.ts
// 주의: RSC는 렌더링 테스트만 가능 (실제 DB 접근 필요)
import { describe, it, expect, vi } from 'vitest';
import FeedPage from '@/app/page';

describe('FeedPage (RSC)', () => {
  it('should render without crashing', async () => {
    // RSC는 async이므로 await 필수
    const page = await FeedPage();
    expect(page).toBeDefined();
  });

  // 주의: RSC 내부 상태/이벤트 테스트는 E2E(Playwright)에서
});
```

---

## TanStack Query Mock 전략

### API Mock (Vitest + MSW 권장)

```typescript
// vitest.setup.ts 추가
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/posts', () => {
    return HttpResponse.json([
      { id: '1', title: 'Post 1', content: 'Content 1' },
    ]);
  }),
  
  http.post('/api/posts/:postId/like', () => {
    return HttpResponse.json({ success: true });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Query 캐시 초기화

```typescript
beforeEach(() => {
  // 각 테스트마다 캐시 초기화
  queryClient.clear();
});
```

---

## E2E 테스트 (Playwright)

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 페이지 객체 패턴 (POM)

```typescript
// e2e/pages/PostPage.ts
import { Page } from '@playwright/test';

export class PostPage {
  constructor(public page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/${slug}`);
  }

  async getLikeButton() {
    return this.page.getByRole('button', { name: /like/i });
  }

  async clickLike() {
    await this.getLikeButton().click();
  }

  async getCommentCount() {
    return this.page.locator('[data-testid="comment-count"]');
  }
}
```

### 사용자 흐름 테스트

```typescript
// e2e/post.spec.ts
import { test, expect } from '@playwright/test';
import { PostPage } from './pages/PostPage';

test.describe('Post Detail Flow', () => {
  test('should like a post', async ({ page, context }) => {
    // 로그인 상태 설정
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test_token_123',
        url: 'http://localhost:3000',
      },
    ]);

    const postPage = new PostPage(page);
    await postPage.goto('test-post');

    // 좋아요 버튼이 보이는지 확인
    await expect(postPage.getLikeButton()).toBeVisible();

    // 클릭 후 상태 변경 확인
    await postPage.clickLike();
    await expect(postPage.getLikeButton()).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('should show login prompt for unauthenticated user', async ({
    page,
  }) => {
    const postPage = new PostPage(page);
    await postPage.goto('test-post');

    // 로그인 상태 아님 → 댓글 작성 폼 비활성화
    const commentForm = page.locator('[data-testid="comment-form"]');
    await expect(commentForm).toBeDisabled();
  });

  test('should add comment with auth', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test_token_123',
        url: 'http://localhost:3000',
      },
    ]);

    const postPage = new PostPage(page);
    await postPage.goto('test-post');

    // 댓글 입력
    const commentInput = page.locator('[data-testid="comment-input"]');
    await commentInput.fill('Great post!');

    // 제출
    await page.locator('button:has-text("Submit")').click();

    // 댓글 확인
    await expect(
      page.locator('text=Great post!')
    ).toBeVisible();
  });
});
```

---

## Markdown 렌더링 테스트

```typescript
// components/markdown/MarkdownRenderer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('should render basic markdown', () => {
    render(
      <MarkdownRenderer 
        content="# Hello\n\nThis is **bold**" 
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello');
    expect(screen.getByText('bold')).toHaveClass('font-bold');
  });

  it('should sanitize dangerous HTML', () => {
    render(
      <MarkdownRenderer 
        content="<script>alert('xss')</script>" 
      />
    );

    // script 태그가 렌더링되지 않아야 함
    expect(document.querySelector('script')).not.toBeInTheDocument();
  });

  it('should highlight code blocks', () => {
    const code = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={code} />);

    const codeBlock = screen.getByText('const x = 1;');
    expect(codeBlock.parentElement).toHaveClass('hljs');
  });
});
```

---

## 무한스크롤 (IntersectionObserver) 테스트

```typescript
// components/post/InfinitePostList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InfinitePostList } from './InfinitePostList';

describe('InfinitePostList', () => {
  it('should load more when scrolling to bottom', async () => {
    const mockCallback = vi.fn();

    render(<InfinitePostList onLoadMore={mockCallback} />);

    // IntersectionObserver 콜백 시뮬레이션
    const observerCallback = (window.IntersectionObserver as any).mock
      .calls[0][0];

    observerCallback([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
```

---

## 테스트 실행

```bash
# 단위 테스트 실행
npm run test

# UI 함께 보기
npm run test -- --ui

# 특정 파일만
npm run test -- PostCard.test.tsx

# 커버리지 리포트
npm run test -- --coverage

# E2E 테스트
npm run test:e2e

# E2E UI 모드
npx playwright test --ui
```

---

## 테스트 커버리지 목표

| 영역 | 목표 | 우선순위 |
|---|---|---|
| UI 컴포넌트 (Button, Input) | 90%+ | 높음 |
| Custom Hooks | 80%+ | 높음 |
| API 함수 | 85%+ | 높음 |
| Zustand Store | 80%+ | 중간 |
| Server Components | 감지 테스트만 | 낮음 |
| RSC 통합 | E2E 테스트 | 높음 |

---

## 체크리스트

- [ ] Vitest + Playwright 설정이 완료되었는가?
- [ ] TanStack Query 테스트에서 MSW 사용하는가?
- [ ] 모든 Props 변경에 대한 테스트가 있는가?
- [ ] Markdown XSS 테스트가 있는가?
- [ ] E2E 테스트에서 인증 상태를 시뮬레이션하는가?
- [ ] 무한스크롤 IntersectionObserver 테스트가 있는가?
