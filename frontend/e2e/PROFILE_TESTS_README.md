# Profile E2E Tests

E2E (End-to-End) tests for user profile editing functionality. Tests cover authentication, form interactions, validation, and public profile display.

## Test Files

### 1. `profile.spec.ts` (Comprehensive Test Suite)

Detailed test suite covering all aspects of profile editing without Page Object Model pattern.

**Test Groups:**
- **Unauthenticated user** - Redirect to login flow
- **Authenticated user - Settings page** - Settings page access and navigation
- **Profile edit page - Form interactions** - Form field interactions and updates
- **Profile edit page - Form submission** - Form submission and cancellation
- **Public profile page - Reflect changes** - Profile updates visibility on public profile
- **Responsive design - Mobile** - Mobile viewport compatibility
- **Form validation and errors** - Input validation and error handling
- **Dark mode support** - Dark mode styling verification
- **Navigation and linking** - Navigation flow between pages

**Total Test Cases: 28**

### 2. `profile-pom.spec.ts` (Page Object Model Pattern)

Refactored test suite using Page Object Model (POM) pattern for better maintainability and reusability.

**Test Groups:**
- **Settings and Navigation Flow** - Navigation between pages
- **Profile Edit Form** - Form field interactions and updates
- **Form Validation** - Input validation
- **Public Profile Display** - Profile updates on public profile
- **Mobile Responsiveness** - Mobile viewport testing
- **Dark Mode Support** - Dark mode styling
- **Authentication and Authorization** - Auth redirects

**Total Test Cases: 23**

## Page Objects

### ProfilePage.ts

Three main page objects for profile-related pages:

#### 1. `ProfileEditPage`

Handles interactions with `/settings/profile` page.

**Key Methods:**
```typescript
// Navigation
goto() - Navigate to profile edit page

// Field getters
getNameInput()
getEmailInput()
getBioTextarea()
getBlogTitleInput()
getUsernameInput()
getProfilePhotoButton()

// Field updates
updateName(name: string)
updateEmail(email: string)
updateBio(bio: string)
updateBlogTitle(title: string)
updateProfile(data: {...}) - Update multiple fields

// Form submission
submit() - Click save button
cancel() - Click cancel button

// Value retrieval
getNameValue()
getEmailValue()
getBioValue()
getBlogTitleValue()
getAllFormValues()

// Validation
isUsernameDisabled()
waitForSuccessMessage()
waitForErrorMessage()
```

#### 2. `SettingsPage`

Handles interactions with `/settings` page.

**Key Methods:**
```typescript
// Navigation
goto() - Navigate to settings page

// Element getters
getTitle()
getProfileEditLink()
getPasswordChangeSection()
getNotificationSection()

// Navigation
navigateToProfileEdit() - Navigate to profile edit page

// State checking
isLoaded() - Check if page is loaded
```

#### 3. `PublicProfilePage`

Handles interactions with `/@[username]` public profile page.

**Key Methods:**
```typescript
// Navigation
goto() - Navigate to public profile

// Element getters
getDisplayName()
getUsernameDisplay()
getBioSection()
getBlogTitle()
getPostsSection()
getFollowersCount()

// Verification
isLoaded() - Check if profile loaded
verifyName(name: string) - Verify name update
verifyBio(bio: string) - Verify bio update
getBioText() - Get bio text content
```

## Test Helpers

### `helpers/auth.ts`

Authentication utilities for test setup.

**Test Users:**
```typescript
testUsers.authenticated - Standard test user
testUsers.admin - Admin test user
```

**Key Functions:**
```typescript
// Cookie management
setAuthCookie(context, tokenValue)
setAuthCookieWithUserData(context, userData)
clearAuthCookies(context)

// Session management
setupAuthenticatedSession(page, context)
setupGuestSession(page, context)

// Auth checking
isAuthenticated(context) - Check auth status
getAuthToken(context) - Get auth token value

// API mocking
mockAuthApi(page) - Mock auth endpoints
```

## Test Scenarios

### Authentication Flow

```
Unauthenticated User:
/settings → (redirect) → /login

Authenticated User:
/settings → Navigate → /settings/profile
```

### Profile Update Flow

```
1. Navigate to /settings/profile
2. Fill form fields (name, email, bio, blog title)
3. Click "Save" button
4. Success message appears (or page redirects)
5. Navigate to /@[username]
6. Verify changes are displayed
```

### Form Validation

