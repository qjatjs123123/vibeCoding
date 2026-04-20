# vibeCoding 프론트엔드 - 남은 작업 목록

## 완료된 작업
- ✅ 프로젝트 디렉토리 구조 통일 (src/app → app)
- ✅ 모든 import 경로 수정 (@/src/ → @/)
- ✅ 로그인/회원가입 UI 페이지 완성
- ✅ axios 인터셉터 설정 (Authorization 헤더)
- ✅ 글쓰기 페이지 MarkdownEditor 연동
- ✅ 포스트 상세 페이지 좋아요/댓글 기능 구현
- ✅ 유저 프로필 페이지 API 연동
- ✅ 시리즈/태그 페이지 API 연동
- ✅ 설정/프로필 수정 페이지 구현

---

## 🔴 CRITICAL - 즉시 확인 필요

### 1. 백엔드 회원가입/로그인 API 검증
**상태**: ❌ 실패  
**문제**: 회원가입 후 로그인 시 "Invalid email or password" 에러

**필요한 작업**:
- [ ] 백엔드 `/api/auth/register` 엔드포인트 확인
  - 요청 스키마: `{ email, password, username }`
  - 응답이 정상인지 확인
- [ ] 백엔드 `/api/auth/login` 엔드포인트 확인
  - 요청 스키마: `{ email, password }`
  - 응답 스키마: `{ access_token, user_id, username, email, ... }`
- [ ] 데이터베이스 사용자 조회 쿼리 검증
- [ ] 비밀번호 해싱/검증 로직 확인
- [ ] 직접 curl로 백엔드 API 테스트

**테스트 명령어**:
```bash
# 회원가입
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","username":"testuser"}'

# 로그인
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## 🟠 높은 우선순위 - API 연동 검증

### 2. 포스트 작성 API 테스트
**파일**: `app/write/page.tsx`
- [ ] 로그인 완료 후 `/write` 페이지 접속
- [ ] 제목, 내용, 태그 입력 후 "발행하기" 버튼 클릭
- [ ] 응답 확인: `/api/posts` POST 요청이 성공하는지
- [ ] 생성된 포스트가 홈페이지 피드에 나타나는지 확인
- [ ] 포스트 상세 페이지로 이동 가능한지 확인

### 3. 포스트 상세 페이지 - 댓글/좋아요 API 테스트
**파일**: `app/[username]/[slug]/page.tsx`
- [ ] 포스트 상세 페이지 접속
- [ ] 좋아요 버튼 클릭 → `/api/posts/{id}/like` 호출 확인
- [ ] 댓글 작성 → `/api/comments` POST 호출 확인
- [ ] 댓글 목록 → `/api/comments?postId={id}` GET 호출 확인

### 4. 유저 프로필 페이지 API 테스트
**파일**: `app/@[username]/page.tsx`
- [ ] `/@username` 접속 → `/api/users/{username}` 호출 확인
- [ ] 사용자 정보 표시 확인
- [ ] 사용자 포스트 목록 표시 확인

### 5. 설정 - 프로필 수정 API 테스트
**파일**: `app/settings/profile/page.tsx`
- [ ] 로그인 후 `/settings/profile` 접속
- [ ] 프로필 정보 수정 → `/api/users/{id}` PATCH 호출 확인
- [ ] 성공 메시지 표시 확인

---

## 🟡 중간 우선순위 - 추가 기능

### 6. 이미지 업로드 기능
**파일**: `features/post/components/MarkdownEditor.tsx`
- [ ] 마크다운 에디터에서 이미지 드래그앤드롭 테스트
- [ ] `/api/upload` 엔드포인트 호출 확인
- [ ] 이미지 URL이 마크다운에 삽입되는지 확인

### 7. 시리즈 기능
**파일**: `app/series/page.tsx`
- [ ] `/series` 페이지 접속 → `/api/series` 호출 확인
- [ ] 시리즈 목록 표시 확인
- [ ] 시리즈 상세 페이지 API 연동 확인

### 8. 태그 검색 기능
**파일**: `app/tags/[tagName]/page.tsx`
- [ ] `/tags/react` 접속 → `/api/posts?tag=react` 호출 확인
- [ ] 태그별 포스트 필터링 확인

---

## 🟢 낮은 우선순위 - 최적화 및 리파인

### 9. 오류 처리 개선
- [ ] 네트워크 오류 시 사용자 친화적 메시지 표시
- [ ] 401/403 오류 시 로그인 페이지로 리다이렉트
- [ ] API 오류 응답 형식 표준화

### 10. 성능 최적화
- [ ] 이미지 최적화 (next/image)
- [ ] 코드 분할 확인 (동적 import 활용)
- [ ] 캐싱 전략 검증

### 11. E2E 테스트
- [ ] 전체 사용자 흐름 테스트
- [ ] Playwright E2E 테스트 작성

---

## 🔧 백엔드 확인 필수 API 목록
- [ ] POST `/api/auth/register` - 회원가입
- [ ] POST `/api/auth/login` - 로그인  
- [ ] GET `/api/users/{username}` - 사용자 조회
- [ ] PATCH `/api/users/{id}` - 프로필 수정
- [ ] POST `/api/posts` - 포스트 생성
- [ ] GET `/api/posts` - 포스트 목록
- [ ] POST `/api/posts/{id}/like` - 좋아요
- [ ] POST `/api/comments` - 댓글 생성
- [ ] POST `/api/upload` - 이미지 업로드

---

**마지막 업데이트**: 2026-04-18  
**상태**: 🔴 백엔드 API 검증 대기 중
