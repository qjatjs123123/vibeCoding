from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.base import Base


class Tag(Base):
    """태그 모델"""

    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False, index=True)
    post_count = Column(Integer, default=0)  # 태그가 붙은 포스트 수 (캐시)
