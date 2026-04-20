# Like Button E2E Test - Integration Guide

## Quick Start (5 minutes)

### Step 1: File Location
Files are already created and ready to use:
```
frontend/
├── e2e/
│   ├── like-button.spec.ts          ← Main test suite
│   ├── pages/
│   │   └── PostDetailPage.ts         ← Page object model
│   ├── LIKE_BUTTON_TESTING.md        ← Detailed guide
│   ├── LIKE_BUTTON_TEST_CASES.md     ← Test checklist
│   └── LIKE_BUTTON_INTEGRATION.md    ← This file
```

### Step 2: Run Tests
```bash
# Run all like button tests
pnpm test:e2e e2e/like-button.spec.ts

# Run with UI
pnpm test:e2e e2e/like-button.spec.ts --ui

# Run with browser visible
pnpm test:e2e e2e/like-button.spec.ts --headed
```

### Step 3: Fix Issues
If tests fail, see "Common Issues & Solutions" section below.

---

## Implementation Checklist

### Required Components

- [ ] Post Detail Page Route (`/[username]/[slug]`)
- [ ] Like Button Component
  - [ ] Button element with "좋아요" or "like" text
  - [ ] aria-pressed attribute (true/false)
  - [ ] Visual feedback when liked (class change or style)
- [ ] Heart Icon
  - [ ] Icon inside or next to button
  - [ ] Optional: Animation class when liked
- [ ] Like Count Display
  - [ ] Numeric count visible (e.g., "좋아요 123")
  - [ ] Updates in real-time
- [ ] Login Prompt (for unauthenticated)
  - [ ] Modal, dialog, or message shown on like attempt
  - [ ] OR redirect to `/login` page
- [ ] Backend Like Endpoint
  - [ ] `POST /api/posts/<id>/like` endpoint
  - [ ] Requires authentication
  - [ ] Returns updated like status and count

### Optional Enhancements

- [ ] Heart animation on like (CSS animation)
- [ ] Toast notification on success/error
- [ ] Loading state while request in progress
- [ ] Fallback UI if animation not supported

---

## Selector Customization

### If Like Button Not Found

Update the selector in `PostDetailPage.ts`:

```typescript
async getLikeButton() {
  // Change this selector to match your button
  return this.page.locator('your-selector-here');
}
```

**Examples:**
```typescript
// By data-testid
return this.page.locator('[data-testid="like-button"]');

// By button text (Korean only)
return this.page.locator('button:has-text("좋아요")');

// By button text (English only)
return this.page.locator('button:has-text("Like")');

// By custom class
return this.page.locator('button.like-btn');

// By aria-label
return this.page.locator('button[aria-label="Like post"]');

// Combined (try multiple)
return this.page.locator(
  'button[data-testid="like-btn"], button.like-button, button:has-text("좋아요")'
).first();
```

### If Like Count Not Found

```typescript
async getLikeCount() {
  // Change to match your count display
  return this.page.locator('span.like-count');
}
```

### If Heart Icon Not Found

```typescript
async getHeartIcon() {
  // Change to match your icon
  return this.page.locator('svg.heart-icon');
}
```

### If Login Prompt Text Different

```typescript
async getLoginPrompt() {
  // Update to match your prompt text
  return this.page.locator('text=/로그인이 필요합니다/');
}
```

---

## Authentication Setup

### Option 1: Cookie-based (Most Common)

If your app uses cookies for auth:

```typescript
// In like-button.spec.ts, Authenticated User beforeEach:
await context.addCookies([
  {
    name: 'auth_token',           // ← Change to your cookie name
    value: 'test_token_123',       // ← Change to valid test token
    url: 'http://localhost:3000',
    httpOnly: true,
  },
]);
```

**Find your cookie name:**
1. Open your app in browser
2. Log in
3. Open DevTools → Application → Cookies
4. Look for authentication cookie (e.g., "auth_token", "session", "jwt")

### Option 2: LocalStorage

If your app uses localStorage for auth:

```typescript
// Uncomment this in like-button.spec.ts, Authenticated User beforeEach:
await context.addInitScript(() => {
  localStorage.setItem('auth_token', 'test_token_123');     // ← Change key/value
  localStorage.setItem('user_id', 'test-user-123');
});
```

