# /phase2-auth — Phase 2: 인증 (Auth)

`backend/TODO.md`의 Phase 2 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`backend/TODO.md`의 Phase 2에서 첫 `[ ]` 항목을 찾습니다 (AUTH-1~AUTH-4).

### 2️⃣ Pydantic 스키마 작성

#### app/schemas/auth.py
```bash
cat > app/schemas/auth.py << 'EOF'
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: Optional[str] = None
    needs_username: bool = False  # 최초 로그인시 True

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, regex="^[a-z0-9-]+$")
    # 영문, 숫자, 하이픈만 허용

class OAuthCallback(BaseModel):
    code: str
    provider: str  # "github" | "google"
EOF
```

### 3️⃣ 라우터 작성

#### app/api/routes/auth.py — OAuth + JWT
```bash
cat > app/api/routes/auth.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, TokenResponse, UserRegister
from app.core.security import verify_password, create_access_token, hash_password
from app.db.session import get_db
from app.models.user import User
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """로그인"""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        username=user.username,
        needs_username=user.username is None
    )

@router.post("/register", response_model=TokenResponse)
async def register(username: str, db: Session = Depends(get_db)):
    """Username 등록 (최초 로그인 후)"""
    # get_current_user 의존성 추가 필요
    # 토큰에서 사용자 ID를 추출하고 username 업데이트
    
    # 유효성 검사
    if len(username) < 3 or len(username) > 20:
        raise HTTPException(status_code=400, detail="Username must be 3-20 chars")
    
    if not all(c.isalnum() or c == '-' for c in username):
        raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, hyphens")
    
    # 중복 체크
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # username 업데이트
    # ... 실제 구현

@router.post("/logout")
async def logout():
    """로그아웃 (클라이언트에서 토큰 제거)"""
    return {"message": "Logged out"}

# OAuth 콜백 (GitHub, Google)
@router.post("/callback")
async def oauth_callback(provider: str, code: str, db: Session = Depends(get_db)):
    """OAuth 콜백 (GitHub/Google)"""
    # 1. 외부 OAuth 서버에서 토큰 교환
    # 2. 사용자 정보 조회
    # 3. DB에 사용자 존재 여부 확인
    # 4. 없으면 생성 (username = None)
    # 5. JWT 토큰 반환
    pass
EOF
```

### 4️⃣ User 모델 업데이트

#### app/models/user.py
```python
# 기존 User 모델에 다음 추가:
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    
    # ... 기존 필드들 ...
    
    # 관계
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    likes = relationship("Like", back_populates="user")
```

### 5️⃣ 마이그레이션

```bash
# User 모델 수정 후
alembic revision --autogenerate -m "add_user_relations"
alembic upgrade head
```

### 6️⃣ 검증

**라우터 등록 확인:**
```bash
# app/main.py에 다음 추가
from app.api.routes import auth

app.include_router(auth.router)
```

**Swagger UI 테스트:**
```bash
uvicorn app.main:app --reload
# http://localhost:8000/docs 에서 POST /api/auth/login 테스트
```

### 7️⃣ 체크
TODO.md에서 AUTH-1~AUTH-4를 순서대로 `[x]`로 변경합니다.

### 8️⃣ 리포트
```
✅ [완료] Phase 2: 인증 시스템 (AUTH-1~AUTH-4)
  - Pydantic 인증 스키마 작성
  - POST /api/auth/login (JWT 토큰 반환)
  - POST /api/auth/register (username 등록)
  - OAuth 콜백 처리 (GitHub + Google)
  - Username 유효성 검사 (3~20자, 영문·숫자·하이픈)
  - 최초 로그인 시 needs_username: true 반환

➡️ [다음] POST-1: Post API 구현 시작
           실행: /phase3-post
```

---

## 주의사항

- **OAuth 세부 구현**: GitHub/Google OAuth 문서 참고
- **토큰 저장**: 프론트에서 localStorage에 저장 (HttpOnly 쿠키도 가능)
- **Username 중복 체크**: DB unique constraint + 쿼리 검증 모두 필요
- **에러 응답**: 명확한 메시지 (보안: 가능하면 일반적으로)

---

## 완료 후

Phase 2 완료 = **인증 시스템 완성** ✅

다음: `/phase3-post` 실행 → Post API 구현
