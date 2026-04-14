# /phase1-lib — Phase 1: 공통 라이브러리

`backend/TODO.md`의 Phase 1 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`backend/TODO.md`의 Phase 1에서 첫 `[ ]` 항목을 찾습니다 (LIB-1~LIB-6).

### 2️⃣ 작업 실행

#### LIB-1: app/db/session.py — DB 세션 팩토리
```bash
cat > app/db/session.py << 'EOF'
from sqlalchemy.orm import Session
from app.db.base import SessionLocal

def get_db() -> Session:
    """DB 세션을 제공하는 제너레이터"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF
```

#### LIB-2: app/core/security.py — JWT & 비밀번호 해시
```bash
cat > app/core/security.py << 'EOF'
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """비밀번호 해시화"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """JWT 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expire_hours)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """JWT 토큰 디코딩"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None
EOF
```

#### LIB-3: app/api/deps.py — 의존성 (DI)
```bash
cat > app/api/deps.py << 'EOF'
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """현재 로그인한 사용자를 반환"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

async def get_current_user_optional(
    credentials: HTTPAuthCredentials = None,
    db: Session = Depends(get_db)
) -> User | None:
    """로그인 상태 체크 (선택사항)"""
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        return None
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    return user
EOF
```

#### LIB-4: app/utils/slug.py — Slug 생성
```bash
cat > app/utils/slug.py << 'EOF'
from python_slugify import slugify
import uuid

def generate_slug(title: str) -> str:
    """제목으로부터 slug 생성 (중복 방지용 uuid suffix)"""
    base_slug = slugify(title)
    unique_suffix = uuid.uuid4().hex[:8]
    return f"{base_slug}-{unique_suffix}"
EOF
```

#### LIB-5: app/utils/trending.py — 트렌딩 점수
```bash
cat > app/utils/trending.py << 'EOF'
from datetime import datetime
import math

def calc_trending_score(
    like_count: int,
    comment_count: int,
    view_count: int,
    published_at: datetime
) -> float:
    """포스트의 트렌딩 점수 계산"""
    hours_since = (datetime.utcnow() - published_at).total_seconds() / 3600
    numerator = like_count * 2 + view_count * 0.5 + comment_count
    denominator = math.pow(hours_since + 2, 1.5)
    return numerator / denominator if denominator > 0 else 0
EOF
```

#### LIB-6: app/utils/response.py — 응답 래퍼
```bash
cat > app/utils/response.py << 'EOF'
from fastapi.responses import JSONResponse
from typing import Any

def success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> JSONResponse:
    """성공 응답"""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )

def error_response(message: str = "Error", status_code: int = 400, detail: Any = None) -> JSONResponse:
    """에러 응답"""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "error": detail
        }
    )
EOF
```

### 3️⃣ 검증

**파일 생성 확인:**
```bash
ls -la app/db/
ls -la app/core/
ls -la app/api/
ls -la app/utils/
```

**Import 테스트:**
```bash
python -c "from app.core.security import hash_password; print('✅ security.py OK')"
python -c "from app.utils.slug import generate_slug; print('✅ slug.py OK')"
python -c "from app.utils.trending import calc_trending_score; print('✅ trending.py OK')"
```

### 4️⃣ 체크
TODO.md에서 LIB-1~LIB-6을 순서대로 `[x]`로 변경합니다.

### 5️⃣ 리포트
```
✅ [완료] Phase 1: 공통 라이브러리 (LIB-1~LIB-6)
  - DB 세션 팩토리 구현
  - JWT 생성/검증 함수 구현
  - 비밀번호 해시 함수 구현
  - 의존성 주입 (get_current_user 등)
  - Slug 생성 유틸리티
  - 트렌딩 점수 계산 알고리즘
  - 응답 래퍼 헬퍼

➡️ [다음] AUTH-1: 인증 API 구현 시작
           실행: /phase2-auth
```

---

## 주의사항

- **Import 순서**: `app.db.base` → `app.core.config` → 나머지
- **JWT_SECRET**: 환경변수에서 로드되므로 .env.local 필수
- **Passlib**: bcrypt scheme 사용 (argon2도 가능)
- **Slug**: UUID suffix로 중복 방지 (중복 체크 로직 불필요)

---

## 완료 후

Phase 1 완료 = **공통 라이브러리 완성** ✅

다음: `/phase2-auth` 실행 → 인증 시스템 구현
