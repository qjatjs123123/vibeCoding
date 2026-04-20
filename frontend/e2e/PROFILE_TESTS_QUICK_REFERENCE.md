# Profile E2E Tests - Quick Reference

## Files Overview

```
e2e/
├── profile.spec.ts              # Comprehensive test suite (28 tests)
├── profile-pom.spec.ts          # POM pattern test suite (23 tests)
├── pages/
│   └── ProfilePage.ts           # Page Object Models for profile pages
├── helpers/
│   └── auth.ts                  # Authentication utilities
├── PROFILE_TESTS_README.md      # Detailed documentation
└── PROFILE_TESTS_QUICK_REFERENCE.md  # This file
```

## Quick Commands

```bash
# Run all profile tests
pnpm playwright test e2e/profile*.spec.ts

# Run with UI mode (interactive)
pnpm playwright test e2e/profile*.spec.ts --ui

# Run with headed browser (see what happens)
pnpm playwright test e2e/profile*.spec.ts --headed

# Run specific test file
pnpm playwright test e2e/profile.spec.ts        # Comprehensive
pnpm playwright test e2e/profile-pom.spec.ts    # POM pattern

# Run specific test by name pattern
pnpm playwright test e2e/profile.spec.ts -g "should update name"
pnpm playwright test e2e/profile.spec.ts -g "Mobile"

# Debug mode (stops and waits for commands)
pnpm playwright test e2e/profile.spec.ts --debug

# View test report
pnpm playwright show-report
```

## Test Organization

### profile.spec.ts (28 tests)
- ✅ Unauthenticated user (2)
- ✅ Authenticated settings page (3)
- ✅ Profile edit form interactions (7)
- ✅ Form submission (2)
- ✅ Public profile updates (3)
- ✅ Mobile responsiveness (3)
- ✅ Form validation (3)
- ✅ Dark mode (2)
- ✅ Navigation (2)

### profile-pom.spec.ts (23 tests)
- ✅ Settings & Navigation (2)
- ✅ Profile Edit Form (6)
- ✅ Form Validation (2)
- ✅ Public Profile Display (3)
- ✅ Mobile Responsiveness (3)
- ✅ Dark Mode Support (2)
- ✅ Authentication & Authorization (2)

## Test Scenarios

### 1. User Settings Access
```
Unauthenticated: /settings → /login (redirect)
Authenticated: /settings → /settings/profile (navigation)
```

### 2. Profile Form Updates
```
Fields:
- Name (required, text)
- Email (required, validated)
- Bio (optional, textarea)
- Blog Title (optional, text)
- Username (read-only, disabled)

Actions:
- Fill form
- Submit (save)
- Cancel
```

### 3. Public Profile Reflection
```
After editing and saving:
- Changes appear on /@username
- Visitor can see updated info
- ISR cache updates (1 hour)
```

### 4. Validation
```
Email:
- "invalid" → Invalid (HTML5 validation)
- "user@example.com" → Valid

Username:
- Always disabled
- Cannot change

Other fields:
- Any text accepted
```

## Using Page Objects

### Example: Update Profile

```typescript
import { ProfileEditPage } from './pages/ProfilePage';

// Navigate and update
const profilePage = new ProfileEditPage(page);
await profilePage.goto();

await profilePage.updateProfile({
  name: 'New Name',
  email: 'new@example.com',
  bio: 'Updated bio',
  blogTitle: 'New Blog Title'
});

await profilePage.submit();
```

### Example: Verify Public Profile

```typescript
import { PublicProfilePage } from './pages/ProfilePage';

const publicProfile = new PublicProfilePage(page, 'testuser');
await publicProfile.goto();

const isLoaded = await publicProfile.isLoaded();
const nameUpdated = await publicProfile.verifyName('New Name');
const bioUpdated = await publicProfile.verifyBio('Updated bio');
```

### Example: Setup Authentication

```typescript
import { setAuthCookie } from './helpers/auth';

// In beforeEach hook
await setAuthCookie(page.context());
```

## Common Patterns

