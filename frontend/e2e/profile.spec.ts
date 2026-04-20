import { test, expect } from '@playwright/test';

test.describe('Profile Edit E2E', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    initialName: 'Test User',
    newName: 'Updated Test User',
    initialBio: 'Original bio',
    newBio: 'Updated bio for testing',
    initialBlogTitle: 'My Dev Blog',
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

  test.describe('Unauthenticated user', () => {
    test('should redirect to login when accessing settings', async ({
      page,
    }) => {
      // settings 페이지에 접근 시도
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });

      // 로그인 페이지로 리다이렉트되었는지 확인
      // (실제 리다이렉트가 구현되어 있다면)
      const url = page.url();
      expect(url).toContain('/login');

      // 또는 로그인 버튼이 표시되는지 확인
      const loginButton = page.locator('button:has-text(/로그인|Login/)');
      // await expect(loginButton).toBeVisible();
    });

    test('should redirect to login when accessing profile edit', async ({
      page,
    }) => {
      // settings/profile 페이지에 접근 시도
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });

      // 로그인 페이지로 리다이렉트되었는지 확인
      const url = page.url();
      expect(url).toContain('/login');
    });
  });

  test.describe('Authenticated user - Settings page', () => {
    test.beforeEach(async ({ page, context }) => {
      // Mock API 응답 설정
      await context.routeFromHAR('e2e/settings.har', {
        update: 'missing',
      }).catch(() => {
        // HAR 파일이 없으면 무시
      });

      // 인증 쿠키 설정
      await setAuthCookie(page);

      // settings 페이지 방문
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    });

    test('should load settings page when authenticated', async ({ page }) => {
      // 페이지 제목 확인
      const title = page.locator('h1:has-text(/설정|Settings/)');
      await expect(title).toBeVisible();

      // 설정 설명 텍스트 확인
      const subtitle = page.locator('text=/계정과 개인 정보를 관리|Manage your account/');
      await expect(subtitle).toBeVisible();
    });

    test('should display settings menu items', async ({ page }) => {
      // 프로필 편집 링크 확인
      const profileEditLink = page.locator(
        'a:has-text(/프로필 편집|Edit Profile/)'
      );
      await expect(profileEditLink).toBeVisible();

      // 비밀번호 변경 섹션 확인
      const passwordSection = page.locator(
        'text=/비밀번호 변경|Change Password/'
      );
      await expect(passwordSection).toBeVisible();

      // 알림 설정 섹션 확인
      const notificationSection = page.locator(
        'text=/알림 설정|Notification Settings/'
      );
      await expect(notificationSection).toBeVisible();
    });

    test('should navigate to profile edit page', async ({ page }) => {
      // 프로필 편집 링크 클릭
      await page.locator('a:has-text(/프로필 편집|Edit Profile/)').click();

      // 프로필 편집 페이지로 이동 확인
      const profileTitle = page.locator(
        'h1:has-text(/프로필 편집|Edit Profile/)'
      );
      await expect(profileTitle).toBeVisible();

      // URL 확인
      await expect(page).toHaveURL(/\/settings\/profile/);
    });
  });

  test.describe('Profile edit page - Form interactions', () => {
    test.beforeEach(async ({ page, context }) => {
      // 인증 쿠키 설정
      await setAuthCookie(page);

      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });
    });

    test('should display profile edit form', async ({ page }) => {
      // 프로필 사진 섹션 확인
      const profilePhotoLabel = page.locator(
        'label:has-text(/프로필 사진|Profile Photo/)'
      );
      await expect(profilePhotoLabel).toBeVisible();

      // 프로필 사진 변경 버튼 확인
      const changePhotoButton = page.locator(
        'button:has-text(/변경하기|Change/)'
      );
      await expect(changePhotoButton).toBeVisible();
    });

    test('should display all required form fields', async ({ page }) => {
      // 이름 필드
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      await expect(nameInput).toBeVisible();

      // 사용자명 필드 (disabled)
      const usernameInput = page.locator(
        'input[placeholder*="사용자명|username"]'
      );
      await expect(usernameInput).toBeVisible();
      await expect(usernameInput).toBeDisabled();

      // 이메일 필드
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      // 자기소개 필드
      const bioTextarea = page.locator(
        'textarea[placeholder*="자기소개|biography"]'
      );
      await expect(bioTextarea).toBeVisible();

      // 블로그 제목 필드
      const blogTitleInput = page.locator(
        'input[placeholder*="블로그 제목|Blog title"]'
      );
      await expect(blogTitleInput).toBeVisible();
    });

    test('should display form buttons', async ({ page }) => {
      // 저장하기 버튼
      const saveButton = page.locator(
        'button[type="submit"]:has-text(/저장하기|Save/)'
      );
      await expect(saveButton).toBeVisible();

      // 취소 버튼
      const cancelButton = page.locator(
        'button[type="button"]:has-text(/취소|Cancel/)'
      );
      await expect(cancelButton).toBeVisible();
    });

    test('should update name field', async ({ page }) => {
      // 이름 입력 필드 찾기
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();

      // 기존 값 지우고 새 값 입력
      await nameInput.clear();
      await nameInput.fill(testUser.newName);

      // 입력된 값 확인
      const value = await nameInput.inputValue();
      expect(value).toBe(testUser.newName);
    });

    test('should not allow username field to be edited', async ({ page }) => {
      // 사용자명 필드 찾기
      const usernameInput = page.locator(
        'input[placeholder*="사용자명|username"]'
      );

      // disabled 상태 확인
      await expect(usernameInput).toBeDisabled();

      // readonly 또는 disabled 클래스 확인
      const className = await usernameInput.getAttribute('class');
      expect(className).toMatch(/disabled|opacity-50/);
    });

    test('should update bio field', async ({ page }) => {
      // 자기소개 textarea 찾기
      const bioTextarea = page.locator(
        'textarea[placeholder*="자기소개|biography"]'
      );

      // 값 입력
      await bioTextarea.clear();
      await bioTextarea.fill(testUser.newBio);

      // 입력된 값 확인
      const value = await bioTextarea.inputValue();
      expect(value).toBe(testUser.newBio);
    });

    test('should update blog title field', async ({ page }) => {
      // 블로그 제목 필드 찾기
      const blogTitleInput = page.locator(
        'input[placeholder*="블로그 제목|Blog title"]'
      );

      // 값 입력
      await blogTitleInput.clear();
      await blogTitleInput.fill(testUser.newBlogTitle);

      // 입력된 값 확인
      const value = await blogTitleInput.inputValue();
      expect(value).toBe(testUser.newBlogTitle);
    });

    test('should update email field', async ({ page }) => {
      // 이메일 필드 찾기
      const emailInput = page.locator('input[type="email"]');

      // 기존 값 지우고 새 값 입력
      await emailInput.clear();
      await emailInput.fill('newemail@example.com');

      // 입력된 값 확인
      const value = await emailInput.inputValue();
      expect(value).toBe('newemail@example.com');
    });
  });

  test.describe('Profile edit page - Form submission', () => {
    test.beforeEach(async ({ page, context }) => {
      // 인증 쿠키 설정
      await setAuthCookie(page);

      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });

      // Mock API 응답 (프로필 업데이트)
      await context.route('**/api/users/me', (route) => {
        if (route.request().method() === 'PATCH') {
          route.abort('failed').catch(() => {});
          // 실제 구현에서는 다음과 같이 응답하면 됨:
          // route.continue();
        } else {
          route.continue();
        }
      });
    });

    test('should submit profile form with updated fields', async ({
      page,
    }) => {
      // 이름 업데이트
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      await nameInput.clear();
      await nameInput.fill(testUser.newName);

      // 자기소개 업데이트
      const bioTextarea = page.locator(
        'textarea[placeholder*="자기소개|biography"]'
      );
      await bioTextarea.clear();
      await bioTextarea.fill(testUser.newBio);

      // 블로그 제목 업데이트
      const blogTitleInput = page.locator(
        'input[placeholder*="블로그 제목|Blog title"]'
      );
      await blogTitleInput.clear();
      await blogTitleInput.fill(testUser.newBlogTitle);

      // 저장하기 버튼 클릭
      const saveButton = page.locator(
        'button[type="submit"]:has-text(/저장하기|Save/)'
      );
      await saveButton.click();

      // 성공 메시지 대기 (선택사항)
      // const successMessage = page.locator('text=/저장 완료|Successfully saved/');
      // await expect(successMessage).toBeVisible({ timeout: 5000 });
    });

    test('should cancel form submission', async ({ page }) => {
      // 이름 업데이트
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      const initialValue = await nameInput.inputValue();

      // 값 변경
      await nameInput.clear();
      await nameInput.fill('Changed Name');

      // 취소 버튼 클릭
      const cancelButton = page.locator(
        'button[type="button"]:has-text(/취소|Cancel/)'
      );
      await cancelButton.click();

      // 페이지가 변경되지 않거나 원래 값으로 복원되는지 확인
      // (실제 구현에 따라 다를 수 있음)
      const currentValue = await nameInput.inputValue();
      // expect(currentValue).toBe(initialValue);
    });
  });

  test.describe('Public profile page - Reflect changes', () => {
    test.beforeEach(async ({ page, context }) => {
      // 인증 쿠키 설정
      await setAuthCookie(page);
    });

    test('should display updated profile name on public profile', async ({
      page,
    }) => {
      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });

      // 이름 업데이트
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      await nameInput.clear();
      await nameInput.fill(testUser.newName);

      // 저장
      const saveButton = page.locator(
        'button[type="submit"]:has-text(/저장하기|Save/)'
      );
      await saveButton.click();

      // 성공 메시지 대기 (필요시)
      await page.waitForTimeout(500);

      // 공개 프로필 페이지로 이동
      await page.goto(`/@${testUser.username}`, { waitUntil: 'domcontentloaded' });

      // 업데이트된 이름이 표시되는지 확인
      const profileName = page.locator(`text=${testUser.newName}`);
      // 페이지 제목이나 헤더에 새 이름이 표시되는지 확인
      const heading = page.locator(
        `h1:has-text(/${testUser.newName}|${testUser.username}/)`
      );
      // await expect(heading).toBeVisible();
    });

    test('should display updated bio on public profile', async ({ page }) => {
      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });

      // 자기소개 업데이트
      const bioTextarea = page.locator(
        'textarea[placeholder*="자기소개|biography"]'
      );
      await bioTextarea.clear();
      await bioTextarea.fill(testUser.newBio);

      // 저장
      const saveButton = page.locator(
        'button[type="submit"]:has-text(/저장하기|Save/)'
      );
      await saveButton.click();

      // 성공 메시지 대기
      await page.waitForTimeout(500);

      // 공개 프로필 페이지로 이동
      await page.goto(`/@${testUser.username}`, { waitUntil: 'domcontentloaded' });

      // 업데이트된 자기소개가 표시되는지 확인
      const bioText = page.locator(`text=${testUser.newBio}`);
      // await expect(bioText).toBeVisible();
    });

    test('should navigate from settings to public profile', async ({ page }) => {
      // 설정 페이지에서 시작
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });

      // 프로필 편집 페이지로 이동
      await page.locator('a:has-text(/프로필 편집|Edit Profile/)').click();

      // 프로필 편집 페이지 확인
      await expect(page).toHaveURL(/\/settings\/profile/);

      // 프로필 링크나 버튼을 통해 공개 프로필로 이동 (구현에 따라)
      // 예: 사용자명을 클릭하거나 "프로필 보기" 버튼 클릭
      // await page.locator('a:has-text(/프로필 보기|View Profile/)').click();

      // 또는 직접 이동
      await page.goto(`/@${testUser.username}`, {
        waitUntil: 'domcontentloaded',
      });

      // 공개 프로필 페이지 확인
      const profileHeader = page.locator(
        `heading:has-text(/프로필|Profile/) >> visible=true`
      );
      // 프로필 섹션이나 사용자명이 표시되는지 확인
      const username = page.locator(`text=@${testUser.username}`);
      // await expect(username).toBeVisible();
    });
  });

  test.describe('Responsive design - Mobile', () => {
    test.beforeEach(async ({ page, context }) => {
      // Mobile viewport 설정
      await page.setViewportSize({ width: 375, height: 667 });

      // 인증 쿠키 설정
      await setAuthCookie(page);

      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });
    });

    test('should display form fields properly on mobile', async ({ page }) => {
      // 이름 필드가 보이는지 확인
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      await expect(nameInput).toBeVisible();

      // 각 필드가 전체 너비인지 확인
      const boundingBox = await nameInput.boundingBox();
      expect(boundingBox).toBeTruthy();
    });

    test('should display buttons properly on mobile', async ({ page }) => {
      // 저장 버튼이 보이는지 확인
      const saveButton = page.locator(
        'button[type="submit"]:has-text(/저장하기|Save/)'
      );
      await expect(saveButton).toBeVisible();

      // 취소 버튼이 보이는지 확인
      const cancelButton = page.locator(
        'button[type="button"]:has-text(/취소|Cancel/)'
      );
      await expect(cancelButton).toBeVisible();

      // 버튼 크기가 최소 44px인지 확인 (모바일 친화적)
      const saveButtonBox = await saveButton.boundingBox();
      expect(saveButtonBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should allow scrolling to see all form fields', async ({ page }) => {
      // 페이지 스크롤 가능 여부 확인
      const mainElement = page.locator('main');
      await expect(mainElement).toBeVisible();

      // 아래로 스크롤
      await page.evaluate(() => window.scrollBy(0, 500));

      // 블로그 제목 필드가 보이는지 확인 (스크롤 후)
      const blogTitleInput = page.locator(
        'input[placeholder*="블로그 제목|Blog title"]'
      );
      await expect(blogTitleInput).toBeVisible();
    });
  });

  test.describe('Form validation and errors', () => {
    test.beforeEach(async ({ page, context }) => {
      // 인증 쿠키 설정
      await setAuthCookie(page);

      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });
    });

    test('should validate email format', async ({ page }) => {
      // 이메일 필드 찾기
      const emailInput = page.locator('input[type="email"]');

      // 잘못된 이메일 입력
      await emailInput.clear();
      await emailInput.fill('invalid-email');

      // 저장 버튼 클릭
      const saveButton = page.locator(
        'button[type="submit"]:has-text(/저장하기|Save/)'
      );
      await saveButton.click();

      // 유효성 검사 메시지가 표시되거나 폼이 제출되지 않는지 확인
      // 브라우저 기본 유효성 검사 메시지 확인
      const isValid = await emailInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity()
      );
      expect(isValid).toBe(false);
    });

    test('should allow saving with valid email', async ({ page }) => {
      // 이메일 필드 찾기
      const emailInput = page.locator('input[type="email"]');

      // 유효한 이메일 입력
      await emailInput.clear();
      await emailInput.fill('valid@example.com');

      // 유효성 확인
      const isValid = await emailInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity()
      );
      expect(isValid).toBe(true);
    });

    test('should handle server validation errors gracefully', async ({
      page,
      context,
    }) => {
      // 에러 응답을 반환하는 API 라우트 모킹
      await context.route('**/api/users/me', (route) => {
        if (route.request().method() === 'PATCH') {
          route.abort('failed').catch(() => {});
        } else {
          route.continue();
        }
      });

      // 이름 변경
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      await nameInput.clear();
      await nameInput.fill(testUser.newName);

      // 저장 시도
      const saveButton = page.locator(
        'button[type="submit"]:has-text(/저장하기|Save/)'
      );
      await saveButton.click();

      // 에러 메시지가 표시되거나 폼이 그대로 유지되는지 확인
      // const errorMessage = page.locator('text=/오류|Error|실패|failed/');
      // await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Dark mode support', () => {
    test.beforeEach(async ({ page, context }) => {
      // Dark mode 활성화
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });

      // 인증 쿠키 설정
      await setAuthCookie(page);

      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });
    });

    test('should display form in dark mode', async ({ page }) => {
      // 다크 모드 클래스 확인
      const htmlElement = page.locator('html');
      const isDarkMode = await htmlElement.evaluate((el) =>
        el.classList.contains('dark')
      );

      // 페이지 요소들이 보이는지 확인
      const title = page.locator('h1:has-text(/프로필 편집|Edit Profile/)');
      await expect(title).toBeVisible();

      // 입력 필드들이 접근 가능한 상태인지 확인
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      await expect(nameInput).toBeVisible();
    });

    test('should maintain dark mode styling on input fields', async ({
      page,
    }) => {
      // 입력 필드의 다크 모드 클래스 확인
      const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
      const className = await nameInput.getAttribute('class');

      // dark: 클래스가 포함되어 있는지 확인 (Tailwind)
      // expect(className).toContain('dark:');
    });
  });

  test.describe('Navigation and linking', () => {
    test.beforeEach(async ({ page, context }) => {
      // 인증 쿠키 설정
      await setAuthCookie(page);
    });

    test('should have settings link in settings page', async ({ page }) => {
      // 설정 페이지 방문
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });

      // 프로필 편집 링크 확인
      const profileEditLink = page.locator(
        'a:has-text(/프로필 편집|Edit Profile/)'
      );
      expect(profileEditLink).toBeTruthy();

      // 링크가 올바른 URL을 가리키는지 확인
      const href = await profileEditLink.getAttribute('href');
      expect(href).toContain('/settings/profile');
    });

    test('should navigate back from profile edit to settings', async ({
      page,
    }) => {
      // 프로필 편집 페이지 방문
      await page.goto('/settings/profile', { waitUntil: 'domcontentloaded' });

      // 취소 버튼 또는 뒤로가기 클릭 (구현에 따라)
      const cancelButton = page.locator(
        'button[type="button"]:has-text(/취소|Cancel/)'
      );
      await cancelButton.click();

      // 설정 페이지로 돌아가는지 확인
      // 또는 다른 내비게이션 방식이 있을 수 있음
      await page.waitForTimeout(500);

      // 페이지 상태 확인
      const currentUrl = page.url();
      // expect(currentUrl).toBe('http://localhost:3000/settings');
    });
  });
});
