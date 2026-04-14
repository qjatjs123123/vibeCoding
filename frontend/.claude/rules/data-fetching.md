---
description: Server Component(page.tsx/layout.tsx), useQuery hook, ISR/SSR/SSG 전략 작업 시
alwaysApply: false
---

# Data Fetching Guide — Frontend

RSC (Server Component) fetch vs 클라이언트 TanStack Query 선택 기준, ISR/SSG/SSR 전략.

---

## RSC fetch vs Client-side Query 선택

| 특성 | RSC fetch | TanStack Query |
|---|---|---|
| **데이터 로드 시점** | 서버 렌더링 시 | 클라이언트 마운트 시 |
| **캐싱** | HTTP 캐시 / ISR | staleTime 기반 |
| **인증** | 서버 쿠키/세션 | 클라이언트 credentials |
| **사용 시기** | 페이지 초기 데이터 필요 | 유저 상호작용 후 데이터 |

---

## Server Component (RSC) 패턴

```typescript
// app/[username]/[slug]/page.tsx
export const revalidate = 3600; // ISR: 1시간마다 갱신

export async function generateStaticParams() {
  const posts = await getPost();
  return posts.map((p) => ({ username: p.author.username, slug: p.slug }));
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  return <PostDetail post={post} />;
}
```

---

## Client-side TanStack Query 패턴

```typescript
// hooks/usePostList.ts
'use client';
export function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(),
    staleTime: 1000 * 60 * 5,    // 5분 fresh
    gcTime: 1000 * 60 * 30,      // 30분 캐시
  });
}

// components/post/PostList.tsx
'use client';
export function PostList() {
  const { data: posts, isLoading, error } = usePostList();
  if (error) return <ErrorFallback />;
  if (isLoading) return <Skeleton />;
  return posts?.map(p => <PostCard key={p.id} post={p} />);
}
```

---

## ISR / SSR / SSG 전략

| 전략 | 동적 매개변수 | 갱신 시점 | 예시 |
|---|---|---|---|
| **SSG** | 없음 | 빌드 시 생성 | `/about` |
| **ISR** | 있음 | 첫 요청 후 정기 갱신 | `/blog/[slug]` (매 1시간) |
| **SSR** | 있음 | 매 요청 시 | `/search?q=...` |

```typescript
// SSG: 정적, 변경 거의 없음
export const revalidate = false;

// ISR: 정기 갱신
export const revalidate = 3600;

// SSR: 매번 새로 렌더링
export const dynamic = 'force-dynamic';
```

---

## 에러 처리

### Server Component
```typescript
// app/error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Client Component (TanStack Query)
```typescript
export function PostList() {
  const { data, error } = usePostList();
  
  if (error) {
    if (error.message === 'Unauthorized') return <LoginPrompt />;
    return <div className="error-banner">{error.message}</div>;
  }
  
  return <div>{/* ... */}</div>;
}
```

---

## 인증 데이터 페칭

```typescript
// 퍼블릭 (인증 불필요)
export async function fetchPublicPosts() {
  const res = await fetch(`/api/posts`);
  return res.json();
}

// 프라이빗 (인증 필수)
export async function fetchMyPosts() {
  const res = await fetch('/api/me/posts', {
    credentials: 'include', // 인증 쿠키 포함
  });
  if (res.status === 401) window.location.href = '/login';
  return res.json();
}
```

---

## 체크리스트

### RSC fetch
- [ ] 페이지 로드 시 필요한 데이터는 RSC에서?
- [ ] 인증이 필요한 데이터는 Server Component?
- [ ] ISR 설정이 적절한가? (변경 빈도에 맞게)

### TanStack Query
- [ ] 유저 상호작용 후 필요한 데이터는 Query?
- [ ] staleTime/gcTime이 합리적인가?
- [ ] 에러 상태 처리가 있는가?

### 혼합 (RSC + Query)
- [ ] 초기 데이터는 RSC, 배경 갱신은 Query?
- [ ] setQueryData로 초기 캐시 설정?
