# Backend TODO

작업 순서. 위에서부터 순서대로 진행. 완료 시 [x] 체크.

---

## Phase 0: 프로젝트 셋업

- [x] P0-1: FastAPI 프로젝트 초기화 (pyproject.toml, app/ 디렉토리 구조)
- [x] P0-2: 프로덕션 의존성 설치
      (fastapi, sqlalchemy, alembic, pydantic, pydantic-settings, python-jose,
       passlib, bcrypt, python-multipart, cloudinary, python-slugify, email-validator)
- [x] P0-3: 개발 의존성 설치
      (pytest, pytest-asyncio, httpx, pytest-cov)
- [x] P0-4: app/core/config.py — 환경변수 설정 (Settings with pydantic-settings)
- [x] P0-5: .env.local 환경변수 파일 생성
      (DATABASE_URL, GITHUB/GOOGLE CLIENT ID·SECRET, JWT_SECRET, CLOUDINARY 키)
- [x] P0-6: app/db/base.py 및 SQLAlchemy 엔진/세션 설정
- [x] P0-7: app/models/ 에 SQLAlchemy ORM 모델 작성
      (User, Post, Tag, PostTag, Comment, Like, Series, PostSeries)
- [x] P0-8: alembic init 및 alembic/env.py 설정 (SQLAlchemy metadata 자동 감지)
- [x] P0-9: alembic revision --autogenerate -m "init" (초기 마이그레이션) [DB 필요]
- [x] P0-10: alembic upgrade head (DB 마이그레이션) [DB 필요]

---

## Phase 1: 공통 라이브러리

- [x] LIB-1: app/db/session.py — SessionLocal (DB 세션 팩토리)
- [x] LIB-2: app/core/security.py — JWT 관련 함수 (encode/decode, password hashing)
- [x] LIB-3: app/api/deps.py — 의존성 (get_db, get_current_user, get_current_user_optional)
- [x] LIB-4: app/utils/slug.py — title → slugify + uuid suffix 생성 함수
- [x] LIB-5: app/utils/trending.py — calcTrendingScore(post) 함수
      (likeCount×2 + viewCount×0.5 + commentCount) / (hoursSince+2)^1.5
- [x] LIB-6: app/utils/response.py — 응답 래퍼 (success_response / error_response)

---

## Phase 2: 인증 (Auth)

- [x] AUTH-1: app/schemas/auth.py — Pydantic 스키마 (LoginRequest, TokenResponse, UserRegister)
- [x] AUTH-2: app/api/routes/auth.py — POST /auth/login, /auth/register, /auth/logout
      OAuth (GitHub + Google) 콜백 처리 포함
- [x] AUTH-3: User.username 검증 (영문·숫자·하이픈 3~20자)
- [x] AUTH-4: 최초 로그인 시 username 없으면 클라이언트에 needsUsername: true 반환
      프론트에서 /auth/register 요청 후 username 설정

---

## Phase 3: Post API

> 각 Route: Pydantic 검증 → get_current_user → SQLAlchemy 쿼리 → 응답
> 패턴: `backend/.claude/rules/api-convention.md` 참고

### Pydantic 스키마

- [x] POST-1: app/schemas/post.py 작성
      (CreatePostRequest, UpdatePostRequest, PostResponse, PostListResponse 등)

### 포스트 CRUD

- [x] POST-2: app/api/routes/posts.py — GET /api/posts (피드)
      쿼리 파라미터: feed=recent|trending, tag=[tagName], limit=12, cursor=...
      recent: publishedAt DESC 커서 페이지네이션
      trending: calcTrendingScore 점수 정렬 (period=week|month|year)
- [x] POST-3: app/api/routes/posts.py — POST /api/posts (포스트 생성)
      인증 필수, slug 자동 생성(slugify+uuid), tags 관계 설정
- [x] POST-4: app/api/routes/posts.py — GET /api/posts/{post_id} (포스트 상세)
      viewCount 증가 (background task 또는 fire-and-forget)
- [x] POST-5: app/api/routes/posts.py — PATCH /api/posts/{post_id} (수정)
      본인 확인 (post.author_id != current_user.id → 403)
