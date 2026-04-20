from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.user import UserResponse, UserProfileResponse, UpdateUserRequest
from app.models.user import User
from app.models.post import Post
from app.api.deps import get_current_user, get_db

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/{username}", response_model=UserProfileResponse)
async def get_user_profile(
    username: str,
    db: Session = Depends(get_db),
):
    """사용자 프로필 조회"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 포스트 수 계산
    post_count = (
        db.query(func.count(Post.id))
        .filter(Post.author_id == user.id, Post.published == True)
        .scalar()
    )

    # 시리즈 수 계산
    from app.models.series import Series

    series_count = (
        db.query(func.count(Series.id))
        .filter(Series.author_id == user.id)
        .scalar()
    )

    return UserProfileResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        bio=user.bio,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        post_count=post_count or 0,
        series_count=series_count or 0,
    )


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    req: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """사용자 프로필 수정 (인증 필수)"""
    if req.bio is not None:
        current_user.bio = req.bio
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url

    db.commit()
    db.refresh(current_user)

    # 포스트 수 계산
    post_count = (
        db.query(func.count(Post.id))
        .filter(Post.author_id == current_user.id, Post.published == True)
        .scalar()
    )

    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        post_count=post_count or 0,
    )
