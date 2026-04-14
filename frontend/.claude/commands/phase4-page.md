# /phase4-page — Phase 4: Pages (App Router)

`frontend/TODO.md`의 Phase 4 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`frontend/TODO.md`의 Phase 4에서 첫 `[ ]` 항목을 찾습니다 (PAGE-1~PAGE-11).

### 2️⃣ 컨텍스트 파악
**참고**: 
- `frontend/CLAUDE.md` (페이지 구조)
- `frontend/.claude/rules/data-fetching.md` (ISR/SSR/SSG 전략)

핵심:
- **RSC (Server Component)**: DB 데이터, 초기 load, ISR 캐시
- **Client Component** ('use client'): 상호작용, useState, useEffect
- **ISR**: `export const revalidate = 3600` (1시간)
- **SSR**: `export const dynamic = 'force-dynamic'`

### 3️⃣ 작업 실행

```typescript
// app/[username]/[slug]/page.tsx (포스트 상세 - ISR)
export const revalidate = 3600;

export async function generateStaticParams() {
  // 인기 포스트 미리 정적 생성
  const posts = await postRepository.getPopular();
  return posts.map(p => ({
    username: p.author.username,
    slug: p.slug,
  }));
}

export default async function PostPage({ params }) {
  const post = await postRepository.getBySlug(params.username, params.slug);
  if (!post) notFound();
  
  return (
    <PostDetail post={post}>
      <ClientCommentSection postId={post.id} />
    </PostDetail>
  );
}
```

### 4️⃣ 검증

**TypeScript:**
```bash
npx tsc --noEmit
```

**Playwright MCP 실시간 검증:**

> ⚠️ 선행조건: `pnpm dev` 실행 중

1. 해당 페이지 URL로 navigate (예: `http://localhost:3000/recent`)
2. screenshot 캡처 → 렌더링 확인
3. 콘솔 에러/경고 수집
4. 에러 발견 시:
   - 에러 분석 → 코드 수정 → 파일 저장
   - 다시 navigate → screenshot → 에러 확인
   - 최대 3회 반복. 3회 초과 시 사용자에게 보고하고 중단.
5. 에러 없으면 통과

**빌드 검증:**
```bash
pnpm build
```
경고 없이 빌드 완료.

### 5️⃣ 체크
TODO.md에서 항목을 `[x]`로 변경합니다.

### 6️⃣ 리포트
```
✅ [완료] PAGE-1: app/layout.tsx
  - QueryClientProvider, ThemeProvider, NextAuthProvider 설정

➡️ [다음] PAGE-2: app/page.tsx 메인 피드 (ISR)
```

---

## 페이지 특기사항

### PAGE-1: app/layout.tsx (루트 레이아웃)
```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// src/app/providers.tsx
'use client';
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

### PAGE-2~3: 피드 페이지 (ISR)
- `export const revalidate = 3600`
- `/` (메인), `/recent`, `/trending`
- `<Suspense>` + 피드 컴포넌트

### PAGE-4: 로그인/회원가입
- 일반 페이지 (비보호)
- NextAuth 세션 리다이렉트

### PAGE-5~6: /write (포스트 작성 - Protected)
- `middleware.ts`에서 인증 체크
- `/write` (신규)
- `/write/[postId]` (수정)
- 에디터 + 임시저장

### PAGE-7: /@[username] (프로필 페이지)
- Parallel Routes (`@`), ISR 포함 가능
- 유저 정보 + 시리즈 + 최근 포스트

### PAGE-8: /[username]/[slug] (포스트 상세 - ISR)
- **중요**: 매우 인기있는 라우트 → ISR 필수
- `generateStaticParams`로 미리 캐시
- 댓글은 Client Component

### PAGE-9: /tags (태그 페이지)
- `/tags` (전체 태그 리스트)
- `/tags/[tagName]` (태그 필터링)

### PAGE-10: /settings (프로필 설정 - Protected)
- 미들웨어로 인증 보호
- `/settings/profile` (프로필 수정)

### PAGE-11: SEO + 메타데이터
- `sitemap.ts` (동적 사이트맵)
- `robots.ts` (robots.txt)
- `generateMetadata` (각 페이지에서)
- JSON-LD (구조화된 데이터)

---

## 중요: 인증 보호

### middleware.ts (루트)
```typescript
export function middleware(request: NextRequest) {
  const session = getSession(request);
  
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/write') ||
        request.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}

export const config = {
  matcher: ['/write/:path*', '/settings/:path*'],
};
```

---

## ISR vs SSR 판단

| 페이지 | 전략 | 이유 |
|---|---|---|
| `/` | ISR (1시간) | 피드는 자주 업데이트되지만 항상 최신 필요 x |
| `/[username]/[slug]` | ISR (24시간) | 포스트 상세는 변경 드물고 캐시 효과 높음 |
| `/write` | SSR | 사용자별 다른 데이터 (임시저장 등) |
| `/settings` | SSR | 사용자별 프로필 데이터 |
| `/search` | SSR | 동적 쿼리에 따라 매번 다름 |

---

## 주의사항

- **ISR 설정**: `revalidate` 값 합리적인가? (너무 짧거나 길지 않은가)
- **generateStaticParams**: 모든 경로를 미리 생성 가능한가? (가능하면 구현)
- **에러 처리**: `error.tsx` + `not-found()` 사용
- **로딩 상태**: `loading.tsx` 또는 `<Suspense>` fallback
- **빌드 검증**: `pnpm build` 성공 필수
