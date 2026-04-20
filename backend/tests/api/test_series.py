import pytest
from fastapi.testclient import TestClient
import uuid
from sqlalchemy.orm import Session

from app.models.series import Series


def test_get_user_series_empty(client: TestClient, test_user):
    """사용자의 시리즈 목록 조회 (빈 목록)"""
    response = client.get(f"/api/users/{test_user.username}/series")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_user_series(
    client: TestClient,
    db: Session,
    test_user,
):
    """사용자의 시리즈 목록 조회"""
    # 시리즈 생성
    series = Series(
        id=uuid.uuid4(),
        author_id=test_user.id,
        name="Test Series",
        description="Test series description",
    )
    db.add(series)
    db.commit()

    response = client.get(f"/api/users/{test_user.username}/series")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Series"
    assert data[0]["description"] == "Test series description"
    assert "post_count" in data[0]


def test_create_series(client: TestClient, test_user_token: str):
    """시리즈 생성 테스트"""
    payload = {
        "name": "New Series",
        "description": "New series description",
    }

    response = client.post(
        "/api/series",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Series"
    assert data["description"] == "New series description"
    assert "id" in data


def test_create_series_unauthorized(client: TestClient):
    """인증 없이 시리즈 생성 시도 (실패 테스트)"""
    payload = {"name": "Unauthorized Series"}

    response = client.post("/api/series", json=payload)

    assert response.status_code == 401


def test_update_series(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_user,
):
    """시리즈 수정 테스트"""
    # 시리즈 생성
    series = Series(
        id=uuid.uuid4(),
        author_id=test_user.id,
        name="Original Series",
        description="Original description",
    )
    db.add(series)
    db.commit()

    # 수정
    payload = {
        "name": "Updated Series",
        "description": "Updated description",
    }

    response = client.patch(
        f"/api/series/{series.id}",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Series"
    assert data["description"] == "Updated description"

    # DB 확인
    db.refresh(series)
    assert series.name == "Updated Series"


def test_update_series_forbidden(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_another_user,
):
    """다른 사용자의 시리즈 수정 시도 (실패 테스트)"""
    # 다른 사용자의 시리즈
    series = Series(
        id=uuid.uuid4(),
        author_id=test_another_user.id,
        name="Another User's Series",
    )
    db.add(series)
    db.commit()

    payload = {"name": "Hacked Series"}

    response = client.patch(
        f"/api/series/{series.id}",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 403


def test_delete_series(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_user,
):
    """시리즈 삭제 테스트"""
    # 시리즈 생성
    series = Series(
        id=uuid.uuid4(),
        author_id=test_user.id,
        name="Series to Delete",
    )
    db.add(series)
    db.commit()

    response = client.delete(
        f"/api/series/{series.id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    assert "message" in response.json()

    # DB 확인: 삭제되어야 함
    deleted = db.query(Series).filter(Series.id == series.id).first()
    assert deleted is None


def test_delete_series_forbidden(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_another_user,
):
    """다른 사용자의 시리즈 삭제 시도 (실패 테스트)"""
    # 다른 사용자의 시리즈
    series = Series(
        id=uuid.uuid4(),
        author_id=test_another_user.id,
        name="Another User's Series",
    )
    db.add(series)
    db.commit()

    response = client.delete(
        f"/api/series/{series.id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 403
