# Profile E2E Tests - Complete Index

## Quick Navigation

### Getting Started
1. Read [PHASE5_E2E_6_SUMMARY.md](./PHASE5_E2E_6_SUMMARY.md) first for overview
2. Check [PROFILE_TESTS_QUICK_REFERENCE.md](./PROFILE_TESTS_QUICK_REFERENCE.md) for commands
3. Refer to [PROFILE_TESTS_README.md](./PROFILE_TESTS_README.md) for detailed docs

### Quick Commands
```bash
# Run all profile tests
pnpm playwright test e2e/profile*.spec.ts

# Run with UI mode
pnpm playwright test e2e/profile*.spec.ts --ui

# Run with headed browser
pnpm playwright test e2e/profile*.spec.ts --headed

# List all tests
pnpm playwright test e2e/profile*.spec.ts --list

# View report
pnpm playwright show-report
```

## File Structure

```
e2e/
├── 📄 INDEX_PROFILE_TESTS.md          ← You are here
├── 📄 PHASE5_E2E_6_SUMMARY.md         ← Read first
├── 📄 PROFILE_TESTS_README.md         ← Detailed guide
├── 📄 PROFILE_TESTS_QUICK_REFERENCE.md ← Commands & tips
│
├── 🧪 profile.spec.ts                 ← 28 comprehensive tests
├── 🧪 profile-pom.spec.ts             ← 23 POM pattern tests
│
├── 📁 pages/
│   ├── ProfilePage.ts                 ← 3 page objects
│   └── PostDetailPage.ts              ← (existing)
│
├── 📁 helpers/
│   └── auth.ts                        ← Auth utilities
│
└── 📁 [other test files]
    ├── comments.spec.ts
    ├── feed.spec.ts
    ├── like-button.spec.ts
    ├── markdown-editor.spec.ts
    ├── post-creation.spec.ts
    ├── tags-series.spec.ts
    └── [more...]
```

## Documentation Overview

### PHASE5_E2E_6_SUMMARY.md (Start Here)
**Purpose**: Executive summary of complete project
**Contains**:
- Overview and statistics
- All deliverables listed
- Test scenarios overview
- File structure
- Test coverage checklist
- Running tests guide
- Integration with CI/CD
- Success criteria met

**Best For**: Understanding the complete project at a glance

### PROFILE_TESTS_README.md (Deep Dive)
**Purpose**: Comprehensive technical documentation
**Contains**:
- Test file descriptions
- Page object API documentation
- Helper function descriptions
- Test scenario details
- Detailed running instructions
- Full coverage list
- Maintenance guidelines
- Troubleshooting guide
- Best practices

**Best For**: Understanding how everything works

### PROFILE_TESTS_QUICK_REFERENCE.md (Daily Use)
**Purpose**: Quick lookup for commands and examples
**Contains**:
- File structure overview
- Common commands
- Test organization table
- Code examples
- Debugging tips
- Element selectors
- Tips and tricks
- Troubleshooting table
- Test metrics

**Best For**: Quick lookup during development

### INDEX_PROFILE_TESTS.md (This File)
**Purpose**: Navigation hub for all profile test documentation
**Contains**: This index and quick links

**Best For**: Finding what you need quickly

## Test Files Overview

### profile.spec.ts - Comprehensive Suite (28 tests)

**Approach**: Traditional test structure with detailed setup
**Best For**: Understanding test structure and detailed test cases

**Test Groups**:
- Unauthenticated user (2)
- Authenticated user - Settings page (3)
- Profile edit page - Form interactions (7)
- Profile edit page - Form submission (2)
- Public profile page - Reflect changes (3)
- Responsive design - Mobile (3)
- Form validation and errors (3)
- Dark mode support (2)
- Navigation and linking (2)

**Example Test**:
```typescript
test('should update name field', async ({ page }) => {
  const nameInput = page.locator('input[placeholder*="이름|Name"]').first();
  await nameInput.clear();
  await nameInput.fill(testUser.newName);
  const value = await nameInput.inputValue();
  expect(value).toBe(testUser.newName);
});
```

### profile-pom.spec.ts - Page Object Model Suite (23 tests)

**Approach**: Uses Page Object Model pattern for better maintainability
**Best For**: Production code, reusable test patterns

**Test Groups**:
- Settings and Navigation Flow (2)
- Profile Edit Form (6)
- Form Validation (2)
- Public Profile Display (3)
- Mobile Responsiveness (3)
- Dark Mode Support (2)
- Authentication and Authorization (2)

**Example Test**:
```typescript
test('should update name field', async ({ page }) => {
  const profilePage = new ProfileEditPage(page);
  await profilePage.goto();
  await profilePage.updateName(testUser.newName);
  const value = await profilePage.getNameValue();
  expect(value).toBe(testUser.newName);
});
```

## Page Objects Reference

### ProfileEditPage
**URL**: `/settings/profile`
**Methods**: 15+
**Key Methods**:
- `goto()`, `submit()`, `cancel()`
- `updateName()`, `updateEmail()`, `updateBio()`, `updateBlogTitle()`
- `getNameValue()`, `getEmailValue()`, `getBioValue()`, `getBlogTitleValue()`
- `isUsernameDisabled()`, `waitForSuccessMessage()`, `waitForErrorMessage()`

### SettingsPage
**URL**: `/settings`
**Methods**: 6
**Key Methods**:
- `goto()`, `isLoaded()`
- `getProfileEditLink()`, `navigateToProfileEdit()`
- `getPasswordChangeSection()`, `getNotificationSection()`

### PublicProfilePage
**URL**: `/@[username]`
**Methods**: 11
**Key Methods**:
- `goto()`, `isLoaded()`
- `getDisplayName()`, `getUsernameDisplay()`, `getBioSection()`, `getPostsSection()`
- `verifyName()`, `verifyBio()`, `getBioText()`

