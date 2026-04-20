import { Page, BrowserContext } from '@playwright/test';

/**
 * Test user credentials for E2E testing
 */
export const testUsers = {
  authenticated: {
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    bio: 'Test bio',
    blogTitle: 'Test Blog',
  },
  admin: {
    username: 'adminuser',
    email: 'admin@example.com',
    name: 'Admin User',
  },
};

/**
 * Set authentication cookie for test user
 * @param context - Browser context
 * @param tokenValue - Optional custom token value
 */
export async function setAuthCookie(
  context: BrowserContext,
  tokenValue = 'test_token_123'
) {
  await context.addCookies([
    {
      name: 'auth_token',
      value: tokenValue,
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Set authentication cookie with additional user data
 * @param context - Browser context
 * @param userData - User data to store
 */
export async function setAuthCookieWithUserData(
  context: BrowserContext,
  userData: {
    username: string;
    email: string;
    name?: string;
  }
) {
  await context.addCookies([
    {
      name: 'auth_token',
      value: 'test_token_123',
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'user_data',
      value: JSON.stringify(userData),
      url: 'http://localhost:3000',
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Clear all authentication cookies
 * @param context - Browser context
 */
export async function clearAuthCookies(context: BrowserContext) {
  const cookies = await context.cookies();
  const authCookies = cookies.filter((c) =>
    ['auth_token', 'user_data', 'session'].includes(c.name)
  );

  for (const cookie of authCookies) {
    await context.clearCookies({ name: cookie.name });
  }
}

/**
 * Check if user is authenticated by checking for auth cookie
 * @param context - Browser context
 */
export async function isAuthenticated(context: BrowserContext) {
  const cookies = await context.cookies();
  return cookies.some((c) => c.name === 'auth_token');
}

/**
 * Get authentication token from context
 * @param context - Browser context
 */
export async function getAuthToken(context: BrowserContext) {
  const cookies = await context.cookies();
  const authCookie = cookies.find((c) => c.name === 'auth_token');
  return authCookie?.value || null;
}

/**
 * Setup authenticated session for test
 * @param page - Page object
 * @param context - Browser context
 */
export async function setupAuthenticatedSession(
  page: Page,
  context: BrowserContext
) {
  await setAuthCookie(context);
  // Navigate to app to establish session
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

/**
 * Setup guest session (no authentication)
 * @param page - Page object
 * @param context - Browser context
 */
export async function setupGuestSession(
  page: Page,
  context: BrowserContext
) {
  await clearAuthCookies(context);
  // Navigate to app
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

/**
 * Mock API authentication endpoint
 * @param page - Page object
 */
export async function mockAuthApi(page: Page) {
  // Mock login endpoint
  await page.route('**/api/auth/login', (route) => {
    route.continue();
  });

  // Mock current user endpoint
  await page.route('**/api/auth/me', (route) => {
    route.continue();
  });

  // Mock logout endpoint
  await page.route('**/api/auth/logout', (route) => {
    route.continue();
  });
}
