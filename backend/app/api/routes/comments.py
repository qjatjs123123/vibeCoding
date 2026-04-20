from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid

from app.schemas.post import CommentSchema
from app.models.post import Post
from app.models.comment import Comment
from app.models.user import User
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/api/posts/{post_id}/comments", tags=["comments"])


class CreateCommentRequest(BaseModel):
    content: str
    parent_id: Optional[str] = None


class UpdateCommentRequest(BaseModel):
    content: str


@router.get("", response_model=List[CommentSchema])
async def get_comments(
    post_id: str,
    db: Session = Depends(get_db),
):
    """댓글 목록 조회 (부모 댓글만, 대댓글은 replies에 포함)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 부모 댓글만 조회 (parent_id = None)
    parent_comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id, Comment.parent_id == None)
        .order_by(Comment.created_at.desc())
        .all()
    )

    return parent_comments


@router.post("", response_model=CommentSchema, status_code=201)
async def create_comment(
    post_id: str,
    req: CreateCommentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """댓글 작성"""
    # 포스트 존재 확인
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 대댓글인 경우 부모 댓글 확인
    if req.parent_id:
        parent = db.query(Comment).filter(Comment.id == req.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    comment = Comment(
        id=uuid.uuid4(),
        post_id=post_id,
        author_id=current_user.id,
        parent_id=req.parent_id,
        content=req.content,
    )

    db.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    db.commit()
    db.refresh(comment)

    return comment


@router.patch("/{comment_id}", response_model=CommentSchema)
async def update_comment(
    post_id: str,
    comment_id: str,
    req: UpdateCommentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """댓글 수정 (본인만)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    comment.content = req.content
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}")
async def delete_comment(
    post_id: str,
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """댓글 삭제 (soft-delete: 대댓글 있으면 content 변경, 없으면 완전 삭제)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # 대댓글 확인
    replies = db.query(Comment).filter(Comment.parent_id == comment_id).all()

    if replies:
        # Soft-delete: content 변경
        comment.content = "[삭제된 댓글입니다]"
        db.commit()
        message = "Comment marked as deleted"
    else:
        # 완전 삭제
        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.comment_count = max(0, (post.comment_count or 0) - 1)

        db.delete(comment)
        db.commit()
        message = "Comment deleted"

    return {"message": message}
