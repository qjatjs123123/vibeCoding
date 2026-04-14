# vibeCoding Specification

## 1. 프로젝트 개요 (Project Overview)

**프로젝트명**: vibeCoding

**목표**: Velog(velog.io)에서 영감을 받은 한국 개발자 특화 블로그 플랫폼. 깔끔한 Markdown 기반 글쓰기 환경과 태그/시리즈 기반 콘텐츠 탐색을 제공합니다.

**핵심 가치**:
- 개발자 경험(DX) 중심의 UI/UX
- 최소한의 인터페이스로 최대 생산성
- SEO 친화적 정적 콘텐츠 구조

**MVP 범위**:
- OAuth 로그인 (GitHub, Google)
- 포스트 CRUD (Markdown 에디터 기반)
- 태그 시스템
- 시리즈 시스템
- 댓글 (대댓글 1단계)
- 좋아요 (토글)
- 유저 프로필
- 피드 (최신, 트렌딩)

---

## 2. 기술 스택 (Tech Stack)

| 카테고리 | 선택 기술 | 선택 이유 |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC, Server Actions, 최신 최적화 기능 |
| Language | TypeScript 5+ | 타입 안전성, 개발자 생산성 |
| Database | PostgreSQL 16 | 관계형 데이터 적합, Full-text search 지원 |
| ORM | Prisma 6+ | 타입 안전 쿼리, 마이그레이션 자동화 |
| Auth | NextAuth.js v5 (Auth.js) | OAuth 추상화, Next.js 15 호환성, 세션 관리 |
| Markdown Editor | @uiw/react-md-editor | 프리뷰 포함, 이미지 드래그앤드롭 |
| Markdown Renderer | react-markdown + remark-gfm + rehype-highlight | GFM 지원, 코드 하이라이팅 |
| Styling | Tailwind CSS v4 | utility-first, dark mode 자동 지원 |
| Theme | next-themes | SSR hydration 이슈 해결 |
| Image Upload | Cloudinary 또는 AWS S3 | 이미지 최적화, CDN 제공 |
| Validation | Zod | 런타임 검증, API 안전성 |
| State | Zustand + TanStack Query v5 | 경량, 조합가능한 상태 관리 |

### 환경 변수 (.env.local)
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vibecoding

# NextAuth.js
NEXTAUTH_SECRET=<생성된 secret>
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=<GitHub App ID>
GITHUB_CLIENT_SECRET=<GitHub App Secret>

# Google OAuth
GOOGLE_CLIENT_ID=<Google Client ID>
GOOGLE_CLIENT_SECRET=<Google Client Secret>

# Cloudinary (이미지 업로드)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<Cloud Name>
CLOUDINARY_API_KEY=<API Key>
CLOUDINARY_API_SECRET=<API Secret>
```

---

## 3. 데이터 모델 (Data Models - Prisma Schema)

### 3.1 User (사용자)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  username      String    @unique  // URL 슬러그: /@username
  bio           String?
  avatarUrl     String?   // Cloudinary URL
  website       String?
  githubUrl     String?
  
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  followers     Follow[]  @relation("following")
  following     Follow[]  @relation("follower")
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 3.2 Account (NextAuth.js OAuth 계정)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // "oauth"
  provider          String  // "github" | "google"
  providerAccountId String  // OAuth 제공자의 고유 ID
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}
```

### 3.3 Session (NextAuth.js 세션)
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

### 3.4 Post (포스트)
```prisma
model Post {
  id            String    @id @default(cuid())
  title         String    @db.VarChar(255)
  slug          String    @unique  // "post-title-cm3abc" 형식
  content       String    // Raw Markdown
  excerpt       String?   // 검색/카드 미리보기용
  coverImage    String?   // Cloudinary URL
  published     Boolean   @default(false)
  publishedAt   DateTime?
  
  readingTime   Int?      // 분 단위
  viewCount     Int       @default(0)
  
  authorId      String
  author        User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  seriesId      String?
  series        Series?   @relation(fields: [seriesId], references: [id], onDelete: SetNull)
  seriesOrder   Int?      // 시리즈 내 순서
  
  tags          PostTag[]
  comments      Comment[]
  likes         Like[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([authorId])
  @@index([publishedAt])
  @@index([slug])
  @@index([seriesId])
}
```

### 3.5 Tag (태그)
```prisma
model Tag {
  id       String    @id @default(cuid())
  name     String    @unique  // 소문자 정규화
  
  posts    PostTag[]
  
  createdAt DateTime @default(now())
}

model PostTag {
  postId   String
  tagId    String
  
  post     Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag      Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([postId, tagId])
  @@index([tagId])
}
```

### 3.6 Series (시리즈)
```prisma
model Series {
  id          String   @id @default(cuid())
  name        String   @db.VarChar(255)
  description String?
  coverImage  String?  // Cloudinary URL
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  posts       Post[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([authorId, name])
  @@index([authorId])
}
```

### 3.7 Comment (댓글)
```prisma
model Comment {
  id        String    @id @default(cuid())
  content   String
  
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  postId    String
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  parentId  String?   // 대댓글: 상위 댓글 ID
  parent    Comment?  @relation("replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("replies")
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([postId])
  @@index([parentId])
}
```

