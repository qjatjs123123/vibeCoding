from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class TagSchema(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class AuthorSchema(BaseModel):
    id: str
    username: Optional[str]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True


class CreatePostRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    published: bool = False
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
    excerpt: Optional[str]
    cover_image: Optional[str]
    published_at: Optional[datetime]
    reading_time: int = 0
    view_count: int
    author: AuthorSchema
    tags: List[TagSchema]
    like_count: int
    comment_count: int

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total_count: int
    next_cursor: Optional[str] = None


class CommentSchema(BaseModel):
    id: str
    content: str
    author: AuthorSchema
    created_at: datetime
    updated_at: datetime
    replies: Optional[List["CommentSchema"]] = []

    class Config:
        from_attributes = True


CommentSchema.model_rebuild()
