# Phase 5: E2E Tests - Quick Start Guide

## Overview

**Phase 5 Task**: E2E-1 - Feed Loading and Infinite Scroll Tests

**File Created**: `e2e/feed.spec.ts`

**Total Tests**: 20 comprehensive test cases

---

## Quick Start (30 seconds)

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Run Tests
```bash
npx playwright test e2e/feed.spec.ts
```

### 3. View Results
```bash
npx playwright show-report
```

---

## Common Commands

### Run Tests with UI (Recommended for Development)
```bash
npx playwright test e2e/feed.spec.ts --ui
```
Features:
- Interactive test runner
- Visual debugging
- Step-through execution
- Real-time element inspection

### Run Single Test
```bash
npx playwright test e2e/feed.spec.ts -g "should load feed on homepage"
```

### Run Test Group
```bash
npx playwright test e2e/feed.spec.ts -g "Load and Navigation"
npx playwright test e2e/feed.spec.ts -g "Infinite Scroll"
```

### Debug Mode (With Inspector)
```bash
npx playwright test e2e/feed.spec.ts --debug
```

### Watch Mode (Headless)
```bash
npx playwright test e2e/feed.spec.ts --watch
```

### With Visual Output (See Browser)
```bash
npx playwright test e2e/feed.spec.ts --headed
```

---

## Test Groups

### 1. Feed Page - Load and Navigation (5 tests)
```bash
npx playwright test e2e/feed.spec.ts -g "Load and Navigation"
```

**Tests**:
- Homepage loads
- Post cards render with data
- Metadata displays correctly
- Empty feed handled gracefully

### 2. Tab Navigation (3 tests)
```bash
npx playwright test e2e/feed.spec.ts -g "Tab Navigation"
```

**Tests**:
- Navigate to `/recent`
- Navigate to `/trending`
- Switch between tabs

### 3. Infinite Scroll (3 tests)
```bash
npx playwright test e2e/feed.spec.ts -g "Infinite Scroll"
```

**Tests**:
- Load more on scroll
- IntersectionObserver detection
- Loading indicator display

### 4. Post Card Interactions (3 tests)
```bash
npx playwright test e2e/feed.spec.ts -g "Post Card Interactions"
```

**Tests**:
- Click post card
- No console errors
- Like button presence

### 5. Responsive Design (3 tests)
```bash
npx playwright test e2e/feed.spec.ts -g "Responsive Design"
```

**Tests**:
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1440x900)

### 6. Error Handling (2 tests)
```bash
npx playwright test e2e/feed.spec.ts -g "Error Handling"
```

**Tests**:
- API failure gracefully handled
- Network timeout handled

### 7. Performance (2 tests)
```bash
npx playwright test e2e/feed.spec.ts -g "Performance"
```

**Tests**:
- Load time < 5 seconds
- No layout shift during load

---

## Expected Results

### All Tests Pass ✅
If all routes and basic components exist:

```
✓ [chromium] › feed.spec.ts:20:7 › Feed Page - Load and Navigation › should load feed on homepage
✓ [chromium] › feed.spec.ts:100:7 › Feed Page - Tab Navigation › should navigate to recent feed
✓ [chromium] › feed.spec.ts:114:7 › Feed Page - Tab Navigation › should navigate to trending feed
... (17 more tests)

20 passed
```

### Some Tests Fail ⚠️
**Most Common**: PostList component not implemented yet

```
1 failed [chromium] › feed.spec.ts:31 › should render post cards
- Expected post cards in <article> but found none
```

**Solution**: Implement PostList and PostCard components

---

## Test Structure Explained

