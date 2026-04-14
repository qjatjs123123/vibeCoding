# /phase5-e2e — Phase 5: E2E Tests (Playwright)

`frontend/TODO.md`의 Phase 5 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`frontend/TODO.md`의 Phase 5에서 첫 `[ ]` 항목을 찾습니다 (E2E-1~E2E-6).

### 2️⃣ 컨텍스트 파악
**참고**: `frontend/.claude/rules/testing.md` (E2E 테스트 섹션)

Playwright 스택:
- **기본**: `@playwright/test` (병렬 실행, 여러 브라우저)
- **패턴**: Page Object Model (POM) — 페이지별 클래스
- **실행**: `npx playwright test` (headless) 또는 `--ui` (interactive)

### 3️⃣ 작업 실행

#### 기본 구조

**페이지 객체 (Page Object Model):**
```typescript
// e2e/pages/FeedPage.ts
import { Page } from '@playwright/test';

export class FeedPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async getPostCard(postId: string) {
    return this.page.locator(`[data-testid="post-${postId}"]`);
  }

  async clickLike(postId: string) {
    const card = await this.getPostCard(postId);
    await card.locator('button[aria-label="Like"]').click();
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async waitForInfiniteScroll() {
    await this.page.waitForLoadState('networkidle');
  }
}
```

**테스트 시나리오:**
```typescript
// e2e/feed.spec.ts
import { test, expect } from '@playwright/test';
import { FeedPage } from './pages/FeedPage';

test.describe('Feed', () => {
  test('should load posts and support infinite scroll', async ({ page }) => {
    const feedPage = new FeedPage(page);
    
    await feedPage.goto();
    await expect(page.locator('[data-testid="post-card"]').first()).toBeVisible();

    const initialCount = await page.locator('[data-testid="post-card"]').count();
    
    // 무한스크롤 트리거
    await feedPage.scrollToBottom();
    await feedPage.waitForInfiniteScroll();

    const finalCount = await page.locator('[data-testid="post-card"]').count();
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});
```

### 4️⃣ 검증

**실행:**
```bash
# Headless 모드
npx playwright test

# Interactive UI 모드
npx playwright test --ui

# 특정 브라우저만
npx playwright test --project=chromium
```

모든 테스트 **PASS** 확인.

### 5️⃣ 체크
TODO.md에서 항목을 `[x]`로 변경합니다.

### 6️⃣ 리포트
```
✅ [완료] E2E-1: 피드 로드 + 무한스크롤
  - 초기 로드 확인
  - 스크롤 트리거 시 다음 페이지 로드
  - 테스트 통과 ✅

➡️ [다음] E2E-2: 포스트 작성 → 발행 → 상세 확인
```

---

## E2E 테스트 케이스

### E2E-1: 피드 로드 + 무한스크롤
```
1. 메인 페이지 접속
2. 포스트 카드 12개 로드 확인
3. 페이지 하단으로 스크롤
4. IntersectionObserver 트리거
5. 다음 페이지 (12개) 로드 확인
6. 총 24개 이상 항목 표시
```

### E2E-2: 포스트 작성 → 발행 → 상세 확인
```
1. /write 페이지 접속 (로그인 필요)
2. 제목 입력: "E2E Test Post"
3. 마크다운 에디터에 콘텐츠 입력
4. "발행" 버튼 클릭
5. 자동으로 상세 페이지로 리다이렉트
6. 제목, 콘텐츠, 작성자 확인
```

### E2E-3: 좋아요 토글 (로그인/비로그인)
```
비로그인 상태:
1. 포스트 상세 페이지 접속
2. "좋아요" 버튼 클릭 시도
3. 로그인 페이지로 리다이렉트

로그인 상태:
1. 로그인 후 포스트 상세 접속
2. "좋아요" 버튼 클릭
3. 하트 아이콘 색상 변경 (낙관적 업데이트)
4. 페이지 새로고침 후에도 상태 유지 확인
```

### E2E-4: 댓글 작성 + 대댓글
```
1. 포스트 상세 페이지에서 댓글 폼 스크롤
2. 댓글 입력: "첫 번째 댓글"
3. 제출 버튼 클릭
4. 댓글이 목록에 나타남 확인
5. "답글" 버튼 클릭
6. 대댓글 입력 및 제출
7. 대댓글이 부모 댓글 아래 나타남 확인
```

### E2E-5: 태그 필터 + 시리즈 네비게이션
```
태그 필터:
1. /tags 페이지 접속
2. "React" 태그 클릭
3. /tags/React 페이지로 이동
4. 모든 포스트의 태그에 "React" 포함 확인

시리즈 네비게이션:
1. 시리즈 포함 포스트 상세 페이지
2. "시리즈 이전 글" / "다음 글" 버튼 확인
3. 버튼 클릭 시 시리즈 내 다른 포스트로 이동
```

### E2E-6: 프로필 수정
```
1. /settings/profile 접속 (로그인 필수)
2. 이름 입력: "New Name"
3. 소개 입력: "Updated bio"
4. 아바타 업로드 (이미지 파일)
5. "저장" 버튼 클릭
6. 성공 토스트 메시지 확인
7. /@username 프로필 페이지에서 변경사항 확인
```

---

## Playwright 팁

### 로그인 인증 설정
```typescript
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  // 로그인 플로우
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 세션 저장
  await page.context().storageState({ path: 'auth.json' });
});
```

### 프로젝트 설정 (다중 브라우저)
```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

### 디버그 모드
```bash
# 느리게 실행하며 각 단계 시각화
npx playwright test --debug

# 특정 파일만
npx playwright test e2e/feed.spec.ts --debug
```

---

## 주의사항

- **Page Object Model**: 페이지마다 클래스 생성 (재사용성)
- **data-testid**: 컴포넌트에 `data-testid` 추가 필수 (테스트 용이)
- **네트워크 대기**: `waitForLoadState('networkidle')` 또는 특정 요소 대기
- **비동기**: 모든 액션 후 요소 나타날 때까지 대기
- **CI 환경**: 타임아웃 증가, 재시도 설정 (GitHub Actions 등)

---

## 실행 순서

```
E2E-1: 기본 피드 + 무한스크롤 (앱 검증)
E2E-2: 포스트 작성 (로그인 + 에디터 + 리다이렉트)
E2E-3: 좋아요 (UI 상호작용)
E2E-4: 댓글 (폼 + 중첩 구조)
E2E-5: 태그/시리즈 (네비게이션)
E2E-6: 프로필 수정 (설정 페이지 + 파일 업로드)
```

Phase 5 완료 = **전체 기능 검증 완료**! 🎉
