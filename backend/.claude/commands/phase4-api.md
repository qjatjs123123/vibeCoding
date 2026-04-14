# /phase4-api — Phase 4: 기타 API

`backend/TODO.md`의 Phase 4 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`backend/TODO.md`의 Phase 4에서 첫 `[ ]` 항목을 찾습니다 (USER-1, SERIES-1, TAG-1, UPLOAD-1, SEARCH-1, ETC-1 등).

### 2️⃣ 스키마 작성

#### app/schemas/user.py
```bash
cat > app/schemas/user.py << 'EOF'
from pydantic import BaseModel, Optional

class UpdateUserRequest(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    bio: Optional[str]
    avatar_url: Optional[str]
    post_count: int
EOF
```

#### app/schemas/series.py
```bash
cat > app/schemas/series.py << 'EOF'
from pydantic import BaseModel, Field
from typing import Optional, List

class CreateSeriesRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class UpdateSeriesRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class SeriesResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    author_id: str
    post_count: int
EOF
```

### 3️⃣ 라우터 구현

#### app/api/routes/users.py
```bash
cat > app/api/routes/users.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.user import UserResponse, UpdateUserRequest
from app.models.user import User
from app.models.post import Post
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/{username}", response_model=UserResponse)
async def get_user(username: str, db: Session = Depends(get_db)):
    """사용자 프로필 조회"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    post_count = db.query(func.count(Post.id)).filter(Post.author_id == user.id).scalar()
    return {
        **user.__dict__,
        "post_count": post_count
    }

@router.patch("/me", response_model=UserResponse)
async def update_user(
    req: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """사용자 프로필 수정 (본인만)"""
    if req.bio is not None:
        current_user.bio = req.bio
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    
    db.commit()
    return current_user
EOF
```

#### app/api/routes/series.py
```bash
cat > app/api/routes/series.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.series import CreateSeriesRequest, SeriesResponse
from app.models.series import Series
from app.models.post import Post
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/api/series", tags=["series"])

@router.get("/users/{username}", response_model=list[SeriesResponse])
async def get_user_series(username: str, db: Session = Depends(get_db)):
    """유저 시리즈 목록"""
    # ... 구현

@router.post("", response_model=SeriesResponse)
async def create_series(
    req: CreateSeriesRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """시리즈 생성"""
    series = Series(
        name=req.name,
        description=req.description,
        author_id=current_user.id
    )
    db.add(series)
    db.commit()
    return series

@router.patch("/{series_id}", response_model=SeriesResponse)
async def update_series(
    series_id: str,
    req: CreateSeriesRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """시리즈 수정 (본인만)"""
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    if series.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if req.name:
        series.name = req.name
    if req.description:
        series.description = req.description
    
    db.commit()
    return series

@router.delete("/{series_id}")
async def delete_series(
    series_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """시리즈 삭제 (본인만)"""
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    if series.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    db.delete(series)
    db.commit()
    return {"message": "Series deleted"}
EOF
```

#### app/api/routes/tags.py
```bash
cat > app/api/routes/tags.py << 'EOF'
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.tag import Tag
from app.models.post_tag import PostTag
from app.db.session import get_db

router = APIRouter(prefix="/api/tags", tags=["tags"])

@router.get("")
async def get_tags(
    sort: str = "popular",
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """태그 목록 조회 (인기순)"""
    if sort == "popular":
        tags = db.query(
            Tag,
            func.count(PostTag.id).label("post_count")
        ).outerjoin(PostTag).group_by(Tag.id).order_by(
            func.count(PostTag.id).desc()
        ).limit(limit).all()
    
    return [{"name": tag.name, "post_count": count} for tag, count in tags]
EOF
```

#### app/api/routes/upload.py
```bash
cat > app/api/routes/upload.py << 'EOF'
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.core.config import get_settings
import cloudinary.uploader
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/upload", tags=["upload"])

settings = get_settings()

# Cloudinary 설정
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret
)

@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """이미지 업로드 (Cloudinary)"""
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="vibecoding/posts",
            resource_type="auto"
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
EOF
```

#### app/api/routes/search.py
```bash
cat > app/api/routes/search.py << 'EOF'
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.post import Post
from app.models.user import User
from app.db.session import get_db

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
async def search(q: str, db: Session = Depends(get_db)):
    """검색 (포스트 + 사용자)"""
    if not q or len(q) < 2:
        return {"posts": [], "users": []}
    
    # 포스트 검색 (title, content)
    posts = db.query(Post).filter(
        Post.published == True,
        or_(
            Post.title.ilike(f"%{q}%"),
            Post.content.ilike(f"%{q}%")
        )
    ).limit(20).all()
    
    # 사용자 검색 (username)
    users = db.query(User).filter(
        User.username.ilike(f"%{q}%")
    ).limit(20).all()
    
    return {
        "posts": posts,
        "users": users
    }
EOF
```

#### app/api/routes/health.py
```bash
cat > app/api/routes/health.py << 'EOF'
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("")
async def health_check(db: Session = Depends(get_db)):
    """헬스 체크 (DB 연결 확인)"""
    try:
        db.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
EOF
```

### 4️⃣ 라우터 등록

```bash
# app/main.py에 추가
from app.api.routes import users, series, tags, upload, search, health

app.include_router(users.router)
app.include_router(series.router)
app.include_router(tags.router)
app.include_router(upload.router)
app.include_router(search.router)
app.include_router(health.router)
```

### 5️⃣ 테스트 작성

```bash
# tests/api/test_users.py
# tests/api/test_series.py
# tests/api/test_tags.py
# tests/api/test_upload.py
# tests/api/test_search.py
```

### 6️⃣ 검증

```bash
uvicorn app.main:app --reload
# Swagger UI에서 모든 엔드포인트 확인
```

### 7️⃣ 체크
TODO.md에서 Phase 4 항목들을 순서대로 `[x]`로 변경합니다.

### 8️⃣ 리포트
```
✅ [완료] Phase 4: 기타 API (USER, SERIES, TAG, UPLOAD, SEARCH)
  - GET /api/users/{username} (프로필 + 포스트 수)
  - PATCH /api/users/me (프로필 수정)
  - GET /api/users/{username}/series (시리즈 목록)
  - POST/PATCH/DELETE /api/series (시리즈 CRUD)
  - GET /api/tags (인기 태그, 정렬)
  - POST /api/upload (Cloudinary 이미지 업로드)
  - GET /api/search (포스트 + 사용자 검색)
  - GET /api/health (DB 헬스 체크)
  - 모든 라우터 등록 완료
  - 통합 테스트 완료

➡️ [다음] E2E-1: 통합 테스트 실행
           실행: /phase5-test
```

---

## 완료 후

Phase 4 완료 = **모든 API 엔드포인트 완성** ✅

다음: `/phase5-test` 실행 → 통합 & E2E 테스트
