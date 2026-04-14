# /phase2-state — Phase 2: State Layer (TanStack Query)

`frontend/TODO.md`의 Phase 2 항목을 순서대로 실행합니다.

---

## 특기사항

### ⚠️ useSuspenseQuery 필수
- `useQuery` 사용 금지
- 항상 `<Suspense>` boundary와 함께 사용
- 로딩 상태 없음 (Suspense가 처리)

### 📦 queryKey Factory
- 라이브러리: `@lukemorales/query-key-factory`
- `src/lib/queryKeys.ts`에서 중앙 관리
- 형식: `queryKeys.posts.feed({ feed: 'recent' })`

### 🧪 테스트: Suspense + waitFor 패턴
```typescript
<Suspense fallback={null}>
  <Component />
</Suspense>
// ↓
await waitFor(() => expect(result.current.data).toBeDefined())
```

### 🚀 낙관적 업데이트
- `useMutation` 사용
- `onMutate`: 즉시 cache 수정
- `onError`: 실패 시 롤백
- `onSettled`: 재검증

---

## 실행 절차

### 1️⃣ TODO 읽기
`frontend/TODO.md`의 Phase 2에서 첫 `[ ]` 항목을 찾습니다 (STATE-0부터 STATE-16까지).

### 2️⃣ 컨텍스트 파악

| 항목 | 참고 파일 |
|---|---|
| STATE-0 | `@lukemorales/query-key-factory` 문서 |
| STATE-1, 3, 5, 7, 9, 11, 13 | `data-fetching.md` (TanStack Query 섹션) |
| STATE-2, 4, 6, 8, 10, 12, 14 | `testing.md` (TanStack Query 테스트 섹션) |
| STATE-15, 16 | Zustand 관련 문서 |

### 3️⃣ 작업 실행

#### STATE-0: queryKeys.ts (전 도메인 설정)
```typescript
import { createQueryKeyStore } from '@lukemorales/query-key-factory';

export const queryKeys = createQueryKeyStore({
  posts: {
    all: null,
    feed: (params) => [params],
    detail: (postId) => [postId],
    // ...
  },
  comments: { /* ... */ },
  users: { /* ... */ },
  // ...
});
```

#### STATE-1, 3, 5, 7, 9, 11, 13: useXxxQuery 훅 구현
```typescript
export function usePostList(params: FeedParams) {
  return useSuspenseQuery({
    queryKey: queryKeys.posts.feed(params),  // queryKey factory 사용
    queryFn: () => postRepository.getFeed(params),
    staleTime: 1000 * 60 * 5,  // 5분
    gcTime: 1000 * 60 * 30,    // 30분 캐시
  });
}
```

#### STATE-2, 4, 6, 8, 10, 12, 14: 테스트 구현
```typescript
it('should fetch data with useSuspenseQuery', async () => {
  const { result } = renderHook(() => usePostList(), {
    wrapper: ({ children }) => (
      <Suspense fallback={null}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Suspense>
    ),
  });

  // Suspense 해결 대기
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });

  expect(result.current.data.items).toHaveLength(1);
});
```

#### STATE-15, 16: Zustand Store 구현
```typescript
// authStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  login: (session) => set({ session }),
  logout: () => set({ session: null }),
  reset: () => set({ session: null }),
}));
```

### 4️⃣ 검증

**쿼리 훅 구현 (STATE-1, 3, 5, 7, 9, 11, 13):**
```bash
npx tsc --noEmit
```

**테스트 (STATE-2, 4, 6, 8, 10, 12, 14):**
```bash
npx vitest run src/features/{domain}/state/__tests__/{Hook}.test.ts
```
모든 테스트 **PASS** 확인.

**Zustand Store (STATE-15, 16):**
```bash
npx tsc --noEmit
```

### 5️⃣ 체크
TODO.md에서 항목을 `[x]`로 변경합니다.

### 6️⃣ 리포트
```
✅ [완료] STATE-0~4: queryKeys + Post 쿼리 + 테스트
  - queryKeys.ts 생성 (전 도메인 설정)
  - usePostQuery.ts 구현
  - usePostQuery.test.ts ✅ 3/3 테스트 PASS

➡️ [다음] STATE-5: useUserQuery.ts
```

---

## 도메인 순서

1. **STATE-0**: queryKeys 중앙 설정 (필수 선행)
2. **Post**: STATE-1~4 (usePostQuery, 테스트, useMutation)
3. **User**: STATE-5~8
4. **Comment**: STATE-9~12 (soft-delete 주의)
5. **Tag/Series**: STATE-13~14
6. **Stores**: STATE-15~16 (마지막)

---

## 주의사항

### ❌ 하면 안 되는 것
- `useQuery` 사용 (반드시 `useSuspenseQuery`)
- 조건부 페칭 필요 시만 `useQuery` 사용 (매우 드문 경우)
- queryKey를 문자열로 하드코딩 (항상 factory 사용)
- 테스트에서 `Suspense` 없이 테스트

### ✅ 해야 할 것
- 모든 조회는 `useSuspenseQuery`
- 모든 변경(create/update/delete)은 `useMutation`
- `onMutate`에서 낙관적 업데이트 구현
- Like 같은 토글은 `onMutate`에서 즉시 상태 반영

### 테스트 패턴 (copy-paste 가능)
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/posts', () =>
    HttpResponse.json({ posts: [...], totalCount: 1 })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('usePostList', () => {
  function makeWrapper() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>{children}</Suspense>
      </QueryClientProvider>
    );
  }

  it('should fetch posts', async () => {
    const { result } = renderHook(() => usePostList(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data.items).toHaveLength(1);
  });
});
```

---

## 낙관적 업데이트 예시

Like 토글 (immediate feedback):

```typescript
export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postRepository.toggleLike(postId),
    onMutate: (postId: string) => {
      // 캐시에서 즉시 like 상태 토글
      queryClient.setQueryData(
        queryKeys.posts.detail(postId),
        (old: Post) => ({
          ...old,
          likeCount: old.likeCount + 1,  // 또는 - 1
        })
      );
    },
    onError: (error, postId) => {
      // 실패 시 재검증하여 서버 상태로 복구
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
    },
  });
}
```

---

## 디버깅

### 테스트가 timeout되는 경우
→ `Suspense` boundary가 없거나 `waitFor` 패턴이 잘못됨.

### queryKey가 마하는 경우
→ queryKeys 정의 확인. 도메인/메서드명 맞는지 확인.

### 낙관적 업데이트가 안 보이는 경우
→ `onMutate`에서 정확한 queryKey 대상 확인. `setQueryData` 사용 여부 확인.
