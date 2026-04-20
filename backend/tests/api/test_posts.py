import pytest
from fastapi.testclient import TestClient
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.tag import Tag


def test_get_recent_posts(client: TestClient, db: Session, test_user, test_post):
    """최신 피드 조회 테스트"""
    response = client.get("/api/posts?feed=recent&limit=10")

    assert response.status_code == 200
    data = response.json()
    assert "posts" in data
    assert "total_count" in data
    assert "next_cursor" in data
    assert len(data["posts"]) > 0

    # 첫 번째 포스트 검증
    post = data["posts"][0]
    assert post["id"] == str(test_post.id)
    assert post["title"] == "Test Post"
    assert post["slug"] == "test-post-abc123"
    assert "reading_time" in post
    assert post["reading_time"] >= 1
    assert "author" in post
    assert post["author"]["username"] == "testuser"
    assert "tags" in post


def test_get_trending_posts(client: TestClient, db: Session, test_user, test_post):
    """트렌딩 피드 조회 테스트"""
    # 좋아요 추가
    test_post.like_count = 5
    test_post.comment_count = 2
    test_post.view_count = 20
    db.commit()

    response = client.get("/api/posts?feed=trending&period=week")

    assert response.status_code == 200
    data = response.json()
    assert len(data["posts"]) > 0

    post = data["posts"][0]
    assert post["id"] == str(test_post.id)


def test_get_posts_by_tag(client: TestClient, db: Session, test_user, test_post, test_tag):
    """태그별 피드 조회 테스트"""
    # 태그를 포스트에 추가
    test_post.tags.append(test_tag)
    db.commit()

    response = client.get("/api/posts?feed=recent&tag=test-tag")

    assert response.status_code == 200
    data = response.json()
    assert len(data["posts"]) == 1
    assert data["posts"][0]["id"] == str(test_post.id)


def test_create_post(client: TestClient, test_user_token: str):
    """포스트 생성 테스트"""
    payload = {
        "title": "New Post",
        "content": "This is a test post content with enough words to calculate reading time properly.",
        "excerpt": "Test excerpt",
        "published": True,
        "tags": ["python", "fastapi"],
    }

    response = client.post(
        "/api/posts",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Post"
    assert data["slug"].startswith("new-post")
    assert data["published"] == True
    assert len(data["tags"]) == 2
    assert data["reading_time"] >= 1


def test_create_post_unauthorized(client: TestClient):
    """인증 없이 포스트 생성 시도 (실패 테스트)"""
    payload = {
        "title": "New Post",
        "content": "Test content",
        "published": True,
    }

    response = client.post("/api/posts", json=payload)

    assert response.status_code == 401


def test_get_post_detail(client: TestClient, test_post):
    """포스트 상세 조회 테스트"""
    response = client.get(f"/api/posts/{test_post.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_post.id)
    assert data["title"] == "Test Post"
    assert data["view_count"] >= 0  # 백그라운드 태스크로 증가할 수 있음


def test_get_post_not_found(client: TestClient):
    """존재하지 않는 포스트 조회 (실패 테스트)"""
    fake_id = uuid.uuid4()
    response = client.get(f"/api/posts/{fake_id}")

    assert response.status_code == 404


def test_update_post(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post: Post,
    test_user,
):
    """포스트 수정 테스트"""
    test_post.author_id = test_user.id
    db.commit()

    payload = {
        "title": "Updated Title",
        "content": "Updated content with more words for proper reading time calculation.",
        "tags": ["updated-tag"],
    }

    response = client.patch(
        f"/api/posts/{test_post.id}",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["content"] == payload["content"]
    assert len(data["tags"]) == 1
    assert data["tags"][0]["name"] == "updated-tag"


def test_update_post_forbidden(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post: Post,
    test_another_user,
):
    """다른 사용자의 포스트 수정 시도 (실패 테스트)"""
    test_post.author_id = test_another_user.id
    db.commit()

    payload = {"title": "Hacked Title"}

    response = client.patch(
        f"/api/posts/{test_post.id}",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 403


def test_delete_post(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post: Post,
    test_user,
):
    """포스트 삭제 테스트"""
    test_post.author_id = test_user.id
    db.commit()

    response = client.delete(
        f"/api/posts/{test_post.id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    assert "message" in response.json()

    # 삭제 확인
    get_response = client.get(f"/api/posts/{test_post.id}")
    assert get_response.status_code == 404


def test_delete_post_forbidden(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post: Post,
    test_another_user,
):
    """다른 사용자의 포스트 삭제 시도 (실패 테스트)"""
    test_post.author_id = test_another_user.id
    db.commit()

    response = client.delete(
        f"/api/posts/{test_post.id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 403


def test_publish_draft_post(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_user,
):
    """임시저장 포스트 발행 테스트"""
    # 임시저장 포스트 생성
    post = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="Draft Post",
        slug="draft-post-xyz",
        content="Draft content for testing.",
        published=False,
    )
    db.add(post)
    db.commit()

    # 발행 업데이트
    payload = {"published": True}
    response = client.patch(
        f"/api/posts/{post.id}",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["published"] == True
    assert data["published_at"] is not None
