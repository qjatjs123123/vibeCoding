import { Page } from '@playwright/test';

/**
 * Page Object Model for Profile Edit page
 * Handles interactions with /settings/profile
 */
export class ProfileEditPage {
  constructor(private page: Page) {}

  /**
   * Navigate to profile edit page
   */
  async goto() {
    await this.page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Get the page title
   */
  async getTitle() {
    return this.page.locator('h1:has-text(/프로필 편집|Edit Profile/)');
  }

  /**
   * Get the profile photo change button
   */
  async getProfilePhotoButton() {
    return this.page.locator('button:has-text(/변경하기|Change/)').first();
  }

  /**
   * Get the name input field
   */
  async getNameInput() {
    return this.page.locator('input[placeholder*="이름|Name"]').first();
  }

  /**
   * Get the username input field (disabled)
   */
  async getUsernameInput() {
    return this.page.locator(
      'input[placeholder*="사용자명|username"]'
    );
  }

  /**
   * Get the email input field
   */
  async getEmailInput() {
    return this.page.locator('input[type="email"]');
  }

  /**
   * Get the bio textarea
   */
  async getBioTextarea() {
    return this.page.locator(
      'textarea[placeholder*="자기소개|biography"]'
    );
  }

  /**
   * Get the blog title input field
   */
  async getBlogTitleInput() {
    return this.page.locator(
      'input[placeholder*="블로그 제목|Blog title"]'
    );
  }

  /**
   * Get the save button
   */
  async getSaveButton() {
    return this.page.locator(
      'button[type="submit"]:has-text(/저장하기|Save/)'
    );
  }

  /**
   * Get the cancel button
   */
  async getCancelButton() {
    return this.page.locator(
      'button[type="button"]:has-text(/취소|Cancel/)'
    );
  }

  /**
   * Update name field
   */
  async updateName(newName: string) {
    const nameInput = await this.getNameInput();
    await nameInput.clear();
    await nameInput.fill(newName);
  }

  /**
   * Update email field
   */
  async updateEmail(newEmail: string) {
    const emailInput = await this.getEmailInput();
    await emailInput.clear();
    await emailInput.fill(newEmail);
  }

  /**
   * Update bio field
   */
  async updateBio(newBio: string) {
    const bioTextarea = await this.getBioTextarea();
    await bioTextarea.clear();
    await bioTextarea.fill(newBio);
  }

  /**
   * Update blog title field
   */
  async updateBlogTitle(newTitle: string) {
    const blogTitleInput = await this.getBlogTitleInput();
    await blogTitleInput.clear();
    await blogTitleInput.fill(newTitle);
  }

  /**
   * Submit the form
   */
  async submit() {
    const saveButton = await this.getSaveButton();
    await saveButton.click();
  }

  /**
   * Cancel the form
   */
  async cancel() {
    const cancelButton = await this.getCancelButton();
    await cancelButton.click();
  }

  /**
   * Update multiple fields and submit
   */
  async updateProfile(data: {
    name?: string;
    email?: string;
    bio?: string;
    blogTitle?: string;
  }) {
    if (data.name) {
      await this.updateName(data.name);
    }
    if (data.email) {
      await this.updateEmail(data.email);
    }
    if (data.bio) {
      await this.updateBio(data.bio);
    }
    if (data.blogTitle) {
      await this.updateBlogTitle(data.blogTitle);
    }
  }

  /**
   * Get current name field value
   */
  async getNameValue() {
    const nameInput = await this.getNameInput();
    return nameInput.inputValue();
  }

  /**
   * Get current email field value
   */
  async getEmailValue() {
    const emailInput = await this.getEmailInput();
    return emailInput.inputValue();
  }

  /**
   * Get current bio field value
   */
  async getBioValue() {
    const bioTextarea = await this.getBioTextarea();
    return bioTextarea.inputValue();
  }

  /**
   * Get current blog title field value
   */
  async getBlogTitleValue() {
    const blogTitleInput = await this.getBlogTitleInput();
    return blogTitleInput.inputValue();
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage(timeout = 5000) {
    return this.page.waitForSelector(
      'text=/저장 완료|Successfully saved|Success/',
      { timeout }
    );
  }

  /**
   * Wait for error message
   */
  async waitForErrorMessage(timeout = 5000) {
    return this.page.waitForSelector(
      'text=/오류|Error|실패|failed/',
      { timeout }
    );
  }

  /**
   * Check if username field is disabled
   */
  async isUsernameDisabled() {
    const usernameInput = await this.getUsernameInput();
    return usernameInput.isDisabled();
  }

  /**
   * Get all form field values as an object
   */
  async getAllFormValues() {
    return {
      name: await this.getNameValue(),
      email: await this.getEmailValue(),
      bio: await this.getBioValue(),
      blogTitle: await this.getBlogTitleValue(),
    };
  }
}

/**
 * Page Object Model for Settings page
 * Handles interactions with /settings
 */
export class SettingsPage {
  constructor(private page: Page) {}

  /**
   * Navigate to settings page
   */
  async goto() {
    await this.page.goto('/settings', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Get the settings page title
   */
  async getTitle() {
    return this.page.locator('h1:has-text(/설정|Settings/)');
  }

  /**
   * Get the profile edit link
   */
  async getProfileEditLink() {
    return this.page.locator(
      'a:has-text(/프로필 편집|Edit Profile/)'
    );
  }

  /**
   * Get the password change section
   */
  async getPasswordChangeSection() {
    return this.page.locator('text=/비밀번호 변경|Change Password/');
  }

  /**
   * Get the notification settings section
   */
  async getNotificationSection() {
    return this.page.locator('text=/알림 설정|Notification Settings/');
  }

  /**
   * Navigate to profile edit page
   */
  async navigateToProfileEdit() {
    const link = await this.getProfileEditLink();
    await link.click();
  }

  /**
   * Check if page is loaded
   */
  async isLoaded() {
    const title = await this.getTitle();
    return title.isVisible();
  }
}

/**
 * Page Object Model for Public Profile page
 * Handles interactions with /@[username]
 */
export class PublicProfilePage {
  constructor(
    private page: Page,
    private username: string
  ) {}

  /**
   * Navigate to public profile page
   */
  async goto() {
    await this.page.goto(`/@${this.username}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Get the user's displayed name
   */
  async getDisplayName() {
    return this.page.locator(`heading:visible`).first();
  }

  /**
   * Get the username display
   */
  async getUsernameDisplay() {
    return this.page.locator(`text=@${this.username}`);
  }

  /**
   * Get the bio section
   */
  async getBioSection() {
    return this.page.locator('text=/自己紹介|bio|biography/i');
  }

  /**
   * Get the blog title if displayed
   */
  async getBlogTitle() {
    // This depends on where blog title is displayed on the public profile
    return this.page.locator('[data-testid="blog-title"]').or(
      this.page.locator('text=/Blog Title|블로그 제목/')
    );
  }

  /**
   * Get the posts section
   */
  async getPostsSection() {
    return this.page.locator('text=/Posts|포스트/');
  }

  /**
   * Get posts list
   */
  async getPostsList() {
    return this.page.locator('[data-testid="post-item"]');
  }

  /**
   * Get the followers count
   */
  async getFollowersCount() {
    return this.page.locator('text=/Followers|팔로워/').first();
  }

  /**
   * Check if profile is loaded
   */
  async isLoaded() {
    const username = await this.getUsernameDisplay();
    return username.isVisible();
  }

  /**
   * Get text content of bio section
   */
  async getBioText() {
    const bioSection = await this.getBioSection();
    return bioSection.textContent();
  }

  /**
   * Verify name is updated
   */
  async verifyName(expectedName: string) {
    const displayName = await this.getDisplayName();
    const text = await displayName.textContent();
    return text?.includes(expectedName) || false;
  }

  /**
   * Verify bio is updated
   */
  async verifyBio(expectedBio: string) {
    const bioText = await this.getBioText();
    return bioText?.includes(expectedBio) || false;
  }
}
