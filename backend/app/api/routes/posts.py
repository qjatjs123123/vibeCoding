from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from datetime import datetime, timedelta
import uuid

from app.schemas.post import (
    CreatePostRequest,
    UpdatePostRequest,
    PostResponse,
    PostListResponse,
    AuthorSchema,
    TagSchema,
)
from app.models.post import Post, Like
from app.models.tag import Tag
from app.models.user import User
from app.api.deps import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.utils.slug import generate_slug
from app.utils.trending import calc_trending_score
from app.utils.response import calculate_reading_time

router = APIRouter(prefix="/api/posts", tags=["posts"])


def format_post_response(post: Post) -> PostResponse:
    """Post 모델을 PostResponse로 변환"""
    return PostResponse(
        id=str(post.id),
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        cover_image=post.cover_image,
        published_at=post.published_at,
        reading_time=calculate_reading_time(post.content),
        view_count=post.view_count,
        author=AuthorSchema(
            username=post.author.username,
            avatar_url=post.author.avatar_url,
        ),
        tags=[TagSchema(name=tag.name) for tag in post.tags],
        like_count=post.like_count,
        comment_count=post.comment_count,
    )


async def increment_view_count(post_id: str, db: Session):
    """viewCount 증가 (백그라운드 태스크)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.view_count = (post.view_count or 0) + 1
        db.commit()


@router.get("", response_model=PostListResponse)
async def get_posts(
    feed: str = "recent",
    tag: str = None,
    limit: int = 12,
    cursor: str = None,
    period: str = "week",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """피드 조회 (recent, trending, 또는 tag별)"""
    query = db.query(Post).filter(Post.published == True)

    # 태그 필터링
    if tag:
        from sqlalchemy import join
        from app.models.post import post_tag
        query = query.join(post_tag).join(Tag).filter(Tag.name == tag)

    if feed == "trending":
        # 트렌딩: 점수순 정렬
        # period 필터링 (week, month, year)
        period_days = {"week": 7, "month": 30, "year": 365}.get(period, 7)
        cutoff_date = datetime.utcnow() - timedelta(days=period_days)
        query = query.filter(Post.published_at >= cutoff_date)

        # 트렌딩 점수로 정렬 (SQL에서 계산)
        from sqlalchemy import desc

        score_expr = (
            (Post.like_count * 2 + Post.view_count * 0.5 + Post.comment_count)
            / func.pow(
                (func.extract("epoch", func.now() - Post.published_at) / 3600) + 2,
                1.5,
            )
        )
        posts = (
            query.order_by(desc(score_expr)).limit(limit).all()
        )
        post_responses = [format_post_response(post) for post in posts]
        return PostListResponse(posts=post_responses, total_count=len(post_responses), next_cursor=None)
    else:
        # recent: 커서 기반 페이지네이션
        if cursor:
            cursor_parts = cursor.split(",")
            if len(cursor_parts) == 2:
                cursor_date_str, cursor_id = cursor_parts
                cursor_date = datetime.fromisoformat(cursor_date_str)
                query = query.filter(
                    or_(
                        Post.published_at < cursor_date,
                        and_(
                            Post.published_at == cursor_date,
                            Post.id < cursor_id,
                        ),
                    )
                )

        posts = (
            query.order_by(Post.published_at.desc(), Post.id.desc())
            .limit(limit + 1)
            .all()
        )

        # next_cursor 계산
        next_cursor = None
        if len(posts) > limit:
            last_post = posts[limit]
            next_cursor = f"{last_post.published_at.isoformat()},{last_post.id}"
            posts = posts[:limit]

        post_responses = [format_post_response(post) for post in posts]
        return PostListResponse(
            posts=post_responses, total_count=len(post_responses), next_cursor=next_cursor
        )


@router.post("", response_model=PostResponse, status_code=201)
async def create_post(
    req: CreatePostRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """포스트 생성"""
    slug = generate_slug(req.title)

    post = Post(
        id=uuid.uuid4(),
        title=req.title,
        slug=slug,
        content=req.content,
        excerpt=req.excerpt or req.content[:200],
        cover_image=req.cover_image,
        published=req.published,
        published_at=datetime.utcnow() if req.published else None,
        view_count=0,
        like_count=0,
        comment_count=0,
        author_id=current_user.id,
    )

    # 태그 관계 설정
    for tag_name in req.tags:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(id=uuid.uuid4(), name=tag_name, post_count=1)
        else:
            tag.post_count = (tag.post_count or 0) + 1
        post.tags.append(tag)

    db.add(post)
    db.commit()
    db.refresh(post)

    return format_post_response(post)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """포스트 상세 조회"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # viewCount 증가 (백그라운드 태스크)
    background_tasks.add_task(increment_view_count, post_id, db)

    return format_post_response(post)


@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    req: UpdatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """포스트 수정 (본인만)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # 필드 업데이트
    if req.title is not None:
        post.title = req.title
    if req.content is not None:
        post.content = req.content
    if req.excerpt is not None:
        post.excerpt = req.excerpt
    if req.cover_image is not None:
        post.cover_image = req.cover_image
    if req.published is not None:
        post.published = req.published
        if req.published and not post.published_at:
            post.published_at = datetime.utcnow()

    # 태그 업데이트
    if req.tags is not None:
        post.tags.clear()
        for tag_name in req.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(id=uuid.uuid4(), name=tag_name, post_count=1)
            post.tags.append(tag)

    db.commit()
    db.refresh(post)
    return format_post_response(post)


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """포스트 삭제 (본인만, cascade 삭제)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}
