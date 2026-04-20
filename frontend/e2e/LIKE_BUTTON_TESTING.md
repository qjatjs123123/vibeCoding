# Like Button E2E Testing Guide

## Overview

The Like Button E2E tests (`like-button.spec.ts`) verify the complete user experience for liking/unliking posts in the vibeCoding platform. These tests cover both authenticated and unauthenticated user scenarios with comprehensive coverage of UI interactions, state management, and error handling.

## Files

- **`e2e/like-button.spec.ts`** - Main test suite with all test cases
- **`e2e/pages/PostDetailPage.ts`** - Page Object Model for post detail pages

## Test Structure

### 1. Unauthenticated User Tests

#### Purpose
Verify that unauthenticated users cannot like posts and are prompted to log in.

**Test Cases:**
- `should show login prompt when clicking like button without auth`
  - Verifies login prompt/modal appears when unauthenticated user clicks like
  - Covers modal dialog or page redirect to login

- `should not increment like count when unauthenticated`
  - Ensures like count remains unchanged for unauthenticated users
  - Prevents unauthorized like count modifications

- `should not change button state when unauthenticated`
  - Verifies button state doesn't change (button doesn't appear "liked")
  - Ensures UI consistency

### 2. Authenticated User Tests

#### Purpose
Verify that authenticated users can toggle likes with proper optimistic updates and state persistence.

**Test Cases:**
- `should toggle like when authenticated user clicks like button`
  - Basic toggle functionality for authenticated users
  - Verifies state changes on click

- `should update like count immediately (optimistic update)`
  - Tests optimistic UI updates
  - Like count changes before server confirmation
  - Crucial for good UX

- `should show like animation when clicking like button`
  - Verifies heart animation plays
  - Tests visual feedback to user

- `should toggle like back when clicked again`
  - Double-click toggle functionality
  - Ensures like/unlike works bidirectionally
  - Verifies like count reverts

- `should maintain like state after page reload`
  - Tests persistence of like state
  - Verifies backend correctly stores like status
  - Critical for data integrity

- `should show visual feedback on like button when liked`
  - Tests button visual changes when liked
  - Verifies CSS classes/styles update
  - Includes aria-pressed attribute changes

### 3. Like Button Rendering Tests

#### Purpose
Verify like button displays correctly and contains all necessary elements.

**Test Cases:**
- `should display like button on post detail page`
- `should display like count on post detail page`
- `should display heart icon in like button`
- `should render like button in correct section of page`
  - Positioning verification

### 4. Accessibility Tests

#### Purpose
Ensure like button is accessible to all users including those using assistive technologies.

**Test Cases:**
- `should have accessible like button`
  - Verifies button role and labels
  - Checks for aria-label or visible text

- `should have aria-pressed attribute for like button`
  - Required for toggle buttons
  - Values: 'true' or 'false'

- `should be keyboard navigable to like button`
  - Tests Tab key navigation
  - Ensures keyboard-only users can access feature

### 5. Error Handling Tests

#### Purpose
Verify graceful error handling when like operation fails.

**Test Cases:**
- `should handle network error gracefully`
  - Tests offline scenarios
  - Verifies page remains functional after error

- `should show user-friendly error message on like failure`
  - Tests error message display
  - Verifies like state doesn't change on failure

## Running Tests

### Run all like button tests
```bash
pnpm test:e2e e2e/like-button.spec.ts
```

### Run specific test suite
```bash
pnpm test:e2e e2e/like-button.spec.ts -g "Authenticated User"
```

### Run with UI mode
```bash
pnpm test:e2e e2e/like-button.spec.ts --ui
```

### Run in headed mode (see browser)
```bash
pnpm test:e2e e2e/like-button.spec.ts --headed
```

### Run with debugging
```bash
pnpm test:e2e e2e/like-button.spec.ts --debug
```

## Authentication Setup

The tests use two approaches for authentication:

### 1. Cookie-based Authentication (Default)
```typescript
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
```

### 2. LocalStorage-based Authentication (Alternative)
```typescript
await context.addInitScript(() => {
  localStorage.setItem('auth_token', 'test_token_123');
  localStorage.setItem('user_id', 'test-user-123');
});
```

**To use the second approach:** Uncomment the `addInitScript` block in the `beforeEach` hook and comment out the `addCookies` block.

## Page Object Model (PostDetailPage)

### Key Methods

#### Navigation
- `goto()` - Navigate to post detail page
- `waitForPageLoad()` - Wait for page to fully load
- `isLoaded()` - Check if page is loaded

#### Like Button Interactions
- `getLikeButton()` - Get like button element
- `clickLike()` - Click the like button
- `isLiked()` - Check if post is currently liked
- `isLikeButtonDisabled()` - Check if button is disabled

#### State/Data
- `getLikeCount()` - Get like count element
- `getLikeCountNumber()` - Extract like count as number
- `getHeartIcon()` - Get heart icon element
- `hasHeartAnimation()` - Check if animation is playing

#### UI Prompts
- `getLoginPrompt()` - Get login prompt element
- `isLoginPromptVisible()` - Check if login prompt is visible
- `waitForLoginPrompt()` - Wait for login prompt to appear

