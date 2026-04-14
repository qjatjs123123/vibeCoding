# Component Preview 페이지 셋업 (Phase 3 준비용)

Playwright MCP로 개별 컴포넌트를 검증하려면, `/dev/components/[name]` 라우트가 필요합니다.

---

## 파일 구조

```
app/dev/
├── layout.tsx                    # 개발용 레이아웃
├── components/
│   ├── page.tsx                  # 컴포넌트 목록 페이지
│   └── [name]/
│       └── page.tsx              # 개별 컴포넌트 preview
└── .gitignore                    # /dev 라우트 제외 (프로덕션)
```

---

## 1. app/dev/layout.tsx

```typescript
// app/dev/layout.tsx
export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>Components Preview - Dev Only</title>
      </head>
      <body className="p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🧪 Component Preview</h1>
          <nav className="mb-8 p-4 bg-white rounded border">
            <a href="/dev/components" className="text-blue-600 hover:underline">
              ← Back to List
            </a>
          </nav>
          <div className="bg-white p-6 rounded border">{children}</div>
        </div>
      </body>
    </html>
  );
}
```

---

## 2. app/dev/components/page.tsx

```typescript
// app/dev/components/page.tsx
const COMPONENTS = [
  { name: 'PostCard', path: '/dev/components/PostCard' },
  { name: 'PostList', path: '/dev/components/PostList' },
  { name: 'CommentList', path: '/dev/components/CommentList' },
  { name: 'Button', path: '/dev/components/Button' },
  // ... 더 추가 (Phase 3 작성하면서 업데이트)
];

export default function ComponentsListPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Available Components</h2>
      <ul className="space-y-2">
        {COMPONENTS.map(c => (
          <li key={c.name}>
            <a
              href={c.path}
              className="text-blue-600 hover:underline"
            >
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 3. app/dev/components/[name]/page.tsx

```typescript
// app/dev/components/[name]/page.tsx
'use client';

import React from 'react';

// Mock 데이터
const mockData = {
  post: {
    id: '1',
    title: 'Test Post Title',
    slug: 'test-post',
    excerpt: 'This is a test excerpt',
    coverImage: 'https://via.placeholder.com/600x300',
    publishedAt: new Date('2024-01-01'),
    readingTime: 5,
    viewCount: 42,
    author: {
      username: 'testuser',
      avatarUrl: 'https://via.placeholder.com/40x40',
    },
    tags: [{ name: 'react' }, { name: 'typescript' }],
    likeCount: 10,
    commentCount: 3,
  },
  comment: {
    id: '1',
    content: 'Great post!',
    author: {
      username: 'commenter',
      avatarUrl: 'https://via.placeholder.com/40x40',
    },
    createdAt: new Date('2024-01-02'),
    likeCount: 2,
    replies: [],
  },
  user: {
    username: 'testuser',
    name: 'Test User',
    bio: 'A test user for component preview',
    avatarUrl: 'https://via.placeholder.com/60x60',
    website: 'https://example.com',
    githubUrl: 'https://github.com',
    createdAt: new Date('2023-01-01'),
  },
};

// 컴포넌트 맵 (Phase 3에서 추가)
const componentMap: Record<string, () => React.ReactNode> = {
  // PostCard 예시
  PostCard: () => {
    const { PostCard } = require('@/components/post/PostCard');
    return <PostCard post={mockData.post} />;
  },
  // CommentList 예시
  CommentList: () => {
    const { CommentList } = require('@/components/comment/CommentList');
    return <CommentList comments={[mockData.comment]} />;
  },
  // Button 예시
  Button: () => {
    const { Button } = require('@/components/common/Button');
    return (
      <div className="space-y-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>
    );
  },
  // ... 추가 컴포넌트
};

export default function ComponentPreviewPage({
  params,
}: {
  params: { name: string };
}) {
  const Component = componentMap[params.name];

  if (!Component) {
    return (
      <div className="text-red-600">
        <h2 className="text-xl font-bold">Component not found: {params.name}</h2>
        <p className="mt-2">
          Available components:{' '}
          {Object.keys(componentMap).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{params.name}</h2>
      <div className="border-2 border-dashed border-gray-300 p-6 rounded">
        <Component />
      </div>
    </div>
  );
}
```

---

## 4. next.config.js — 프로덕션 제외

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    return config;
  },
  // 프로덕션 빌드에서 /dev 라우트 제외 (선택사항)
  // staticPageGenerationTimeout: 60,
};

module.exports = nextConfig;
```

혹은 `.gitignore`에 포함:
```
# .gitignore
# Dev routes (포함 금지)
# app/dev/는 프로덕션 배포 시 제거 (CI/CD 설정)
```

---

## 5. 사용 방법

### Phase 3에서 COMP-2 (PostCard 컴포넌트) 작성 후:

1. `app/dev/components/[name]/page.tsx`의 `componentMap`에 추가:
```typescript
PostCard: () => {
  const { PostCard } = require('@/components/post/PostCard');
  return <PostCard post={mockData.post} />;
}
```

2. `/dev/components/page.tsx`의 `COMPONENTS` 배열에 추가:
```typescript
{ name: 'PostCard', path: '/dev/components/PostCard' }
```

3. Playwright MCP로 검증:
```bash
/verify --component PostCard
# → http://localhost:3000/dev/components/PostCard로 이동
# → 콘솔 에러 확인
```

---

## 주의사항

- **Mock 데이터**: 각 컴포넌트가 필요한 props를 정확히 전달
- **'use client'**: 클라이언트 컴포넌트만 preview 가능 (RSC 제외)
- **프로덕션 제외**: `/dev` 라우트는 production 빌드에 포함되지 않도록 주의
- **에러 메시지**: 컴포넌트 로드 실패 시 명확한 메시지 표시

---

## Phase 3 진행하면서

각 COMP 항목마다:
1. 컴포넌트 구현 (src/components/{domain}/{Component}.tsx)
2. componentMap에 등록
3. `/dev/components`의 COMPONENTS 목록에 추가
4. `/verify --component {Name}` 실행 → 자동 수정 루프

이렇게 하면 모든 컴포넌트가 실시간으로 검증됩니다.
