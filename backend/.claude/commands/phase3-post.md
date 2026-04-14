# /phase3-post — Phase 3: Post API

`backend/TODO.md`의 Phase 3 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`backend/TODO.md`의 Phase 3에서 첫 `[ ]` 항목을 찾습니다 (POST-1~POST-13).

### 2️⃣ Pydantic 스키마 작성

#### app/schemas/post.py
```bash
cat > app/schemas/post.py << 'EOF'
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class TagSchema(BaseModel):
    id: str
    name: str

class AuthorSchema(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str]

class CreatePostRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    published: bool
    tags: List[str] = Field(default=[], max_items=10)
    series_id: Optional[str] = None
    series_order: Optional[int] = None

class UpdatePostRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    published: Optional[bool] = None
    tags: Optional[List[str]] = None
    series_id: Optional[str] = None
    series_order: Optional[int] = None

class PostResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    cover_image: Optional[str]
    published_at: datetime
    reading_time: int
    view_count: int
    author: AuthorSchema
    tags: List[TagSchema]
    like_count: int
    comment_count: int

class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total_count: int
    next_cursor: Optional[str]
EOF
```

### 3️⃣ ORM 모델 작성

#### app/models/post.py 등
- Post (id, title, slug, content, excerpt, cover_image, published, published_at, view_count, author_id)
- Tag (id, name)
- PostTag (post_id, tag_id)
- Comment (id, content, author_id, post_id, parent_id, created_at)
- Like (id, user_id, post_id, created_at)

### 4️⃣ 라우터 구현

#### app/api/routes/posts.py
```bash
cat > app/api/routes/posts.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime
from app.schemas.post import CreatePostRequest, UpdatePostRequest, PostResponse, PostListResponse
from app.models.post import Post, Comment, Like, Tag
from app.models.user import User
from app.api.deps import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.utils.slug import generate_slug
from app.utils.trending import calc_trending_score

router = APIRouter(prefix="/api/posts", tags=["posts"])

@router.get("", response_model=PostListResponse)
async def get_posts(
    feed: str = "recent",
    tag: str = None,
    limit: int = 12,
    cursor: str = None,
    period: str = "week",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """피드 조회 (recent, trending, tag)"""
    query = db.query(Post).filter(Post.published == True)
    
    if tag:
        query = query.join(PostTag).join(Tag).filter(Tag.name == tag)
    
    if feed == "trending":
        # 트렌딩 점수로 정렬
        posts = query.order_by(
            desc(calc_trending_score(...))
        ).limit(limit).all()
    else:
        # recent: 커서 기반 페이지네이션
        if cursor:
            # cursor = "2024-01-01T00:00:00,post_id"
            cursor_date, cursor_id = cursor.split(",")
            query = query.filter(
                or_(
                    Post.published_at < datetime.fromisoformat(cursor_date),
                    and_(
                        Post.published_at == datetime.fromisoformat(cursor_date),
                        Post.id < cursor_id
                    )
                )
            )
        posts = query.order_by(Post.published_at.desc(), Post.id.desc()).limit(limit+1).all()
    
    return {"posts": posts, "total_count": 0, "next_cursor": None}

@router.post("", response_model=PostResponse)
async def create_post(
    req: CreatePostRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """포스트 생성"""
    slug = generate_slug(req.title)
    post = Post(
        title=req.title,
        slug=slug,
        content=req.content,
        excerpt=req.excerpt,
        cover_image=req.cover_image,
        published=req.published,
        author_id=current_user.id
    )
    
    # tags 관계 설정
    for tag_name in req.tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
        post.tags.append(tag)
    
    db.add(post)
    db.commit()
    return post

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """포스트 상세 조회"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # viewCount 증가 (백그라운드 태스크)
    background_tasks.add_task(increment_view_count, post_id, db)
    
    return post

@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    req: UpdatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """포스트 수정 (본인만)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # 필드 업데이트
    if req.title:
        post.title = req.title
    if req.content:
        post.content = req.content
    # ... 나머지 필드
    
    db.commit()
    return post

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """포스트 삭제 (본인만)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # cascade 삭제
    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}

async def increment_view_count(post_id: str, db: Session):
    """viewCount 증가 (백그라운드 태스크)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.view_count += 1
        db.commit()
EOF
```

#### app/api/routes/likes.py
```bash
cat > app/api/routes/likes.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.post import Like
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/api/posts/{post_id}/like", tags=["likes"])

@router.post("")
async def toggle_like(
    post_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """좋아요 토글"""
    like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()
    
    if like:
        db.delete(like)
        liked = False
    else:
        like = Like(post_id=post_id, user_id=current_user.id)
        db.add(like)
        liked = True
    
    db.commit()
    
    # like_count 조회
    like_count = db.query(Like).filter(Like.post_id == post_id).count()
    return {"liked": liked, "like_count": like_count}
EOF
```

#### app/api/routes/comments.py
```bash
# 댓글 GET/POST/PATCH/DELETE 구현
# soft-delete 로직 포함 (replies 있으면 content = "[삭제된 댓글입니다]")
```

### 5️⃣ 테스트 작성

#### tests/api/test_posts.py
```bash
mkdir -p tests/api
cat > tests/api/test_posts.py << 'EOF'
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

@pytest.mark.asyncio
async def test_create_post(client: AsyncClient, db: Session):
    """포스트 생성 테스트"""
    # ... 테스트 코드

@pytest.mark.asyncio
async def test_get_posts(client: AsyncClient):
    """피드 조회 테스트"""
    # ... 테스트 코드
EOF
```

### 6️⃣ 검증

```bash
# 라우터 등록
# app/main.py에 추가:
# app.include_router(posts.router)
# app.include_router(likes.router)
# app.include_router(comments.router)

uvicorn app.main:app --reload
# Swagger UI에서 엔드포인트 확인
```

### 7️⃣ 체크
TODO.md에서 POST-1~POST-13을 순서대로 `[x]`로 변경합니다.

### 8️⃣ 리포트
```
✅ [완료] Phase 3: Post API (POST-1~POST-13)
  - Pydantic 스키마 작성 (Post, Comment, Like)
  - ORM 모델 작성 (Post, Tag, PostTag, Comment, Like, Series)
  - GET /api/posts (recent/trending, 커서 페이지네이션)
  - POST /api/posts (포스트 생성, slug 자동 생성)
  - GET /api/posts/{post_id} (포스트 상세, viewCount 증가)
  - PATCH /api/posts/{post_id} (수정, 본인 확인)
  - DELETE /api/posts/{post_id} (삭제)
  - POST /api/posts/{post_id}/like (좋아요 토글)
  - GET/POST /api/posts/{post_id}/comments (댓글 CRUD)
  - Soft-delete 로직 (대댓글 있으면 보존)
  - 통합 테스트 완료

➡️ [다음] USER-1: 기타 API 구현 시작
           실행: /phase4-api
```

---

## 완료 후

Phase 3 완료 = **Post API 완성** ✅

다음: `/phase4-api` 실행 → User, Series, Tag, Upload, Search API
