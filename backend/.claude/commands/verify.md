# /verify — 서버 검증 및 DB 상태 확인

현재 백엔드 상태를 종합 검증합니다.

---

## 실행 절차

### 1️⃣ 개발 서버 시작

```bash
uvicorn app.main:app --reload --port 8000
```

### 2️⃣ 기본 헬스 체크

```bash
# 서버 응답 확인
curl http://localhost:8000/api/health

# Swagger UI 접근
open http://localhost:8000/docs
```

### 3️⃣ DB 연결 확인

```bash
# psql 직접 접근
psql $DATABASE_URL

# 테이블 목록
\dt

# 테이블 스키마 확인
\d posts
\d users
\d comments
```

### 4️⃣ 라우터 등록 확인

```bash
# Swagger UI (/docs)에서 다음 엔드포인트 표시 확인:
- GET /api/posts
- POST /api/posts
- GET /api/posts/{post_id}
- PATCH /api/posts/{post_id}
- DELETE /api/posts/{post_id}
- POST /api/posts/{post_id}/like
- GET /api/posts/{post_id}/comments
- POST /api/posts/{post_id}/comments
- GET /api/users/{username}
- PATCH /api/users/me
- GET /api/tags
- POST /api/upload
- GET /api/search
- GET /api/health
```

### 5️⃣ API 호출 테스트

```bash
# 포스트 생성 (인증 필요)
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test","published":true,"tags":[]}'

# 포스트 조회
curl http://localhost:8000/api/posts

# 태그 조회
curl http://localhost:8000/api/tags?sort=popular
```

### 6️⃣ 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 테스트 커버리지
pytest --cov=app --cov-report=html

# 상세 출력
pytest -v -s
```

### 7️⃣ 마이그레이션 상태 확인

```bash
# Alembic 버전 확인
alembic current

# 마이그레이션 이력 확인
alembic history
```

### 8️⃣ 체크리스트

- [ ] 개발 서버 정상 시작 (포트 8000)
- [ ] Swagger UI 접근 가능 (/docs)
- [ ] DB 연결 성공
- [ ] 모든 테이블 생성됨
- [ ] 라우터 12개 이상 등록됨
- [ ] GET /api/posts 응답 200
- [ ] GET /api/health 응답 200
- [ ] 모든 테스트 통과
- [ ] 테스트 커버리지 80% 이상

---

## 문제 해결

### 포트 이미 사용 중
```bash
lsof -i :8000  # 포트 점유 프로세스 확인
kill -9 {PID}  # 프로세스 종료
```

### DB 연결 실패
```bash
# DATABASE_URL 확인
echo $DATABASE_URL

# psql로 직접 테스트
psql $DATABASE_URL -c "SELECT 1"
```

### 마이그레이션 충돌
```bash
# 최신 상태로 업그레이드
alembic upgrade head

# 롤백
alembic downgrade -1
```

---

## 완료

모든 항목이 통과하면 백엔드는 프로덕션 준비 완료 ✅
