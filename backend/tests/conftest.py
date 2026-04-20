import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
import uuid
from datetime import datetime

from app.main import app
from app.db.base import Base
from app.models.user import User
from app.models.post import Post, Like
from app.models.comment import Comment
from app.models.tag import Tag
from app.api.deps import get_db
from app.core.security import hash_password, create_access_token


# 테스트용 데이터베이스 URL (메모리 DB 사용 또는 테스트 DB)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "sqlite:///:memory:"  # 기본값: 메모리 DB
)

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in TEST_DATABASE_URL else {},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """테스트용 데이터베이스 세션"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    def override_get_db():
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db: Session):
    """FastAPI 테스트 클라이언트"""
    return TestClient(app)


@pytest.fixture
def test_user(db: Session) -> User:
    """테스트용 사용자"""
    user = User(
        id=uuid.uuid4(),
        username="testuser",
        email="test@example.com",
        password_hash=hash_password("testpass123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user: User) -> str:
    """테스트용 사용자 JWT 토큰"""
    return create_access_token({"sub": str(test_user.id)})


@pytest.fixture
def test_another_user(db: Session) -> User:
    """다른 테스트 사용자"""
    user = User(
        id=uuid.uuid4(),
        username="anotheruser",
        email="another@example.com",
        password_hash=hash_password("anotherpass123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_post(db: Session, test_user: User) -> Post:
    """테스트용 포스트"""
    post = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Test Post",
        slug="test-post-abc123",
        content="This is a test post with some content for reading time calculation.",
        excerpt="Test excerpt",
        published=True,
        published_at=datetime.utcnow(),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@pytest.fixture
def test_tag(db: Session) -> Tag:
    """테스트용 태그"""
    tag = Tag(
        id=uuid.uuid4(),
        name="test-tag",
        post_count=0,
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag
