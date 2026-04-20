from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.models.post import Post
from app.models.user import User
from app.db.session import get_db

router = APIRouter(prefix="/api/search", tags=["search"])


class PostSearchResult(BaseModel):
    """포스트 검색 결과"""
    id: str
    title: str
    slug: str
    excerpt: Optional[str]

    class Config:
        from_attributes = True


class UserSearchResult(BaseModel):
    """사용자 검색 결과"""
    id: str
    username: Optional[str]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """검색 응답"""
    posts: list[PostSearchResult]
    users: list[UserSearchResult]


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    """포스트 및 사용자 검색"""
    # 포스트 검색: title 또는 content에서 키워드 검색
    posts = (
        db.query(Post)
        .filter(
            Post.published == True,
            (Post.title.ilike(f"%{q}%") | Post.content.ilike(f"%{q}%"))
        )
        .limit(20)
        .all()
    )

    # 사용자 검색: username에서 키워드 검색
    users = (
        db.query(User)
        .filter(User.username.ilike(f"%{q}%"))
        .limit(20)
        .all()
    )

    return SearchResponse(
        posts=[
            PostSearchResult(
                id=str(post.id),
                title=post.title,
                slug=post.slug,
                excerpt=post.excerpt,
            )
            for post in posts
        ],
        users=[
            UserSearchResult(
                id=str(user.id),
                username=user.username,
                avatar_url=user.avatar_url,
            )
            for user in users
        ],
    )