### 3.8 Like (좋아요)
```prisma
model Like {
  userId    String
  postId    String
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  createdAt DateTime  @default(now())
  
  @@id([userId, postId])
  @@index([postId])
}
```

### 3.9 Follow (팔로우 - 선택적, MVP 이후)
```prisma
model Follow {
  followerId  String
  followingId String
  
  follower    User      @relation("follower", fields: [followerId], references: [id])
  following   User      @relation("following", fields: [followingId], references: [id])
  
  createdAt   DateTime  @default(now())
  
  @@id([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

---

## 4. 페이지/라우트 구조 (Next.js 15 App Router)

```
app/
├── layout.tsx                    # Root layout (폰트, Providers)
├── page.tsx                      # / (메인 피드)
├── not-found.tsx
├── error.tsx
│
├── (auth)/                       # Route Group - 인증 UI
│   ├── login/
│   │   └── page.tsx              # /login
│   └── register/
│       └── page.tsx              # /register
│
├── (feed)/                       # Route Group - 피드 레이아웃
│   ├── recent/
│   │   └── page.tsx              # /recent
│   └── trending/
│       └── page.tsx              # /trending
│
├── write/
│   ├── page.tsx                  # /write (신규 작성) [Protected]
│   └── [postId]/
│       └── page.tsx              # /write/[postId] (수정) [Protected]
│
├── @[username]/                  # Dynamic Route - 유저 프로필
│   ├── layout.tsx
│   ├── page.tsx                  # /@username
│   ├── series/
│   │   ├── page.tsx              # /@username/series
│   │   └── [seriesSlug]/
│   │       └── page.tsx          # /@username/series/[seriesSlug]
│   └── about/
│       └── page.tsx              # /@username/about
│
├── [username]/                   # Dynamic Route - 포스트 상세
│   └── [slug]/
│       └── page.tsx              # /[username]/[slug]
│
├── tags/
│   ├── page.tsx                  # /tags
│   └── [tagName]/
│       └── page.tsx              # /tags/[tagName]
│
├── settings/                     # [Protected]
│   ├── layout.tsx
│   ├── page.tsx                  # /settings
│   └── profile/
│       └── page.tsx              # /settings/profile
│
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts          # NextAuth.js 엔드포인트
    ├── posts/
    │   ├── route.ts              # GET (피드), POST (생성)
    │   └── [postId]/
    │       ├── route.ts          # GET, PATCH, DELETE
    │       ├── like/
    │       │   └── route.ts      # POST (좋아요 토글)
    │       └── comments/
    │           ├── route.ts      # GET, POST
    │           └── [commentId]/
    │               └── route.ts  # PATCH, DELETE
    ├── users/
    │   └── [username]/
    │       ├── route.ts          # GET
    │       └── series/
    │           └── route.ts      # GET
    ├── series/
    │   ├── route.ts              # POST (생성)
    │   └── [seriesId]/
    │       └── route.ts          # PATCH, DELETE
    ├── tags/
    │   └── route.ts              # GET
    ├── upload/
    │   └── route.ts              # POST (이미지 업로드)
    ├── search/
    │   └── route.ts              # GET
    └── health/
        └── route.ts              # GET (헬스 체크)
