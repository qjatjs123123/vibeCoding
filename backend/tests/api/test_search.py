import pytest
from fastapi.testclient import TestClient
import uuid
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.user import User


def test_search_empty_query(client: TestClient):
    """빈 검색 (실패 테스트)"""
    response = client.get("/api/search?q=")

    assert response.status_code == 422  # Validation error


def test_search_no_results(client: TestClient):
    """검색 결과 없음"""
    response = client.get("/api/search?q=nonexistent")

    assert response.status_code == 200
    data = response.json()
    assert len(data["posts"]) == 0
    assert len(data["users"]) == 0


def test_search_posts_by_title(
    client: TestClient,
    db: Session,
    test_user,
):
    """포스트 제목으로 검색"""
    # 포스트 생성
    post = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Python FastAPI Tutorial",
        slug="python-fastapi-tutorial-abc",
        content="Learn FastAPI basics",
        published=True,
    )
    db.add(post)
    db.commit()

    response = client.get("/api/search?q=FastAPI")

    assert response.status_code == 200
    data = response.json()
    assert len(data["posts"]) == 1
    assert data["posts"][0]["title"] == "Python FastAPI Tutorial"


def test_search_posts_by_content(
    client: TestClient,
    db: Session,
    test_user,
):
    """포스트 내용으로 검색"""
    post = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Django Guide",
        slug="django-guide-xyz",
        content="This is a comprehensive guide to Django framework and databases",
        published=True,
    )
    db.add(post)
    db.commit()

    response = client.get("/api/search?q=databases")

    assert response.status_code == 200
    data = response.json()
    assert len(data["posts"]) == 1
    assert data["posts"][0]["title"] == "Django Guide"


def test_search_unpublished_excluded(
    client: TestClient,
    db: Session,
    test_user,
):
    """미발행 포스트는 검색에서 제외"""
    # 발행된 포스트
    post1 = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Published Post",
        slug="published-post-abc",
        content="Python tips",
        published=True,
    )

    # 미발행 포스트
    post2 = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Draft Post",
        slug="draft-post-xyz",
        content="Python advanced tips",
        published=False,
    )

    db.add_all([post1, post2])
    db.commit()

    response = client.get("/api/search?q=Python")

    assert response.status_code == 200
    data = response.json()
    # "Python advanced tips"는 미발행이므로 포함되지 않아야 함
    assert len(data["posts"]) == 1
    assert data["posts"][0]["title"] == "Published Post"


def test_search_users_by_username(
    client: TestClient,
    db: Session,
):
    """사용자 username으로 검색"""
    # 추가 사용자 생성
    user = User(
        id=uuid.uuid4(),
        username="johndoe",
        email="john@example.com",
    )
    db.add(user)
    db.commit()

    response = client.get("/api/search?q=john")

    assert response.status_code == 200
    data = response.json()
    assert len(data["users"]) == 1
    assert data["users"][0]["username"] == "johndoe"


def test_search_case_insensitive(
    client: TestClient,
    db: Session,
    test_user,
):
    """대소문자 구분 없는 검색"""
    post = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Python Programming",
        slug="python-programming-abc",
        content="Learn Python",
        published=True,
    )
    db.add(post)
    db.commit()

    # 소문자로 검색
    response = client.get("/api/search?q=python")

    assert response.status_code == 200
    data = response.json()
    assert len(data["posts"]) == 1


def test_search_combined_results(
    client: TestClient,
    db: Session,
    test_user,
):
    """포스트와 사용자 함께 검색"""
    # 포스트 생성
    post = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Web Development",
        slug="web-development-abc",
        content="Learn web dev",
        published=True,
    )

    # 사용자 생성
    user = User(
        id=uuid.uuid4(),
        username="webdev",
        email="web@example.com",
    )

    db.add_all([post, user])
    db.commit()

    response = client.get("/api/search?q=web")

    assert response.status_code == 200
    data = response.json()
    assert len(data["posts"]) == 1
    assert len(data["users"]) == 1
