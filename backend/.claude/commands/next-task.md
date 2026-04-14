# /next-task — 다음 미완료 항목 확인

`backend/TODO.md`에서 현재 진행 상태를 확인하고 다음 작업을 제안합니다.

---

## 사용 방법

### 1️⃣ TODO.md 읽기
```bash
cat backend/TODO.md | grep "^- \[ \]" | head -1
```

### 2️⃣ 현재 진행률 확인
```bash
# 완료된 항목 수
grep "^- \[x\]" backend/TODO.md | wc -l

# 전체 항목 수
grep "^- \[" backend/TODO.md | wc -l

# 진행률 계산
# 예: 15 / 60 = 25% 완료
```

### 3️⃣ 현재 단계 파악

**Phase 0 (9항목)**
- P0-1~P0-10: 프로젝트 셋업
- 완료: /phase0-setup

**Phase 1 (6항목)**
- LIB-1~LIB-6: 공통 라이브러리
- 완료: /phase1-lib

**Phase 2 (4항목)**
- AUTH-1~AUTH-4: 인증
- 완료: /phase2-auth

**Phase 3 (13항목)**
- POST-1~POST-13: Post API
- 완료: /phase3-post

**Phase 4 (20항목 이상)**
- USER-1~4, SERIES-1~5, TAG-1~2, UPLOAD-1~2, SEARCH-1~2, ETC-1
- 완료: /phase4-api

**Phase 5 (6항목)**
- E2E-1~E2E-6: 통합 테스트
- 완료: /phase5-test

---

## 현재 단계별 실행 방법

### Phase 0 진행 중
```bash
/phase0-setup
```

### Phase 1 진행 중
```bash
/phase1-lib
```

### Phase 2 진행 중
```bash
/phase2-auth
```

### Phase 3 진행 중
```bash
/phase3-post
```

### Phase 4 진행 중
```bash
/phase4-api
```

### Phase 5 진행 중
```bash
/phase5-test
```

---

## 빠른 점프

```bash
# 마지막 완료된 phase 이후 다음 항목 실행
/next-task  # 추천 명령어 출력

# 예시:
# ✅ Phase 0 완료 (P0-1~P0-10)
# ➡️ 다음: /phase1-lib (LIB-1부터 시작)
```

---

## 체크리스트

각 phase 커맨드 실행 후:
1. TODO.md에서 완료된 항목을 `[x]`로 변경
2. `git add backend/TODO.md && git commit -m "✅ Phase N 완료"`
3. `/next-task` 다시 실행하여 다음 단계 확인

---

## 예상 소요 시간

| Phase | 작업 | 예상 시간 |
|---|---|---|
| Phase 0 | 프로젝트 셋업 | 1-2시간 |
| Phase 1 | 공통 라이브러리 | 1시간 |
| Phase 2 | 인증 시스템 | 2-3시간 |
| Phase 3 | Post API | 4-5시간 |
| Phase 4 | 기타 API | 4-5시간 |
| Phase 5 | 통합 테스트 | 2-3시간 |
| **총합** | | **14-19시간** |

---

## 진행 현황 저장

```bash
# TODO.md 변경사항 커밋
git add backend/TODO.md
git commit -m "✅ {Phase} 완료: {항목명}"

# 예:
# git commit -m "✅ Phase 0 완료: 프로젝트 셋업"
```