```
Email Field:
- Invalid: "invalid-email" (fails HTML5 validation)
- Valid: "user@example.com" (passes validation)

Username Field:
- Always disabled (read-only)
- Cannot be edited

Other Fields:
- Accept any text input
- Support multi-line (bio)
```

### Mobile Testing

```
Viewport: 375x667 (iPhone SE)
- All fields visible/scrollable
- Buttons have minimum 44px height
- Form layout responsive
- Text readable in all sizes
```

### Dark Mode Testing

```
Enabled: localStorage.setItem('theme', 'dark')
         document.documentElement.classList.add('dark')

Verified:
- Form fields visible in dark mode
- Colors readable
- All interactive elements accessible
```

## Running Tests

### Run All Profile Tests

```bash
# Run both profile test suites
pnpm playwright test e2e/profile*.spec.ts

# Run with UI
pnpm playwright test e2e/profile*.spec.ts --ui

# Run with headed browser
pnpm playwright test e2e/profile*.spec.ts --headed
```

### Run Specific Test Suite

```bash
# Run comprehensive tests
pnpm playwright test e2e/profile.spec.ts

# Run POM tests
pnpm playwright test e2e/profile-pom.spec.ts
```

### Run Specific Test Group

```bash
# Run only authenticated user tests
pnpm playwright test e2e/profile.spec.ts -g "Authenticated user"

# Run only form validation tests
pnpm playwright test e2e/profile.spec.ts -g "Form validation"

# Run only mobile tests
pnpm playwright test e2e/profile.spec.ts -g "Mobile"
```

### Run with Different Options

```bash
# Debug mode
pnpm playwright test e2e/profile.spec.ts --debug

# Slow motion
pnpm playwright test e2e/profile.spec.ts --slow-motion=1000

# Specific browser
pnpm playwright test e2e/profile.spec.ts --project=chromium

# Generate report
pnpm playwright test e2e/profile.spec.ts --reporter=html
```

## Coverage

### Settings Page (/settings)
- ✅ Page loads for authenticated users
- ✅ Shows all menu items
- ✅ Navigation to profile edit works
- ✅ Redirects to login for unauthenticated

### Profile Edit Page (/settings/profile)
- ✅ All form fields display
- ✅ Fields are editable
- ✅ Username field is disabled
- ✅ Form submission works
- ✅ Form cancellation works
- ✅ Success/error messages display
- ✅ Email validation works
- ✅ Responsive on mobile
- ✅ Works in dark mode

### Public Profile Page (/@[username])
- ✅ Displays user information
- ✅ Shows updated profile data
- ✅ Displays bio if set
- ✅ Shows user statistics
- ✅ Navigation from settings works

### Special Cases
- ✅ Unauthenticated redirect
- ✅ Mobile viewport compatibility
- ✅ Dark mode support
- ✅ Form validation
- ✅ Error handling

## Notes

1. **API Integration**: Tests currently use mock navigation and locator checking. When backend API is fully implemented, update API mock responses.

2. **ISR Caching**: Public profile uses ISR (Incremental Static Regeneration) with 1-hour cache. Test may need to account for cache delay.

3. **Authentication**: Tests use cookie-based auth. Update `helpers/auth.ts` if auth mechanism changes.

4. **Selectors**: Tests use semantic selectors (text, roles) first, then fallback to placeholders. Update if UI text changes.

5. **Timeouts**: Default 5-second timeout for async operations. Increase if needed for slow networks.

## Maintenance

### When to Update Tests

- [ ] UI text changes
- [ ] Form field names/placeholders change
- [ ] New form fields added
- [ ] API endpoints change
- [ ] Authentication mechanism changes
- [ ] Page routes change

### Best Practices

1. Use Page Objects for page-specific interactions
2. Use semantic selectors (text, roles) for better maintainability
3. Group related assertions
4. Keep tests focused and independent
5. Use helper functions for common setup tasks
6. Document complex test scenarios
7. Update selectors when UI changes

## Troubleshooting

### Tests Timeout

- Check if dev server is running: `pnpm dev`
- Increase timeout: `test.setTimeout(60000)`
- Check network conditions

### Cannot Find Elements

- Verify selectors match actual UI text
- Check for dynamic text rendering
- Use `page.pause()` to debug interactively
- Run with `--headed` flag to see browser

### Authentication Issues

- Ensure cookies are set correctly in `beforeEach`
- Clear cookies between tests if needed
- Check cookie expiration

### API Mock Issues

- Verify mock routes match actual API endpoints
- Check request/response format
- Use `--debug` flag to inspect network requests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
