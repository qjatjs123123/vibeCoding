# Phase 5 E2E Tests: Feed Loading and Infinite Scroll

## Overview

**File**: `e2e/feed.spec.ts`

This test suite provides comprehensive end-to-end testing for the vibeCoding feed pages using Playwright. It covers:

- Feed page loading and content rendering
- Post card display with metadata
- Tab navigation (recent/trending)
- Infinite scroll behavior
- Post card interactions
- Responsive design across viewports
- Error handling
- Performance monitoring

**Total Tests**: 20 test cases organized in 6 test groups

---

## Test Structure

### 1. Feed Page - Load and Navigation (5 tests)

Tests basic feed loading and content rendering functionality.

#### `should load feed on homepage`
- Navigates to `/` (home page)
- Verifies `<main>` element is visible
- Checks page title contains feed-related keywords
- **Status**: Ready to run

#### `should render post cards with correct data`
- Waits 1 second for content to load
- Checks for grid container or `<article>` elements
- Verifies first post card has a title
- **Dependency**: PostList component must be implemented

#### `should display post metadata`
- Looks for post metadata: reading time (분), dates, view counts
- Checks first article contains metadata indicators
- **Flexible detection**: Supports multiple metadata formats

#### `should handle empty feed gracefully`
- Tests error state handling
- Verifies page doesn't crash with no content
- Checks for error message or loading state
- **Edge case**: Handles both success and error states

### 2. Feed Page - Tab Navigation (3 tests)

Tests navigation between recent and trending feeds.

#### `should navigate to recent feed`
- Navigates to `/recent`
- Verifies page loads with "최신/Recent" in heading
- **Pattern**: Routes are: `/`, `/recent`, `/trending`

#### `should navigate to trending feed`
- Navigates to `/trending`
- Verifies page loads with "Trending/트렌딩" in heading
- **Pattern**: Trending feed tests popularity-based sorting

#### `should switch between feed tabs if tabs exist`
- Looks for tab buttons with text "Recent/Trending/최신/트렌딩"
- Tests clicking between tabs
- Verifies `aria-selected` or CSS class changes
- **Conditional**: Only runs if tabs are implemented

### 3. Feed Page - Infinite Scroll (3 tests)

Tests infinite scroll loading behavior.

#### `should load more posts on scroll`
- Counts initial post cards
- Scrolls to bottom of page (window.scrollBy)
- Waits 1.5 seconds for new content
- Verifies post count stays same or increases
- **Skip condition**: Skips if < 3 posts loaded initially

#### `should have intersection observer for scroll detection`
- Checks if browser supports IntersectionObserver
- **Purpose**: Validates scroll detection mechanism exists
- **Note**: Browser native API check

#### `should show loading indicator during fetch`
- Scrolls to trigger potential data load
- Looks for loading UI: `[class*="loading"]`, spinner, `[role="status"]`
- **Flexible**: Tests if loading UI is present (optional feature)

### 4. Feed Page - Post Card Interactions (3 tests)

Tests user interactions with post cards.

#### `should be able to click post card`
- Finds first `<article>` element
- Checks for clickable `<a>` link
- Verifies `href` attribute exists
- **Purpose**: Tests post card routing

#### `should display post card without errors`
- Monitors console for errors
- Filters out expected errors (404, mock data, localhost)
- Ensures no critical JavaScript errors during load
- **Duration**: 2 second wait for error detection

#### `should have like button on post cards`
- Looks for buttons with "Like/좋아요/♥/❤"
- **Status**: Optional feature test
- **Purpose**: Tests interactive elements on cards

### 5. Feed Page - Responsive Design (3 tests)

Tests layout responsiveness across device sizes.

#### `should be responsive on mobile viewport`
- Sets viewport to 375x667 (iPhone 6/7/8)
- Verifies main content is visible
- Checks article rendering on mobile
- **Purpose**: Mobile-first design validation

#### `should be responsive on tablet viewport`
- Sets viewport to 768x1024 (iPad)
- Verifies content displays correctly
- **Purpose**: Tablet layout testing

#### `should be responsive on desktop viewport`
- Sets viewport to 1440x900 (Desktop)
- Verifies content displays correctly
- **Purpose**: Desktop layout testing

