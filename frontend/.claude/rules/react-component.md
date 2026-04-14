---
description: React 컴포넌트(.tsx) 생성 또는 수정 작업 시
alwaysApply: false
---

# React Component Coding Style

팀 온보딩용 React 컴포넌트 컨벤션. TypeScript + Tailwind + Next.js App Router.

---

## 네이밍

- 컴포넌트: `PascalCase` (PostCard.tsx)
- 함수/변수: `camelCase`
- Props 인터페이스: `${Component}Props`

```tsx
// ✅ Good
interface PostCardProps { post: Post; onLike?: () => void; }
export function PostCard({ post, onLike }: PostCardProps) {}

// ❌ Bad
interface Props {}
export function PostCard(props: any) {}
```

---

## 구조

- **1파일 1컴포넌트**: PostCard.tsx는 PostCard 컴포넌트만
- **도메인 index**: `components/post/index.ts`에서 배럴 export
- **임포트 순서**: 임포트 → 타입 → 상수 → 컴포넌트

```tsx
// ✅ Good structure
'use client'; // 필요할 때만
import { useState } from 'react';
interface PostCardProps { post: Post; }
const DEFAULT = '...';
export function PostCard({ post }: PostCardProps) {}
```

---

## Server vs Client Component

- **Server Component** (app/page.tsx): DB 접근, 민감 정보 처리
- **Client Component** ('use client'): 상호작용, useState, useEffect

```tsx
// ✅ Server
export default async function Page() {
  const data = await getPosts();
  return <PostList initialData={data} />;
}

// ✅ Client
'use client';
export function PostList({ initialData }) {
  const [items, setItems] = useState(initialData);
  return <div>{/* ... */}</div>;
}
```

---

## 버그 방지

- **Optional chaining**: `obj?.prop?.nested`
- **Props는 읽기 전용**: 직접 수정 금지, useState 사용
- **Guard pattern**: TypeScript strict + Zod 검증
- **console.log 제거**: 배포 전 모두 삭제

```tsx
// ✅ Good
const avatar = user?.profile?.avatar;
const [title, setTitle] = useState(post.title);
if (!userId) return <div>Required</div>;

// ❌ Bad
post.title = 'New'; // Props 수정
if (user && user.profile && user.profile.avatar) {}
```

---

## 아키텍처

- **Container/Presentation 분리**: 로직 ↔ UI
- **중복 제거**: Utility 파일 `lib/utils.ts`로 추출
- **컴포넌트 내 함수 선언 금지**: useCallback 또는 외부로

```tsx
// ✅ Container (로직)
export function usePostList() {
  return useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
}

// ✅ Presentation (UI)
'use client';
export function PostList() {
  const { data: posts } = usePostList();
  return posts?.map(p => <PostCard key={p.id} post={p} />);
}
```

---

## ES6+

- **const/let만**: var 금지
- **화살표 함수**: `const fn = () => {}`
- **Spread & 구조분해**: `{ ...obj, prop: value }`, `const { a, b } = obj`
- **Template literal**: `` `Hello, ${name}` ``

---

## TypeScript

- **Props 타입 필수**: `interface PostCardProps { ... }`
- **Union 타입**: `as const` 사용

```tsx
const THEMES = ['light', 'dark'] as const;
type Theme = typeof THEMES[number];
```

---

## CSS

- **inline style 금지**: Tailwind만 사용
- **dark mode**: `dark:` 클래스
- **순서**: 레이아웃 → 박스 → 색상 → 효과

```tsx
// ✅ Good
<div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow">

// ❌ Bad
<div style={{ fontSize: '1rem', color: '#000' }}>
```

---

## 주석

- **WHY만 작성** (WHAT은 코드가 말함)
- **주석처리 코드 삭제**: Git history 있음
- **TODO/FIXME 활용**

```tsx
// ✅ Good
// 관리자 또는 본인만 삭제 가능
const canDelete = isAdmin || userId === post.authorId;

// ❌ Bad
// userName 변수 선언
const userName = 'John';
// const oldCode = {...};
```

---

## 테스트

- **파일명**: `Component.test.tsx` (대상과 동일)
- **1파일 1테마**: 너무 크면 분리
- **Mock 사용**: 네트워크/DB는 가짜 함수

---

## 체크리스트

- [ ] PascalCase/camelCase 구분?
- [ ] Props 인터페이스 정의?
- [ ] 1파일 1컴포넌트?
- [ ] Optional chaining 사용?
- [ ] Props 읽기 전용?
- [ ] Spread/구조분해 활용?
- [ ] console.log 제거?
- [ ] Tailwind만 사용?
- [ ] dark: 모드 적용?
- [ ] 주석처리 코드 삭제?