- [x] POST-6: app/api/routes/posts.py — DELETE /api/posts/{post_id} (삭제)
      본인 확인 → cascade 삭제 (PostTag, Like, Comment)

### 좋아요

- [x] POST-7: app/api/routes/likes.py — POST /api/posts/{post_id}/like (좋아요 토글)
      인증 필수, upsert 패턴 (있으면 delete, 없으면 create)
      응답: { liked: boolean, like_count: number }

### 댓글

- [x] POST-8: app/api/routes/comments.py — GET /api/posts/{post_id}/comments (댓글 목록)
      부모 댓글 기준 정렬, 대댓글 중첩 포함
- [x] POST-9: app/api/routes/comments.py — POST /api/posts/{post_id}/comments (댓글 작성)
      인증 필수, body: { content, parent_id? }
- [x] POST-10: app/api/routes/comments.py — PATCH/DELETE /api/posts/{post_id}/comments/{comment_id}
      본인 확인
      DELETE: 대댓글 있으면 content = "[삭제된 댓글입니다]" (soft-delete), 없으면 완전 삭제

### 테스트

- [x] POST-11: tests/api/test_posts.py — 피드 조회, 생성, 수정, 삭제 통합 테스트
- [x] POST-12: tests/api/test_likes.py — 좋아요 토글, 중복 방지 테스트
- [x] POST-13: tests/api/test_comments.py — 댓글 CRUD + soft-delete 테스트

---

## Phase 4: 기타 API

> 동일 패턴: Pydantic → Session → SQLAlchemy → 응답

### User

- [x] USER-1: app/schemas/user.py 작성 (UpdateUserRequest, UserResponse)
- [x] USER-2: app/api/routes/users.py — GET /api/users/{username} (프로필 + 포스트 수)
- [x] USER-3: app/api/routes/users.py — PATCH /api/users/me (프로필 수정: bio, avatar_url, 인증 필수)

### Series

- [x] SERIES-1: app/schemas/series.py 작성
- [x] SERIES-2: app/api/routes/series.py — GET /api/users/{username}/series (유저 시리즈 목록)
- [x] SERIES-3: app/api/routes/series.py — POST /api/series (시리즈 생성)
- [x] SERIES-4: app/api/routes/series.py — PATCH/DELETE /api/series/{series_id} (본인 확인)

### Tag

- [x] TAG-1: app/api/routes/tags.py — GET /api/tags
      ?sort=popular → post_count DESC, limit=50
      응답: [{ name, post_count }]

### Upload

- [x] UPLOAD-1: app/api/routes/upload.py — POST /api/upload (Cloudinary 업로드)
      인증 필수, multipart/form-data 파싱, Cloudinary SDK 업로드
      응답: { url: string }
- [x] UPLOAD-2: tests/api/test_upload.py — 파일 업로드 + 인증 없음 401 테스트

### Search

- [x] SEARCH-1: app/api/routes/search.py — GET /api/search?q=keyword
      Post: title/content 전문 검색 (ilike 패턴)
      User: username 검색
      응답: { posts: [...], users: [...] }
- [x] SEARCH-2: tests/api/test_search.py — 키워드 검색 + 빈 결과 테스트

### 기타

- [x] ETC-1: app/api/routes/health.py — GET /api/health (DB ping, 200 OK)

### 테스트

- [x] USER-4: tests/api/test_users.py — 프로필 조회, 수정 테스트
- [x] SERIES-5: tests/api/test_series.py — 시리즈 CRUD 테스트
- [x] TAG-2: tests/api/test_tags.py — 인기 태그 정렬 테스트

---

## Phase 5: 통합 / E2E

- [x] E2E-1: 포스트 작성 → 발행 → 피드 노출 플로우
- [x] E2E-2: 임시저장(published: false) → 이어쓰기 → 발행 플로우
- [x] E2E-3: 좋아요 → 트렌딩 점수 반영 확인
- [x] E2E-4: 댓글 작성 → 대댓글 → soft-delete 표시 확인
- [x] E2E-5: 태그 등록 → /api/tags 인기순 정렬 확인
- [x] E2E-6: 인증 없는 요청 → 401, 타인 리소스 수정 → 403 확인