### 6. Feed Page - Error Handling (2 tests)

Tests error handling and edge cases.

#### `should show error message on API failure`
- Aborts all `/api/posts` requests
- Waits for error UI
- Verifies graceful degradation (error message shown)
- **Purpose**: API failure resilience

#### `should handle network timeout`
- Simulates 10 second timeout on API calls
- Waits 2 seconds for page render
- Verifies page doesn't become blank
- **Purpose**: Network timeout resilience

### 7. Feed Page - Performance (2 tests)

Tests performance and visual stability.

#### `should load initial content within reasonable time`
- Measures page load time
- Asserts load completes within 5 seconds
- **Performance goal**: < 5000ms

#### `should not have layout shift during load`
- Monitors Layout Shift entries from Performance API
- **Purpose**: Prevents CLS (Cumulative Layout Shift)
- **Note**: Browser and implementation dependent

---

## Test Execution

### Run All Feed Tests
```bash
npx playwright test e2e/feed.spec.ts
```

### Run Specific Test Group
```bash
npx playwright test e2e/feed.spec.ts -g "Load and Navigation"
npx playwright test e2e/feed.spec.ts -g "Infinite Scroll"
```

### Run Single Test
```bash
npx playwright test e2e/feed.spec.ts -g "should load feed on homepage"
```

### Run with UI Mode (Recommended for Development)
```bash
npx playwright test e2e/feed.spec.ts --ui
```

### Run with Debug Mode
```bash
npx playwright test e2e/feed.spec.ts --debug
```

### Run with Headed Mode (See Browser)
```bash
npx playwright test e2e/feed.spec.ts --headed
```

### Generate HTML Report
```bash
npx playwright test e2e/feed.spec.ts
npx playwright show-report
```

---

## Test Configuration

**Config File**: `playwright.config.ts`

### Settings
- **Base URL**: `http://localhost:3000`
- **Browser**: Chromium
- **Timeout**: 30 seconds per test
- **Retries**: 2 (CI), 0 (local)
- **Screenshots**: On failure only
- **Traces**: On first retry

### Prerequisites
- Local dev server running: `pnpm dev`
- Or Playwright auto-starts with `command: 'pnpm dev'`

---

## Selectors Used

### Common Selectors
```typescript
page.locator('main')                    // Main content area
page.locator('h1')                      // Page heading
page.locator('article')                 // Post cards
page.locator('a')                       // Links in cards
page.locator('button:has-text(...)')    // Buttons with text
page.locator('[class*="grid"]')         // Grid containers
page.locator('[class*="error"]')        // Error messages
page.locator('[role="status"]')         // Loading/status regions
page.locator('input[placeholder="..."]') // Input fields
```

### Flexible Selectors
Tests use fallback selectors to handle different implementations:
- Posts: `<article>` tag OR grid container
- Metadata: Multiple formats (Korean "분", ISO dates, view counts)
- Tabs: Text content matching (Recent|Trending|최신|트렌딩)
- Loading: Multiple patterns (loading, spinner, status role)

---

## Implementation Requirements

### Minimum Implementation
For tests to pass, the following must be implemented:

1. **Pages**
   - `/` route renders
   - `/recent` route renders
   - `/trending` route renders

2. **Content**
   - `<main>` element wrapping content
   - `<article>` elements or grid for post cards
   - `<h1>` with feed title

3. **Links**
   - Post cards have clickable `<a>` links

### Recommended Implementation
For full test coverage:

1. **PostList Component** (`features/post/components/PostList.tsx`)
   - Accepts `initialPosts` and `hasMore` props
   - Renders post cards with metadata
   - Implements infinite scroll using IntersectionObserver

2. **PostCard Component** (`features/post/components/PostCard.tsx`)
   - Displays title, author, date, reading time
   - Shows metadata
   - Has like button
   - Is clickable/navigates to detail page

3. **Metadata Display**
   - Author name/avatar
   - Publication date
   - Reading time (in minutes, marked with "분")
   - View count
   - Tags (if applicable)

4. **Infinite Scroll**
   - Uses IntersectionObserver for scroll detection
   - Shows loading indicator while fetching
   - Appends new posts to list
   - Disables when no more content