#### Additional Info
- `getPostTitle()` - Get post title
- `getAuthorName()` - Get author information
- `getCommentCount()` - Get comment count
- `getViewCount()` - Get view count

## Selectors Used

The tests use flexible selectors to adapt to different UI implementations:

### Like Button
```typescript
'button:has-text(/좋아요|like/i), button[data-testid="like-button"]'
```

### Like Count
```typescript
'text=/좋아요\\s+\\d+|like count|likes:\\s*\\d+/i'
```

### Heart Icon
```typescript
'[data-testid="heart-icon"], svg[aria-label*="heart"], .heart-icon'
```

### Login Prompt
```typescript
'text=/로그인이 필요합니다|Please login|로그인 후|Sign in/i'
```

## Test Data Requirements

For tests to run successfully, you need:

1. **Test Post Data**
   - A post accessible at `/<username>/<slug>` route
   - Post must have like/comment/view count displays
   - Can be a real post or a dev/fixture page

2. **Test User (for authenticated tests)**
   - The auth tokens used should be valid for your backend
   - Or adjust the auth setup to match your implementation

3. **Backend Support**
   - Like toggle endpoint: `POST /api/posts/<id>/like`
   - Response should include like status and updated count

## Customization Guide

### Update Test Post URL
```typescript
// Change these values in beforeEach
const testUsername = 'your-username';
const testSlug = 'your-post-slug';
```

### Update Selectors
If your UI uses different class names or attributes:

```typescript
// In PostDetailPage.ts, update the selectors
async getLikeButton() {
  return this.page.locator('your-custom-selector');
}
```

### Update Auth Setup
```typescript
// In beforeEach hook, modify cookie/localStorage setup
await context.addCookies([
  {
    name: 'your_auth_cookie_name',
    value: 'your_token_value',
    url: 'http://localhost:3000',
  },
]);
```

### Add Custom Assertions
```typescript
test('custom assertion', async ({ page }) => {
  const postDetailPage = new PostDetailPage(page, testUsername, testSlug);
  await postDetailPage.waitForPageLoad();
  
  // Add your custom assertions here
  const customElement = page.locator('your-selector');
  expect(customElement).toHaveText('expected text');
});
```

## Expected UI Implementation

The tests expect the following HTML structure:

### Like Button
```html
<button aria-pressed="false" class="like-button">
  <svg class="heart-icon"><!-- heart icon --></svg>
  좋아요
</button>
```

### Like Count Display
```html
<span data-testid="like-count">좋아요 123</span>
```

### Login Prompt (for unauthenticated users)
```html
<div class="modal" data-testid="login-prompt">
  <p>로그인이 필요합니다</p>
  <button>로그인</button>
</div>
```

### Liked State
```html
<button aria-pressed="true" class="like-button liked active">
  <svg class="heart-icon animate-bounce"><!-- heart icon --></svg>
  좋아요 해제
</button>
```

## Troubleshooting

### Tests fail with "locator not found"
1. Verify the post URL is correct
2. Check selectors match your UI implementation
3. Add custom selectors in PostDetailPage

### Authentication tests fail
1. Verify auth cookie/token names match your implementation
2. Check token format (JWT, session, etc.)
3. Adjust auth setup in beforeEach hook

### Like count not updating
1. Ensure backend like endpoint is working
2. Check network requests in Playwright Inspector
3. Verify response format includes updated count

### Animation tests are flaky
1. Use `waitForTimeout()` to give animation time to play
2. Check animation class names in your CSS
3. Consider disabling animations in test environment

### Timeout errors
1. Increase timeout values in test methods
2. Check backend is running and responding
3. Verify page load times with `waitUntil`

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: pnpm test:e2e -- like-button.spec.ts
  env:
    CI: true
```

### Notes for CI
- Tests run in parallel by default
- Use `fullyParallel: false` for sequential execution
- Increase timeout values for slower CI environments

## Performance Considerations

- Each test takes ~2-5 seconds
- Total suite runtime: ~60-120 seconds
- Tests are parallelizable (default: 4 workers)
- Use `--workers=1` for serial execution if needed

## Best Practices

1. **Always use Page Object Model** - Keeps tests maintainable
2. **Use meaningful test names** - Describe what's being tested
3. **Add comments** - Explain non-obvious test logic
4. **Wait appropriately** - Use `waitFor` instead of fixed timeouts
5. **Clean up state** - Use `beforeEach`/`afterEach` hooks
6. **Test user flows** - Test complete scenarios, not isolated pieces
7. **Include error cases** - Test what happens when things fail
8. **Use accessibility selectors** - Prefer role-based over CSS selectors

## Future Enhancements

Possible additions to test coverage:

- [ ] Test like button on different post feed pages
- [ ] Test like button persistence across browser tabs
- [ ] Test like count race conditions (concurrent likes)
- [ ] Test like button with different user roles (admin, moderator)
- [ ] Test like button analytics tracking
- [ ] Test like button with different viewport sizes (responsive)
- [ ] Test like button on touch devices
- [ ] Test bulk like operations
- [ ] Test like limits (max likes per day, etc.)

## References

- [Playwright Testing Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Playwright API Reference](https://playwright.dev/docs/api/class-page)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