**Find your localStorage keys:**
1. Open your app in browser
2. Log in
3. Open DevTools → Application → Local Storage
4. Look for auth-related keys

### Option 3: Session/Server-side Auth

If using session-based auth, create a helper function:

```typescript
// Add to beforeEach
await loginTestUser(context);

async function loginTestUser(context) {
  // Make POST request to your login endpoint
  // Set returned cookies/tokens
  const response = await context.request.post('http://localhost:3000/api/login', {
    data: {
      email: 'test@example.com',
      password: 'test123',
    },
  });
  
  if (response.ok) {
    const cookies = await context.cookies();
    await context.addCookies(cookies);
  }
}
```

---

## Test Post Data Setup

### Option 1: Use Existing Post
If you have a real post in your database:
```typescript
// In like-button.spec.ts:
const testUsername = 'real-username';   // ← Your real username
const testSlug = 'real-post-slug';      // ← Your real post slug
```

### Option 2: Create Test Post
Create a post for testing:
1. Log in to your app
2. Create a post with title "Test Post for E2E"
3. Get the username and slug from URL
4. Update test file with those values

### Option 3: Create Fixture/Mock Post
Create a dev page for testing:

```typescript
// frontend/src/app/dev/like-test/page.tsx
'use client';

import { PostDetailPage } from '@/components/PostDetail';

export default function LikeTestPage() {
  const mockPost = {
    id: '1',
    title: 'Like Test Post',
    slug: 'like-test-post',
    author: { username: 'test-author' },
    likeCount: 0,
    commentCount: 0,
    content: 'Test content',
    // ... other fields
  };

  return <PostDetailPage post={mockPost} />;
}
```

Then update tests:
```typescript
// In beforeEach
await page.goto('/dev/like-test', { waitUntil: 'domcontentloaded' });
```

---

## Backend Endpoint Requirements

Your backend must have:

### Like Toggle Endpoint
```
POST /api/posts/<postId>/like
```

**Request:**
```json
{
  "postId": "post-123"  // or in URL
}
```

**Response:**
```json
{
  "success": true,
  "liked": true,
  "likeCount": 124,
  "updatedAt": "2026-04-18T10:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## Test Execution Flow

### Flow 1: Unauthenticated User
```
1. Navigate to post page
2. Get initial like count
3. Click like button → Expected: Login prompt appears
4. Verify: Count unchanged, button state unchanged
```

### Flow 2: Authenticated User - Toggle Like
```
1. Navigate to post page (with auth token)
2. Get initial state
3. Click like button
4. Verify: State changed, count updated, animation played
5. Click again to unlike
6. Verify: State returned, count reverted
7. Reload page
8. Verify: State persisted
```

### Flow 3: Error Handling
```
1. Disable network
2. Click like button
3. Verify: No crash, error message shown
4. Re-enable network
5. Verify: Page functional
```

---

## Common Issues & Solutions

### Issue 1: "Locator not found" for like button

**Cause:** Button selector doesn't match your UI

**Solution:**
1. Open app in browser
2. Inspect like button
3. Note the tag, class, id, data-testid
4. Update selector in `PostDetailPage.ts`

Example:
```typescript
// Before
return this.page.locator('button:has-text(/좋아요/)');

