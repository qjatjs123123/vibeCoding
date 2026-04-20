# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tags-series.spec.ts >> Tags and Series Navigation >> Tags Page >> should display multiple tags in grid layout
- Location: e2e\tags-series.spec.ts:41:9

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/tags", waiting until "networkidle"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "vibeCoding" [ref=e5] [cursor=pointer]:
        - /url: /
      - navigation [ref=e6]:
        - link "Home" [ref=e7] [cursor=pointer]:
          - /url: /
        - link "Tags" [ref=e8] [cursor=pointer]:
          - /url: /tags
      - link "Login" [ref=e10] [cursor=pointer]:
        - /url: /login
        - button "Login" [ref=e11]
  - main [ref=e12]:
    - main [ref=e13]:
      - heading "Tags" [level=1] [ref=e14]
      - generic [ref=e15]:
        - link "#react 45 articles" [ref=e16] [cursor=pointer]:
          - /url: /tags/react
          - heading "#react" [level=3] [ref=e17]
          - paragraph [ref=e18]: 45 articles
        - link "#typescript 38 articles" [ref=e19] [cursor=pointer]:
          - /url: /tags/typescript
          - heading "#typescript" [level=3] [ref=e20]
          - paragraph [ref=e21]: 38 articles
        - link "#nextjs 32 articles" [ref=e22] [cursor=pointer]:
          - /url: /tags/nextjs
          - heading "#nextjs" [level=3] [ref=e23]
          - paragraph [ref=e24]: 32 articles
        - link "#javascript 51 articles" [ref=e25] [cursor=pointer]:
          - /url: /tags/javascript
          - heading "#javascript" [level=3] [ref=e26]
          - paragraph [ref=e27]: 51 articles
        - link "#frontend 47 articles" [ref=e28] [cursor=pointer]:
          - /url: /tags/frontend
          - heading "#frontend" [level=3] [ref=e29]
          - paragraph [ref=e30]: 47 articles
        - link "#performance 23 articles" [ref=e31] [cursor=pointer]:
          - /url: /tags/performance
          - heading "#performance" [level=3] [ref=e32]
          - paragraph [ref=e33]: 23 articles
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tags and Series Navigation', () => {
  4   |   test.describe('Tags Page', () => {
  5   |     test.beforeEach(async ({ page }) => {
> 6   |       await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  7   |     });
  8   | 
  9   |     test('should load tags page', async ({ page }) => {
  10  |       // Check page title
  11  |       const title = page.locator('h1');
  12  |       await expect(title).toContainText('Tags');
  13  |     });
  14  | 
  15  |     test('should display tag list', async ({ page }) => {
  16  |       // Check if tags are displayed
  17  |       const tags = page.locator('a[href*="/tags/"]');
  18  |       const tagCount = await tags.count();
  19  | 
  20  |       expect(tagCount).toBeGreaterThan(0);
  21  |     });
  22  | 
  23  |     test('should display tag names with article count', async ({ page }) => {
  24  |       // Verify individual tag elements
  25  |       const reactTag = page.locator('a[href="/tags/react"]');
  26  |       await expect(reactTag).toBeVisible();
  27  | 
  28  |       const reactTagText = await reactTag.textContent();
  29  |       expect(reactTagText).toContain('react');
  30  |       expect(reactTagText).toContain('articles');
  31  |     });
  32  | 
  33  |     test('should have clickable tag links', async ({ page }) => {
  34  |       // Verify tag links are properly formatted
  35  |       const firstTag = page.locator('a[href*="/tags/"]').first();
  36  |       const href = await firstTag.getAttribute('href');
  37  | 
  38  |       expect(href).toMatch(/^\/tags\/[a-z]+$/);
  39  |     });
  40  | 
  41  |     test('should display multiple tags in grid layout', async ({ page }) => {
  42  |       // Check grid structure
  43  |       const tagContainer = page.locator('div[class*="grid"]');
  44  |       await expect(tagContainer).toBeVisible();
  45  | 
  46  |       const tags = page.locator('a[href*="/tags/"]');
  47  |       const count = await tags.count();
  48  | 
  49  |       // Should have at least 3 tags
  50  |       expect(count).toBeGreaterThanOrEqual(3);
  51  |     });
  52  |   });
  53  | 
  54  |   test.describe('Tag Detail Page', () => {
  55  |     test('should navigate to tag page when clicking tag', async ({ page }) => {
  56  |       // Start from tags list page
  57  |       await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });
  58  | 
  59  |       // Click first tag
  60  |       const firstTag = page.locator('a[href*="/tags/"]').first();
  61  |       const tagHref = await firstTag.getAttribute('href');
  62  | 
  63  |       await firstTag.click();
  64  |       await page.waitForURL('**/tags/**', { timeout: 5000 });
  65  | 
  66  |       // Verify URL changed
  67  |       expect(page.url()).toContain('/tags/');
  68  |     });
  69  | 
  70  |     test('should display filtered posts by tag', async ({ page }) => {
  71  |       await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });
  72  | 
  73  |       // Check page title includes tag name
  74  |       const title = page.locator('h1').first();
  75  |       const titleText = await title.textContent();
  76  |       expect(titleText).toContain('react');
  77  | 
  78  |       // Check for post list
  79  |       const posts = page.locator('article');
  80  |       const postCount = await posts.count();
  81  | 
  82  |       // Should have at least one post (based on mock data)
  83  |       expect(postCount).toBeGreaterThanOrEqual(1);
  84  |     });
  85  | 
  86  |     test('should show article count for tag', async ({ page }) => {
  87  |       await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });
  88  | 
  89  |       // Check article count text
  90  |       const countText = page.locator('p').filter({ hasText: /article/ });
  91  |       await expect(countText.first()).toBeVisible();
  92  | 
  93  |       const text = await countText.first().textContent();
  94  |       expect(text).toMatch(/\d+\s+articles?/);
  95  |     });
  96  | 
  97  |     test('should display post details in filtered view', async ({ page }) => {
  98  |       await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });
  99  | 
  100 |       // Check for post card elements
  101 |       const posts = page.locator('article');
  102 |       const postCount = await posts.count();
  103 | 
  104 |       // At least one post should be visible
  105 |       expect(postCount).toBeGreaterThanOrEqual(1);
  106 |     });
```