import pytest
from fastapi.testclient import TestClient
import uuid
from sqlalchemy.orm import Session

from app.models.post import Post


def test_get_user_profile(client: TestClient, db: Session, test_user):
    """사용자 프로필 조회 테스트"""
    # 포스트 추가
    post = Post(
        id=uuid.uuid4(),
        author_id=test_user.id,
        title="User's Post",
        slug="users-post-xyz",
        content="This is a user post.",
        published=True,
    )
    db.add(post)
    db.commit()

    response = client.get(f"/api/users/{test_user.username}")

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email
    assert data["post_count"] == 1
    assert "avatar_url" in data
    assert "bio" in data


def test_get_user_profile_not_found(client: TestClient):
    """존재하지 않는 사용자 프로필 조회 (실패 테스트)"""
    response = client.get("/api/users/nonexistent")

    assert response.status_code == 404


def test_update_user_profile(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_user,
):
    """사용자 프로필 수정 테스트"""
    payload = {
        "bio": "Updated bio",
        "avatar_url": "https://example.com/avatar.jpg",
    }

    response = client.patch(
        "/api/users/me",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["bio"] == "Updated bio"
    assert data["avatar_url"] == "https://example.com/avatar.jpg"

    # DB 확인
    db.refresh(test_user)
    assert test_user.bio == "Updated bio"
    assert test_user.avatar_url == "https://example.com/avatar.jpg"


def test_update_user_profile_unauthorized(client: TestClient):
    """인증 없이 프로필 수정 시도 (실패 테스트)"""
    payload = {"bio": "Hacked bio"}

    response = client.patch("/api/users/me", json=payload)

    assert response.status_code == 401


def test_update_user_profile_partial(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_user,
):
    """프로필 부분 수정 테스트"""
    payload = {"bio": "Only bio updated"}

    response = client.patch(
        "/api/users/me",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["bio"] == "Only bio updated"
    assert data["avatar_url"] is None  # 변경되지 않았으므로 None
