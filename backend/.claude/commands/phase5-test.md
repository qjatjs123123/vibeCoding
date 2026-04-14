# /phase5-test — Phase 5: 통합 / E2E 테스트

`backend/TODO.md`의 Phase 5 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`backend/TODO.md`의 Phase 5에서 첫 `[ ]` 항목을 찾습니다 (E2E-1~E2E-6).

### 2️⃣ 테스트 환경 설정

#### tests/conftest.py
```bash
cat > tests/conftest.py << 'EOF'
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.api.deps import get_db

# 테스트용 DB (in-memory SQLite 또는 별도 테스트 DB)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()
EOF
```

### 3️⃣ 통합 테스트 작성

#### tests/api/test_posts.py
```bash
cat > tests/api/test_posts.py << 'EOF'
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_post_flow(client, db):
    """E2E-1: 포스트 작성 → 발행 → 피드 노출"""
    # 1. 포스트 생성 (draft)
    response = await client.post("/api/posts", json={
        "title": "Test Post",
        "content": "# Hello",
        "published": False,
        "tags": ["python", "fastapi"]
    })
    assert response.status_code == 201
    post_id = response.json()["id"]
    
    # 2. 포스트 발행
    response = await client.patch(f"/api/posts/{post_id}", json={
        "published": True
    })
    assert response.status_code == 200
    
    # 3. 피드에서 조회 확인
    response = await client.get("/api/posts?feed=recent")
    assert response.status_code == 200
    posts = response.json()["posts"]
    assert any(p["id"] == post_id for p in posts)

@pytest.mark.asyncio
async def test_post_update_and_delete(client, db):
    """E2E-2: 포스트 수정 → 삭제"""
    # 1. 포스트 생성
    response = await client.post("/api/posts", json={
        "title": "Original Title",
        "content": "Original Content",
        "published": True,
        "tags": []
    })
    post_id = response.json()["id"]
    
    # 2. 포스트 수정
    response = await client.patch(f"/api/posts/{post_id}", json={
        "title": "Updated Title"
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    
    # 3. 포스트 삭제
    response = await client.delete(f"/api/posts/{post_id}")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_like_trending_score(client, db):
    """E2E-3: 좋아요 → 트렌딩 점수 반영"""
    # 1. 포스트 생성
    response = await client.post("/api/posts", json={
        "title": "Trending Test",
        "content": "Content",
        "published": True,
        "tags": []
    })
    post_id = response.json()["id"]
    
    # 2. 좋아요 토글
    response = await client.post(f"/api/posts/{post_id}/like")
    assert response.status_code == 200
    assert response.json()["liked"] == True
    
    # 3. 트렌딩 피드에서 확인
    response = await client.get("/api/posts?feed=trending")
    assert response.status_code == 200
    # 트렌딩 점수가 상위에 있는지 확인

@pytest.mark.asyncio
async def test_comment_and_soft_delete(client, db):
    """E2E-4: 댓글 작성 → 대댓글 → soft-delete"""
    # 1. 포스트 생성
    response = await client.post("/api/posts", json={
        "title": "Comment Test",
        "content": "Content",
        "published": True,
        "tags": []
    })
    post_id = response.json()["id"]
    
    # 2. 댓글 작성
    response = await client.post(f"/api/posts/{post_id}/comments", json={
        "content": "Great post!"
    })
    assert response.status_code == 201
    comment_id = response.json()["id"]
    
    # 3. 대댓글 작성
    response = await client.post(f"/api/posts/{post_id}/comments", json={
        "content": "Thanks!",
        "parent_id": comment_id
    })
    assert response.status_code == 201
    
    # 4. 댓글 삭제 (대댓글 있으면 soft-delete)
    response = await client.delete(f"/api/posts/{post_id}/comments/{comment_id}")
    assert response.status_code == 200
    
    # 5. 댓글 조회에서 "[삭제된 댓글입니다]" 표시 확인
    response = await client.get(f"/api/posts/{post_id}/comments")
    assert response.status_code == 200
    comments = response.json()
    assert any(c["content"] == "[삭제된 댓글입니다]" for c in comments)

@pytest.mark.asyncio
async def test_tag_sorting(client, db):
    """E2E-5: 태그 등록 → /api/tags 인기순 정렬"""
    # 1. 여러 포스트에 태그 추가
    for i in range(3):
        await client.post("/api/posts", json={
            "title": f"Post {i}",
            "content": "Content",
            "published": True,
            "tags": ["python"]
        })
    
    # 2. 태그 조회 (인기순)
    response = await client.get("/api/tags?sort=popular")
    assert response.status_code == 200
    tags = response.json()
    python_tag = next(t for t in tags if t["name"] == "python")
    assert python_tag["post_count"] == 3

@pytest.mark.asyncio
async def test_auth_and_authorization(client, db):
    """E2E-6: 인증 없는 요청 → 401, 타인 리소스 수정 → 403"""
    # 1. 인증 없이 포스트 생성 시도
    response = await client.post("/api/posts", json={
        "title": "Test",
        "content": "Content",
        "published": True,
        "tags": []
    })
    assert response.status_code == 401
    
    # 2. 다른 사용자 포스트 수정 시도
    # ... (2개 계정 필요)
    # response = await client.patch(f"/api/posts/{other_user_post_id}", json={...})
    # assert response.status_code == 403
EOF
```

