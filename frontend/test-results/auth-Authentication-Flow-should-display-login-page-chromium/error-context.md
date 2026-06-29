# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should display login page
- Location: tests\auth.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1, h2')
Expected pattern: /login|sign in/i
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1, h2')

```

```yaml
- text: Internal Server Error
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Authentication Flow", () => {
  4  |   test("should display login page", async ({ page }) => {
  5  |     await page.goto("/login");
> 6  |     await expect(page.locator("h1, h2")).toContainText(/login|sign in/i);
     |                                          ^ Error: expect(locator).toContainText(expected) failed
  7  |   });
  8  | 
  9  |   test("should display register page", async ({ page }) => {
  10 |     await page.goto("/register");
  11 |     await expect(page.locator("h1, h2")).toContainText(/register|sign up/i);
  12 |   });
  13 | 
  14 |   test("should show validation errors on empty login", async ({ page }) => {
  15 |     await page.goto("/login");
  16 |     const submitButton = page.locator('button[type="submit"]');
  17 |     if (await submitButton.isVisible()) {
  18 |       await submitButton.click();
  19 |       await expect(page.locator('[role="alert"], .text-destructive')).toBeVisible();
  20 |     }
  21 |   });
  22 | 
  23 |   test("should navigate between login and register", async ({ page }) => {
  24 |     await page.goto("/login");
  25 |     const registerLink = page.locator('a[href*="register"]');
  26 |     if (await registerLink.isVisible()) {
  27 |       await registerLink.click();
  28 |       await expect(page).toHaveURL(/register/);
  29 |     }
  30 |   });
  31 | });
  32 | 
  33 | test.describe("Dashboard", () => {
  34 |   test("should redirect to login when not authenticated", async ({ page }) => {
  35 |     await page.goto("/dashboard");
  36 |     await expect(page).toHaveURL(/login/);
  37 |   });
  38 | });
  39 | 
  40 | test.describe("Navigation", () => {
  41 |   test("should have working sidebar links", async ({ page }) => {
  42 |     await page.goto("/login");
  43 |     const sidebar = page.locator("nav, [role='navigation']");
  44 |     await expect(sidebar).toBeVisible();
  45 |   });
  46 | });
  47 | 
```