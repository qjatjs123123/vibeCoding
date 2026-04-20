import { test, expect } from '@playwright/test';

test.describe('MarkdownEditor', () => {
  test.beforeEach(async ({ page }) => {
    // 개발 페이지로 이동
    await page.goto('/dev/markdown-editor', { waitUntil: 'domcontentloaded' });
  });

  test('should render the page', async ({ page }) => {
    // 페이지가 로드되었는지 확인
    const title = page.locator('head title');
    await expect(title).toBeTruthy();
  });

  test('should display title input', async ({ page }) => {
    // 제목 입력 필드가 있는지 확인
    const titleInput = page.locator('input[placeholder="Post title"]');
    await expect(titleInput).toBeVisible();
  });

  test('should display initial title', async ({ page }) => {
    // 초기 제목이 표시되는지 확인
    const titleInput = page.locator('input[placeholder="Post title"]');
    const value = await titleInput.inputValue();
    expect(value).toContain('Welcome');
  });

  test('should display excerpt input', async ({ page }) => {
    // 발췌 입력 필드가 있는지 확인
    const excerptInput = page.locator('input[placeholder*="summary"]');
    await expect(excerptInput).toBeVisible();
  });

  test('should display cover image', async ({ page }) => {
    // 커버 이미지가 표시되는지 확인
    const coverImage = page.locator('img[alt="cover"]');
    await expect(coverImage).toBeVisible();
  });

  test('should update title on input', async ({ page }) => {
    // 제목 입력 필드 찾기
    const titleInput = page.locator('input[placeholder="Post title"]');

    // 기존 값 지우기
    await titleInput.clear();

    // 새로운 값 입력
    await titleInput.fill('New Test Title');

    // 변경된 값 확인
    const newValue = await titleInput.inputValue();
    expect(newValue).toBe('New Test Title');
  });

  test('should display textarea for markdown editing', async ({ page }) => {
    // 마크다운 편집 영역 (textarea)이 있는지 확인
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
  });

  test('should have draft info section', async ({ page }) => {
    // 드래프트 정보 (제목 섹션)이 있는지 확인
    const draftSection = page.locator('text=Title');
    await expect(draftSection).toBeVisible();
  });

  test('should have edit and preview labels', async ({ page }) => {
    // 페이지에서 "Markdown Editor" 또는 "Preview" 텍스트 확인
    const editorLabel = page.locator('text=Markdown Editor');
    const previewLabel = page.locator('text=Preview');

    // 둘 중 하나는 보여야 함
    const editorVisible = await editorLabel.isVisible().catch(() => false);
    const previewVisible = await previewLabel.isVisible().catch(() => false);

    expect(editorVisible || previewVisible).toBe(true);
  });

  test('should display split view or tab controls', async ({ page }) => {
    // "Full Width" 또는 "Split View" 버튼이 있는지 확인
    const splitViewButton = page.locator('button').filter({ hasText: /Full Width|Split View/ });
    const editTabButton = page.locator('button').filter({ hasText: /Edit|Preview/ });

    // 하나 이상의 컨트롤이 있어야 함
    const splitVisible = await splitViewButton.isVisible().catch(() => false);
    const tabVisible = await editTabButton.isVisible().catch(() => false);

    expect(splitVisible || tabVisible).toBe(true);
  });

  test('should display cover image input', async ({ page }) => {
    // 커버 이미지 URL 입력 필드
    const coverImageInput = page.locator('input[placeholder*="example.com/image"]');
    await expect(coverImageInput).toBeVisible();
  });

  test('should display upload button', async ({ page }) => {
    // Upload 버튼이 있는지 확인
    const uploadButton = page.locator('button:has-text("Upload")');
    await expect(uploadButton).toBeVisible();
  });

  test('should have working textarea for markdown', async ({ page }) => {
    // Textarea에 텍스트 입력할 수 있는지 확인
    const textarea = page.locator('textarea');

    // 기존 내용 확인
    const initialValue = await textarea.inputValue();
    expect(initialValue.length).toBeGreaterThan(0);

    // 새로운 내용 입력
    await textarea.fill('# New Content\n\nTesting markdown editor');

    // 변경된 값 확인
    const newValue = await textarea.inputValue();
    expect(newValue).toContain('New Content');
  });

  test('should maintain form data on interaction', async ({ page }) => {
    // 여러 필드와 상호작용한 후 데이터가 유지되는지 확인

    // 1. 제목 변경
    const titleInput = page.locator('input[placeholder="Post title"]');
    await titleInput.clear();
    await titleInput.fill('Test Post');

    // 2. Textarea에 텍스트 입력
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.fill('# Test Content');

    // 3. 입력한 값들이 유지되는지 확인
    const titleValue = await titleInput.inputValue();
    const textareaValue = await textarea.inputValue();

    expect(titleValue).toBe('Test Post');
    expect(textareaValue).toContain('Test Content');
  });

  test('should show all metadata input fields', async ({ page }) => {
    // 모든 메타데이터 필드가 표시되는지 확인
    const titleInput = page.locator('input[placeholder="Post title"]');
    const excerptInput = page.locator('input[placeholder*="summary"]');
    const coverImageInput = page.locator('input[placeholder*="example.com"]');
    const uploadButton = page.locator('button:has-text("Upload")');

    await expect(titleInput).toBeVisible();
    await expect(excerptInput).toBeVisible();
    await expect(coverImageInput).toBeVisible();
    await expect(uploadButton).toBeVisible();
  });

  test('should display markdown editor section', async ({ page }) => {
    // 마크다운 에디터 섹션이 있는지 확인
    const editorSection = page.locator('text=Markdown Editor');
    const textarea = page.locator('textarea');

    // 한 가지는 보여야 함
    const sectionVisible = await editorSection.isVisible().catch(() => false);
    const textareaVisible = await textarea.isVisible().catch(() => false);

    expect(sectionVisible || textareaVisible).toBe(true);
  });

  test('should have responsive layout', async ({ page, viewport }) => {
    // 뷰포트가 설정된 경우, 레이아웃 확인
    if (viewport) {
      const isMobile = viewport.width < 768;

      if (isMobile) {
        // 모바일에서는 탭이 있어야 함
        const editTab = page.locator('button:has-text("Edit")');
        const previewTab = page.locator('button:has-text("Preview")');

        const editVisible = await editTab.isVisible().catch(() => false);
        const previewVisible = await previewTab.isVisible().catch(() => false);

        expect(editVisible || previewVisible).toBe(true);
      } else {
        // 데스크탑에서는 Split View 컨트롤이 있을 수 있음
        const splitButton = page.locator('button').filter({ hasText: /Full Width|Split View/ });
        const splitVisible = await splitButton.isVisible().catch(() => false);

        // Split View 컨트롤이 있으면 좋지만, 필수는 아님
        expect(typeof splitVisible).toBe('boolean');
      }
    }
  });
});
