from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    """사용자 프로필 응답"""
    id: str
    username: Optional[str]
    email: str
    bio: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    post_count: int = 0

    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    """사용자 프로필 수정 요청"""
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    """사용자 프로필 상세 응답"""
    id: str
    username: Optional[str]
    email: str
    bio: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    post_count: int = 0
    series_count: int = 0

    class Config:
        from_attributes = True