### Authenticated Test Setup
```typescript
test.beforeEach(async ({ page, context }) => {
  // Set auth cookie
  await setAuthCookie(context);
  
  // Navigate to page
  const profilePage = new ProfileEditPage(page);
  await profilePage.goto();
});
```

### Mobile Viewport Testing
```typescript
test.beforeEach(async ({ page }) => {
  // Set mobile size
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Continue with test...
});
```

### Dark Mode Testing
```typescript
test.beforeEach(async ({ page }) => {
  // Enable dark mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  
  // Continue with test...
});
```

## Debugging

### See Test in Browser
```bash
pnpm playwright test e2e/profile.spec.ts --headed
```

### Step-by-Step Debugging
```bash
pnpm playwright test e2e/profile.spec.ts --debug
```

### Pause at Specific Point
```typescript
await page.pause();  // Browser stops, waiting for command in inspector
```

### Take Screenshot
```typescript
await page.screenshot({ path: 'debug.png' });
```

### Check Page State
```typescript
const url = page.url();
const title = await page.title();
console.log(url, title);
```

## Assertions

### Element Visibility
```typescript
await expect(element).toBeVisible();
await expect(element).toBeHidden();
```

### Element Value
```typescript
const value = await input.inputValue();
expect(value).toBe('expected');
```

### Element Property
```typescript
const isDisabled = await input.isDisabled();
expect(isDisabled).toBe(true);
```

### URL Check
```typescript
await expect(page).toHaveURL('/settings/profile');
```

### Text Content
```typescript
await expect(element).toContainText('Expected text');
```

## Element Selectors Used

```typescript
// By text
page.locator('text=/프로필 편집|Edit Profile/')

// By role
page.locator('button:has-text(/저장하기|Save/)')

// By type
page.locator('input[type="email"]')

// By placeholder
page.locator('input[placeholder*="이름|Name"]')

// By attribute
page.locator('input[placeholder*="사용자명"]')

// By test ID
page.locator('[data-testid="name-input"]')
```

## Tips & Tricks

1. **Run in watch mode** for development:
   ```bash
   pnpm playwright test --ui
   ```

2. **Filter tests by name**:
   ```bash
   pnpm playwright test -g "Mobile"
   ```

3. **Generate HTML report**:
   ```bash
   pnpm playwright test && pnpm playwright show-report
   ```

4. **Slow down execution** to see what's happening:
   ```bash
   pnpm playwright test --slow-motion=1000  # 1s between actions
   ```

5. **Use semantic selectors** (text, role) for stability

6. **Wait for elements** instead of fixed timeouts:
   ```typescript
   await expect(element).toBeVisible({ timeout: 10000 });
   ```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Tests timeout | Check dev server (`pnpm dev`), increase timeout |
| Cannot find element | Use `--headed --debug`, check selector, use `page.pause()` |
| Auth fails | Verify cookie setup in `beforeEach` |
| Flaky tests | Use `toBeVisible()` instead of `page.waitForTimeout()` |
| ISR cache issue | Clear cache or wait for ISR update |

## Test Metrics

- **Total Tests**: 51
- **Coverage**: Authentication, Form, Validation, Responsive, Dark Mode
- **Pages Tested**: 3 (/settings, /settings/profile, /@[username])
- **Estimated Runtime**: ~2-3 minutes
- **Browsers**: Chromium (can add Firefox, Webkit)

## Next Steps

1. ✅ Create test files (done)
2. ✅ Create page objects (done)
3. ✅ Create auth helpers (done)
4. ⏳ Run tests: `pnpm playwright test e2e/profile*.spec.ts`
5. ⏳ Fix failing tests (if any)
6. ⏳ Add to CI/CD pipeline
7. ⏳ Update selectors if UI changes

## Related Documentation

- [PROFILE_TESTS_README.md](./PROFILE_TESTS_README.md) - Detailed documentation
- [Frontend CLAUDE.md](/frontend/CLAUDE.md) - Architecture overview
- [Testing Guide](/frontend/.claude/rules/testing.md) - General testing guidelines
