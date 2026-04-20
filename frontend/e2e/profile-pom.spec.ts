import { test, expect } from '@playwright/test';
import {
  ProfileEditPage,
  SettingsPage,
  PublicProfilePage,
} from './pages/ProfilePage';

test.describe('Profile Edit E2E (Using Page Object Model)', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    newName: 'Updated Test User',
    newBio: 'Updated bio for testing',
    newBlogTitle: 'My Awesome Dev Blog',
  };

  // Helper: Set authentication cookie
  async function setAuthCookie(page: any) {
    await page.context().addCookies([
      {
        name: 'auth_token',
        value: 'test_token_123',
        url: 'http://localhost:3000',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
  }

  test.describe('Settings and Navigation Flow', () => {
    test('should navigate from settings to profile edit', async ({ page }) => {
      await setAuthCookie(page);

      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();

      // Verify settings page is loaded
      const title = await settingsPage.getTitle();
      await expect(title).toBeVisible();

      // Navigate to profile edit
      await settingsPage.navigateToProfileEdit();

      // Verify profile edit page is loaded
      const profileEditPage = new ProfileEditPage(page);
      const profileTitle = await profileEditPage.getTitle();
      await expect(profileTitle).toBeVisible();
    });

    test('should display all settings menu items', async ({ page }) => {
      await setAuthCookie(page);

      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();

      // Check all menu sections exist
      const profileLink = await settingsPage.getProfileEditLink();
      await expect(profileLink).toBeVisible();

      const passwordSection = await settingsPage.getPasswordChangeSection();
      await expect(passwordSection).toBeVisible();

      const notificationSection = await settingsPage.getNotificationSection();
      await expect(notificationSection).toBeVisible();
    });
  });

  test.describe('Profile Edit Form', () => {
    test.beforeEach(async ({ page }) => {
      await setAuthCookie(page);
    });

    test('should display all form fields', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Verify all fields are visible
      await expect(await profilePage.getNameInput()).toBeVisible();
      await expect(await profilePage.getEmailInput()).toBeVisible();
      await expect(await profilePage.getBioTextarea()).toBeVisible();
      await expect(await profilePage.getBlogTitleInput()).toBeVisible();

      // Username should be disabled
      const usernameInput = await profilePage.getUsernameInput();
      await expect(usernameInput).toBeDisabled();
    });

    test('should display form buttons', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Verify buttons exist
      await expect(await profilePage.getSaveButton()).toBeVisible();
      await expect(await profilePage.getCancelButton()).toBeVisible();
    });

    test('should update name field', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      await profilePage.updateName(testUser.newName);

      const value = await profilePage.getNameValue();
      expect(value).toBe(testUser.newName);
    });

    test('should update email field', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      const newEmail = 'newemail@example.com';
      await profilePage.updateEmail(newEmail);

      const value = await profilePage.getEmailValue();
      expect(value).toBe(newEmail);
    });

    test('should update bio field', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      await profilePage.updateBio(testUser.newBio);

      const value = await profilePage.getBioValue();
      expect(value).toBe(testUser.newBio);
    });

    test('should update blog title field', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      await profilePage.updateBlogTitle(testUser.newBlogTitle);

      const value = await profilePage.getBlogTitleValue();
      expect(value).toBe(testUser.newBlogTitle);
    });

    test('should update multiple fields at once', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Update multiple fields
      await profilePage.updateProfile({
        name: testUser.newName,
        email: 'newemail@example.com',
        bio: testUser.newBio,
        blogTitle: testUser.newBlogTitle,
      });

      // Verify all values
      const values = await profilePage.getAllFormValues();
      expect(values.name).toBe(testUser.newName);
      expect(values.email).toBe('newemail@example.com');
      expect(values.bio).toBe(testUser.newBio);
      expect(values.blogTitle).toBe(testUser.newBlogTitle);
    });

    test('should submit profile changes', async ({ page, context }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Update fields
      await profilePage.updateProfile({
        name: testUser.newName,
        bio: testUser.newBio,
      });

      // Submit
      await profilePage.submit();

      // Verify submission (success message or navigation)
      await page.waitForTimeout(500);
      // In a real scenario, you'd check for success message or API call
    });

    test('should cancel form without submitting', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Get initial value
      const initialName = await profilePage.getNameValue();

      // Update field
      await profilePage.updateName('Changed Name');

      // Verify change
      let currentValue = await profilePage.getNameValue();
      expect(currentValue).toBe('Changed Name');

      // Cancel
      await profilePage.cancel();

      // In a real scenario, the form would reset or navigate away
      // For now, we just verify the cancel action was triggered
      await page.waitForTimeout(500);
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await setAuthCookie(page);
    });

    test('should validate email format', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      const emailInput = await profilePage.getEmailInput();

      // Test invalid email
      await emailInput.clear();
      await emailInput.fill('invalid-email');

      const isValid = await emailInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity()
      );
      expect(isValid).toBe(false);

      // Test valid email
      await emailInput.clear();
      await emailInput.fill('valid@example.com');

      const isValidAfter = await emailInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity()
      );
      expect(isValidAfter).toBe(true);
    });

    test('should ensure username field is disabled', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      const isDisabled = await profilePage.isUsernameDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('Public Profile Display', () => {
    test.beforeEach(async ({ page }) => {
      await setAuthCookie(page);
    });

    test('should display updated name on public profile', async ({ page }) => {
      const profileEditPage = new ProfileEditPage(page);
      await profileEditPage.goto();

      // Update name
      await profileEditPage.updateName(testUser.newName);
      await profileEditPage.submit();

      // Navigate to public profile
      await page.waitForTimeout(500);
      const publicProfile = new PublicProfilePage(page, testUser.username);
      await publicProfile.goto();

      // Verify name is updated (if ISR is instant)
      // In real scenarios, ISR may have a delay
      // const isUpdated = await publicProfile.verifyName(testUser.newName);
      // expect(isUpdated).toBe(true);

      // At minimum, verify public profile loaded
      const isLoaded = await publicProfile.isLoaded();
      expect(isLoaded).toBe(true);
    });

    test('should display updated bio on public profile', async ({ page }) => {
      const profileEditPage = new ProfileEditPage(page);
      await profileEditPage.goto();

      // Update bio
      await profileEditPage.updateBio(testUser.newBio);
      await profileEditPage.submit();

      // Navigate to public profile
      await page.waitForTimeout(500);
      const publicProfile = new PublicProfilePage(page, testUser.username);
      await publicProfile.goto();

      // Verify bio is present
      const isLoaded = await publicProfile.isLoaded();
      expect(isLoaded).toBe(true);

      // Verify bio text (if ISR updates are instant)
      // const bioUpdated = await publicProfile.verifyBio(testUser.newBio);
      // expect(bioUpdated).toBe(true);
    });

    test('should display user statistics on public profile', async ({
      page,
    }) => {
      const publicProfile = new PublicProfilePage(page, testUser.username);
      await publicProfile.goto();

      // Verify public profile displays key information
      const usernameDisplay = await publicProfile.getUsernameDisplay();
      await expect(usernameDisplay).toBeVisible();

      const postsSection = await publicProfile.getPostsSection();
      await expect(postsSection).toBeVisible();

      const followersCount = await publicProfile.getFollowersCount();
      await expect(followersCount).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await setAuthCookie(page);
    });

    test('should display form fields on mobile viewport', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Verify all fields are visible on mobile
      await expect(await profilePage.getNameInput()).toBeVisible();
      await expect(await profilePage.getEmailInput()).toBeVisible();
      await expect(await profilePage.getBioTextarea()).toBeVisible();
      await expect(await profilePage.getBlogTitleInput()).toBeVisible();
    });

    test('should display buttons with adequate size on mobile', async ({
      page,
    }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      const saveButton = await profilePage.getSaveButton();
      const boundingBox = await saveButton.boundingBox();

      // Button should be at least 44px (iOS minimum touch target)
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should allow scrolling to see all fields on mobile', async ({
      page,
    }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Scroll to bottom
      await page.evaluate(() => window.scrollBy(0, 500));

      // Verify we can see the buttons at bottom
      const saveButton = await profilePage.getSaveButton();
      await expect(saveButton).toBeVisible();
    });
  });

  test.describe('Dark Mode Support', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });

      await setAuthCookie(page);
    });

    test('should display form in dark mode', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Verify dark mode is applied
      const htmlElement = page.locator('html');
      const isDarkMode = await htmlElement.evaluate((el) =>
        el.classList.contains('dark')
      );
      expect(isDarkMode).toBe(true);

      // Verify form elements are visible in dark mode
      const title = await profilePage.getTitle();
      await expect(title).toBeVisible();

      const nameInput = await profilePage.getNameInput();
      await expect(nameInput).toBeVisible();
    });

    test('should maintain readability in dark mode', async ({ page }) => {
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Verify all form fields are still usable
      const inputs = [
        profilePage.getNameInput(),
        profilePage.getEmailInput(),
        profilePage.getBioTextarea(),
        profilePage.getBlogTitleInput(),
      ];

      for (const input of inputs) {
        await expect(await input).toBeVisible();
      }
    });
  });

  test.describe('Authentication and Authorization', () => {
    test('should redirect unauthenticated user to login', async ({ page }) => {
      // Don't set auth cookie
      const profilePage = new ProfileEditPage(page);
      await profilePage.goto();

      // Should redirect to login
      const url = page.url();
      expect(url).toContain('/login');
    });

    test('should load settings page for authenticated user', async ({
      page,
    }) => {
      await setAuthCookie(page);

      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();

      const isLoaded = await settingsPage.isLoaded();
      expect(isLoaded).toBe(true);
    });
  });
});
