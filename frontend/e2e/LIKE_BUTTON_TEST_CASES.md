# Like Button E2E Test Cases - Complete Checklist

## Phase 5 E2E-3: Like Button E2E Tests

### Files Created
- ✅ `e2e/like-button.spec.ts` - Complete test suite (360+ lines, 20 test cases)
- ✅ `e2e/pages/PostDetailPage.ts` - Page Object Model (200+ lines, 25+ helper methods)
- ✅ `e2e/LIKE_BUTTON_TESTING.md` - Comprehensive testing guide
- ✅ `e2e/LIKE_BUTTON_TEST_CASES.md` - This checklist

---

## Test Cases by Category

### 1. Unauthenticated User Tests (3 cases)

#### ✅ should show login prompt when clicking like button without auth
**Purpose:** Verify unauthenticated users cannot like and get login prompt
- Navigate to post detail page
- Click like button
- Verify login prompt appears OR redirected to login page
- **Expected Result:** Modal/message shows or URL changes to /login

#### ✅ should not increment like count when unauthenticated
**Purpose:** Ensure like count doesn't change for unauthenticated users
- Get initial like count
- Click like button
- Verify like count unchanged
- **Expected Result:** Like count = initial count

#### ✅ should not change button state when unauthenticated
**Purpose:** Verify button visual state doesn't change for unauthenticated users
- Get initial button state
- Click like button
- Verify button state unchanged
- **Expected Result:** Button class/aria-pressed unchanged

**Run with:** `pnpm test:e2e -- like-button.spec.ts -g "Unauthenticated"`

---

### 2. Authenticated User Tests (6 cases)

#### ✅ should toggle like when authenticated user clicks like button
**Purpose:** Basic like toggle functionality
- Authenticate user (via cookie or localStorage)
- Get initial like state
- Click like button
- **Expected Result:** Like state changes (liked ↔ unliked)

#### ✅ should update like count immediately (optimistic update)
**Purpose:** Verify optimistic UI updates without waiting for server
- Get initial like count
- Click like button
- **Expected Result:** Like count updates immediately (before server response)
- **Critical for:** Good UX and perceived performance

#### ✅ should show like animation when clicking like button
**Purpose:** Verify heart animation plays on like
- Click like button
- Check for animation class
- **Expected Result:** Heart icon has animation class (animate, bounce, etc.)

#### ✅ should toggle like back when clicked again
**Purpose:** Verify bidirectional toggle functionality
- Click like button (like)
- Verify state changed
- Click like button again (unlike)
- **Expected Result:** State returns to initial, count reverts

#### ✅ should maintain like state after page reload
**Purpose:** Verify like state persistence (backend data integrity)
- Click like button to change state
- Reload page
- **Expected Result:** Like state persists after reload
- **Critical for:** Data consistency and backend correctness

#### ✅ should show visual feedback on like button when liked
**Purpose:** Verify button appearance changes when liked
- Get initial button classes/styles
- Click like button
- **Expected Result:** Button class/aria-pressed changes to indicate "liked"
- **Expected:** class includes "liked"/"active" OR aria-pressed="true"

**Run with:** `pnpm test:e2e -- like-button.spec.ts -g "Authenticated"`

---

### 3. Like Button Rendering Tests (4 cases)

#### ✅ should display like button on post detail page
**Purpose:** Verify like button is present and visible
- Navigate to post detail page
- **Expected Result:** Like button is visible
- **Selector:** `button:has-text(/좋아요|like/i)` or `button[data-testid="like-button"]`

#### ✅ should display like count on post detail page
**Purpose:** Verify like count display is present
- Navigate to post detail page
- **Expected Result:** Like count element visible with number
- **Selector:** `text=/좋아요\\s+\\d+|likes?:/i`

#### ✅ should display heart icon in like button
**Purpose:** Verify heart icon element exists
- Navigate to post detail page
- **Expected Result:** Heart icon is present (visible or within button)
- **Selector:** `[data-testid="heart-icon"], svg[aria-label*="heart"], .heart-icon`

#### ✅ should render like button in correct section of page
**Purpose:** Verify button positioning in page layout
- Check button Y coordinate vs title
- **Expected Result:** Like button appears below post title (correct order)
- **Verification:** Button.y >= Title.y

**Run with:** `pnpm test:e2e -- like-button.spec.ts -g "Like Button Rendering"`

---

### 4. Accessibility Tests (3 cases)

#### ✅ should have accessible like button
**Purpose:** Verify button is accessible with proper semantics
- Check button role attribute
- Check for aria-label or visible text
- **Expected Result:** 
  - role="button" OR native button element
  - aria-label OR visible text content

#### ✅ should have aria-pressed attribute for like button
**Purpose:** Verify toggle button semantics for screen readers
- Get aria-pressed attribute
- **Expected Result:** aria-pressed="true" or "false"
- **Critical for:** Screen reader users

#### ✅ should be keyboard navigable to like button
**Purpose:** Verify keyboard-only users can access like button
- Press Tab key
- **Expected Result:** Like button is reachable via Tab navigation
- **Critical for:** Keyboard accessibility

**Run with:** `pnpm test:e2e -- like-button.spec.ts -g "Accessibility"`

---

### 5. Error Handling Tests (2 cases)

#### ✅ should handle network error gracefully
**Purpose:** Verify app doesn't crash on network failure
- Disable network (set offline)
- Click like button
- Re-enable network
- **Expected Result:** Page remains functional, no crash
- **Verification:** Page is still loaded and interactive

