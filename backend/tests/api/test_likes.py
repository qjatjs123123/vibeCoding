import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.post import Like


def test_toggle_like_add(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
):
    """좋아요 추가 테스트"""
    response = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["liked"] == True
    assert data["like_count"] == 1

    # DB 확인
    db.refresh(test_post)
    assert test_post.like_count == 1
    like = db.query(Like).filter(Like.post_id == test_post.id).first()
    assert like is not None


def test_toggle_like_remove(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_user,
):
    """좋아요 제거 테스트"""
    # 먼저 좋아요 추가
    like = Like(post_id=test_post.id, user_id=test_user.id)
    db.add(like)
    test_post.like_count = 1
    db.commit()

    # 좋아요 제거
    response = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["liked"] == False
    assert data["like_count"] == 0

    # DB 확인
    db.refresh(test_post)
    assert test_post.like_count == 0
    like = db.query(Like).filter(Like.post_id == test_post.id).first()
    assert like is None


def test_like_toggle_multiple_times(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
):
    """좋아요 토글 반복 테스트"""
    # 좋아요 추가
    response1 = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response1.json()["liked"] == True
    assert response1.json()["like_count"] == 1

    # 좋아요 제거
    response2 = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response2.json()["liked"] == False
    assert response2.json()["like_count"] == 0

    # 좋아요 다시 추가
    response3 = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response3.json()["liked"] == True
    assert response3.json()["like_count"] == 1


def test_like_unauthorized(client: TestClient, test_post):
    """인증 없이 좋아요 시도 (실패 테스트)"""
    response = client.post(f"/api/posts/{test_post.id}/like")

    assert response.status_code == 401


def test_like_post_not_found(client: TestClient, test_user_token: str):
    """존재하지 않는 포스트에 좋아요 시도"""
    import uuid

    fake_id = uuid.uuid4()
    response = client.post(
        f"/api/posts/{fake_id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 404


def test_like_duplicate_prevention(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_user,
):
    """중복 좋아요 방지 테스트 (Unique constraint)"""
    # 첫 번째 좋아요
    response1 = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response1.status_code == 200
    assert response1.json()["like_count"] == 1

    # 다시 좋아요를 시도하면 제거되어야 함 (토글)
    response2 = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response2.status_code == 200
    assert response2.json()["liked"] == False
    assert response2.json()["like_count"] == 0

    # 중복이 아닌 제거이므로 같은 좋아요가 DB에 없어야 함
    db.refresh(test_post)
    likes = db.query(Like).filter(Like.post_id == test_post.id).all()
    assert len(likes) == 0


def test_multiple_users_like(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_another_user,
    test_post,
):
    """여러 사용자의 좋아요 테스트"""
    # 첫 번째 사용자 좋아요
    response1 = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response1.json()["like_count"] == 1

    # 두 번째 사용자 좋아요 (토큰 생성 필요)
    from app.core.security import create_access_token

    another_token = create_access_token({"sub": str(test_another_user.id)})
    response2 = client.post(
        f"/api/posts/{test_post.id}/like",
        headers={"Authorization": f"Bearer {another_token}"},
    )
    assert response2.json()["like_count"] == 2

    # DB 확인
    db.refresh(test_post)
    assert test_post.like_count == 2