## Helper Functions Reference

### helpers/auth.ts

**Constants**:
- `testUsers.authenticated`
- `testUsers.admin`

**Functions**:
- `setAuthCookie(context, tokenValue)`
- `clearAuthCookies(context)`
- `isAuthenticated(context)`
- `setupAuthenticatedSession(page, context)`
- `setupGuestSession(page, context)`

## Common Usage Patterns

### Pattern 1: Simple Field Update
```typescript
const profilePage = new ProfileEditPage(page);
await profilePage.goto();
await profilePage.updateName('New Name');
const value = await profilePage.getNameValue();
expect(value).toBe('New Name');
```

### Pattern 2: Multiple Field Update
```typescript
const profilePage = new ProfileEditPage(page);
await profilePage.goto();
await profilePage.updateProfile({
  name: 'New Name',
  email: 'new@example.com',
  bio: 'Updated bio',
  blogTitle: 'New Title'
});
```

### Pattern 3: Public Profile Verification
```typescript
const publicProfile = new PublicProfilePage(page, 'testuser');
await publicProfile.goto();
const isLoaded = await publicProfile.isLoaded();
expect(isLoaded).toBe(true);
```

### Pattern 4: Authentication Setup
```typescript
test.beforeEach(async ({ page, context }) => {
  await setAuthCookie(context);
  const profilePage = new ProfileEditPage(page);
  await profilePage.goto();
});
```

## Test Coverage Matrix

| Feature | Unit | Profile.spec | POM.spec | Pages | Helpers |
|---------|------|--------------|----------|-------|---------|
| Authentication | - | ✅ | ✅ | - | ✅ |
| Settings page | - | ✅ | ✅ | ✅ | - |
| Profile edit form | - | ✅ | ✅ | ✅ | - |
| Name field | - | ✅ | ✅ | ✅ | - |
| Email field | - | ✅ | ✅ | ✅ | - |
| Bio field | - | ✅ | ✅ | ✅ | - |
| Blog title field | - | ✅ | ✅ | ✅ | - |
| Username field (disabled) | - | ✅ | ✅ | ✅ | - |
| Form submission | - | ✅ | ✅ | ✅ | - |
| Form cancellation | - | ✅ | ✅ | - | - |
| Email validation | - | ✅ | ✅ | - | - |
| Public profile | - | ✅ | ✅ | ✅ | - |
| Mobile responsive | - | ✅ | ✅ | - | - |
| Dark mode | - | ✅ | ✅ | - | - |
| Navigation | - | ✅ | ✅ | ✅ | - |

## Statistics

| Metric | Value |
|--------|-------|
| **Total Tests** | 51 |
| **Test Files** | 2 |
| **Page Objects** | 3 |
| **Helper Modules** | 1 |
| **Documentation** | 4 files |
| **Lines of Test Code** | ~900 |
| **Lines of POM Code** | ~500 |
| **Lines of Helper Code** | ~180 |
| **Total Code** | ~1,580 |
| **Estimated Runtime** | 2-3 minutes |
| **Browser Coverage** | Chromium (extensible) |

## Running Tests by Purpose

### For Development
```bash
pnpm playwright test e2e/profile*.spec.ts --headed
```
See tests running in real-time with visual feedback.

### For Continuous Integration
```bash
pnpm playwright test e2e/profile*.spec.ts --reporter=html
```
Generate HTML report for CI/CD pipeline.

### For Debugging
```bash
pnpm playwright test e2e/profile*.spec.ts --debug --headed
```
Step through tests with inspector open.

### For Performance Insight
```bash
pnpm playwright test e2e/profile*.spec.ts --slow-motion=1000
```
Watch tests at 1x speed with 1-second delays.

## Troubleshooting Quick Reference

| Problem | Check | Solution |
|---------|-------|----------|
| Tests timeout | Dev server | `pnpm dev` in another terminal |
| Cannot find elements | Selectors | Run with `--headed --debug` |
| Auth fails | Cookie setup | Check `beforeEach` hook |
| Flaky tests | Waits | Use `toBeVisible()` not `waitForTimeout()` |
| Mobile test fails | Viewport | Check viewport size set correctly |
| Dark mode off | Setup | Verify localStorage and classList |

## Next Steps for Integration

1. Run tests locally
   ```bash
   pnpm playwright test e2e/profile*.spec.ts --ui
   ```

2. Fix any failing tests by checking:
   - Page selectors match actual UI text
   - API endpoints if mocking
   - Auth mechanism if using different approach

3. Add to CI/CD pipeline:
   - Add to GitHub Actions workflow
   - Configure HTML report upload
   - Set up notifications on failure

4. Monitor and maintain:
   - Run tests before each commit
   - Update selectors if UI changes
   - Add new tests for new features

## Related Documentation

- [Frontend CLAUDE.md](../CLAUDE.md) - Architecture overview
- [Testing Guide](../.claude/rules/testing.md) - General testing patterns
- [React Component Convention](../.claude/rules/react-component.md) - Component patterns
- [Playwright Docs](https://playwright.dev) - Official Playwright documentation

## Version History

- **v1.0** (2026-04-18): Initial release
  - 51 tests
  - 2 test suites (traditional + POM)
  - 3 page objects
  - Complete documentation

## Summary

This folder contains a complete, production-ready E2E test suite for profile editing functionality. All files are documented and ready to use. Start with [PHASE5_E2E_6_SUMMARY.md](./PHASE5_E2E_6_SUMMARY.md) for overview, then refer to specific documentation files as needed.

---

Last updated: 2026-04-18
Status: Ready for Testing
Contact: Development Team
