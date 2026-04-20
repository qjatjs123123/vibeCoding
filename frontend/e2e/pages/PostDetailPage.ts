import { Page } from '@playwright/test';

/**
 * Page Object Model for Post Detail page
 * Handles interactions with /[username]/[slug]
 */
export class PostDetailPage {
  constructor(
    private page: Page,
    private username: string,
    private slug: string
  ) {}

  /**
   * Navigate to post detail page
   */
  async goto() {
    await this.page.goto(`/${this.username}/${this.slug}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Get the like button element
   */
  async getLikeButton() {
    return this.page.locator(
      'button:has-text(/좋아요|like/i), button[data-testid="like-button"]'
    ).first();
  }

  /**
   * Get the like count display
   */
  async getLikeCount() {
    return this.page.locator(
      'text=/좋아요\\s+\\d+|like count|likes:\\s*\\d+/i'
    ).first();
  }

  /**
   * Get the heart icon (for animation testing)
   */
  async getHeartIcon() {
    return this.page.locator(
      '[data-testid="heart-icon"], svg[aria-label*="heart"], .heart-icon'
    ).first();
  }

  /**
   * Get the login prompt modal/message (when not authenticated)
   */
  async getLoginPrompt() {
    return this.page.locator(
      'text=/로그인이 필요합니다|Please login|로그인 후|Sign in/i'
    );
  }

  /**
   * Get the login button in prompt
   */
  async getLoginButton() {
    return this.page.locator(
      'button:has-text(/로그인|login|sign in/i)'
    );
  }

  /**
   * Get the post title
   */
  async getPostTitle() {
    return this.page.locator('h1').first();
  }

  /**
   * Get the post author name
   */
  async getAuthorName() {
    return this.page.locator(
      'text=/작성자|author|by/i'
    ).or(this.page.locator('[data-testid="post-author"]')).first();
  }

  /**
   * Click the like button
   */
  async clickLike() {
    const likeButton = await this.getLikeButton();
    await likeButton.click();
  }

  /**
   * Check if post is liked (button state)
   */
  async isLiked() {
    const likeButton = await this.getLikeButton();
    const ariaPressed = await likeButton.getAttribute('aria-pressed');
    const className = await likeButton.getAttribute('class');

    // Check aria-pressed attribute
    if (ariaPressed === 'true') return true;

    // Check if button has liked class
    if (className?.includes('liked') || className?.includes('active')) return true;

    // Check button text
    const text = await likeButton.textContent();
    return text?.includes('해제') || text?.includes('Unlike') || false;
  }

  /**
   * Get the like count number
   */
  async getLikeCountNumber() {
    const likeCountText = await this.getLikeCount();
    if (!likeCountText) return null;

    const text = await likeCountText.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  /**
   * Wait for like count to change
   */
  async waitForLikeCountChange(initialCount: number, timeout = 5000) {
    return this.page.waitForFunction(
      (initial) => {
        const element = document.querySelector(
          '[data-testid="like-count"], text=/좋아요\\s+\\d+/i'
        );
        if (!element) return false;

        const text = element.textContent || '';
        const match = text.match(/\d+/);
        const currentCount = match ? parseInt(match[0], 10) : initial;

        return currentCount !== initial;
      },
      initialCount,
      { timeout }
    );
  }

  /**
   * Check if heart animation is playing
   */
  async hasHeartAnimation() {
    const heartIcon = await this.getHeartIcon();
    const className = await heartIcon.getAttribute('class');

    // Check for animation class
    return className?.includes('animate') || className?.includes('bounce') || false;
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad() {
    const title = await this.getPostTitle();
    await title.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if page is loaded
   */
  async isLoaded() {
    const title = await this.getPostTitle();
    return title.isVisible();
  }

  /**
   * Check if login prompt is visible
   */
  async isLoginPromptVisible() {
    const prompt = await this.getLoginPrompt();
    return prompt.isVisible().catch(() => false);
  }

  /**
   * Wait for login prompt to appear
   */
  async waitForLoginPrompt(timeout = 3000) {
    const prompt = await this.getLoginPrompt();
    await prompt.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get text content of the post
   */
  async getPostContent() {
    return this.page.locator('article, [data-testid="post-content"]').textContent();
  }

  /**
   * Check if like button is disabled
   */
  async isLikeButtonDisabled() {
    const likeButton = await this.getLikeButton();
    return likeButton.isDisabled();
  }

  /**
   * Get the comment count
   */
  async getCommentCount() {
    return this.page.locator(
      'text=/댓글\\s+\\d+|comments?:\\s*\\d+|\\d+\\s+comments?/i'
    ).first();
  }

  /**
   * Get the view count
   */
  async getViewCount() {
    return this.page.locator(
      'text=/조회\\s+\\d+|views?:\\s*\\d+|\\d+\\s+views?/i'
    ).first();
  }
}
