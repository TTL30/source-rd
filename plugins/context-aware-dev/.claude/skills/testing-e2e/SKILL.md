---
name: testing-e2e
description: Implement end-to-end testing with Playwright or Cypress, including page object models, test fixtures, and CI/CD integration. Use when the user mentions E2E tests, end-to-end testing, Playwright, Cypress, browser testing, or integration testing.
---

# End-to-End Testing Implementation Pattern

## When to Use This Skill

Use this skill when implementing:
- Browser-based E2E tests
- User flow testing
- Page Object Model patterns
- Visual regression testing
- CI/CD test automation

## Framework Comparison

**Playwright** (Recommended for new projects)
- Multi-browser support (Chromium, Firefox, WebKit)
- Better performance and reliability
- Built-in test runner
- Auto-wait functionality

**Cypress** (Popular, mature ecosystem)
- Developer-friendly API
- Time-travel debugging
- Real-time reloads
- Rich plugin ecosystem

## Implementation Steps - Playwright

### 1. Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Create Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Implement Page Object Model

```typescript
// tests/e2e/pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
```

### 4. Write Test Cases

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login('user@example.com', 'password123');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('invalid credentials show error', async ({ page }) => {
    await loginPage.login('invalid@example.com', 'wrong');

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Invalid credentials');
  });

  test('empty form shows validation errors', async ({ page }) => {
    await loginPage.submitButton.click();

    await expect(loginPage.emailInput).toHaveAttribute('aria-invalid', 'true');
  });
});
```

### 5. Set Up Test Fixtures

```typescript
// tests/e2e/fixtures.ts
import { test as base } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Set up authenticated state
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

## Implementation Steps - Cypress

### 1. Install Cypress

```bash
npm install -D cypress
npx cypress open
```

### 2. Create Cypress Configuration

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

### 3. Write Cypress Tests

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully', () => {
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should show error on invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrong');
    cy.get('[data-testid="login-button"]').click();

    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

## Best Practices

1. **Test Data**: Use data-testid attributes for reliable selectors
2. **Wait Strategy**: Use implicit waits, avoid hardcoded delays
3. **Test Isolation**: Each test should be independent
4. **Page Objects**: Encapsulate page logic in Page Object classes
5. **Fixtures**: Use fixtures for test data and authentication
6. **Parallel Execution**: Run tests in parallel for speed
7. **CI Integration**: Configure tests to run on every PR
8. **Visual Testing**: Add screenshot comparisons for UI changes

## Common Testing Patterns

### API Mocking

```typescript
await page.route('**/api/users', async route => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ users: [] }),
  });
});
```

### Network Interception

```typescript
await page.route('**/api/**', route => {
  console.log('API call:', route.request().url());
  route.continue();
});
```

### File Upload

```typescript
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('path/to/file.pdf');
```

### Authentication State

```typescript
// Save auth state
await page.context().storageState({ path: 'auth.json' });

// Reuse auth state
const context = await browser.newContext({ storageState: 'auth.json' });
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Running Tests

```bash
# Playwright
npm run test:e2e              # Run all tests
npm run test:e2e -- --headed  # Run with browser visible
npm run test:e2e -- --debug   # Run in debug mode
npm run test:e2e -- --ui      # Open UI mode

# Cypress
npx cypress open              # Open Cypress UI
npx cypress run               # Run headless
npx cypress run --spec "cypress/e2e/auth.cy.ts"  # Run specific test
```

## Reference Files

- See additional examples and patterns in `examples.md`
