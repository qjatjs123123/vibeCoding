import pytest
from fastapi.testclient import TestClient
import uuid
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.post import Post
from app.models.tag import Tag


def test_e2e_post_creation_to_feed(
    client: TestClient,
    db: Session,
    test_user_token: str,
):
    """E2E-1: 포스트 작성 → 발행 → 피드 노출"""
    # 1. 포스트 생성
    payload = {
        "title": "My First Post",
        "content": "This is my first post with enough content to test the entire flow properly.",
        "published": True,
        "tags": ["python", "blog"],
    }

    create_response = client.post(
        "/api/posts",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert create_response.status_code == 201
    created_post = create_response.json()
    post_id = created_post["id"]

    # 2. 피드에서 포스트 확인
    feed_response = client.get("/api/posts?feed=recent&limit=10")
    assert feed_response.status_code == 200
    feed_data = feed_response.json()

    # 방금 생성한 포스트가 피드에 있는지 확인
    post_ids = [p["id"] for p in feed_data["posts"]]
    assert post_id in post_ids

    # 3. 상세 조회
    detail_response = client.get(f"/api/posts/{post_id}")
    assert detail_response.status_code == 200
    detail_data = detail_response.json()
    assert detail_data["title"] == "My First Post"
    assert len(detail_data["tags"]) == 2


def test_e2e_draft_to_published(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_user,
):
    """E2E-2: 임시저장(draft) → 이어쓰기 → 발행"""
    # 1. 임시저장 포스트 생성
    payload = {
        "title": "Draft Post",
        "content": "Initial draft content that will be expanded.",
        "published": False,
    }

    create_response = client.post(
        "/api/posts",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert create_response.status_code == 201
    draft_post = create_response.json()
    post_id = draft_post["id"]

    # 2. 임시저장 상태 확인 (피드에 미노출)
    feed_response = client.get("/api/posts?feed=recent")
    post_ids = [p["id"] for p in feed_response.json()["posts"]]
    assert post_id not in post_ids

    # 3. 포스트 수정 (내용 추가)
    update_payload = {
        "content": "Initial draft content that will be expanded. Much better content now!"
    }
    update_response = client.patch(
        f"/api/posts/{post_id}",
        json=update_payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert update_response.status_code == 200

    # 4. 발행
    publish_payload = {"published": True}
    publish_response = client.patch(
        f"/api/posts/{post_id}",
        json=publish_payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert publish_response.status_code == 200
    published = publish_response.json()
    assert published["published"] == True
    assert published["published_at"] is not None

    # 5. 피드에 노출 확인
    feed_response = client.get("/api/posts?feed=recent")
    post_ids = [p["id"] for p in feed_response.json()["posts"]]
    assert post_id in post_ids


def test_e2e_likes_impact_trending(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_another_user,
):
    """E2E-3: 좋아요 추가 → 트렌딩 점수 반영"""
    # 1. 포스트 생성
    payload = {
        "title": "Trending Post",
        "content": "This post will become trending with likes and engagement.",
        "published": True,
    }

    create_response = client.post(
        "/api/posts",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    post_id = create_response.json()["id"]

    # 2. 좋아요 추가 (여러 사용자)
    from app.core.security import create_access_token

    another_token = create_access_token({"sub": str(test_another_user.id)})

    like_response1 = client.post(
        f"/api/posts/{post_id}/like",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert like_response1.status_code == 200
    assert like_response1.json()["like_count"] == 1

    like_response2 = client.post(
        f"/api/posts/{post_id}/like",
        headers={"Authorization": f"Bearer {another_token}"},
    )
    assert like_response2.status_code == 200
    assert like_response2.json()["like_count"] == 2

    # 3. 트렌딩 피드 확인
    trending_response = client.get("/api/posts?feed=trending&period=week")
    trending_data = trending_response.json()

    # 좋아요가 많은 포스트가 트렌딩에 나타나야 함
    post_ids = [p["id"] for p in trending_data["posts"]]
    assert post_id in post_ids


def test_e2e_comments_with_replies_and_soft_delete(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_another_user,
    test_post,
):
    """E2E-4: 댓글 작성 → 대댓글 → soft-delete"""
    from app.core.security import create_access_token

    another_token = create_access_token({"sub": str(test_another_user.id)})

    # 1. 댓글 작성
    comment_payload = {"content": "Great post!"}
    comment_response = client.post(
        f"/api/posts/{test_post.id}/comments",
        json=comment_payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert comment_response.status_code == 201
    comment_id = comment_response.json()["id"]

    # 2. 대댓글 작성
    reply_payload = {
        "content": "Thanks for the feedback!",
        "parent_id": comment_id,
    }
    reply_response = client.post(
        f"/api/posts/{test_post.id}/comments",
        json=reply_payload,
        headers={"Authorization": f"Bearer {another_token}"},
    )
    assert reply_response.status_code == 201

    # 3. 댓글 soft-delete (대댓글이 있으므로)
    delete_response = client.delete(
        f"/api/posts/{test_post.id}/comments/{comment_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert delete_response.status_code == 200

    # 4. soft-delete 확인
    comments_response = client.get(f"/api/posts/{test_post.id}/comments")
    comments = comments_response.json()
    parent_comment = next((c for c in comments if c["id"] == comment_id), None)
    assert parent_comment is not None
    assert parent_comment["content"] == "[삭제된 댓글입니다]"


def test_e2e_tags_popularity(
    client: TestClient,
    db: Session,
    test_user_token: str,
):
    """E2E-5: 태그 등록 → 인기도 반영"""
    # 1. 여러 포스트에 태그 추가
    for i in range(3):
        payload = {
            "title": f"Post {i+1}",
            "content": f"Content for post {i+1}",
            "published": True,
            "tags": ["python"],
        }
        client.post(
            "/api/posts",
            json=payload,
            headers={"Authorization": f"Bearer {test_user_token}"},
        )

    # 2. 태그 인기도 확인
    tags_response = client.get("/api/tags?sort=popular&limit=10")
    assert tags_response.status_code == 200
    tags = tags_response.json()

    python_tag = next((t for t in tags if t["name"] == "python"), None)
    assert python_tag is not None
    assert python_tag["post_count"] == 3


def test_e2e_auth_security(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_another_user,
):
    """E2E-6: 인증 보안 및 권한 확인"""
    # 1. 인증 없는 요청
    response = client.post("/api/posts", json={"title": "Unauthorized"})
    assert response.status_code == 401

    # 2. 다른 사용자 리소스 수정 시도
    post = Post(
        id=uuid.uuid4(),
        author_id=test_another_user.id,
        title="Another User's Post",
        slug="another-post-xyz",
        content="This belongs to another user",
        published=True,
    )
    db.add(post)
    db.commit()

    update_payload = {"title": "Hacked Title"}
    response = client.patch(
        f"/api/posts/{post.id}",
        json=update_payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 403

    # 3. 프로필 수정 (현재 사용자만 가능)
    update_profile = {"bio": "My bio"}
    response = client.patch(
        "/api/users/me",
        json=update_profile,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200

    # 4. 타인 프로필 수정 시도 (불가능 - /api/users/me는 현재 사용자만)
    # 직접 다른 사용자 수정 엔드포인트가 없으므로 이 부분은 생략
