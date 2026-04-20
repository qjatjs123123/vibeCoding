import pytest
from fastapi.testclient import TestClient
import uuid
from sqlalchemy.orm import Session

from app.models.tag import Tag


def test_get_tags_empty(client: TestClient):
    """태그 목록 조회 (빈 목록)"""
    response = client.get("/api/tags")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_tags_popular_sort(
    client: TestClient,
    db: Session,
):
    """인기순 태그 정렬 테스트"""
    # 여러 태그 생성
    tag1 = Tag(id=uuid.uuid4(), name="popular-tag", post_count=50)
    tag2 = Tag(id=uuid.uuid4(), name="medium-tag", post_count=20)
    tag3 = Tag(id=uuid.uuid4(), name="less-popular-tag", post_count=5)

    db.add_all([tag1, tag2, tag3])
    db.commit()

    response = client.get("/api/tags?sort=popular")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    # 인기순 확인 (post_count DESC)
    assert data[0]["name"] == "popular-tag"
    assert data[0]["post_count"] == 50
    assert data[1]["name"] == "medium-tag"
    assert data[1]["post_count"] == 20
    assert data[2]["name"] == "less-popular-tag"
    assert data[2]["post_count"] == 5


def test_get_tags_with_limit(
    client: TestClient,
    db: Session,
):
    """태그 제한 개수 테스트"""
    # 5개 태그 생성
    for i in range(5):
        tag = Tag(id=uuid.uuid4(), name=f"tag-{i}", post_count=i + 1)
        db.add(tag)
    db.commit()

    response = client.get("/api/tags?limit=3")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3


def test_get_tags_default_sort(
    client: TestClient,
    db: Session,
):
    """기본 정렬 (인기순) 테스트"""
    tag1 = Tag(id=uuid.uuid4(), name="tag-a", post_count=10)
    tag2 = Tag(id=uuid.uuid4(), name="tag-b", post_count=30)

    db.add_all([tag1, tag2])
    db.commit()

    # sort 파라미터 없이 기본값 사용
    response = client.get("/api/tags")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    # 인기순 확인
    assert data[0]["post_count"] == 30
    assert data[1]["post_count"] == 10


def test_get_tags_response_format(
    client: TestClient,
    db: Session,
):
    """태그 응답 형식 테스트"""
    tag = Tag(id=uuid.uuid4(), name="test-tag", post_count=15)
    db.add(tag)
    db.commit()

    response = client.get("/api/tags")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    tag_data = data[0]
    assert "name" in tag_data
    assert "post_count" in tag_data
    assert tag_data["name"] == "test-tag"
    assert tag_data["post_count"] == 15
