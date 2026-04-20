from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SeriesResponse(BaseModel):
    """시리즈 응답"""
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    post_count: int = 0

    class Config:
        from_attributes = True


class CreateSeriesRequest(BaseModel):
    """시리즈 생성 요청"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class UpdateSeriesRequest(BaseModel):
    """시리즈 수정 요청"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class SeriesDetailResponse(BaseModel):
    """시리즈 상세 응답 (포스트 포함)"""
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    post_count: int = 0
    posts: list = Field(default_factory=list)

    class Config:
        from_attributes = True
