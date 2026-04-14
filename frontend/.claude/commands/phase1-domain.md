# /phase1-domain — Phase 1: 도메인 레이어 작업

`frontend/TODO.md`의 Phase 1 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`frontend/TODO.md`에서 첫 번째 `[ ]` 항목을 찾습니다 (POST-1부터 SEARCH-3까지).

### 2️⃣ 컨텍스트 파악
**참고**: `frontend/.claude/rules/domain-layer-pattern.md`

8단계 워크플로우:
1. 백엔드 API 스키마 확인
2. DTO 작성 (백엔드 응답 그대로)
3. Zod Schema 작성
4. Domain Model 작성
5. Mapper 작성
6. Repository Interface 정의
7. Repository 구현체 작성
8. MSW mock 테스트 작성 및 통과

### 3️⃣ 작업 실행
해당 도메인의 파일을 생성합니다.

**주의:**
- 파일 생성 전 상위 디렉토리 확인
- 8단계는 **순서대로** 진행 (앞 단계 완료 후 다음)

### 4️⃣ 검증

**Step 1-7 (코드 작성):**
```bash
npx tsc --noEmit
```
TypeScript 타입 오류 없어야 합니다.

**Step 8 (테스트 작성):**
```bash
npx vitest run src/features/{domain}/__tests__/{Domain}Repository.test.ts
```
모든 테스트가 **PASS**해야 합니다.

### 5️⃣ 체크
TODO.md에서 해당 항목을 `[x]`로 변경합니다.

### 6️⃣ 리포트
완료한 작업과 다음 항목을 사용자에게 알립니다.

```
✅ [완료] POST-1~8: Post 도메인 레이어 구현 및 테스트 통과
  - postDto.ts, postSchema.ts, post.ts, postMapper.ts
  - IPostRepository.ts, PostRepository.ts
  - postRepository.test.ts ✅ 8/8 테스트 PASS

➡️ [다음] USER-1: User API 스키마 확인
```

---

## 도메인 순서

1. **Post** (POST-1~8): 가장 복잡, 모든 CRUD 메서드 포함
2. **User** (USER-1~8): 기본 패턴
3. **Comment** (COMMENT-1~8): soft-delete 고려
4. **Tag** (TAG-1~8): 간단한 도메인
5. **Series** (SERIES-1~8): Post와 관련
6. **Upload** (UPLOAD-1~2): 단순 도메인
7. **Search** (SEARCH-1~3): 단순 도메인

---

## 주의사항

- **한 번에 하나**: 항상 `[ ]` 항목 하나만 처리
- **순서 준수**: 건너뛰거나 역순 진행 금지
- **테스트 실패**: 실패하면 `[x]` 체크 불가. 오류 자세히 보고
- **디렉토리**: 파일 생성 전 필요한 폴더 없으면 먼저 생성

---

## 팁

### 도메인 완료 후 다음 도메인 시작
```
[x] POST-8 ✅
[x] USER-1
```
자동으로 이어집니다.

### 테스트 작성 시
- MSW `http.get/post/patch/delete` 핸들러 구성
- 성공 + 실패 case 최소 2개
- Zod 검증 실패 case도 테스트
- 예시: `domain-layer-pattern.md` 파일의 "Step 8" 참고

### 에러 발생 시
1. 에러 메시지 전체 기록
2. 관련 파일 확인 (typo, import 오류 등)
3. `domain-layer-pattern.md` 패턴 재확인
4. 사용자에게 상세 보고
