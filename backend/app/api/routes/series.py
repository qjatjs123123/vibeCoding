from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from app.schemas.series import (
    SeriesResponse,
    CreateSeriesRequest,
    UpdateSeriesRequest,
    SeriesDetailResponse,
)
from app.models.series import Series, PostSeries
from app.models.user import User
from app.models.post import Post
from app.api.deps import get_current_user, get_current_user_optional, get_db

router = APIRouter(prefix="/api", tags=["series"])


@router.get("/users/{username}/series")
async def get_user_series(
    username: str,
    db: Session = Depends(get_db),
):
    """사용자의 시리즈 목록 조회"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    series_list = (
        db.query(Series)
        .filter(Series.author_id == user.id)
        .order_by(Series.created_at.desc())
        .all()
    )

    result = []
    for s in series_list:
        post_count = (
            db.query(func.count(PostSeries.id))
            .filter(PostSeries.series_id == s.id)
            .scalar()
        )
        result.append(
            SeriesResponse(
                id=str(s.id),
                name=s.name,
                description=s.description,
                created_at=s.created_at,
                post_count=post_count or 0,
            )
        )

    return result


@router.post("/series", response_model=SeriesResponse, status_code=201)
async def create_series(
    req: CreateSeriesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """시리즈 생성 (인증 필수)"""
    series = Series(
        id=uuid.uuid4(),
        author_id=current_user.id,
        name=req.name,
        description=req.description,
    )

    db.add(series)
    db.commit()
    db.refresh(series)

    return SeriesResponse(
        id=str(series.id),
        name=series.name,
        description=series.description,
        created_at=series.created_at,
        post_count=0,
    )


@router.patch("/series/{series_id}", response_model=SeriesResponse)
async def update_series(
    series_id: str,
    req: UpdateSeriesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """시리즈 수정 (본인만)"""
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")

    if series.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    if req.name is not None:
        series.name = req.name
    if req.description is not None:
        series.description = req.description

    db.commit()
    db.refresh(series)

    # 포스트 수 계산
    post_count = (
        db.query(func.count(PostSeries.id))
        .filter(PostSeries.series_id == series.id)
        .scalar()
    )

    return SeriesResponse(
        id=str(series.id),
        name=series.name,
        description=series.description,
        created_at=series.created_at,
        post_count=post_count or 0,
    )


@router.delete("/series/{series_id}")
async def delete_series(
    series_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """시리즈 삭제 (본인만)"""
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")

    if series.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(series)
    db.commit()

    return {"message": "Series deleted"}
