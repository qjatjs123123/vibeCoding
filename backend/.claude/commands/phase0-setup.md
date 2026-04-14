# /phase0-setup — Phase 0: 프로젝트 셋업

`backend/TODO.md`의 Phase 0 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`backend/TODO.md`의 Phase 0에서 첫 `[ ]` 항목을 찾습니다 (P0-1~P0-10).

### 2️⃣ 컨텍스트 파악
**참고**: `backend/CLAUDE.md` (기술 스택, 환경변수 섹션)

### 3️⃣ 작업 실행

#### P0-1: FastAPI 프로젝트 초기화
```bash
cd backend
mkdir -p app/{api/routes,models,schemas,core,db,utils}
mkdir -p tests/{api,unit}
touch app/main.py app/__init__.py
```

#### P0-2: 프로덕션 의존성 설치
```bash
# pyproject.toml 생성 후
cat > pyproject.toml << 'EOF'
[project]
name = "vibecoding-backend"
version = "0.1.0"
requires-python = ">=3.11"

[project.optional-dependencies]
dev = [
    "pytest>=7.4",
    "pytest-asyncio>=0.21",
    "httpx>=0.24",
    "pytest-cov>=4.1",
]

[tool.setuptools]
packages = ["app"]
EOF

pip install -e .
pip install fastapi sqlalchemy alembic pydantic pydantic-settings python-jose passlib bcrypt python-multipart cloudinary python-slugify email-validator
```

#### P0-3: 개발 의존성 설치
```bash
pip install -e ".[dev]"
# 또는
pip install pytest pytest-asyncio httpx pytest-cov
```

#### P0-4: app/core/config.py — 환경변수 설정
```bash
cat > app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # 데이터베이스
    database_url: str
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24
    
    # OAuth
    github_client_id: str
    github_client_secret: str
    google_client_id: str
    google_client_secret: str
    
    # Cloudinary
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    
    # App
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    debug: bool = False
    
    class Config:
        env_file = ".env.local"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
EOF
```

#### P0-5: .env.local 환경변수 파일 생성
```bash
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/vibecoding
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
DEBUG=false
EOF
```

#### P0-6: app/db/base.py — SQLAlchemy 설정
```bash
cat > app/db/base.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,  # 연결 상태 확인
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
EOF
```

#### P0-7: SQLAlchemy 모델 작성
```bash
# app/models/__init__.py
touch app/models/user.py app/models/post.py app/models/comment.py \
      app/models/tag.py app/models/series.py

# 각 모델 파일에 ORM 클래스 정의
# 예: app/models/user.py
cat > app/models/user.py << 'EOF'
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(20), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
EOF
```

#### P0-8: alembic 초기화
```bash
alembic init alembic
```

#### P0-9: alembic/env.py 수정 (SQLAlchemy 메타데이터 자동 감지)
```python
# alembic/env.py에서
from app.db.base import Base
target_metadata = Base.metadata
```

#### P0-10: alembic 마이그레이션 및 DB 적용
```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

### 4️⃣ 검증

**프로젝트 구조:**
```bash
ls -la backend/
# pyproject.toml, .env.local, alembic/, app/, tests/ 확인
```

**의존성 설치:**
```bash
pip list | grep fastapi
pip list | grep sqlalchemy
```

**DB 연결:**
```bash
python -c "from app.db.base import engine; engine.execute('SELECT 1')"
# 또는 psql로 직접 확인
psql $DATABASE_URL -c "\dt"  # 테이블 목록
```

**개발 서버 시작:**
```bash
uvicorn app.main:app --reload --port 8000
# http://localhost:8000/docs 에서 Swagger UI 확인
```

### 5️⃣ 체크
TODO.md에서 P0-1~P0-10을 순서대로 `[x]`로 변경합니다.

### 6️⃣ 리포트
```
✅ [완료] Phase 0: 프로젝트 셋업 (P0-1~P0-10)
  - FastAPI 프로젝트 초기화
  - 의존성 설치 완료 (fastapi, sqlalchemy, alembic 등)
  - PostgreSQL 연결 확인
  - Alembic 마이그레이션 완료
  - 개발 서버 정상 작동 (localhost:8000)
  - Swagger UI 접근 가능 (/docs)

➡️ [다음] LIB-1: 공통 라이브러리 구현 시작
           실행: /phase1-lib
```

---

## 주의사항

- **Python 버전**: 3.11 이상 권장
- **가상환경**: `python -m venv venv` 후 활성화 필수
- **psql**: PostgreSQL이 로컬에 설치되어 있어야 함
- **DATABASE_URL**: `postgresql://user:password@host:port/dbname` 형식
- **JWT_SECRET**: 최소 32자 이상의 랜덤 문자열 (보안)

---

## 완료 후

Phase 0 완료 = **모든 준비 완료** ✅

다음: `/phase1-lib` 실행 → 공통 라이브러리 시작
