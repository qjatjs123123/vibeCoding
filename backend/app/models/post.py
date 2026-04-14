from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base


# Association table for Post and Tag
post_tag = Table(
    "post_tag",
    Base.metadata,
    Column("post_id", UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE")),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE")),
)


class Post(Base):
    """포스트 모델"""

    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)
    published = Column(Boolean, default=False, index=True)
    published_at = Column(DateTime, nullable=True, index=True)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", backref="posts")
    tags = relationship("Tag", secondary=post_tag, backref="posts")
    comments = relationship("Comment", backref="post", cascade="all, delete-orphan")
    likes = relationship("Like", backref="post", cascade="all, delete-orphan")
    series_items = relationship("PostSeries", backref="post", cascade="all, delete-orphan")


class Like(Base):
    """좋아요 모델"""

    __tablename__ = "likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="likes")

    __table_args__ = (
        # 한 사용자가 같은 포스트에 여러 번 좋아요할 수 없음
        __import__("sqlalchemy").UniqueConstraint("post_id", "user_id", name="uq_post_user_like"),
    )