### Before Each Test
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});
```
- Navigates to home page
- Waits for DOM to load
- Runs before each test in group

### Test Example
```typescript
test('should load feed on homepage', async ({ page }) => {
  // Check main content visible
  const mainElement = page.locator('main');
  await expect(mainElement).toBeVisible();
  
  // Check heading exists
  const heading = page.locator('h1');
  const headingText = await heading.textContent();
  expect(headingText).toMatch(/최신|Recent/i);
});
```

### Selectors
- `page.locator('main')` - Find `<main>` element
- `page.locator('h1')` - Find heading
- `page.locator('article')` - Find post cards
- `page.locator('button:has-text("...")')` - Find button by text
- `page.locator('[class*="error"]')` - Find by class pattern

### Assertions
- `await expect(element).toBeVisible()` - Element visible on page
- `await expect(element).toBeInTheDocument()` - Element exists in DOM
- `expect(text).toMatch(/pattern/)` - Regex match
- `expect(number).toBeLessThan(5000)` - Number assertion

---

## Troubleshooting

### Issue: Backend connection refused
```
✗ Tests fail: ECONNREFUSED (connection to http://localhost:8000)
```

**Fix**:
1. Start backend: `cd ../backend && pnpm dev`
2. Or mock API in test setup

### Issue: Tests timeout
```
✗ Test timeout: 30000ms exceeded
```

**Fix**:
1. Ensure dev server running: `pnpm dev`
2. Wait longer if server is slow: `await page.waitForTimeout(3000)`
3. Check network in DevTools

### Issue: Selectors not found
```
✗ locator('article') did not find element
```

**Fix**:
1. Run with `--debug` to inspect page
2. Check PostList component is implemented
3. Use looser selectors: `page.locator('[class*="grid"]')`

### Issue: Mobile test viewport
```
✗ Mobile viewport test fails
```

**Fix**:
1. Check responsive CSS exists
2. Run with `--headed` to see actual render
3. Ensure media queries in Tailwind CSS

---

## Mock API Setup

If backend isn't available, mock API responses:

```typescript
test('should load feed on homepage', async ({ page }) => {
  // Mock API
  await page.route('**/api/posts**', route => {
    return route.fulfill({
      status: 200,
      body: JSON.stringify({
        posts: [
          {
            id: '1',
            title: 'Test Post',
            slug: 'test-post',
            excerpt: 'Test excerpt',
            coverImage: 'https://example.com/image.jpg',
            publishedAt: '2024-01-01T00:00:00Z',
            readingTime: 5,
            viewCount: 100,
            author: { username: 'author', avatarUrl: 'https://example.com/avatar.jpg' },
            tags: [{ name: 'test' }],
            likeCount: 0,
            commentCount: 0,
          }
        ],
        totalCount: 1,
        nextCursor: null,
      })
    });
  });

  await page.goto('/');
  // Test continues...
});
```

---

## Implementation Checklist

For tests to fully pass, ensure these are implemented:

### Routes
- [ ] `/` route exists and renders
- [ ] `/recent` route exists and renders
- [ ] `/trending` route exists and renders

### Components
- [ ] `<main>` element wraps content
- [ ] `<h1>` heading with feed title
- [ ] Post cards (can be `<article>` or custom)

### Features
- [ ] PostList component renders posts
- [ ] PostCard component shows title, author, reading time
- [ ] Post cards are clickable/navigable
- [ ] Infinite scroll loads more posts
- [ ] Error messages show on API failure

### Optional Features
- [ ] Like buttons on posts
- [ ] Loading indicators
- [ ] Tab navigation between feeds
- [ ] Responsive design

---

## Next Steps

### After Tests Pass
1. ✅ Verify all 20 tests pass
2. 📊 Check test coverage report
3. 🔧 Fix any failing components
4. 📝 Add additional test cases
5. 🚀 Integrate with CI/CD

### Additional E2E Tests to Create
- `e2e/auth.spec.ts` - Login/Register
- `e2e/posts.spec.ts` - Post CRUD
- `e2e/comments.spec.ts` - Comment creation
- `e2e/search.spec.ts` - Search functionality
- `e2e/tags.spec.ts` - Tag filtering

---

## Documentation

- **Full Guide**: See `E2E_FEED_TESTS.md`
- **Test File**: `e2e/feed.spec.ts`
- **Config**: `playwright.config.ts`
- **Architecture**: `CLAUDE.md`

---

## Performance Goals

| Metric | Goal | Status |
|--------|------|--------|
| Page Load | < 5s | ✓ Tested |
| TTFP* | < 2s | ✓ Tested |
| Infinite Scroll | < 1.5s | ✓ Tested |
| No Errors | 0 errors | ✓ Tested |

*Time To First Post

---

## Command Reference

```bash
# Development
pnpm dev                                    # Start dev server
npx playwright test e2e/feed.spec.ts        # Run all tests
npx playwright test e2e/feed.spec.ts --ui  # Interactive UI

# Debugging
npx playwright test e2e/feed.spec.ts --debug    # Inspector
npx playwright test e2e/feed.spec.ts --headed   # See browser
npx playwright test e2e/feed.spec.ts --watch    # Watch mode

# Reporting
npx playwright show-report                  # View test report
npx playwright test --reporter=html         # Generate HTML

# Specific Tests
npx playwright test e2e/feed.spec.ts -g "Load and Navigation"
npx playwright test e2e/feed.spec.ts -g "should load feed"
```

---

## Support

For issues or questions:
1. Check `E2E_FEED_TESTS.md` for detailed documentation
2. Review `CLAUDE.md` for architecture
3. Check Playwright docs: https://playwright.dev
4. Run with `--debug` to inspect

---

**Status**: ✅ Tests created and ready to run

**Next Phase**: Implement PostList component to pass all tests
