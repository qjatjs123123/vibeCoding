from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.models.post import Post, Like
from app.models.user import User
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/api/posts", tags=["likes"])


@router.post("/{post_id}/like")
async def toggle_like(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """좋아요 토글"""
    # 포스트 존재 확인
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 좋아요 상태 확인
    like = (
        db.query(Like)
        .filter(Like.post_id == post_id, Like.user_id == current_user.id)
        .first()
    )

    if like:
        # 좋아요 취소
        db.delete(like)
        post.like_count = max(0, (post.like_count or 0) - 1)
        liked = False
    else:
        # 좋아요 추가
        like = Like(id=uuid.uuid4(), post_id=post_id, user_id=current_user.id)
        db.add(like)
        post.like_count = (post.like_count or 0) + 1
        liked = True

    db.commit()

    return {"liked": liked, "like_count": post.like_count}