#### ✅ should show user-friendly error message on like failure
**Purpose:** Verify error message display on like operation failure
- Intercept and fail like request (abort)
- Click like button
- **Expected Result:** Error message appears OR like state doesn't change
- **Expected:** text contains "실패", "error", "failed", or "문제가 발생"

**Run with:** `pnpm test:e2e -- like-button.spec.ts -g "Error Handling"`

---

## Test Statistics

| Category | Count | Status |
|----------|-------|--------|
| Unauthenticated User | 3 | ✅ Complete |
| Authenticated User | 6 | ✅ Complete |
| Button Rendering | 4 | ✅ Complete |
| Accessibility | 3 | ✅ Complete |
| Error Handling | 2 | ✅ Complete |
| **TOTAL** | **18** | ✅ **Complete** |

---

## Requirement Coverage

### Phase 5 E2E-3 Requirements

| Requirement | Test Case | Status |
|-------------|-----------|--------|
| Find like button on post detail | "should display like button on post detail page" | ✅ |
| Unauthenticated: show login | "should show login prompt when clicking like button without auth" | ✅ |
| Authenticated: toggle like | "should toggle like when authenticated user clicks like button" | ✅ |
| Update like count immediately | "should update like count immediately (optimistic update)" | ✅ |
| Show heart animation | "should show like animation when clicking like button" | ✅ |
| Bidirectional toggle | "should toggle like back when clicked again" | ✅ |
| State persistence | "should maintain like state after page reload" | ✅ |
| Visual feedback | "should show visual feedback on like button when liked" | ✅ |

---

## Authentication Setup

### Test Configuration

**Cookie-based Auth (Default):**
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

**LocalStorage Auth (Alternative):**
```typescript
await context.addInitScript(() => {
  localStorage.setItem('auth_token', 'test_token_123');
  localStorage.setItem('user_id', 'test-user-123');
});
```

---

## Running Tests

### All Tests
```bash
pnpm test:e2e e2e/like-button.spec.ts
```

### By Category
```bash
# Unauthenticated tests
pnpm test:e2e e2e/like-button.spec.ts -g "Unauthenticated"

# Authenticated tests
pnpm test:e2e e2e/like-button.spec.ts -g "Authenticated"

# Rendering tests
pnpm test:e2e e2e/like-button.spec.ts -g "Like Button Rendering"

# Accessibility tests
pnpm test:e2e e2e/like-button.spec.ts -g "Accessibility"

# Error handling tests
pnpm test:e2e e2e/like-button.spec.ts -g "Error Handling"
```

### Single Test
```bash
pnpm test:e2e e2e/like-button.spec.ts -g "should toggle like when authenticated"
```

### With UI Mode
```bash
pnpm test:e2e e2e/like-button.spec.ts --ui
```

### With Browser Visible
```bash
pnpm test:e2e e2e/like-button.spec.ts --headed
```

### With Debugging
```bash
pnpm test:e2e e2e/like-button.spec.ts --debug
```

---

## Page Object Methods Used

### Navigation
- ✅ `goto()` - Navigate to post detail page
- ✅ `waitForPageLoad()` - Wait for page to load
- ✅ `isLoaded()` - Check page loaded state

### Like Button
- ✅ `getLikeButton()` - Get button element
- ✅ `clickLike()` - Click button
- ✅ `isLiked()` - Check if liked
- ✅ `isLikeButtonDisabled()` - Check if disabled

### Count & State
- ✅ `getLikeCount()` - Get count element
- ✅ `getLikeCountNumber()` - Extract count as number
- ✅ `waitForLikeCountChange()` - Wait for count to change
- ✅ `getHeartIcon()` - Get heart icon
- ✅ `hasHeartAnimation()` - Check animation

### Login Prompt
- ✅ `getLoginPrompt()` - Get prompt element
- ✅ `isLoginPromptVisible()` - Check visibility
- ✅ `waitForLoginPrompt()` - Wait for prompt
- ✅ `getLoginButton()` - Get login button in prompt

### Additional
- ✅ `getPostTitle()` - Get title
- ✅ `getAuthorName()` - Get author
- ✅ `getPostContent()` - Get content
- ✅ `getCommentCount()` - Get comment count
- ✅ `getViewCount()` - Get view count

---

## Dependencies

- `@playwright/test` - Test framework
- `playwright` - Browser automation
- TypeScript 5+ - Type safety
- Next.js - Frontend framework

---

## Notes

1. **Test Post Data Required**
   - Tests need a real post at `/<username>/<slug>` URL
   - Can be a dev page or actual post

2. **Backend Support Required**
   - Like toggle endpoint: `POST /api/posts/<id>/like`
   - Must support authenticated requests

3. **Authentication Required**
   - Tests use mock tokens (adjust to your auth implementation)
   - Both cookie and localStorage approaches supported

4. **Flexible Selectors**
   - Tests use regex patterns for Korean/English text
   - Selectors support multiple selector options
   - Easy to customize for different implementations

---

## Next Steps

1. ✅ Create test files
2. ✅ Implement page object model
3. ✅ Write comprehensive tests
4. ✅ Add testing documentation
5. 🔄 Run tests against actual implementation
6. 🔄 Adjust selectors for real UI
7. 🔄 Customize auth setup for backend
8. 🔄 Fix any failing tests
9. 🔄 Add CI/CD integration
10. 🔄 Monitor test performance

---

**Created:** 2026-04-18  
**Version:** 1.0  
**Status:** ✅ Complete
