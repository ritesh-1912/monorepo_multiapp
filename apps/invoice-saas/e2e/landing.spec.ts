/**
 * E2E: Landing page and auth entry points.
 * Run with dev server: npm run dev -w invoice-saas (port 3000), then npm run e2e.
 */
import { test, expect } from '@playwright/test';

test.describe('Landing', () => {
  test('home page loads and shows invoicing content', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.getByText(/invoicing/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('login link goes to /login', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /log in/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('register route is reachable', async ({ page }) => {
    const res = await page.goto('/register');
    expect(res?.status()).toBe(200);
    await expect(page.getByText(/register|create account|get started/i).first()).toBeVisible({
      timeout: 5000,
    });
  });
});
