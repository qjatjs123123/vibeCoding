from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.models.tag import Tag
from app.db.session import get_db

router = APIRouter(prefix="/api/tags", tags=["tags"])


class TagResponse(BaseModel):
    """태그 응답"""
    name: str
    post_count: int

    class Config:
        from_attributes = True


@router.get("", response_model=list[TagResponse])
async def get_tags(
    sort: str = "popular",
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """태그 목록 조회 (인기순)"""
    if sort == "popular":
        tags = (
            db.query(Tag)
            .order_by(Tag.post_count.desc())
            .limit(limit)
            .all()
        )
    else:
        # 기본값: 인기순
        tags = (
            db.query(Tag)
            .order_by(Tag.post_count.desc())
            .limit(limit)
            .all()
        )

    return [
        TagResponse(name=tag.name, post_count=tag.post_count)
        for tag in tags
    ]
