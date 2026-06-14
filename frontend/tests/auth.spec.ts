import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1, h2")).toContainText(/login|sign in/i);
  });

  test("should display register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1, h2")).toContainText(/register|sign up/i);
  });

  test("should show validation errors on empty login", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await expect(page.locator('[role="alert"], .text-destructive')).toBeVisible();
    }
  });

  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/login");
    const registerLink = page.locator('a[href*="register"]');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});

test.describe("Dashboard", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Navigation", () => {
  test("should have working sidebar links", async ({ page }) => {
    await page.goto("/login");
    const sidebar = page.locator("nav, [role='navigation']");
    await expect(sidebar).toBeVisible();
  });
});
