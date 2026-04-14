# CLAUDE.md — Backend

FastAPI + SQLAlchemy + PostgreSQL 기반 서버 레이어.

## 기술 스택

| 항목 | 기술 |
|---|---|
| Runtime | Python 3.11+ |
| Language | Python with type hints |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0+ |
| Migration | Alembic |
| Database | PostgreSQL 16 |
| Auth | Python-JOSE + Passlib (JWT) |
| Validation | Pydantic v2 |
| Image Upload | Cloudinary |
| Testing | Pytest + HTTPx |

## 인증 (Authentication)

### OAuth 플로우
**Python-JOSE + Passlib** 사용, GitHub + Google Provider

1. **최초 로그인**
   - Frontend `/login` → OAuth Callback → `/api/auth/callback?code=...` (백엔드)
   - 백엔드에서 OAuth 토큰 교환 → User 생성 (username 없음)
   - JWT 토큰 발급 + `needsUsername: true` 반환
   - Frontend `/register` 표시 → username 입력 → PATCH `/api/users/me`

2. **재로그인**
   - `/api/auth/login` → JWT 토큰 발급 → `/`

### 인증 전략
- **JWT 기반** (localStorage 저장)
- `Authorization: Bearer {token}` 헤더
- 토큰 만료: 24시간 (설정 가능)
- Refresh token (선택): long-lived token으로 자동 갱신
- 서버: `Depends(get_current_user)` 의존성 주입

### 라우트 보호 (router prefix)
```
Protected: /api/posts POST, /api/posts/{id} PATCH/DELETE
          /api/comments POST, /api/comments/{id} PATCH/DELETE
          /api/series *, /api/users/me PATCH, /api/upload
Unprotected: GET 모든 엔드포인트, /api/auth/*, /api/health
```

### Username 규칙
- 영문, 숫자, 하이픈만 허용
- 3~20자
- DB unique constraint
- URL 슬러그: `/@username` → GET `/api/users/{username}`

---

## API 엔드포인트

### 인증
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/auth/session` | No |
| POST | `/api/auth/signin` | No |
| POST | `/api/auth/signout` | Yes |

### 포스트
| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/posts?feed=recent&limit=12&cursor=...` | No | 최신 피드 |
| GET | `/api/posts?feed=trending&period=week` | No | 트렌딩 피드 |
| GET | `/api/posts?tag=[tagName]` | No | 태그별 피드 |
| POST | `/api/posts` | Yes | 포스트 생성 |
| GET | `/api/posts/[postId]` | No | 포스트 상세 |
| PATCH | `/api/posts/[postId]` | Yes (본인) | 포스트 수정 |
| DELETE | `/api/posts/[postId]` | Yes (본인) | 포스트 삭제 |
| POST | `/api/posts/[postId]/like` | Yes | 좋아요 토글 |

### 댓글
| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/posts/[postId]/comments` | No | 댓글 목록 |
| POST | `/api/posts/[postId]/comments` | Yes | 댓글 작성 |
| PATCH | `/api/posts/[postId]/comments/[commentId]` | Yes (본인) | 댓글 수정 |
| DELETE | `/api/posts/[postId]/comments/[commentId]` | Yes (본인) | 댓글 삭제 |

### 시리즈
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/users/[username]/series` | No |
| POST | `/api/series` | Yes |
| PATCH | `/api/series/[seriesId]` | Yes (본인) |
| DELETE | `/api/series/[seriesId]` | Yes (본인) |

### 태그
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/tags?sort=popular&limit=50` | No |

### 유저
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/users/[username]` | No |
| PATCH | `/api/users/me` | Yes |

### 기타
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/upload` | Yes |
| GET | `/api/search?q=keyword` | No |

---

## Request/Response 포맷 (Pydantic 스키마)

### POST /api/posts (포스트 생성)
```python
class CreatePostRequest(BaseModel):
    title: str  # 필수, 1~255자
    content: str  # 필수, Markdown
    excerpt: str | None = None
    cover_image: str | None = None  # URL
    published: bool
    tags: list[str]  # 최대 10개
    series_id: str | None = None  # UUID
    series_order: int | None = None
```

### GET /api/posts (피드 응답)
```python
class PostResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    cover_image: str | None
    published_at: datetime
    reading_time: int
    view_count: int
    author: dict  # { "username": str, "avatar_url": str }
    tags: list[dict]  # [{ "name": str }]
    like_count: int
    comment_count: int

class PostListResponse(BaseModel):
    posts: list[PostResponse]
    total_count: int
    next_cursor: str | None = None
```

---

## 보안 (Security)

### 입력 검증 (Pydantic)
모든 라우터에서 자동 검증 (FastAPI 기본)
```python
from pydantic import BaseModel, Field

class CreatePostRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: list[str] = Field(..., max_items=10)
    
    # Pydantic이 자동으로 검증 후 라우터 호출
```

### XSS 방지
- Markdown 렌더링은 프론트에서 처리
- 저장된 content는 그대로 (sanitizing은 프론트 `rehype-sanitize` 담당)

### SQL Injection 방지
- SQLAlchemy ORM 사용 (parameterized queries)
- 직접 SQL 작성 금지

### CSRF
- SameSite 쿠키 설정 (CORS 미들웨어)
- JWT 토큰 기반이므로 자동 방지

### 인가 확인 (Authorization)
```python
from fastapi import Depends

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # JWT 검증 후 user 반환
    return user

