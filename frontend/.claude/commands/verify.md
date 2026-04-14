# /verify — Playwright MCP 실시간 검증 & 자동 수정

개발 중인 컴포넌트 또는 페이지를 **Playwright MCP로 실시간 검증**하고, 에러가 발견되면 **자동으로 수정**하는 루프.

---

## 사용 시나리오

### Phase 3 (Components)
```
/verify --component PostCard
→ localhost:3000/dev/components/PostCard로 navigate
→ screenshot + console error 확인
→ 에러 있으면 자동 수정 & 재검증
```

### Phase 4 (Pages)
```
/verify --page /recent
→ localhost:3000/recent로 navigate
→ screenshot + console error 확인
→ 에러 있으면 자동 수정 & 재검증
```

---

## 실행 절차

### 1️⃣ 선행 조건 확인
```bash
✅ pnpm dev (running on localhost:3000)
✅ 소스 파일 저장됨
```

사용자에게 요청:
```
pnpm dev가 실행 중입니다. 계속할까요? (Y/n)
```

### 2️⃣ Playwright MCP Navigate
목표 URL로 이동:
```
Component: http://localhost:3000/dev/components/[ComponentName]
Page: http://localhost:3000[PagePath]
```

### 3️⃣ 스크린샷 + 에러 수집

Playwright MCP tools 호출:
```javascript
// 1. Screenshot 캡처
playwright_navigate(url)
playwright_screenshot()  // Base64 이미지 → Claude가 시각적 확인

// 2. 콘솔 에러/경고 수집
playwright_evaluate(`
  window.__logs = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    window.__logs.push({ level: 'error', msg: args.join(' ') });
    originalError(...args);
  };
  
  console.warn = (...args) => {
    window.__logs.push({ level: 'warn', msg: args.join(' ') });
    originalWarn(...args);
  };
  
  return window.__logs;
`)

// 3. TypeScript 타입 에러 확인 (개발 서버 콘솔)
// → 사용자에게 개발 서버 터미널 확인 요청 (필요시)
```

### 4️⃣ 에러 분석 & 자동 수정

**Case 1: 콘솔 에러 있음**
```
❌ Error: Cannot read property 'map' of undefined
  at PostCard (src/components/post/PostCard.tsx:15)

→ Claude가 파일 읽음 → 15번 줄 분석 → 수정
→ 파일 저장
→ Step 3 반복 (최대 3회 루프)
```

**Case 2: TypeScript 에러**
```
> npx tsc --noEmit
src/components/post/PostCard.tsx:10:15
Error: Property 'title' does not exist on type 'Post'.

→ Claude가 Post 모델 확인 → 수정
→ 파일 저장
→ 재검증
```

**Case 3: 시각적 에러 (렌더링 문제)**
```
스크린샷 보고:
- 레이아웃 깨짐
- 텍스트 자르임
- 반응형 문제 등

→ Claude가 Tailwind class 확인 → 수정
```

### 5️⃣ 검증 완료 또는 실패

**✅ 성공 (에러 없음)**
```
✅ [검증 통과] PostCard
  - 콘솔 에러: 0개
  - TypeScript: OK
  - 렌더링: 정상

→ TODO.md [x] 체크하면 됩니다.
```

**❌ 실패 (3회 루프 초과)**
```
❌ [검증 실패] PostCard
  - 3회 자동 수정 시도했으나 여전히 에러:
    Error: ...
  - 수동으로 검토 필요

→ 사용자에게 에러 상세 보고
```

---

## 에러-수정 루프 (최대 3회)

```
[시도 1]
  파일 생성/수정
  ↓
  playwright navigate + screenshot + console check
  ↓
  에러? ──YES──→ 분석 + 수정 → 반복
  │              [시도 2]
  NO
  ↓
  ✅ 통과

[3회 초과]
  ❌ 실패 → 사용자에게 보고
```

---

## Playwright MCP Tools (활용)

**사용 가능한 도구:**
- `playwright_navigate(url)` — URL 이동
- `playwright_screenshot()` — 스크린샷 캡처 (Base64)
- `playwright_click(selector)` — 요소 클릭
- `playwright_fill(selector, text)` — 입력 필드 채우기
- `playwright_evaluate(jsCode)` — JavaScript 실행
- `playwright_waitForSelector(selector)` — 요소 대기
- `playwright_getContent()` — 페이지 HTML

---

## 사용 예시

### Component 검증
```bash
/verify --component PostCard
# /dev/components/PostCard 페이지로 이동
# 에러 확인 및 자동 수정
```

### Page 검증
```bash
/verify --page /write
# /write 페이지로 이동
# 에러 확인 및 자동 수정
```

### 수동 URL
```bash
/verify --url /tags/react
# /tags/react 페이지로 이동
```

---

## Phase 3 / 4 커맨드 통합

`phase3-component.md`와 `phase4-page.md`에서:

```
### 5️⃣ Playwright MCP 검증

개발 서버가 실행 중인지 확인 후:

/verify --component [ComponentName]

# 또는 해당 페이지가 있는 경우
/verify --page [path]
```

에러 없으면 계속 진행 (테스트, [x] 체크)
에러 있으면 자동 수정 루프 진행

---

## 주의사항

### ⚠️ 개발 서버 필수
- `/verify` 실행 전 `pnpm dev` 반드시 실행 중
- 포트: 3000 (기본값)
- 다른 포트: `--port 3001` 옵션으로 지정 가능

### ⚠️ Component Preview 페이지
Phase 3에서는 `/dev/components/[name]` 페이지 필요:
```typescript
// app/dev/components/[name]/page.tsx
export default function ComponentPreview({ params }) {
  const components = {
    PostCard: () => <PostCard post={mockPost} />,
    // ...
  };
  return components[params.name]?.();
}
```

### ⚠️ 루프 무한화 방지
- 최대 3회 자동 수정 시도
- 그 이상은 사용자 개입 필요

### ⚠️ TypeScript 빌드 에러
- MCP screenshot과 별개로 `npx tsc --noEmit` 병행
- 개발 서버 터미널의 에러도 함께 확인

---

## 디버그 팁

### MCP가 응답 안 할 때
```bash
# 1. settings.json에서 playwright MCP 활성화 확인
# 2. pnpx @playwright/mcp@latest 설치 확인
pnpm list @playwright/mcp

# 3. 개발 서버 포트 확인
lsof -i :3000
```

### 에러-수정 루프가 막힐 때
- 3회 초과 시 사용자에게 수동 개입 요청
- 제약 사항 (예: API 호출 불가) 있는지 확인
- 해당 컴포넌트/페이지 스킵하고 다음으로 진행 가능