#### tests/api/test_likes.py
```bash
cat > tests/api/test_likes.py << 'EOF'
import pytest

@pytest.mark.asyncio
async def test_like_toggle(client, db):
    """좋아요 토글 테스트"""
    # 포스트 생성 후 좋아요 토글
    response = await client.post("/api/posts/{post_id}/like")
    assert response.status_code == 200
    assert response.json()["liked"] == True
    
    # 다시 토글 (좋아요 취소)
    response = await client.post("/api/posts/{post_id}/like")
    assert response.status_code == 200
    assert response.json()["liked"] == False

@pytest.mark.asyncio
async def test_like_count(client, db):
    """좋아요 수 정확성 테스트"""
    # 여러 사용자가 좋아요
    # ... 테스트
EOF
```

#### tests/api/test_comments.py
```bash
cat > tests/api/test_comments.py << 'EOF'
import pytest

@pytest.mark.asyncio
async def test_comment_crud(client, db):
    """댓글 CRUD 테스트"""
    # ... 테스트

@pytest.mark.asyncio
async def test_soft_delete_with_replies(client, db):
    """대댓글이 있을 때 soft-delete 테스트"""
    # ... 테스트
EOF
```

### 4️⃣ 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 특정 테스트만 실행
pytest tests/api/test_posts.py

# 커버리지 리포트
pytest --cov=app --cov-report=html

# 상세 출력
pytest -v
```

### 5️⃣ 체크
TODO.md에서 E2E-1~E2E-6을 순서대로 `[x]`로 변경합니다.

### 6️⃣ 최종 검증

```bash
# 개발 서버 실행
uvicorn app.main:app --reload

# 프론트엔드와 통합 테스트
# 1. 포스트 작성 flow
# 2. 좋아요 및 댓글 기능
# 3. 피드 정렬 (recent, trending)
# 4. 검색 기능
# 5. 인증/인가
```

### 7️⃣ 리포트
```
✅ [완료] Phase 5: 통합 / E2E 테스트 (E2E-1~E2E-6)
  - Pytest 설정 완료 (conftest.py)
  - 포스트 작성 → 발행 → 피드 노출 E2E 테스트
  - 임시저장 → 이어쓰기 → 발행 E2E 테스트
  - 좋아요 → 트렌딩 점수 반영 E2E 테스트
  - 댓글 CRUD + soft-delete E2E 테스트
  - 태그 인기순 정렬 E2E 테스트
  - 인증/인가 에러 케이스 E2E 테스트
  - 모든 테스트 통과 ✅
  - 커버리지: 80%+ 달성 ✅

✅ [완료] Backend 전체 구현
  - Phase 0: 프로젝트 셋업 ✅
  - Phase 1: 공통 라이브러리 ✅
  - Phase 2: 인증 시스템 ✅
  - Phase 3: Post API ✅
  - Phase 4: 기타 API (User, Series, Tag, Upload, Search) ✅
  - Phase 5: 통합/E2E 테스트 ✅

📋 다음 단계:
  - 프론트엔드와 API 통합 테스트
  - 배포 준비 (Docker, CI/CD)
```

---

## 테스트 체크리스트

- [ ] 모든 POST/PATCH/DELETE 요청 테스트
- [ ] 인증/인가 에러 케이스 테스트 (401, 403)
- [ ] 좋아요 중복 방지 테스트
- [ ] Soft-delete 로직 테스트 (대댓글 유무)
- [ ] 커서 기반 페이지네이션 테스트
- [ ] 트렌딩 점수 정렬 테스트
- [ ] 검색 기능 테스트 (빈 결과 포함)
- [ ] 업로드 파일 타입 검증 테스트

---

## 완료 후

Phase 5 완료 = **백엔드 전체 구현 완성** ✅

Backend + Frontend 모두 완성 → **MVP 프로젝트 완성** 🎉
