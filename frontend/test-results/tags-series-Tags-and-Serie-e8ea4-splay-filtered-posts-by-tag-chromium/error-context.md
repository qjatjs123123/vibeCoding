# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tags-series.spec.ts >> Tags and Series Navigation >> Tag Detail Page >> should display filtered posts by tag
- Location: e2e\tags-series.spec.ts:70:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/tags/react", waiting until "networkidle"

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
      - generic [ref=e14]:
        - heading "#" [level=1] [ref=e15]
        - paragraph [ref=e16]: "0 articles tagged with #"
      - paragraph [ref=e19]: No posts found
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tags and Series Navigation', () => {
  4   |   test.describe('Tags Page', () => {
  5   |     test.beforeEach(async ({ page }) => {
  6   |       await page.goto('http://localhost:3000/tags', { waitUntil: 'networkidle' });
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
> 71  |       await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
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
  107 | 
  108 |     test('should have proper tag formatting with hash', async ({ page }) => {
  109 |       await page.goto('http://localhost:3000/tags/react', { waitUntil: 'networkidle' });
  110 | 
  111 |       // Check for # prefix in tag name
  112 |       const tagHeader = page.locator('h1').first();
  113 |       const text = await tagHeader.textContent();
  114 | 
  115 |       expect(text).toContain('#');
  116 |     });
  117 |   });
  118 | 
  119 |   test.describe('Tag Navigation from Post Detail', () => {
  120 |     test('should navigate to tag page when clicking tag in post detail', async ({ page }) => {
  121 |       // Go to post detail page
  122 |       await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });
  123 | 
  124 |       // Find and click a tag
  125 |       const tagLink = page.locator('span[class*="bg"]:first-of-type');
  126 | 
  127 |       // Get tag text to verify
  128 |       const tagText = await tagLink.textContent();
  129 |       expect(tagText).toBeTruthy();
  130 | 
  131 |       // Note: If tags are not clickable links in the current implementation,
  132 |       // this test verifies that tags are at least displayed
  133 |       await expect(tagLink).toBeVisible();
  134 |     });
  135 | 
  136 |     test('should display tags in post detail header', async ({ page }) => {
  137 |       await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });
  138 | 
  139 |       // Check for tag badges
  140 |       const tags = page.locator('span[class*="rounded"]').filter({ hasText: /#/ });
  141 |       const tagCount = await tags.count();
  142 | 
  143 |       expect(tagCount).toBeGreaterThanOrEqual(1);
  144 |     });
  145 | 
  146 |     test('should display multiple tags in post detail', async ({ page }) => {
  147 |       await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });
  148 | 
  149 |       // Check for tag content
  150 |       const pageContent = await page.content();
  151 | 
  152 |       expect(pageContent).toContain('react');
  153 |       expect(pageContent).toContain('javascript');
  154 |     });
  155 |   });
  156 | 
  157 |   test.describe('Series Navigation', () => {
  158 |     test('should display series information if available', async ({ page }) => {
  159 |       await page.goto('http://localhost:3000/test-user/react-18-features', { waitUntil: 'networkidle' });
  160 | 
  161 |       // Check if series section exists (depends on implementation)
  162 |       // This is a flexible test since series display is optional for this post
  163 |       const page_content = await page.content();
  164 |       const hasSeriesInfo = page_content.includes('series') || page_content.includes('Series');
  165 | 
  166 |       // If series info exists, verify it's visible
  167 |       if (hasSeriesInfo) {
  168 |         const seriesSection = page.locator('text=/Series|시리즈/i');
  169 |         const visible = await seriesSection.isVisible().catch(() => false);
  170 |         expect(visible).toBe(true);
  171 |       }
```