```

### 라우트 보호 (Protected Routes)
- **보호 대상**: `/write/**`, `/settings/**`
- **방법**: `middleware.ts`에서 NextAuth.js `auth()` 사용
- **실패 시**: `/login`으로 리다이렉트

---

## 5. API 엔드포인트 (API Endpoints)

### 5.1 인증 (Authentication)
| Method | Endpoint | 설명 | Auth 필요 |
|---|---|---|---|
| GET | `/api/auth/session` | 현재 세션 조회 | No |
| POST | `/api/auth/signin` | OAuth 로그인 | No |
| POST | `/api/auth/signout` | 로그아웃 | Yes |

### 5.2 포스트 (Posts)
| Method | Endpoint | 설명 | Auth 필요 |
|---|---|---|---|
| GET | `/api/posts?feed=recent&page=1&limit=12` | 최신 포스트 피드 | No |
| GET | `/api/posts?feed=trending&period=week` | 트렌딩 포스트 | No |
| POST | `/api/posts` | 포스트 생성 | Yes |
| GET | `/api/posts/[postId]` | 포스트 상세 (viewCount++) | No |
| PATCH | `/api/posts/[postId]` | 포스트 수정 | Yes (본인만) |
| DELETE | `/api/posts/[postId]` | 포스트 삭제 | Yes (본인만) |
| POST | `/api/posts/[postId]/like` | 좋아요 토글 | Yes |

**POST `/api/posts` Request Body:**
```json
{
  "title": "string (필수)",
  "content": "string (필수, Markdown)",
  "excerpt": "string (선택)",
  "coverImage": "string (URL, 선택)",
  "published": "boolean (필수)",
  "tags": ["tag1", "tag2"],
  "seriesId": "string (선택)",
  "seriesOrder": "number (선택)"
}
```

**GET `/api/posts` Response:**
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "coverImage": "string",
      "publishedAt": "ISO8601",
      "readingTime": "number",
      "viewCount": "number",
      "author": { "username": "string", "avatarUrl": "string" },
      "tags": [{ "name": "string" }],
      "likeCount": "number",
      "commentCount": "number"
    }
  ],
  "totalCount": "number",
  "nextCursor": "string (선택)"
}
```

### 5.3 댓글 (Comments)
| Method | Endpoint | 설명 | Auth 필요 |
|---|---|---|---|
| GET | `/api/posts/[postId]/comments` | 댓글 목록 (대댓글 포함) | No |
| POST | `/api/posts/[postId]/comments` | 댓글 작성 | Yes |
| PATCH | `/api/posts/[postId]/comments/[commentId]` | 댓글 수정 | Yes (본인만) |
| DELETE | `/api/posts/[postId]/comments/[commentId]` | 댓글 삭제 | Yes (본인만) |

**POST `/api/posts/[postId]/comments` Request Body:**
```json
{
  "content": "string (필수)",
  "parentId": "string (선택, 대댓글인 경우)"
}
```

### 5.4 시리즈 (Series)
| Method | Endpoint | 설명 | Auth 필요 |
|---|---|---|---|
| GET | `/api/users/[username]/series` | 유저 시리즈 목록 | No |
| POST | `/api/series` | 시리즈 생성 | Yes |
| PATCH | `/api/series/[seriesId]` | 시리즈 수정 | Yes (본인만) |
| DELETE | `/api/series/[seriesId]` | 시리즈 삭제 | Yes (본인만) |

### 5.5 태그 (Tags)
| Method | Endpoint | 설명 | Auth 필요 |
|---|---|---|---|
| GET | `/api/tags?sort=popular&limit=50` | 태그 목록 + 포스트 수 | No |
| GET | `/api/posts?tag=[tagName]` | 태그별 포스트 (피드 API 사용) | No |

### 5.6 유저 (Users)
| Method | Endpoint | 설명 | Auth 필요 |
|---|---|---|---|
| GET | `/api/users/[username]` | 프로필 조회 | No |
| PATCH | `/api/users/me` | 내 프로필 수정 | Yes |

### 5.7 기타
| Method | Endpoint | 설명 | Auth 필요 |
|---|---|---|---|
| POST | `/api/upload` | 이미지 업로드 (Cloudinary) | Yes |
| GET | `/api/search?q=keyword` | 포스트/태그 검색 | No |

---

## 6. 핵심 기능 상세 요구사항 (Feature Requirements)

### 6.1 인증 (Authentication)

**GitHub + Google OAuth via NextAuth.js**
- NextAuth.js v5의 GitHub, Google Provider 설정
- 최초 로그인 시 User 없으면 → `/register` (username 설정) 페이지로 리다이렉트
- 이후 로그인 시 → `/` (메인 피드) 리다이렉트

**Username 검증**
- 영문, 숫자, 하이픈만 허용
- 길이: 3-20자
- 고유값 (DB unique constraint)
- URL slug로 사용: `/@username`

**세션 전략**
- DB 기반 세션 (JWT 아님)
- `NextAuth.js`의 `Session` 모델로 저장
- 서버 컴포넌트에서 `getServerSession` 사용
- 세션 무효화: DB 삭제 시 즉각 반영

**Middleware 보호**
```typescript
// middleware.ts
export const config = {
  matcher: ['/write/:path*', '/settings/:path*']
};

export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL('/login', req.url));
  }
});
```

### 6.2 마크다운 에디터 (Markdown Editor)

**라이브러리**: `@uiw/react-md-editor`
- 이유: React 친화적, 분할 뷰(편집+미리보기), 드래그앤드롭 이미지 가능

**기능**
- 분할 뷰: 왼쪽 편집, 오른쪽 미리보기
- 상단 도구모음: Bold, Italic, Heading, Link, Image, Code, Quote, List 등
- 키보드 단축키 지원 (Ctrl+B 등)

**이미지 업로드**
- 드래그앤드롭 또는 클립보드 붙여넣기 → `/api/upload`로 POST
- Cloudinary API로 업로드 → 반환 URL을 Markdown에 자동 삽입
- 예: `![alt](https://res.cloudinary.com/...)`

**자동 임시저장**
- 2초마다 `localStorage`에 저장
- 5초마다 `published: false` 상태로 DB 저장 (Server Action)
- 페이지 이탈 시 경고 표시 (unsaved changes)
- 에디터 새로고침 시 DB의 최신 버전 로드

**슬러그 자동 생성**
```
title 입력 → slugify(title) + cuid()
예: "리액트 훅 완전정복" → "react-hook-complete-guide-cm3abc"
```

**코드 하이라이팅**
- 렌더링: `react-markdown` + `rehype-highlight`
- 언어 지정: ````js, ```python` 등
- 테마: Tailwind dark mode와 호환

### 6.3 태그 시스템 (Tags)

**포스트 작성 시**
- 태그 입력창 (텍스트 + 자동완성)
- Enter 또는 쉼표로 태그 추가
- 최대 10개 제한
- 중복 제거

**태그 정규화**
- 소문자 변환
- 선행/후행 공백 제거
- 최대 20자 (길이 검증)

**태그 생성/연결**
- 기존 태그 있으면 `PostTag` 연결
- 없으면 새로 `Tag` 생성 후 연결

**태그 페이지**
- `/tags` - 전체 태그 목록
  - 각 태그별 포스트 수 표시
  - 정렬: 인기순(포스트 수), 이름순
  - 클릭 → `/tags/[tagName]`
- `/tags/[tagName]` - 해당 태그의 포스트 피드
  - 최신순으로 정렬
  - 무한 스크롤

### 6.4 시리즈 시스템 (Series)

**시리즈 생성/관리**
- `/settings` 에서 시리즈 생성 또는 포스트 작성 중 신규 생성
- 시리즈 이름, 설명, 커버 이미지 (선택)

**포스트와 시리즈 연결**
- 포스트 작성/수정 시 시리즈 선택 (선택사항)
- 시리즈 내 순서: `seriesOrder` 필드로 저장
- 드래그앤드롭으로 순서 변경 (선택사항, MVP는 수동 입력)

**시리즈 페이지**
- `/@username/series` - 유저의 모든 시리즈 목록
- `/@username/series/[seriesSlug]` - 시리즈 상세
  - 커버, 설명, 포스트 목록 (seriesOrder 순서)
  - 각 포스트 클릭 → 상세 페이지

**포스트 상세 페이지에서**
- 같은 시리즈의 포스트 목록 표시 (사이드바 또는 하단)
- 현재 포스트 강조
- 이전/다음 포스트 네비게이션

### 6.5 댓글 시스템 (Comments)

**댓글 계층 구조**
- 최상위 댓글
- 대댓글 (1단계만, MVP)
  - `parentId`로 상위 댓글 참조
  - 대댓글에 대댓글 없음 (DB 검증)

**댓글 작성**
- 로그인 필수
- 비로그인 유저: "로그인 후 댓글을 작성하세요" 메시지 + 로그인 유도
- 최대 길이: 1000자 (검증)

**댓글 표시**
- 최신순 정렬 (createAt DESC)
- 작성자 아바타 + 이름 + 시간 표시
- 작성자만: 수정/삭제 버튼

**댓글 삭제 처리**
- 대댓글이 없으면: 완전 삭제
- 대댓글이 있으면: soft delete
  - content를 "[삭제된 댓글입니다]" 등으로 교체
  - isDeleted 플래그 추가 (선택)
  - 실제 레코드는 유지 (대댓글 참조 유지)

**대댓글**
- "@username" 멘션 표시 (선택)
- "대댓글" 버튼으로 입력창 활성화
- 부모 댓글 내용 미리보기

### 6.6 좋아요 시스템 (Likes)

**좋아요 토글**
- 로그인 유저만 가능
- API: `POST /api/posts/[postId]/like`
  - 좋아요 있으면: 삭제
  - 좋아요 없으면: 생성
- 클라이언트: 즉시 UI 업데이트 (optimistic update)

**좋아요 표시**
- 포스트 카드: ❤️ 좋아요 수
- 포스트 상세: ❤️ 좋아요 수 + 현재 유저 좋아요 여부

**트렌딩 알고리즘**
```
score = (likeCount × 2 + viewCount × 0.5 + commentCount) / (hours_since_published + 2)^1.5

예:
- 1시간 전 발행, 10 좋아요, 50 조회, 2 댓글
- score = (10×2 + 50×0.5 + 2) / (1+2)^1.5 = 27 / 5.196 ≈ 5.19

- 1일 전 발행, 100 좋아요, 500 조회, 20 댓글
- score = (100×2 + 500×0.5 + 20) / (24+2)^1.5 = 370 / 140.3 ≈ 2.64

→ 따라서 최신 포스트가 유리
```

### 6.7 유저 프로필 (User Profile)

**공개 프로필: `/@username`**
- 유저 정보
  - 아바타, 이름, bio, 팔로워/팔로잉 수 (선택), 외부 링크
- 발행된 포스트 목록 (최신순, 무한 스크롤)
- 시리즈 섹션 (선택)

**프로필 상세: `/@username/about`**
- bio, website, GitHub URL 등 상세 정보

**프로필 수정: `/settings/profile`** (본인만)
- 아바타 변경 (이미지 업로드 또는 OAuth 제공 이미지)
- 이름 변경
- Bio 편집
- 외부 링크 (website, GitHub 등) 추가/수정

**아바타**
- 기본: OAuth 제공자 이미지 (gravatar 등)
- 변경: 이미지 업로드 → Cloudinary
- 크기: 200×200 이상, 최대 5MB
- 형식: JPG, PNG, WebP

### 6.8 피드 (Feed)

**메인 페이지: `/`**
- 최신 포스트 피드 기본 표시
- "최신" / "트렌딩" 탭으로 전환

**최신 피드: `/recent` 또는 `/`**
- 발행 시간 기준 내림차순 (publishedAt DESC)
- 커서 기반 무한 스크롤
  - `cursor=cm3abc` (마지막 포스트의 id)
  - `limit=12` (한 번에 12개)
- 포스트 카드
  - 커버 이미지 (있으면)
  - 제목, 요약 (excerpt)
  - 작성자 정보, 발행일
  - 태그 배지
  - 읽는 시간, 조회 수, 좋아요 수, 댓글 수

**트렌딩 피드: `/trending`**
- 기간 필터: 오늘, 이번 주, 이번 달, 전체
- 트렌딩 점수로 정렬 (위의 알고리즘 참고)
- 같은 카드 UI

**포스트 카드 컴포넌트**
```
┌────────────────────────────────┐
│ [커버 이미지 또는 색상 배경]   │
├────────────────────────────────┤
│ 제목 (2줄, ellipsis)           │
│ 요약 (1-2줄, ellipsis)         │
├────────────────────────────────┤
│ [작성자 avatar] 작성자명        │
│ 발행일 · 읽는시간 · 조회 수    │
│ [태그1] [태그2] ...            │
│ ❤️ 10 💬 3                      │
└────────────────────────────────┘
```

---

## 7. 프로젝트 디렉토리 구조 (Directory Structure)

```
vibeCoding/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Root layout (폰트, Providers)
│   ├── page.tsx                  # 메인 피드
│   ├── middleware.ts             # 라우트 보호
│   ├── (auth)/
│   ├── (feed)/
│   ├── write/
│   ├── [@username]/
│   ├── [username]/
│   ├── tags/
│   ├── settings/
│   └── api/
│
├── components/                   # React 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── layout/                   # 레이아웃
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Nav.tsx
│   ├── post/                     # 포스트 관련
│   │   ├── PostCard.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostEditor.tsx
│   │   └── PostList.tsx
│   ├── comment/                  # 댓글
│   │   ├── CommentList.tsx
│   │   ├── CommentForm.tsx
│   │   └── CommentItem.tsx
│   ├── tag/                      # 태그
│   │   ├── TagBadge.tsx
│   │   ├── TagInput.tsx
│   │   └── TagList.tsx
│   ├── series/                   # 시리즈
│   │   ├── SeriesCard.tsx
│   │   ├── SeriesPostList.tsx
│   │   └── SeriesSelector.tsx
│   ├── user/                     # 유저
│   │   ├── UserProfile.tsx
│   │   ├── UserAvatar.tsx
│   │   └── UserInfo.tsx
│   └── provider/                 # Context Providers
│       ├── SessionProvider.tsx
│       ├── ThemeProvider.tsx
│       └── ReactQueryProvider.tsx
│
├── lib/                          # 유틸리티 및 설정
│   ├── prisma.ts                 # Prisma Client singleton
│   ├── auth.ts                   # NextAuth.js 설정
│   ├── utils.ts                  # 공통 유틸 (날짜, slug 등)
│   ├── markdown.ts               # Markdown 처리 함수
│   ├── trending.ts               # 트렌딩 점수 계산
│   ├── cloudinary.ts             # Cloudinary API 래퍼
│   └── validation.ts             # Zod 스키마 정의
│
├── hooks/                        # React Custom Hooks
│   ├── usePost.ts
│   ├── useLike.ts
│   ├── useComment.ts
│   ├── useInfiniteScroll.ts
│   ├── useSession.ts
│   └── useTheme.ts
│
├── types/                        # TypeScript 타입
│   └── index.ts                  # 공통 타입 정의
│
├── prisma/
│   ├── schema.prisma             # 데이터 모델 (Section 3 참고)
│   └── migrations/               # 마이그레이션 히스토리
│
├── public/                       # 정적 자산
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── .env.local                    # 환경 변수 (Section 2 참고)
├── .env.example                  # 환경 변수 템플릿
├── .gitignore
├── next.config.ts                # Next.js 설정
├── tailwind.config.ts            # Tailwind CSS 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json
├── package-lock.json
├── CLAUDE.md                     # 프로젝트 컨텍스트
└── spec.md                       # 본 문서
```

---

## 8. 비기능 요구사항 (Non-Functional Requirements)

### 8.1 SEO

**메타데이터 동적 생성**
```typescript
// app/[username]/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: `${post.title} | ${post.author.username}`,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      url: `https://vibecoding.com/${params.username}/${params.slug}`,
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage || '/og-default.png'],
      authors: [post.author.name],
      publishedTime: post.publishedAt,
    },
  };
}
```

**정적 생성 (ISR)**
- 인기 포스트: `revalidate: 3600` (1시간)
- `generateStaticParams()`로 자주 조회되는 포스트 미리 생성

**사이트맵 및 Robots**
- `app/sitemap.ts` - 모든 포스트 + 태그 + 유저 페이지
- `app/robots.ts` - 크롤링 허용/거부 설정

**구조화된 데이터 (Schema.org)**
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "description": "...",
  "author": { "@type": "Person", "name": "..." },
  "datePublished": "...",
  "image": "..."
}
```

### 8.2 반응형 디자인 (Responsive Design)

**Tailwind 브레이크포인트**
- `sm`: 640px (모바일)
- `md`: 768px (태블릿)
- `lg`: 1024px (데스크탑)
- `xl`: 1280px (와이드)

**모바일 우선**
- 모바일에서 시작, 큰 화면으로 확장
- 에디터: 모바일에서 탭 전환, 데스크탑에서 분할 뷰

**터치 친화적**
- 버튼 최소 크기: 44×44px
- 간격 충분히 확보

### 8.3 다크 모드 (Dark Mode)

**next-themes 라이브러리**
```typescript
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Tailwind dark 클래스**
- 밝은 모드: `bg-white text-black`
- 어두운 모드: `dark:bg-gray-950 dark:text-white`

**시스템 설정 감지**
- `prefers-color-scheme` 미디어 쿼리 활용
- 사용자 수동 토글 → `localStorage`에 저장

### 8.4 성능 (Performance)

**이미지 최적화**
```typescript
// next/image 사용
<Image
  src={post.coverImage}
  alt={post.title}
  width={800}
  height={400}
  priority={isCritical}
  quality={75}
/>
```
- WebP 자동 변환
- lazy loading (기본)
- 반응형 srcset 자동 생성

**코드 스플리팅**
```typescript
// 마크다운 에디터는 지연 로딩
const MarkdownEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false, loading: () => <div>Loading...</div> }
);
```

**무한 스크롤**
- IntersectionObserver API 사용
- 커서 기반 페이지네이션
- TanStack Query로 캐싱

**데이터베이스 인덱싱**
- `publishedAt`: 피드 정렬
- `slug`: 포스트 조회
- `authorId`: 유저별 포스트 조회
- `PostTag` 조인 테이블 인덱싱

**번들 크기**
- 번들 분석: `@next/bundle-analyzer`
- 대용량 라이브러리는 동적 로딩

### 8.5 보안 (Security)

**입력 검증**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string().max(20)).max(10),
});

// API Route에서 검증
const result = postSchema.safeParse(req.body);
if (!result.success) {
  return Response.json({ error: result.error }, { status: 400 });
}
```

**XSS 방지**
- `react-markdown`에 `rehype-sanitize` 플러그인 적용
- HTML 태그 필터링

**CSRF 보호**
- NextAuth.js 내장 CSRF 토큰
- SameSite cookie 설정

**SQL Injection 방지**
- Prisma ORM 사용 (parameterized queries)
- 직접 SQL 작성 금지

**인증/인가**
- 서버 액션에서 `getServerSession` 확인
- API Route 에서 요청자 == 리소스 소유자 검증
- 민감한 정보 (password, token) 절대 로그/응답에 포함 금지

**Rate Limiting** (선택)
- Upstash Redis + `@upstash/ratelimit`
- `/api/posts` POST: 1시간에 10개 (예)
- `/api/comments` POST: 1분에 3개 (예)

**HTTPS**
- 프로덕션: 모든 통신 HTTPS 강제
- `next.config.ts`에서 headers 설정

---

## 9. 구현 단계별 로드맵 (Implementation Roadmap)

### Phase 1: 프로젝트 초기화 및 인프라 (1-2일)
**목표**: Next.js 프로젝트 구조 및 DB 연결 완성

1. `create-next-app@latest --typescript --tailwind` 실행
2. 필수 패키지 설치
   - Prisma, NextAuth.js, Markdown 라이브러리
   - Tailwind, zod, utils
3. PostgreSQL 데이터베이스 생성 및 `DATABASE_URL` 설정
4. Prisma `schema.prisma` 작성 (Section 3)
5. 첫 마이그레이션: `npx prisma migrate dev --name init`
6. `lib/prisma.ts` - Prisma Client singleton 설정
7. `CLAUDE.md` 업데이트 (기술 스택, 프로젝트 상태)
8. `next.config.ts` 기본 설정 (이미지 최적화, 환경변수 등)

### Phase 2: 인증 및 레이아웃 (1.5일)
**목표**: OAuth 로그인 흐름 완성 및 기본 UI 구축

1. NextAuth.js 설정 (`lib/auth.ts`)
   - GitHub & Google Provider 추가
   - 콜백: `signIn` (최초 가입 처리), `session` (세션 커스터마이징)
2. 환경변수 설정 (`.env.local`)
3. `app/api/auth/[...nextauth]/route.ts` - NextAuth 엔드포인트
4. `middleware.ts` - Protected routes 설정 (`/write`, `/settings`)
5. `/login` 페이지 (소셜 로그인 버튼 UI)
6. `/register` 페이지 (username 설정)
7. `components/layout/Header.tsx` - 로그인 상태 반영
8. `components/provider/SessionProvider.tsx` - NextAuth SessionProvider
9. `components/ui/` 기본 버튼, 입력 컴포넌트 (최소한)

### Phase 3: 포스트 CRUD (3-4일)
**목표**: 포스트 작성, 조회, 수정, 삭제 완성

1. **마크다운 에디터**
   - `/write` 페이지 + `components/post/PostEditor.tsx`
   - `@uiw/react-md-editor` 통합
   - 자동 임시저장 (Server Action)
   - 슬러그 자동 생성 유틸

2. **포스트 작성 API**
   - `POST /api/posts` - 포스트 생성
   - Request body 검증 (Zod)
   - 임시저장 & 발행 로직

3. **포스트 조회 API**
   - `GET /api/posts?feed=recent&limit=12` - 피드
   - `GET /api/posts/[postId]` - 상세 (viewCount++)
   - 응답 포맷 (Section 5.2 참고)

4. **포스트 상세 페이지**
   - `app/[username]/[slug]/page.tsx`
   - 마크다운 렌더링 (`react-markdown`)
   - 메타데이터 동적 생성 (`generateMetadata`)

5. **포스트 수정/삭제**
   - `PATCH /api/posts/[postId]`
   - `DELETE /api/posts/[postId]`
   - 본인 확인 로직

6. **이미지 업로드**
   - `POST /api/upload` - Cloudinary API 호출
   - 에디터에서 드래그앤드롭 이미지 처리

7. **포스트 카드 컴포넌트**
   - `components/post/PostCard.tsx`
   - 커버, 제목, 요약, 작성자, 메타정보

### Phase 4: 태그 & 시리즈 (2일)
**목표**: 태그 및 시리즈 시스템 완성

1. **태그 시스템**
   - `/api/tags` GET - 태그 목록
   - 에디터에 `components/tag/TagInput.tsx` 추가
   - 태그 자동완성 (클라이언트)

2. **태그 페이지**
   - `/tags` - 태그 목록 (인기순)
   - `/tags/[tagName]` - 태그별 포스트 피드

3. **시리즈 생성/관리**
   - `/settings` 에서 시리즈 CRUD
   - `POST /api/series`, `PATCH`, `DELETE`

4. **포스트와 시리즈 연결**
   - 에디터에 시리즈 선택/생성 UI
   - `components/series/SeriesSelector.tsx`

5. **시리즈 페이지**
   - `/@username/series` - 유저 시리즈 목록
   - `/@username/series/[seriesSlug]` - 시리즈 상세 + 포스트 목록

### Phase 5: 댓글 & 좋아요 (1.5일)
**목표**: 댓글 및 좋아요 기능 완성

1. **좋아요 API**
   - `POST /api/posts/[postId]/like` - 토글
   - 클라이언트 optimistic update

2. **포스트 상세에 좋아요 버튼**
   - 좋아요 수 표시
   - 클릭 → 하트 애니메이션

3. **댓글 API**
   - `GET /api/posts/[postId]/comments` - 댓글 목록
   - `POST /api/posts/[postId]/comments` - 작성
   - `PATCH`, `DELETE` - 수정/삭제

4. **댓글 UI**
   - `components/comment/CommentList.tsx`
   - `components/comment/CommentForm.tsx`
   - `components/comment/CommentItem.tsx` (댓글, 대댓글)
   - 대댓글 입력폼 토글

5. **포스트 상세 페이지에 댓글 섹션 추가**

### Phase 6: 유저 프로필 & 피드 (1.5일)
**목표**: 프로필 및 피드 페이지 완성

1. **유저 프로필**
   - `/@username` - 공개 프로필
   - `/@username/about` - 상세 정보
   - `/settings/profile` - 프로필 수정 (본인만)

2. **프로필 정보 API**
   - `GET /api/users/[username]`
   - `PATCH /api/users/me` - 수정

3. **포스트 목록**
   - `/@username` 에서 유저 포스트 피드

4. **메인 피드**
   - `/` 또는 `/recent` - 최신 포스트
   - "최신" / "트렌딩" 탭 전환

5. **트렌딩 피드**
   - `/trending` - 기간 필터
   - 트렌딩 점수 계산 (lib/trending.ts)

6. **무한 스크롤**
   - IntersectionObserver 또는 TanStack Query
   - 커서 기반 페이지네이션

7. **포스트 카드 UI 개선**
   - 태그, 읽는시간, 조회 수, 좋아요 수, 댓글 수

### Phase 7: SEO & 다크모드 & 마무리 (1일)
**목표**: SEO, 다크모드, 배포 준비

1. **다크모드**
   - `next-themes` 설치 및 설정
   - ThemeProvider wrapping
   - Tailwind dark: 클래스 적용

2. **SEO**
   - `generateMetadata` 포스트 페이지에 적용
   - `app/sitemap.ts` - 사이트맵
   - `app/robots.ts` - robots.txt

3. **구조화된 데이터** (선택)
   - Schema.org JSON-LD 추가

4. **성능 최적화**
   - 이미지: WebP, lazy loading
   - 코드 스플리팅 확인
   - 번들 크기 분석

5. **배포 준비**
   - 환경변수 확인
   - Vercel/다른 호스팅 설정
   - Prisma: 프로덕션 마이그레이션

6. **문서 작성**
   - README.md (프로젝트 설명, 시작 방법)
   - CONTRIBUTING.md (기여 가이드)

---

## 10. 패키지 의존성 (Dependencies)

### 10.1 설치 명령어

```bash
# 프로젝트 생성
npx create-next-app@latest vibeCoding --typescript --tailwind --eslint

cd vibeCoding

# Core & Framework
npm install next@latest react@latest react-dom@latest typescript@latest

# Database & ORM
npm install @prisma/client
npm install -D prisma

# Authentication
npm install next-auth@beta

# Markdown Editor & Renderer
npm install @uiw/react-md-editor
npm install react-markdown remark-gfm rehype-highlight rehype-sanitize

# Styling & Theme
npm install tailwindcss next-themes
npm install -D @tailwindcss/typography

# Validation
npm install zod

# Utilities
npm install slugify reading-time date-fns clsx

# Image Upload
npm install cloudinary next-cloudinary

# State Management & Data Fetching
npm install zustand @tanstack/react-query

# Development Tools
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier

# (선택) 성능 분석
npm install -D @next/bundle-analyzer

# (선택) Rate Limiting
npm install @upstash/ratelimit @upstash/redis
```

### 10.2 package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "node prisma/seed.ts",
    "studio": "prisma studio"
  }
}
```

---

## 11. 핵심 설계 결정사항 (Critical Design Decisions)

### 11.1 Slug 생성 전략
```
title: "리액트 훅 완전정복"
↓
slugify("리액트 훅 완전정복") = "react-hook-complete-guide"
↓
slug = "react-hook-complete-guide-cm3abc" (cuid suffix)

장점:
- 한글 제목도 URL에 사용 가능
- 중복 방지 (cuid)
- SEO 친화적 (영문 슬러그)

구현:
lib/utils.ts:
export function generateSlug(title: string): string {
  const base = slugify(title, { lower: true });
  return `${base}-${cuid()}`;
}
```

### 11.2 커서 기반 페이지네이션
```
오프셋 방식의 문제:
- 페이지네이션 중 새 포스트 추가 → 중복/누락 발생
- 대규모 데이터셋에서 성능 저하

커서 기반 해결책:
GET /api/posts?feed=recent&limit=12&cursor=cm3abc

응답:
{
  posts: [...],
  nextCursor: "cm3def"  // 다음 페이지를 위한 커서
}

구현:
const posts = await prisma.post.findMany({
  where: {
    published: true,
    publishedAt: { lt: cursorDate } // cursor 시간보다 이전
  },
  orderBy: { publishedAt: 'desc' },
  take: limit,
});
```

### 11.3 viewCount 증가 전략
```
포스트 상세 페이지 (RSC):
export default async function PostPage({ params }) {
  const post = await getPost(params.slug);
  
  // 비동기로 viewCount 증가 (fire-and-forget)
  incrementViewCountAction(post.id).catch(console.error);
  
  return <PostDetail post={post} />;
}

Server Action:
'use server'
async function incrementViewCountAction(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } }
  });
}

장점:
- 페이지 렌더링과 독립적 (실패해도 페이지는 정상 로드)
- DB 트래픽 분산
```

### 11.4 임시저장 (Draft) 전략
```
포스트 상태:
- published: false → 임시저장 (초안)
- published: true → 발행됨

/write 페이지:
1. 첫 방문 → 새 포스트 생성 (published: false)
2. 2초마다 localStorage 저장 (로컬 임시저장)
3. 5초마다 Server Action으로 DB 저장
4. 페이지 이탈 → "저장하지 않은 변경사항이 있습니다" 경고

수정 페이지:
GET /api/posts/[postId] (published=false, 본인만 조회 가능)
```

### 11.5 댓글 삭제 전략
```
시나리오 1: 댓글 단독
DELETE → 완전 삭제 (레코드 제거)

시나리오 2: 댓글에 대댓글 있음
DELETE → soft delete
content = "[삭제된 댓글입니다]"
또는 isDeleted = true 플래그 추가

이유:
- 대댓글의 parentId 참조 유지
- 댓글 트리 구조 보존
```

### 11.6 세션 전략
```
JWT vs DB 세션 비교:

JWT:
- 장점: 서버 상태 없음, 확장성 좋음
- 단점: 즉시 로그아웃 불가능 (토큰 만료까지 유효)

DB 세션:
- 장점: 즉시 로그아웃 가능, 세션 무효화 신속
- 단점: DB 조회 필요, 서버 부하

선택: DB 세션 (NextAuth.js default)
이유: 보안성 + 사용자 경험 (로그아웃 즉시 반영)

구현:
// next-auth.config.ts
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
  },
  providers: [
    GitHub({ ... }),
    Google({ ... }),
  ],
};
```

---

## 12. 추가 참고사항

### 12.1 환경 구성
- 로컬 개발: PostgreSQL (Docker 권장)
  ```bash
  docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
  ```
- 스테이징/프로덕션: 호스팅 제공자의 PostgreSQL (AWS RDS, Railway, Supabase 등)

### 12.2 TypeScript 규칙
- `strict: true`
- `noImplicitAny: true`
- 모든 컴포넌트에 명시적 타입 정의

### 12.3 Git 워크플로우
- `main` 브랜치: 프로덕션 (보호됨)
- `develop` 브랜치: 개발 메인 브랜치
- Feature 브랜치: `feature/post-crud` 등

### 12.4 성능 목표 (Web Vitals)
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 12.5 테스트 (MVP 이후 고려)
- Unit 테스트: Jest + React Testing Library
- E2E 테스트: Playwright
- Coverage: 70% 이상 목표

---

## 요약

이 spec.md 문서는 Velog 스타일의 개발자 블로그 플랫폼 "vibeCoding"의 완전한 기술 명세입니다.

**핵심 기술:**
- Next.js 15 (App Router, Server Components)
- PostgreSQL + Prisma
- NextAuth.js (GitHub/Google OAuth)
- Tailwind CSS (다크모드)

**핵심 기능:**
- OAuth 인증
- Markdown 기반 포스트 CRUD
- 태그/시리즈 분류
- 댓글/좋아요
- 트렌딩 알고리즘
- SEO 최적화

**다음 단계:**
1. `create-next-app` 으로 프로젝트 초기화
2. Phase 1~7 순서로 구현
3. 각 단계별 테스트 및 병합