@router.patch("/posts/{post_id}")
async def update_post(post_id: str, req: UpdatePostRequest, 
                     current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
```

### Rate Limiting (선택)
- Slowapi + Redis (또는 in-memory)
- `/api/posts POST`: 1시간 10개
- `/api/comments POST`: 1분 3개

---

## 트렌딩 알고리즘

```python
from datetime import datetime
import math

def calc_trending_score(post: dict) -> float:
    """포스트의 트렌딩 점수를 계산합니다."""
    like_count = post.get('like_count', 0)
    comment_count = post.get('comment_count', 0)
    view_count = post.get('view_count', 0)
    
    hours_since = (datetime.utcnow() - post['published_at']).total_seconds() / 3600
    
    numerator = like_count * 2 + view_count * 0.5 + comment_count
    denominator = math.pow(hours_since + 2, 1.5)
    
    return numerator / denominator if denominator > 0 else 0
```

**점수 공식 해석**
- 좋아요 × 2: 가중치 높음
- 조회 수 × 0.5: 가중치 낮음
- 댓글: 가중치 동등
- 시간 경과 지수: 최신 포스트 우대

**SQL 구현 (SQLAlchemy)**
```python
from sqlalchemy import func, and_, or_

score_expr = (
    (Post.like_count * 2 + Post.view_count * 0.5 + Post.comment_count) /
    func.pow(
        func.extract('epoch', func.now() - Post.published_at) / 3600 + 2,
        1.5
    )
)

posts = db.query(Post, score_expr.label('trending_score'))\
    .filter(Post.published == True)\
    .order_by(score_expr.desc())\
    .limit(limit)\
    .all()
```

---

## 설계 결정사항

### Slug 생성
```python
from python_slugify import slugify
import uuid

title = "리액트 훅 완전정복"
slug = f"{slugify(title)}-{uuid.uuid4().hex[:8]}"
# 결과: "react-hook-complete-guide-a1b2c3d4"
```

### 페이지네이션: 커서 기반
- 오프셋 방식 대신 커서 사용 (publishedAt + id)
- 실시간 피드에서 중복/누락 방지
- 쿼리: `WHERE published_at < :cursor_date OR (published_at = :cursor_date AND id < :cursor_id)`

### viewCount 증가
```python
# 백그라운드 태스크로 비동기 처리
from fastapi import BackgroundTasks

@router.get("/posts/{post_id}")
async def get_post(post_id: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(increment_view_count, post_id)
    # 또는 fire-and-forget: asyncio.create_task(increment_view_count(post_id))
    return post
```

### 댓글 삭제
- 대댓글 없음: 완전 삭제 (DELETE FROM comments WHERE id = ...)
- 대댓글 있음: content = "[삭제된 댓글입니다]" (UPDATE comments SET content = ..., 레코드 유지)

### 임시저장 (Draft)
- `published: false` 상태로 DB 저장
- 프론트 에디터: 2초마다 localStorage, 5초마다 PATCH /api/posts/{post_id} 요청

---

## API 라우터 구조

```
app/api/routes/
├── auth.py                                   # POST /auth/login, /auth/register, /auth/logout
├── posts.py                                  # GET/POST /posts, GET/PATCH/DELETE /posts/{post_id}
├── comments.py                               # GET/POST /posts/{post_id}/comments
│                                             # PATCH/DELETE /posts/{post_id}/comments/{comment_id}
├── likes.py                                  # POST /posts/{post_id}/like
├── users.py                                  # GET /users/{username}, PATCH /users/me
├── series.py                                 # GET/POST /series, PATCH/DELETE /series/{series_id}
├── tags.py                                   # GET /tags
├── upload.py                                 # POST /upload (Cloudinary)
├── search.py                                 # GET /search
└── health.py                                 # GET /health
```

모든 라우터는 `app/main.py`에서 `app.include_router()` 로 등록됨.

---

## 개발 명령어

```bash
# 환경 설정
python -m venv venv        # 가상환경 생성
source venv/bin/activate   # (Linux/Mac) 또는 venv\Scripts\activate (Windows)
pip install -e .           # 현재 프로젝트 설치 (pyproject.toml)

# DB 마이그레이션
alembic revision --autogenerate -m "description"  # 마이그레이션 파일 생성
alembic upgrade head                              # DB에 마이그레이션 적용
alembic downgrade -1                              # 이전 마이그레이션으로 롤백

# 개발 서버
uvicorn app.main:app --reload --port 8000    # 개발 서버 (hot-reload)
uvicorn app.main:app --host 0.0.0.0          # 프로덕션 (모든 IP에서 접근 가능)

# 테스트
pytest                          # 모든 테스트 실행
pytest tests/api/test_posts.py  # 특정 테스트 파일만
pytest --cov                    # 커버리지 리포트

# 타입 체크
mypy app/                       # 타입 검증
```

## 환경 변수 (.env.local)

```
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/vibecoding

# JWT
JWT_SECRET=<random_secret_key>
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24

# OAuth
GITHUB_CLIENT_ID=<from GitHub>
GITHUB_CLIENT_SECRET=<from GitHub>
GOOGLE_CLIENT_ID=<from Google>
GOOGLE_CLIENT_SECRET=<from Google>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud name>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>

# 앱 설정
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
DEBUG=false
```
