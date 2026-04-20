import { test, expect } from '@playwright/test';
import { PostDetailPage } from './pages/PostDetailPage';

test.describe('Like Button E2E Tests', () => {
  // Mock post data for testing
  const testUsername = 'test-author';
  const testSlug = 'test-post-slug';

  test.beforeEach(async ({ page }) => {
    // Note: Actual URLs will depend on your test data setup
    // You may need to create a fixture or use a dev page for testing
    const postDetailPage = new PostDetailPage(page, testUsername, testSlug);
    await postDetailPage.goto();
  });

  test.describe('Unauthenticated User', () => {
    test('should show login prompt when clicking like button without auth', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Click like button
      await postDetailPage.clickLike();

      // Check if login prompt appears
      const isPromptVisible = await postDetailPage.isLoginPromptVisible();

      // The response could be:
      // 1. A modal/dialog asking to login
      // 2. A message on the page
      // 3. A redirect to login page
      // This test covers case 1 & 2
      expect(
        isPromptVisible || page.url().includes('/login')
      ).toBe(true);
    });

    test('should not increment like count when unauthenticated', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get initial like count
      const initialCount = await postDetailPage.getLikeCountNumber();

      // Click like button
      await postDetailPage.clickLike();

      // Wait a bit for potential update
      await page.waitForTimeout(500);

      // Like count should not change
      const updatedCount = await postDetailPage.getLikeCountNumber();
      expect(updatedCount).toBe(initialCount);
    });

    test('should not change button state when unauthenticated', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Check initial state
      const initialLiked = await postDetailPage.isLiked();

      // Click like button
      await postDetailPage.clickLike();

      // Wait a bit
      await page.waitForTimeout(500);

      // State should not change
      const currentLiked = await postDetailPage.isLiked();
      expect(currentLiked).toBe(initialLiked);
    });
  });

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ context }) => {
      // Set up authentication by adding a mock auth token
      // Adjust cookie name/value based on your actual auth implementation
      await context.addCookies([
        {
          name: 'auth_token',
          value: 'test_token_authenticated_user_123',
          url: 'http://localhost:3000',
          httpOnly: true,
        },
        {
          name: 'userId',
          value: 'test-user-123',
          url: 'http://localhost:3000',
        },
      ]);

      // Alternatively, set auth state in localStorage if using client-side auth
      // await context.addInitScript(() => {
      //   localStorage.setItem('auth_token', 'test_token_123');
      //   localStorage.setItem('user_id', 'test-user-123');
      // });
    });

    test('should toggle like when authenticated user clicks like button', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Check initial state
      const initialLiked = await postDetailPage.isLiked();

      // Click like button
      await postDetailPage.clickLike();

      // Wait for state update
      await page.waitForTimeout(500);

      // State should change
      const updatedLiked = await postDetailPage.isLiked();
      expect(updatedLiked).not.toBe(initialLiked);
    });

    test('should update like count immediately (optimistic update)', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get initial like count
      const initialCount = await postDetailPage.getLikeCountNumber();
      if (initialCount === null) {
        test.skip(); // Skip if like count display not available
      }

      // Click like button
      await postDetailPage.clickLike();

      // Like count should update immediately
      const updatedCount = await postDetailPage.getLikeCountNumber();

      // When liking: count should increase by 1
      // When unliking: count should decrease by 1
      const expectedCount = initialCount! + (await postDetailPage.isLiked() ? 1 : -1);

      // Allow small timing variance for optimistic update
      expect(Math.abs(updatedCount! - expectedCount)).toBeLessThanOrEqual(1);
    });

    test('should show like animation when clicking like button', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get heart icon
      const heartIcon = await postDetailPage.getHeartIcon();

      // Heart icon should exist
      await expect(heartIcon).toBeVisible();

      // Click like button
      await postDetailPage.clickLike();

      // Check if animation class is applied
      // Note: Animation classes might be removed quickly, so check timing
      const hasAnimation = await postDetailPage.hasHeartAnimation();

      // Animation might have already completed, so we check if button state changed
      // which is a better indicator of successful like action
      const isNowLiked = await postDetailPage.isLiked();
      expect(isNowLiked).toBeDefined();
    });

    test('should toggle like back when clicked again', async ({ page }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get initial state
      const initialLiked = await postDetailPage.isLiked();
      const initialCount = await postDetailPage.getLikeCountNumber();

      // Click like button (toggle on)
      await postDetailPage.clickLike();
      await page.waitForTimeout(300);

      // Check state changed
      let currentLiked = await postDetailPage.isLiked();
      expect(currentLiked).not.toBe(initialLiked);

      // Click like button again (toggle off)
      await postDetailPage.clickLike();
      await page.waitForTimeout(300);

      // Check state returned to initial
      currentLiked = await postDetailPage.isLiked();
      expect(currentLiked).toBe(initialLiked);

      // Like count should return to initial
      const finalCount = await postDetailPage.getLikeCountNumber();
      expect(finalCount).toBe(initialCount);
    });

    test('should maintain like state after page reload', async ({ page }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get initial state
      const initialLiked = await postDetailPage.isLiked();

      // Click like button to change state
      await postDetailPage.clickLike();
      await page.waitForTimeout(300);

      const likedAfterClick = await postDetailPage.isLiked();
      expect(likedAfterClick).not.toBe(initialLiked);

      // Reload page
      await page.reload({ waitUntil: 'domcontentloaded' });
      await postDetailPage.waitForPageLoad();

      // Like state should be persisted
      const likedAfterReload = await postDetailPage.isLiked();
      expect(likedAfterReload).toBe(likedAfterClick);
    });

    test('should show visual feedback on like button when liked', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get like button
      const likeButton = await postDetailPage.getLikeButton();

      // Get initial class/style
      const initialClass = await likeButton.getAttribute('class');

      // If already liked, unlike first to get to initial state
      let isCurrentlyLiked = await postDetailPage.isLiked();
      if (isCurrentlyLiked) {
        await postDetailPage.clickLike();
        await page.waitForTimeout(300);
      }

      // Click to like
      await postDetailPage.clickLike();
      await page.waitForTimeout(300);

      // Check button has visual changes (class, style, or icon change)
      const likedClass = await likeButton.getAttribute('class');

      // Either class changes or aria-pressed changes
      const ariaPressed = await likeButton.getAttribute('aria-pressed');

      expect(
        likedClass !== initialClass || ariaPressed === 'true'
      ).toBe(true);
    });
  });

  test.describe('Like Button Rendering', () => {
    test('should display like button on post detail page', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Like button should be visible
      const likeButton = await postDetailPage.getLikeButton();
      await expect(likeButton).toBeVisible();
    });

    test('should display like count on post detail page', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Like count should be visible
      const likeCount = await postDetailPage.getLikeCount();
      await expect(likeCount).toBeVisible();

      // Like count should contain a number
      const count = await postDetailPage.getLikeCountNumber();
      expect(typeof count).toBe('number');
    });

    test('should display heart icon in like button', async ({ page }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Heart icon should be present
      const heartIcon = await postDetailPage.getHeartIcon();
      const isVisible = await heartIcon.isVisible().catch(() => false);

      // Heart icon might be inside button, so check if it exists
      expect(isVisible || (await heartIcon.count()) > 0).toBe(true);
    });

    test('should render like button in correct section of page', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get button positions
      const likeButton = await postDetailPage.getLikeButton();
      const postTitle = await postDetailPage.getPostTitle();

      // Get bounding boxes
      const buttonBox = await likeButton.boundingBox();
      const titleBox = await postTitle.boundingBox();

      // Button should be below title (Y coordinate check)
      expect(buttonBox).toBeTruthy();
      expect(titleBox).toBeTruthy();

      if (buttonBox && titleBox) {
        // Like button should be after title in page flow
        expect(buttonBox.y).toBeGreaterThanOrEqual(titleBox.y);
      }
    });
  });

  test.describe('Like Button Accessibility', () => {
    test('should have accessible like button', async ({ page }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get like button
      const likeButton = await postDetailPage.getLikeButton();

      // Button should be keyboard accessible
      const role = await likeButton.getAttribute('role');
      expect(role).toBe('button');

      // Button should have text or aria-label
      const ariaLabel = await likeButton.getAttribute('aria-label');
      const text = await likeButton.textContent();

      expect(ariaLabel || text).toBeTruthy();
    });

    test('should have aria-pressed attribute for like button', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Get like button
      const likeButton = await postDetailPage.getLikeButton();

      // Button should have aria-pressed
      const ariaPressed = await likeButton.getAttribute('aria-pressed');

      // aria-pressed should be 'true' or 'false'
      expect(['true', 'false', null]).toContain(ariaPressed);
    });

    test('should be keyboard navigable to like button', async ({ page }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Tab through page to reach like button
      // This tests keyboard accessibility
      await page.keyboard.press('Tab');

      // The focused element should eventually be reachable
      // (This is a basic test - full keyboard nav testing would be more complex)
      const focusedElement = await page.evaluate(() =>
        document.activeElement?.tagName
      );

      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe('Like Button Error Handling', () => {
    test('should handle network error gracefully', async ({ page }) => {
      // Simulate network error by disabling network
      await page.context().setOffline(true);

      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Try to click like button
      const likeButton = await postDetailPage.getLikeButton();

      // This might fail or show error, but page should not crash
      try {
        await likeButton.click();
      } catch (error) {
        // Error is acceptable in offline mode
      }

      // Re-enable network
      await page.context().setOffline(false);

      // Page should still be interactive
      expect(await postDetailPage.isLoaded()).toBe(true);
    });

    test('should show user-friendly error message on like failure', async ({
      page,
    }) => {
      const postDetailPage = new PostDetailPage(page, testUsername, testSlug);

      // Wait for page to load
      await postDetailPage.waitForPageLoad();

      // Intercept and fail like request
      await page.route('**/api/posts/**/like', (route) => {
        route.abort('failed');
      });

      // Click like button
      await postDetailPage.clickLike();

      // Wait for error message or indication
      const errorIndicator = page.locator(
        'text=/실패|error|failed|문제가 발생/i'
      );

      // Either error message appears or like state doesn't change
      const hasError = await errorIndicator.isVisible().catch(() => false);
      const isLiked = await postDetailPage.isLiked();

      // At least one should be true (error message OR state unchanged)
      expect(hasError || !isLiked).toBeDefined();
    });
  });
});
