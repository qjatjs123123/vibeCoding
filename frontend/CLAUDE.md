# CLAUDE.md — Frontend

Next.js 15 App Router 기반 UI 레이어.  
**4계층 아키텍처 (Feature Layer → State Layer → Repository → axios)** + inversify DI 패턴.

## 기술 스택

| 항목 | 기술 |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript 5+ |
| Styling | Tailwind CSS v4 |
| Theme | next-themes (다크모드) |
| Markdown Editor | @uiw/react-md-editor |
| Markdown Renderer | react-markdown + remark-gfm + rehype-highlight |
| State | Zustand + TanStack Query v5 |
| Validation | Zod |
| DI Container | inversify |
| HTTP Client | axios |

## 페이지/라우트 구조 (App Router)

```
app/
├── layout.tsx                        # Root layout
├── page.tsx                          # / (메인 피드)
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (feed)/
│   ├── recent/page.tsx
│   └── trending/page.tsx
├── write/                            # [Protected]
│   ├── page.tsx
│   └── [postId]/page.tsx
├── @[username]/
│   ├── page.tsx                      # /@username (프로필)
│   ├── series/
│   ├── about/
├── [username]/
│   └── [slug]/page.tsx               # /[username]/[slug] (포스트 상세)
├── tags/
│   ├── page.tsx
│   └── [tagName]/page.tsx
└── settings/                         # [Protected]
    ├── page.tsx
    └── profile/page.tsx
```

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│ Feature Layer (UI, 비즈니스 로직)                             │
│  ├─ components/  (PostCard, PostDetail...)                  │
│  └─ hooks/       (usePostList, useLike...)                  │
├────────────────────────────────────────────────────────────┤
│ State Layer (React Query, Zustand)                          │
│  └─ state/       (usePostQuery, queryKey 기반)              │
├────────────────────────────────────────────────────────────┤
│ Domain Layer (모델, 변환, 저장소)                             │
│  ├─ domain/      (Post.ts, dto.ts, PostMapper.ts)          │
│  └─ repository/  (IPostRepository, PostRepository)          │
├────────────────────────────────────────────────────────────┤
│ axios Client (HTTP 통신, 에러 처리)                          │
└─────────────────────────────────────────────────────────────┘
```

### 의존성 방향 (단방향)
```
components/hooks → state → repository → axios → API
```
반대 방향 import 금지 (ESLint `import/no-restricted-paths`로 강제)

## 핵심 기능

### 마크다운 에디터
- `@uiw/react-md-editor` (dynamic import)
- 분할 뷰 (편집/미리보기)
- 이미지 드래그앤드롭 → `/api/upload` → Cloudinary
- 자동 임시저장 (localStorage + Server Action)
- 슬러그 자동 생성

### 포스트 카드
- 커버 이미지, 제목, 요약, 작성자, 발행일
- 읽는시간, 조회 수, 좋아요 수, 댓글 수
- 태그 배지

### 태그 시스템
- `TagInput.tsx` — 에디터 내 태그 추가
- `/tags` — 전체 태그 목록 (인기순)
- `/tags/[tagName]` — 태그별 포스트 피드

### 시리즈 시스템
- `SeriesSelector.tsx` — 에디터 내 시리즈 선택/생성
- `/@username/series` — 유저 시리즈 목록
- `/@username/series/[slug]` — 시리즈 상세 + 포스트 목록
- 포스트 상세에 같은 시리즈 포스트 사이드바

### 댓글
- 비로그인: 목록 읽기만, 작성 불가 (로그인 유도)
- 작성자만: 수정/삭제 버튼
- 대댓글 1단계 (인라인 입력폼)

### 좋아요
- 클릭 → 즉시 UI 업데이트 (optimistic)
- 하트 애니메이션

### 피드
- 최신 피드: `publishedAt DESC`
- 트렌딩 피드: 기간 필터 + 점수 정렬
- 무한 스크롤: IntersectionObserver + TanStack Query

## 비기능 요구사항

### SEO
- `generateMetadata` 동적 메타데이터
- ISR: `revalidate: 3600`
- `app/sitemap.ts`, `app/robots.ts`
- Schema.org JSON-LD (BlogPosting)

### 반응형 디자인 (Mobile-first)
- Tailwind: `sm(640px)`, `md(768px)`, `lg(1024px)`, `xl(1280px)`
- 에디터: 모바일 탭, 데스크탑 분할 뷰
- 버튼 최소 크기: 44×44px

### 다크 모드
- `next-themes` (SSR hydration 안전)
- `prefers-color-scheme` 자동 감지
- 토글 → `localStorage` 저장
- Tailwind `dark:` 클래스

### 성능
- `next/image`: WebP, lazy loading, 반응형 srcset
- Markdown 에디터: dynamic import (SSR 제외)
- TanStack Query 캐싱
- 번들 분석: `@next/bundle-analyzer`

## 디렉토리 구조

```
frontend/src/
├── app/                        # Next.js App Router (라우팅)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (feed)/
│   │   ├── recent/page.tsx
│   │   └── trending/page.tsx
│   ├── write/
│   │   ├── page.tsx
│   │   └── [postId]/page.tsx
│   ├── @[username]/
│   │   ├── page.tsx
│   │   ├── series/
│   │   └── about/
│   ├── [username]/
│   │   └── [slug]/page.tsx
│   ├── tags/
│   │   ├── page.tsx
│   │   └── [tagName]/page.tsx
│   ├── settings/
│   │   ├── page.tsx
│   │   └── profile/page.tsx
│   ├── sitemap.ts
│   └── robots.ts
│
├── assets/                     # 이미지, 폰트, 아이콘
│
├── components/                 # 전역 공용 UI (도메인 무관)
│   ├── ui/                     # Button, Input, Modal, Card
│   ├── layout/                 # Header, Footer, Sidebar
│   └── provider/               # SessionProvider, ThemeProvider, ReactQueryProvider
│
├── di/                         # inversify DI Container
│   ├── container.ts            # Repository 바인딩
│   └── types.ts                # Symbol 식별자
│
├── features/                   # 도메인별 모듈 (4계층 아키텍처)
│   ├── post/                   # depth 2
│   │   ├── domain/             # depth 3 — Layer 1: 모델 + 검증 + 매핑
│   │   │   ├── Post.ts         # Zod schema + domain type
│   │   │   ├── dto.ts          # API response DTO schema
│   │   │   └── PostMapper.ts   # DTO → Post 변환
│   │   ├── repository/         # depth 3 — Layer 2: 데이터 접근 (axios + safeParse)
│   │   │   ├── IPostRepository.ts
│   │   │   ├── PostRepository.ts
│   │   │   └── MockPostRepository.ts
│   │   ├── state/              # depth 3 — Layer 3: React Query 캐싱
│   │   │   └── usePostQuery.ts
│   │   ├── components/         # depth 3 — Layer 4: UI
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   └── PostList.tsx
│   │   ├── hooks/              # depth 3 — Layer 4: 비즈니스 로직
│   │   │   ├── usePostList.ts
│   │   │   ├── usePostEditor.ts
│   │   │   └── useLike.ts
│   │   ├── store/              # depth 3 — Zustand (로컬 draft 등)
│   │   │   └── postStore.ts
│   │   ├── utils/              # depth 3 — 포스트 전용 유틸
│   │   │   └── readingTime.ts
│   │   ├── constants/          # depth 3 — 포스트 상수
│   │   │   └── index.ts
│   │   └── validation/         # depth 3 — 폼 Zod 스키마
│   │       └── postSchema.ts
│   │
│   ├── comment/                # 동일한 4계층 구조
│   │   ├── domain/
│   │   │   ├── Comment.ts
│   │   │   ├── dto.ts
│   │   │   └── CommentMapper.ts
│   │   ├── repository/
│   │   │   ├── ICommentRepository.ts
│   │   │   └── CommentRepository.ts
│   │   ├── state/
│   │   │   └── useCommentsQuery.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   │
│   ├── user/
│   ├── tag/
│   └── series/
│
├── hooks/                      # 전역 공용 커스텀 훅
│   ├── useInfiniteScroll.ts
│   └── useTheme.ts
│
├── stores/                     # 전역 Zustand (UI 상태)
│   └── uiStore.ts              # 모달, 사이드바, 토글 등
│
├── lib/                        # 공용 라이브러리
│   ├── axios.ts                # axios 인스턴스 + interceptors
│   ├── errors.ts               # DataLayerError, DomainLayerError
│   ├── utils.ts                # formatDate, formatCount 등
│   └── markdown.ts
│
├── styles/                     # 전역 스타일
│   └── globals.css
│
├── types/                      # 전역 TypeScript 타입
│   └── index.ts
│
└── public/                     # Next.js 정적 파일
```

## 계층별 역할

| 계층 | 파일 | 책임 | 에러 발생 시 |
|---|---|---|---|
| **Domain** | `domain/` | Zod schema, mapper | `DomainLayerError` → BE 스키마 변경 의심 |
| **Repository** | `repository/` | axios 호출 + safeParse + map | `DataLayerError` → 네트워크/서버 문제 |
| **State** | `state/` | React Query 캐싱 | 라이브러리 이슈 |
| **Feature** | `components/, hooks/` | UI, 비즈니스 로직 | 프론트엔드 코드 버그 |

## 주요 설계 원칙

- **폴더 depth 최대 4** (src 기준): `features/post/repository/PostRepository.ts` = depth 3 ✅
- **배럴 export 없음**: 직접 경로로 import
- **domain/ flat**: 모델과 mapper 같은 레벨
- **repository/ flat**: domain/ 외부
- **inversify 바인딩**: `di/container.ts`에서 중앙 관리
- **axios → fetch 전환**: `container.ts` 한 줄만 수정

## 개발 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 실행
npm run lint         # 린트
npm run type-check   # TypeScript 체크
```
