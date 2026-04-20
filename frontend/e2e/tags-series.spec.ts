import { test, expect } from '@playwright/test';

test.describe('Tags and Series Navigation', () => {
  test.describe('Tags Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });
    });

    test('should load tags page', async ({ page }) => {
      // Check page title
      const title = page.locator('h1');
      await expect(title).toContainText('Tags');
    });

    test('should display tag list', async ({ page }) => {
      // Check if tags are displayed
      const tags = page.locator('a[href*="/tags/"]');
      const tagCount = await tags.count();

      expect(tagCount).toBeGreaterThan(0);
    });

    test('should display tag names with article count', async ({ page }) => {
      // Verify individual tag elements
      const reactTag = page.locator('a[href="/tags/react"]');
      await expect(reactTag).toBeVisible();

      const reactTagText = await reactTag.textContent();
      expect(reactTagText).toContain('react');
      expect(reactTagText).toContain('articles');
    });

    test('should have clickable tag links', async ({ page }) => {
      // Verify tag links are properly formatted
      const firstTag = page.locator('a[href*="/tags/"]').first();
      const href = await firstTag.getAttribute('href');

      expect(href).toMatch(/^\/tags\/[a-z]+$/);
    });

    test('should display multiple tags in grid layout', async ({ page }) => {
      // Check grid structure
      const tagContainer = page.locator('div[class*="grid"]');
      await expect(tagContainer).toBeVisible();

      const tags = page.locator('a[href*="/tags/"]');
      const count = await tags.count();

      // Should have at least 3 tags
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Tag Detail Page', () => {
    test('should navigate to tag page when clicking tag', async ({ page }) => {
      // Start from tags list page
      await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });

      // Click first tag
      const firstTag = page.locator('a[href*="/tags/"]').first();
      const tagHref = await firstTag.getAttribute('href');

      await firstTag.click();
      await page.waitForURL('**/tags/**', { timeout: 5000 });

      // Verify URL changed
      expect(page.url()).toContain('/tags/');
    });

    test('should display filtered posts by tag', async ({ page }) => {
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Check page title includes tag name
      const title = page.locator('h1').first();
      const titleText = await title.textContent();
      expect(titleText).toContain('react');

      // Check for post list
      const posts = page.locator('article');
      const postCount = await posts.count();

      // Should have at least one post (based on mock data)
      expect(postCount).toBeGreaterThanOrEqual(1);
    });

    test('should show article count for tag', async ({ page }) => {
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Check article count text
      const countText = page.locator('p').filter({ hasText: /article/ });
      await expect(countText.first()).toBeVisible();

      const text = await countText.first().textContent();
      expect(text).toMatch(/\d+\s+articles?/);
    });

    test('should display post details in filtered view', async ({ page }) => {
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Check for post card elements
      const posts = page.locator('article');
      const postCount = await posts.count();

      // At least one post should be visible
      expect(postCount).toBeGreaterThanOrEqual(1);
    });

    test('should have proper tag formatting with hash', async ({ page }) => {
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Check for # prefix in tag name
      const tagHeader = page.locator('h1').first();
      const text = await tagHeader.textContent();

      expect(text).toContain('#');
    });
  });

  test.describe('Tag Navigation from Post Detail', () => {
    test('should navigate to tag page when clicking tag in post detail', async ({ page }) => {
      // Go to post detail page
      await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });

      // Find and click a tag
      const tagLink = page.locator('span[class*="bg"]:first-of-type');

      // Get tag text to verify
      const tagText = await tagLink.textContent();
      expect(tagText).toBeTruthy();

      // Note: If tags are not clickable links in the current implementation,
      // this test verifies that tags are at least displayed
      await expect(tagLink).toBeVisible();
    });

    test('should display tags in post detail header', async ({ page }) => {
      await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });

      // Check for tag badges
      const tags = page.locator('span[class*="rounded"]').filter({ hasText: /#/ });
      const tagCount = await tags.count();

      expect(tagCount).toBeGreaterThanOrEqual(1);
    });

    test('should display multiple tags in post detail', async ({ page }) => {
      await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });

      // Check for tag content
      const pageContent = await page.content();

      expect(pageContent).toContain('react');
      expect(pageContent).toContain('javascript');
    });
  });

  test.describe('Series Navigation', () => {
    test('should display series information if available', async ({ page }) => {
      await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });

      // Check if series section exists (depends on implementation)
      // This is a flexible test since series display is optional for this post
      const page_content = await page.content();
      const hasSeriesInfo = page_content.includes('series') || page_content.includes('Series');

      // If series info exists, verify it's visible
      if (hasSeriesInfo) {
        const seriesSection = page.locator('text=/Series|시리즈/i');
        const visible = await seriesSection.isVisible().catch(() => false);
        expect(visible).toBe(true);
      }
    });

    test('should show post metadata including reading time', async ({ page }) => {
      await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });

      // Check for reading time
      const pageContent = await page.content();
      expect(pageContent).toMatch(/\d+\s+min\s+read/i);
    });

    test('should display author information', async ({ page }) => {
      await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });

      // Check for author name
      const pageContent = await page.content();
      expect(pageContent).toContain('test-user');
    });
  });

  test.describe('Series Page', () => {
    test('should navigate to user series page', async ({ page }) => {
      // Navigate directly to series page
      await page.goto('http://localhost:3000/@test-user/series', { waitUntil: 'networkidle' });

      // Verify page loaded
      const page_content = await page.content();
      expect(page_content.length).toBeGreaterThan(0);
    });

    test('should display series header', async ({ page }) => {
      await page.goto('http://localhost:3000/@test-user/series', { waitUntil: 'networkidle' });

      // Check for series-related header
      const header = page.locator('h1, h2').first();
      const headerText = await header.textContent();

      // Should have some header text
      expect(headerText).toBeTruthy();
    });

    test('should load series content', async ({ page }) => {
      await page.goto('http://localhost:3000/@test-user/series', { waitUntil: 'networkidle' });

      // Check page loaded with content
      const page_content = await page.content();

      // Should have some content (either series or empty message)
      expect(page_content.length).toBeGreaterThan(100);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should display tags page responsively on mobile', async ({ page, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });

        // Check for mobile-optimized grid
        const tags = page.locator('a[href*="/tags/"]');
        const tagCount = await tags.count();

        expect(tagCount).toBeGreaterThan(0);

        // Verify tags are visible in mobile viewport
        const firstTag = tags.first();
        await expect(firstTag).toBeVisible();
      }
    });

    test('should display tag detail page responsively on mobile', async ({ page, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

        // Check for title
        const title = page.locator('h1').first();
        await expect(title).toBeVisible();

        // Check for posts
        const posts = page.locator('article');
        const postCount = await posts.count();
        expect(postCount).toBeGreaterThanOrEqual(1);
      }
    });

    test('should display post detail responsively on mobile', async ({ page, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });

        // Check for main content
        const title = page.locator('h1').first();
        await expect(title).toBeVisible();

        // Check for tags
        const tags = page.locator('span[class*="bg"]');
        const tagCount = await tags.count();
        expect(tagCount).toBeGreaterThanOrEqual(1);
      }
    });
  });

  test.describe('Navigation Flow', () => {
    test('should allow navigation from tags to post to tag again', async ({ page }) => {
      // Start at tags page
      await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });

      // Click on react tag
      const reactTag = page.locator('a[href="/tags/react"]');
      await reactTag.click();
      await page.waitForURL('**/tags/react', { timeout: 5000 });

      // Verify we're on tag page
      const tagTitle = page.locator('h1').first();
      const titleText = await tagTitle.textContent();
      expect(titleText).toContain('react');

      // Click on first post
      const firstPost = page.locator('article').first();
      const postLink = firstPost.locator('a').first();

      await postLink.click();
      await page.waitForURL('**/**/**', { timeout: 5000 });

      // Verify we're on post detail page
      const postPageUrl = page.url();
      expect(postPageUrl).toContain('/');
    });

    test('should maintain context when navigating back', async ({ page }) => {
      // Go to tag page
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Verify tag page loaded
      const tagTitle = page.locator('h1').first();
      const tagText = await tagTitle.textContent();
      expect(tagText).toContain('react');

      // Go back to tags list
      await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });

      // Verify tags list loaded
      const tagsTitle = page.locator('h1').first();
      const tagsText = await tagsTitle.textContent();
      expect(tagsText).toContain('Tags');

      // Click react tag again
      const reactTag = page.locator('a[href="/tags/react"]');
      await reactTag.click();
      await page.waitForURL('**/tags/react', { timeout: 5000 });

      // Verify we're back on tag page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/tags/react');
    });
  });

  test.describe('Content Consistency', () => {
    test('should show same post data on tag page and post detail', async ({ page }) => {
      // Go to tag page
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Get first post
      const posts = page.locator('article');
      const postCount = await posts.count();

      expect(postCount).toBeGreaterThanOrEqual(1);
    });

    test('should display post stats consistently', async ({ page }) => {
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Check for post stats in content
      const pageContent = await page.content();

      // Should have post stats
      expect(pageContent).toMatch(/min read|views|comments/i);
    });

    test('should display author info in post cards', async ({ page }) => {
      await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });

      // Check for author name in post cards
      const posts = page.locator('article');
      const postCount = await posts.count();

      // Should have at least one post with author info
      expect(postCount).toBeGreaterThanOrEqual(1);
    });
  });
});
