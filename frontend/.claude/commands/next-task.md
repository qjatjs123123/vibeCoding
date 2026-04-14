# Phase별 커맨드 — 다음 작업 실행

`frontend/TODO.md`를 단계별로 진행합니다.

---

## Phase별 커맨드

| Phase | 커맨드 | 내용 |
|---|---|---|
| 0 | `/phase0-setup` | 프로젝트 셋업 (8개 항목) |
| 1 | `/phase1-domain` | 도메인 레이어 — DTO→Zod→Model→Mapper→Repository→Test |
| 2 | `/phase2-state` | State Layer — useSuspenseQuery + queryKey factory + Suspense test |
| 3 | `/phase3-component` | Components — React component + 테스트 |
| 4 | `/phase4-page` | Pages — Next.js App Router |
| 5 | `/phase5-e2e` | E2E 테스트 — Playwright |

---

## 실행 방법

```bash
/phase0-setup   # 프로젝트 초기화
/phase1-domain  # Post 도메인 계속 진행...
/phase2-state   # State Layer 계속 진행...
```

각 커맨드는:
1. TODO.md에서 해당 Phase의 첫 `[ ]` 항목 찾기
2. 관련 rule 파일 참고하여 구현
3. 테스트 항목은 `vitest run` 또는 `npx tsc --noEmit` 검증
4. 완료되면 `[x]` 자동 체크
5. 다음 항목 안내

---

## 특기사항

### Phase 2 (State Layer)
- **useSuspenseQuery 필수** (useQuery 사용 금지)
- **queryKey**: `@lukemorales/query-key-factory` 라이브러리 사용
- **테스트**: `<Suspense fallback={null}>` + `waitFor` 패턴
- **Mutation**: `useMutation` + `onMutate` (낙관적 업데이트) + `onError` (롤백)

---

## Phase 중단/재개

진행 중에 다른 Phase로 이동했다가 돌아올 수 있습니다. 
`frontend/TODO.md`에서 마지막으로 체크한 항목을 확인한 후, 
해당 Phase 커맨드를 다시 실행하면 다음 항목부터 진행됩니다.

예) `[x] STATE-4` 완료 → `/phase2-state` 다시 실행 → STATE-5 시작
