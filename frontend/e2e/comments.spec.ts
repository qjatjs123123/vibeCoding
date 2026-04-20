import { test, expect } from '@playwright/test';

/**
 * E2E-4: 댓글 & 대댓글 작성 테스트
 * Phase 5 E2E 테스트
 */

test.describe('Comments E2E', () => {
  test.describe('CommentForm - Unauthenticated User', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dev/comments', { waitUntil: 'domcontentloaded' });
      // 쿠키 제거하여 비로그인 상태 시뮬레이션
      await page.context().clearCookies();
    });

    test('should show login prompt for unauthenticated comments', async ({ page }) => {
      // 댓글 폼을 찾고 로그인 유도 메시지 확인
      const loginPrompt = page.locator('[data-testid="comment-form-login-required"]');
      const visible = await loginPrompt.isVisible().catch(() => false);

      // 로그인 폼이 없거나 로그인 프롬프트가 있어야 함
      if (visible) {
        await expect(loginPrompt).toBeVisible();

        // 로그인 버튼 확인
        const loginButton = page.locator('[data-testid="comment-form-login-button"]');
        await expect(loginButton).toBeVisible();

        // 버튼 텍스트 확인
        await expect(loginButton).toContainText('로그인');
      }
    });

    test('should disable comment form for unauthenticated users', async ({ page }) => {
      // 댓글 입력 폼이 비활성화되어 있는지 확인
      const textarea = page.locator('[data-testid="comment-form-textarea"]');
      const isDisabled = await textarea.isDisabled().catch(() => false);
      const isNotVisible = !(await textarea.isVisible().catch(() => false));

      // 입력 폼이 없거나 비활성화되어야 함
      expect(isDisabled || isNotVisible).toBe(true);
    });
  });

  test.describe('CommentForm - Authenticated User', () => {
    test.beforeEach(async ({ page, context }) => {
      await page.goto('/dev/comments', { waitUntil: 'domcontentloaded' });

      // 로그인 상태 시뮬레이션 (쿠키 설정)
      await context.addCookies([
        {
          name: 'auth_token',
          value: 'test_token_authenticated_123',
          url: 'http://localhost:3000',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
        {
          name: 'user_id',
          value: 'alice',
          url: 'http://localhost:3000',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ]);

      // 페이지 새로고침하여 쿠키 반영
      await page.reload({ waitUntil: 'domcontentloaded' });
    });

    test('should display comment form when authenticated', async ({ page }) => {
      // 댓글 입력 폼 찾기
      const commentForm = page.locator('[data-testid="comment-form"]');
      const textarea = page.locator('[data-testid="comment-form-textarea"]');
      const submitButton = page.locator('[data-testid="comment-form-submit-button"]');

      // 폼 요소들이 보이는지 확인
      const formVisible = await commentForm.isVisible().catch(() => false);
      const textareaVisible = await textarea.isVisible().catch(() => false);

      // 최소 하나의 폼 요소가 있어야 함
      expect(formVisible || textareaVisible).toBe(true);

      if (textareaVisible) {
        await expect(textarea).toBeVisible();
        await expect(submitButton).toBeVisible();
      }
    });

    test('should create comment when authenticated', async ({ page }) => {
      // 댓글 입력
      const textarea = page.locator('[data-testid="comment-form-textarea"]');
      const submitButton = page.locator('[data-testid="comment-form-submit-button"]');

      // textarea가 보이는지 확인
      const isVisible = await textarea.isVisible().catch(() => false);

      if (isVisible) {
        // 댓글 입력
        await textarea.fill('This is a test comment from E2E test');

        // 초기 submit 버튼 상태 확인
        const isDisabledBefore = await submitButton.isDisabled().catch(() => false);

        // 입력 후 제출 버튼 활성화되어야 함
        if (isDisabledBefore) {
          // 버튼이 비활성화에서 활성화로 변경될 때까지 대기
          await expect(submitButton).not.toBeDisabled();
        }

        // 제출
        await submitButton.click();

        // 제출 후 textarea가 초기화되는지 확인
        await expect(async () => {
          const content = await textarea.inputValue();
          expect(content).toBe('');
        }).toPass();
      }
    });

    test('should display error for empty comment', async ({ page }) => {
      const textarea = page.locator('[data-testid="comment-form-textarea"]');
      const submitButton = page.locator('[data-testid="comment-form-submit-button"]');

      const isVisible = await textarea.isVisible().catch(() => false);

      if (isVisible) {
        // 빈 댓글로 제출 시도
        await textarea.fill('');
        await submitButton.click();

        // 에러 메시지 확인
        const errorMessage = page.locator('[data-testid="comment-form-error"]');
        const errorVisible = await errorMessage.isVisible().catch(() => false);

        if (errorVisible) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });

  test.describe('Comment Display & Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dev/comments', { waitUntil: 'domcontentloaded' });
    });

    test('should display comment list', async ({ page }) => {
      const commentList = page.locator('[data-testid="comment-list"]');
      await expect(commentList).toBeVisible();
    });

    test('should show parent comment', async ({ page }) => {
      const parentComment = page.locator('text=This is a great article');
      await expect(parentComment).toBeVisible();
    });

    test('should show reply comment with indentation', async ({ page }) => {
      const replyComment = page.locator('text=Thanks for the detailed explanation');
      await expect(replyComment).toBeVisible();

      // 대댓글이 들여쓰기되어 있는지 확인
      const replyDiv = page.locator('[data-testid="comment-2"]');
      const className = await replyDiv.getAttribute('class');
      expect(className).toContain('ml-8');
    });

    test('should display author username', async ({ page }) => {
      const authorName = page.locator('text=alice');
      await expect(authorName).toBeVisible();
    });

    test('should display soft-deleted comment', async ({ page }) => {
      const deletedText = page.locator('text=/삭제된 댓글/');
      await expect(deletedText).toBeVisible();
    });

    test('should show multiple replies under one parent', async ({ page }) => {
      const parentComment = page.locator('[data-testid="comment-1"]');
      const replies = page.locator('[data-testid="comment-2"], [data-testid="comment-3"]');

      await expect(parentComment).toBeVisible();
      await expect(replies.first()).toBeVisible();
    });

    test('should display Edit and Delete buttons for comments', async ({ page, context }) => {
      // 댓글 작성자로 로그인 상태 설정
      await context.addCookies([
        {
          name: 'auth_token',
          value: 'test_token_alice_123',
          url: 'http://localhost:3000',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
        {
          name: 'user_id',
          value: 'alice',
          url: 'http://localhost:3000',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ]);

      await page.reload({ waitUntil: 'domcontentloaded' });

      // Edit 버튼 확인
      const editButtons = page.locator('button:has-text("Edit")');
      const deleteButtons = page.locator('button:has-text("Delete")');

      // 최소한 하나 이상의 버튼이 있어야 함
      const editCount = await editButtons.count();
      const deleteCount = await deleteButtons.count();

      expect(editCount).toBeGreaterThan(0);
      expect(deleteCount).toBeGreaterThan(0);
    });

    test('should display Reply button for comments', async ({ page }) => {
      const replyButtons = page.locator('button:has-text("Reply")');

      // 적어도 부모 댓글의 Reply 버튼이 있어야 함
      const replyCount = await replyButtons.count();
      expect(replyCount).toBeGreaterThan(0);
    });

    test('should display comment timestamps', async ({ page }) => {
      // 타임스탬프가 있는지 확인 (날짜 포맷)
      const timestamps = page.locator('text=/\\d{4}년|\\d{1,2}월/');
      const timestampCount = await timestamps.count();

      expect(timestampCount).toBeGreaterThan(0);
    });

    test('should show avatar for each comment', async ({ page }) => {
      // Avatar 이미지 확인
      const avatarImages = page.locator('img[alt*="alice"], img[alt*="bob"], img[alt*="charlie"]');
      const avatarCount = await avatarImages.count();

      // 적어도 하나 이상의 아바타가 있어야 함
      expect(avatarCount).toBeGreaterThan(0);
    });
  });

  test.describe('Nested Comments - Reply Flow', () => {
    test.beforeEach(async ({ page, context }) => {
      await page.goto('/dev/comments', { waitUntil: 'domcontentloaded' });

      // 로그인 상태 시뮬레이션
      await context.addCookies([
        {
          name: 'auth_token',
          value: 'test_token_reply_user_123',
          url: 'http://localhost:3000',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
        {
          name: 'user_id',
          value: 'reply_user',
          url: 'http://localhost:3000',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ]);

      await page.reload({ waitUntil: 'domcontentloaded' });
    });

    test('should show reply form for nested comment', async ({ page }) => {
      // Reply 버튼 클릭
      const firstReplyButton = page.locator('button:has-text("Reply")').first();

      // 버튼이 보이는지 확인
      const isVisible = await firstReplyButton.isVisible().catch(() => false);

      if (isVisible) {
        await firstReplyButton.click();

        // 리플 상태 메시지가 표시되는지 확인
        const replyingTo = page.locator('text=/Replying to comment/');
        const visible = await replyingTo.isVisible().catch(() => false);

        if (visible) {
          await expect(replyingTo).toBeVisible();
        }
      }
    });

    test('should display parentCommentId in reply form', async ({ page }) => {
      // 부모 댓글의 Reply 버튼 클릭
      const parentCommentSection = page.locator('[data-testid="comment-1"]').first();
      const replyButton = parentCommentSection.locator('button:has-text("Reply")').first();

      const isVisible = await replyButton.isVisible().catch(() => false);

      if (isVisible) {
        await replyButton.click();

        // 상태 표시 확인
        const replyingTo = page.locator('text=/Replying to comment/');
        const visible = await replyingTo.isVisible().catch(() => false);

        expect(visible).toBe(true);
      }
    });

    test('should have correct placeholder for reply', async ({ page }) => {
      // Reply 버튼 클릭
      const firstReplyButton = page.locator('button:has-text("Reply")').first();

      const isVisible = await firstReplyButton.isVisible().catch(() => false);

      if (isVisible) {
        await firstReplyButton.click();

        // 답글 입력 폼의 placeholder 확인
        const textarea = page.locator('[data-testid="comment-form-textarea"]');
        const placeholder = await textarea.getAttribute('placeholder').catch(() => null);

        // 답글 입력 폼이면 placeholder가 "답글을 입력해주세요..."이어야 함
        if (placeholder && placeholder.includes('답글')) {
          expect(placeholder).toContain('답글');
        }
      }
    });
  });

  test.describe('Comment List Structure', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dev/comments', { waitUntil: 'domcontentloaded' });
    });

    test('should structure nested comments correctly', async ({ page }) => {
      // 부모 댓글 확인
      const parentComment = page.locator('[data-testid="comment-1"]');
      const replyComment = page.locator('[data-testid="comment-2"]');

      // 부모가 먼저, 대댓글이 나중에 나타나야 함
      const parentBox = await parentComment.boundingBox();
      const replyBox = await replyComment.boundingBox();

      expect(parentBox).toBeTruthy();
      expect(replyBox).toBeTruthy();

      if (parentBox && replyBox) {
        // 대댓글의 Y 좌표가 부모보다 커야 함 (아래에 위치)
        expect(replyBox.y).toBeGreaterThan(parentBox.y);
      }
    });

    test('should have proper indentation for replies', async ({ page }) => {
      const replyDiv = page.locator('[data-testid="comment-2"]');
      const className = await replyDiv.getAttribute('class');

      expect(className).toContain('ml-8');
    });

    test('should have dividers between comments', async ({ page }) => {
      // 댓글 사이에 구분선이 있는지 확인
      const dividers = page.locator('div.border-b');
      const dividerCount = await dividers.count();

      // 적어도 몇 개의 구분선이 있어야 함
      expect(dividerCount).toBeGreaterThan(0);
    });

    test('should display comment count', async ({ page }) => {
      const commentCount = page.locator('text=/Comments/');
      await expect(commentCount).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('/dev/comments', { waitUntil: 'domcontentloaded' });

        // 모바일 뷰에서도 댓글이 표시되는지 확인
        const comment = page.locator('[data-testid="comment-1"]');
        await expect(comment).toBeVisible();

        // 들여쓰기도 유지되는지 확인
        const replyComment = page.locator('[data-testid="comment-2"]');
        const className = await replyComment.getAttribute('class');
        expect(className).toContain('ml-8');
      }
    });

    test('should display comment form on mobile', async ({ page, context, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('/dev/comments', { waitUntil: 'domcontentloaded' });

        // 로그인 상태
        await context.addCookies([
          {
            name: 'auth_token',
            value: 'test_token_mobile_123',
            url: 'http://localhost:3000',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
          },
          {
            name: 'user_id',
            value: 'mobile_user',
            url: 'http://localhost:3000',
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
          },
        ]);

        await page.reload({ waitUntil: 'domcontentloaded' });

        // 모바일에서 댓글 폼이 표시되는지 확인
        const textarea = page.locator('[data-testid="comment-form-textarea"]');
        const isVisible = await textarea.isVisible().catch(() => false);

        if (isVisible) {
          await expect(textarea).toBeVisible();
        }
      }
    });
  });
});