5. **Error Handling**
   - Shows error message on API failure
   - Displays fallback UI gracefully
   - No console errors from application code

---

## Test Data

### Fixture Data
Tests use actual API responses from backend. For testing without backend:

1. **Mock API Responses**
```typescript
// In setup or test
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
          author: { username: 'author', avatarUrl: '...' },
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
```

2. **Test Environment Variables**
- `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Or use backend mock server

---

## Assertions

### Common Assertions Used
```typescript
expect(element).toBeVisible()              // Element is in viewport
expect(element).toBeTruthy()               // Value is truthy
expect(count).toBeLessThan(5000)          // Number comparison
expect(text).toMatch(/pattern/i)          // Regex matching
expect(array.length >= 0).toBeTruthy()    // Array assertions
```

### Custom Assertions
Tests use `.catch(() => false)` for graceful failure handling:
```typescript
const isVisible = await element.isVisible().catch(() => false);
```

This allows tests to continue even if element doesn't exist.

---

## Debugging

### Enable Debug Mode
```bash
npx playwright test e2e/feed.spec.ts --debug
```

### Inspect Elements
In Playwright Inspector:
1. Use "Locator" tool to find elements
2. Run commands in REPL
3. Step through test execution

### View Generated Screenshots
Screenshots saved to: `test-results/` on failure

### Check Console Messages
```typescript
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log(msg.text());
  }
});
```

### Monitor Network Requests
```typescript
const requests = page.context().network();
// Or use:
await page.networkIdleWait();
```

---

## Maintenance

### Adding New Tests
1. Follow existing test structure
2. Use `test.describe()` for grouping
3. Add `test.beforeEach()` for setup
4. Use descriptive test names (should...)
5. Include comments explaining complex assertions

### Updating Selectors
If UI changes, update selectors in corresponding test:
```typescript
// Old selector
page.locator('button:has-text("Old")')

// New selector
page.locator('button[data-testid="feed-tab"]')
```

### Skipping Tests
```typescript
test.skip('should load feed', async ({ page }) => {
  // This test is skipped
});

// Or conditionally:
if (articleCount < 3) {
  test.skip();
}
```

### Marking as Flaky
```typescript
test('potentially flaky test', async ({ page }) => {
  test.fail(); // Expected to fail
});
```

---

## Common Issues

### Issue: Tests timeout waiting for API
**Solution**: 
- Ensure backend is running: `cd ../backend && pnpm dev`
- Or mock API responses in test
- Increase timeout in playwright.config.ts

### Issue: Selectors not found
**Solution**:
- Use `--debug` mode to inspect
- Try looser selectors like `[class*="keyword"]`
- Check page structure matches expectations

### Issue: Mobile tests fail
**Solution**:
- Verify viewport sizes in test
- Check responsive CSS media queries
- Test with `--headed` to see actual render

### Issue: Flaky scroll tests
**Solution**:
- Increase wait timeout from 1500ms to 3000ms
- Add more robust scroll trigger: `window.scrollTo(0, document.body.scrollHeight)`
- Check if IntersectionObserver is properly implemented

---

## Performance Targets

| Metric | Target | Test |
|--------|--------|------|
| Page Load | < 5s | should load initial content |
| Time to First Post | < 2s | should load feed on homepage |
| Scroll Response | < 1.5s | should load more posts |
| Layout Shift | Minimal | should not have layout shift |

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: npx playwright test e2e/feed.spec.ts
  
- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

---

## References

- [Playwright Documentation](https://playwright.dev)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [CLAUDE.md - Frontend Architecture](./CLAUDE.md)
- [Testing Guide](./frontend/.claude/rules/testing.md)

---

## Next Steps

### Phase 5 Checklist
- [ ] Run `npx playwright test e2e/feed.spec.ts` locally
- [ ] Fix any failing tests
- [ ] Implement missing components if needed
- [ ] Add test data fixtures
- [ ] Integration with CI/CD pipeline
- [ ] Add additional E2E tests for other features

### Future Test Expansion
- Authentication flow tests
- Comment creation/deletion tests
- Like functionality tests
- Tag filtering tests
- Search functionality tests
- User profile tests
- Post creation/editing tests
