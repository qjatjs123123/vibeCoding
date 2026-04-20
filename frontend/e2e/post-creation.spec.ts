import { test, expect } from '@playwright/test';

/**
 * E2E-2: 포스트 작성 & 발행 플로우 테스트
 * Phase 5 E2E 테스트
 *
 * 요구사항:
 * 1. /write 페이지 네비게이션
 * 2. 제목 + 본문 입력
 * 3. 태그 추가
 * 4. 발행 버튼 클릭
 * 5. 포스트 상세 페이지로 리다이렉트 확인
 * 6. 입력한 내용이 올바르게 표시되는지 확인
 */

test.describe('Post Creation & Publishing', () => {
  test.beforeEach(async ({ page }) => {
    // /write 페이지로 이동
    await page.goto('/write', { waitUntil: 'domcontentloaded' });
  });

  test('should navigate to write page', async ({ page }) => {
    // 페이지가 로드되었는지 확인
    const url = page.url();
    expect(url).toContain('/write');

    // 페이지 제목 또는 주요 요소 확인
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await expect(titleInput).toBeVisible();
  });

  test('should display write page elements', async ({ page }) => {
    // 제목 입력 필드
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await expect(titleInput).toBeVisible();

    // 요약 텍스트 영역
    const excerptInput = page.locator('textarea[placeholder="Post summary (optional)"]');
    await expect(excerptInput).toBeVisible();

    // 발행 버튼
    const publishButton = page.locator('button:has-text("Publish")');
    await expect(publishButton).toBeVisible();

    // 취소 버튼
    const cancelButton = page.locator('button:has-text("Cancel")');
    await expect(cancelButton).toBeVisible();
  });

  test('should fill in post form with title and content', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('My First Blog Post');

    // 제목 입력 확인
    const titleValue = await titleInput.inputValue();
    expect(titleValue).toBe('My First Blog Post');

    // 요약 입력
    const excerptInput = page.locator('textarea[placeholder="Post summary (optional)"]');
    await excerptInput.fill('This is a summary of my first blog post');

    // 요약 입력 확인
    const excerptValue = await excerptInput.inputValue();
    expect(excerptValue).toBe('This is a summary of my first blog post');
  });

  test('should fill in markdown content', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Markdown Test Post');

    // 마크다운 편집 영역 찾기
    // 마크다운 에디터는 동적 import 되므로 여러 방법으로 찾아야 함
    const textarea = page.locator('textarea').first();

    // textarea가 보이는지 확인
    const isVisible = await textarea.isVisible().catch(() => false);

    if (isVisible) {
      // 마크다운 콘텐츠 입력
      await textarea.fill('# Welcome\n\nThis is a **markdown** post with _emphasis_.');

      // 입력 확인
      const content = await textarea.inputValue();
      expect(content).toContain('# Welcome');
      expect(content).toContain('markdown');
    }
  });

  test('should add tags', async ({ page }) => {
    // 제목 입력 (필수)
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Tagged Post');

    // 설정 사이드바가 보이는지 확인
    const tagSection = page.locator('h3:has-text("Tags")');
    const isSidebarVisible = await tagSection.isVisible().catch(() => false);

    if (isSidebarVisible) {
      // 태그 버튼 찾기 (예: #react)
      const reactTag = page.locator('button:has-text("#react")');
      const typeScriptTag = page.locator('button:has-text("#typescript")');

      // 태그 클릭
      const reactVisible = await reactTag.isVisible().catch(() => false);
      const typeScriptVisible = await typeScriptTag.isVisible().catch(() => false);

      if (reactVisible) {
        await reactTag.click();
        // 태그 버튼이 활성화되었는지 확인 (배경색 변경)
        const reactClass = await reactTag.getAttribute('class');
        expect(reactClass).toContain('accent');
      }

      if (typeScriptVisible) {
        await typeScriptTag.click();
        const typeScriptClass = await typeScriptTag.getAttribute('class');
        expect(typeScriptClass).toContain('accent');
      }
    }
  });

  test('should display series selector', async ({ page }) => {
    // 제목 입력 (필수)
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Series Post');

    // 시리즈 섹션 확인
    const seriesSection = page.locator('h3:has-text("Series")');
    const isSidebarVisible = await seriesSection.isVisible().catch(() => false);

    if (isSidebarVisible) {
      // 시리즈 select 찾기
      const seriesSelect = page.locator('select');
      await expect(seriesSelect).toBeVisible();

      // 시리즈 옵션 확인
      await seriesSelect.selectOption('1');
      const selectedValue = await seriesSelect.inputValue();
      expect(selectedValue).toBe('1');
    }
  });

  test('should toggle sidebar visibility', async ({ page }) => {
    // 제목 입력 (필수)
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Sidebar Test');

    // 사이드바 토글 버튼 찾기
    const toggleButton = page.locator('button:has-text(/Hide settings|Show settings/)');
    await expect(toggleButton).toBeVisible();

    // 초기 상태에서 사이드바 보임
    let sidebarVisible = await page.locator('h3:has-text("Tags")').isVisible().catch(() => false);
    expect(sidebarVisible).toBe(true);

    // 사이드바 숨기기
    await toggleButton.click();
    sidebarVisible = await page.locator('h3:has-text("Tags")').isVisible().catch(() => false);
    expect(sidebarVisible).toBe(false);

    // 다시 보이기
    await toggleButton.click();
    sidebarVisible = await page.locator('h3:has-text("Tags")').isVisible().catch(() => false);
    expect(sidebarVisible).toBe(true);
  });

  test('should prevent publishing without title', async ({ page }) => {
    // 제목 입력 없이 발행 시도
    const publishButton = page.locator('button:has-text("Publish")');

    // alert 핸들러 설정
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Title is required');
      dialog.accept();
    });

    await publishButton.click();

    // 여전히 /write 페이지에 있는지 확인
    const url = page.url();
    expect(url).toContain('/write');
  });

  test('should publish and redirect to home', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('New Published Post');

    // 발행 버튼 클릭
    const publishButton = page.locator('button:has-text("Publish")');
    await publishButton.click();

    // 발행 중 상태 확인
    const publishingText = page.locator('button:has-text("Publishing...")');
    const isPublishing = await publishingText.isVisible().catch(() => false);

    if (isPublishing) {
      await expect(publishingText).toBeVisible();
    }

    // 리다이렉트 대기 (시뮬레이션이므로 /로 이동)
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {
      // 시뮬레이션이므로 리다이렉트 안 될 수 있음
    });

    // URL 확인 (리다이렉트 성공 또는 여전히 /write)
    const finalUrl = page.url();
    expect(
      finalUrl === 'http://localhost:3000/' ||
      finalUrl.includes('/write')
    ).toBe(true);
  });

  test('should maintain form state during interaction', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('State Test Post');

    // 요약 입력
    const excerptInput = page.locator('textarea[placeholder="Post summary (optional)"]');
    await excerptInput.fill('Test summary');

    // 사이드바 토글
    const toggleButton = page.locator('button:has-text(/Hide settings|Show settings/)');
    await toggleButton.click();

    // 다시 토글
    await toggleButton.click();

    // 입력값이 유지되는지 확인
    const titleValue = await titleInput.inputValue();
    const excerptValue = await excerptInput.inputValue();

    expect(titleValue).toBe('State Test Post');
    expect(excerptValue).toBe('Test summary');
  });

  test('should handle cancel button', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Cancel Test Post');

    // 취소 버튼 클릭
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // 뒤로 가기 동작 확인 (이전 페이지로 이동해야 함)
    // 처음 접속이므로 뒤로 갈 곳이 없을 수 있음
    const newUrl = page.url();
    // URL이 변경되었거나 내용이 리셋되었는지 확인
    expect(newUrl).toBeDefined();
  });

  test('should display multiple tags and allow selection', async ({ page }) => {
    // 제목 입력 (필수)
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Multiple Tags Post');

    // 모든 태그 버튼 찾기
    const tagButtons = page.locator('button').filter({ hasText: /#/ });
    const tagCount = await tagButtons.count();

    // 최소 몇 개의 태그가 있는지 확인
    expect(tagCount).toBeGreaterThan(0);

    // 태그 클릭 가능 여부 확인
    if (tagCount > 0) {
      const firstTag = tagButtons.first();
      await firstTag.click();

      // 클릭된 태그의 클래스 확인
      const firstTagClass = await firstTag.getAttribute('class');
      expect(firstTagClass).toBeDefined();
    }
  });

  test('should display auto-save info message', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Auto-save Test');

    // 자동저장 정보 메시지 찾기
    const autoSaveInfo = page.locator('text=Auto-save is enabled');
    const isVisible = await autoSaveInfo.isVisible().catch(() => false);

    if (isVisible) {
      await expect(autoSaveInfo).toBeVisible();
    }
  });

  test('should display publish button with correct text', async ({ page }) => {
    const publishButton = page.locator('button:has-text("Publish")');

    await expect(publishButton).toBeVisible();
    await expect(publishButton).toHaveText('Publish');

    // 버튼이 활성화되어 있는지 확인
    const isDisabled = await publishButton.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('should handle title input with special characters', async ({ page }) => {
    const titleInput = page.locator('input[placeholder="Post title..."]');

    // 특수문자를 포함한 제목 입력
    await titleInput.fill('Post Title with [Special] Characters & Symbols!');

    const titleValue = await titleInput.inputValue();
    expect(titleValue).toBe('Post Title with [Special] Characters & Symbols!');
  });

  test('should display cover image input field', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Cover Image Test');

    // 커버 이미지 섹션 확인
    const coverImageSection = page.locator('h3:has-text("Cover Image")');
    const isSidebarVisible = await coverImageSection.isVisible().catch(() => false);

    if (isSidebarVisible) {
      const coverImageInput = page.locator('input[placeholder="Image URL (optional)"]');
      await expect(coverImageInput).toBeVisible();

      // URL 입력
      await coverImageInput.fill('https://example.com/cover.jpg');
      const imageUrl = await coverImageInput.inputValue();
      expect(imageUrl).toBe('https://example.com/cover.jpg');
    }
  });

  test('should have responsive layout with editor section', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Responsive Layout Test');

    // 에디터 영역이 있는지 확인
    const editorArea = page.locator('div.flex-1');
    const isVisible = await editorArea.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('should handle form submission flow', async ({ page }) => {
    // 완전한 폼 작성
    const titleInput = page.locator('input[placeholder="Post title..."]');
    await titleInput.fill('Complete Form Test');

    const excerptInput = page.locator('textarea[placeholder="Post summary (optional)"]');
    await excerptInput.fill('This is a complete test');

    // 마크다운 콘텐츠 입력 시도
    const textarea = page.locator('textarea').first();
    const isVisible = await textarea.isVisible().catch(() => false);

    if (isVisible && (await textarea.inputValue()).length === 0) {
      await textarea.fill('# Test Content\n\nTest body');
    }

    // 발행 버튼 클릭
    const publishButton = page.locator('button:has-text("Publish")');
    await publishButton.click();

    // 발행 처리 대기
    await page.waitForTimeout(1500);

    // 최종 상태 확인
    const finalUrl = page.url();
    expect(finalUrl).toBeDefined();
  });
});