// After (if button has class)
return this.page.locator('button.like-btn');
```

### Issue 2: "Like count is null" or not extracting number

**Cause:** Like count selector or format doesn't match

**Solution:**
1. Find like count element in browser
2. Check text format (e.g., "좋아요 123", "123 likes", etc.)
3. Update regex in `PostDetailPage.ts`:

```typescript
async getLikeCountNumber() {
  const text = '좋아요 123';  // Your actual text
  const match = text.match(/\d+/);  // Extract first number
  return match ? parseInt(match[0], 10) : null;
}
```

### Issue 3: Authentication not working

**Cause:** Token name or format wrong

**Solution:**
1. Log in manually in browser
2. Check DevTools for auth data:
   - Cookies (Application tab)
   - LocalStorage (Application tab)
   - Headers (Network tab)
3. Update auth setup to match

### Issue 4: Post not found (404)

**Cause:** Wrong username/slug or post doesn't exist

**Solution:**
1. Go to your app
2. Find an existing post
3. Copy username and slug from URL (e.g., `/user-123/my-post-slug`)
4. Update test file:

```typescript
const testUsername = 'user-123';
const testSlug = 'my-post-slug';
```

### Issue 5: Tests timeout

**Cause:** Page loads slowly or endpoint is slow

**Solution:**
1. Increase timeout in test:
```typescript
await postDetailPage.waitForPageLoad(10000); // 10 seconds
```

2. Or increase in page object:
```typescript
async waitForPageLoad() {
  const title = await this.getPostTitle();
  await title.waitFor({ state: 'visible', timeout: 10000 });
}
```

### Issue 6: Flaky animation test

**Cause:** Animation class removed before test checks

**Solution:**
1. Wait a bit before checking:
```typescript
await postDetailPage.clickLike();
await page.waitForTimeout(100);  // Give animation time
const hasAnimation = await postDetailPage.hasHeartAnimation();
```

2. Or just verify button state instead:
```typescript
await postDetailPage.clickLike();
const isLiked = await postDetailPage.isLiked();
expect(isLiked).toBe(true);
```

### Issue 7: "button is disabled" error

**Cause:** Button is disabled (permissions or state issue)

**Solution:**
1. Check if button should be disabled
2. If it shouldn't be, investigate why it's disabled
3. Update test to handle disabled state:

```typescript
const isDisabled = await postDetailPage.isLikeButtonDisabled();
if (!isDisabled) {
  await postDetailPage.clickLike();
}
```

---

## Debugging Tips

### Enable Debug Mode
```bash
pnpm test:e2e e2e/like-button.spec.ts --debug
```

This opens Playwright Inspector with:
- Step-by-step execution
- Element selection help
- Network request viewing

### View Browser While Running
```bash
pnpm test:e2e e2e/like-button.spec.ts --headed
```

### Take Screenshots
Add to test:
```typescript
await page.screenshot({ path: 'debug/screenshot.png' });
```

### Check Network Requests
```typescript
// Log all network requests
page.on('response', response => {
  console.log(`${response.status()} ${response.url()}`);
});
```

### Print Page Content
```typescript
const content = await page.content();
console.log(content);  // See full HTML
```

### Check Like Button Specifically
```typescript
const button = await postDetailPage.getLikeButton();
const text = await button.textContent();
const classes = await button.getAttribute('class');
const ariaPre = await button.getAttribute('aria-pressed');

console.log({
  text,
  classes,
  ariaPre,
});
```

---

## Performance Optimization

### Run Tests in Parallel (faster)
```bash
pnpm test:e2e e2e/like-button.spec.ts --workers=4
```

### Run Tests Serially (debugging)
```bash
pnpm test:e2e e2e/like-button.spec.ts --workers=1
```

### Filter Tests (run subset)
```bash
# Only authenticated tests
pnpm test:e2e e2e/like-button.spec.ts -g "Authenticated"

# Only single test
pnpm test:e2e e2e/like-button.spec.ts -g "should toggle like"
```

---

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Like Button E2E Tests
  run: pnpm test:e2e -- e2e/like-button.spec.ts
  env:
    CI: true
```

### Update playwright.config.ts for CI
```typescript
webServer: {
  command: 'pnpm dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,  // Fresh server in CI
  timeout: 120 * 1000,
},
```

---

## Next Steps

1. **Run tests:** `pnpm test:e2e e2e/like-button.spec.ts`
2. **Fix selectors:** Update PostDetailPage.ts if tests fail
3. **Fix auth:** Customize authentication setup
4. **Check backend:** Ensure like endpoint works
5. **Debug failures:** Use --debug or --headed flags
6. **Review results:** Check test report in `playwright-report/`

---

## Support References

- Full test list: `LIKE_BUTTON_TEST_CASES.md`
- Detailed guide: `LIKE_BUTTON_TESTING.md`
- Playwright docs: https://playwright.dev/docs/intro
- Page object guide: https://playwright.dev/docs/pom

---

**Last Updated:** 2026-04-18  
**Version:** 1.0  
**Status:** Ready for integration
