import pytest
from fastapi.testclient import TestClient
import uuid
from sqlalchemy.orm import Session

from app.models.comment import Comment


def test_get_comments_empty(client: TestClient, test_post):
    """빈 댓글 목록 조회 테스트"""
    response = client.get(f"/api/posts/{test_post.id}/comments")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_create_comment(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
):
    """댓글 작성 테스트"""
    payload = {"content": "This is a test comment"}

    response = client.post(
        f"/api/posts/{test_post.id}/comments",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "This is a test comment"
    assert "id" in data
    assert "author" in data
    assert data["author"]["username"] == "testuser"
    assert "created_at" in data

    # DB 확인
    db.refresh(test_post)
    assert test_post.comment_count == 1


def test_get_comments_with_data(
    client: TestClient,
    db: Session,
    test_post,
    test_user,
):
    """댓글이 있을 때 목록 조회 테스트"""
    # 댓글 생성
    comment = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_user.id,
        content="Test comment",
    )
    db.add(comment)
    test_post.comment_count = 1
    db.commit()

    response = client.get(f"/api/posts/{test_post.id}/comments")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["content"] == "Test comment"


def test_create_reply(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_user,
):
    """대댓글 작성 테스트"""
    # 부모 댓글 생성
    parent_comment = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_user.id,
        content="Parent comment",
    )
    db.add(parent_comment)
    db.commit()

    # 대댓글 생성
    payload = {
        "content": "This is a reply",
        "parent_id": str(parent_comment.id),
    }

    response = client.post(
        f"/api/posts/{test_post.id}/comments",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "This is a reply"


def test_update_comment(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_user,
):
    """댓글 수정 테스트"""
    # 댓글 생성
    comment = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_user.id,
        content="Original comment",
    )
    db.add(comment)
    db.commit()

    # 댓글 수정
    payload = {"content": "Updated comment"}
    response = client.patch(
        f"/api/posts/{test_post.id}/comments/{comment.id}",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Updated comment"

    # DB 확인
    db.refresh(comment)
    assert comment.content == "Updated comment"


def test_update_comment_forbidden(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_another_user,
):
    """다른 사용자의 댓글 수정 시도 (실패 테스트)"""
    # 다른 사용자의 댓글 생성
    comment = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_another_user.id,
        content="Another user's comment",
    )
    db.add(comment)
    db.commit()

    # 댓글 수정 시도
    payload = {"content": "Hacked comment"}
    response = client.patch(
        f"/api/posts/{test_post.id}/comments/{comment.id}",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 403


def test_delete_comment_no_replies(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_user,
):
    """대댓글이 없는 댓글 완전 삭제 테스트"""
    # 댓글 생성
    comment = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_user.id,
        content="Comment to delete",
    )
    db.add(comment)
    test_post.comment_count = 1
    db.commit()

    # 댓글 삭제
    response = client.delete(
        f"/api/posts/{test_post.id}/comments/{comment.id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    assert "message" in response.json()

    # DB 확인: 완전 삭제되어야 함
    deleted = db.query(Comment).filter(Comment.id == comment.id).first()
    assert deleted is None

    # 포스트 댓글 수 감소 확인
    db.refresh(test_post)
    assert test_post.comment_count == 0


def test_delete_comment_with_replies_soft_delete(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_user,
    test_another_user,
):
    """대댓글이 있는 댓글 soft-delete 테스트"""
    # 부모 댓글 생성
    parent_comment = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_user.id,
        content="Parent comment",
    )
    db.add(parent_comment)
    db.commit()

    # 대댓글 생성
    reply = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_another_user.id,
        parent_id=parent_comment.id,
        content="Reply to parent",
    )
    db.add(reply)
    db.commit()

    # 부모 댓글 삭제 시도 (대댓글이 있으므로 soft-delete)
    response = client.delete(
        f"/api/posts/{test_post.id}/comments/{parent_comment.id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    assert "message" in response.json()

    # DB 확인: soft-delete되어야 함
    db.refresh(parent_comment)
    assert parent_comment.content == "[삭제된 댓글입니다]"

    # 대댓글은 여전히 존재해야 함
    db.refresh(reply)
    assert reply.content == "Reply to parent"


def test_delete_comment_forbidden(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
    test_another_user,
):
    """다른 사용자의 댓글 삭제 시도 (실패 테스트)"""
    # 다른 사용자의 댓글 생성
    comment = Comment(
        id=uuid.uuid4(),
        post_id=test_post.id,
        author_id=test_another_user.id,
        content="Another user's comment",
    )
    db.add(comment)
    db.commit()

    # 댓글 삭제 시도
    response = client.delete(
        f"/api/posts/{test_post.id}/comments/{comment.id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 403


def test_comment_unauthorized(client: TestClient, test_post):
    """인증 없이 댓글 작성 시도 (실패 테스트)"""
    payload = {"content": "Unauthorized comment"}

    response = client.post(
        f"/api/posts/{test_post.id}/comments",
        json=payload,
    )

    assert response.status_code == 401


def test_comment_post_not_found(client: TestClient, test_user_token: str):
    """존재하지 않는 포스트에 댓글 작성 시도"""
    fake_id = uuid.uuid4()
    payload = {"content": "Test comment"}

    response = client.post(
        f"/api/posts/{fake_id}/comments",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 404


def test_reply_parent_not_found(
    client: TestClient,
    db: Session,
    test_user_token: str,
    test_post,
):
    """존재하지 않는 부모 댓글에 대댓글 작성 시도"""
    fake_parent_id = uuid.uuid4()
    payload = {
        "content": "Reply to non-existent comment",
        "parent_id": str(fake_parent_id),
    }

    response = client.post(
        f"/api/posts/{test_post.id}/comments",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 404
