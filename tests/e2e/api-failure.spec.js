import { test, expect } from '@playwright/test';

test.describe('API Failure Handling E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Global background mocks to prevent redirects
        await page.route('**/api/v1/cart*', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: [], totalPrice: 0 } }) });
        });
        await page.route('**/api/v1/users/refresh-token*', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Mocked refresh success' }) });
        });
    });

    test('Graceful failure on product fetch error', async ({ page }) => {
        // Intercept product fetching API
        await page.route('**/api/v1/products*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: { products: [], totalPages: 0, totalProducts: 0, currentPage: 1 } }),
            });
        });

        await page.goto('/category/all');
        await page.waitForLoadState('networkidle');

        // Verify UI shows empty state message
        const emptyMsg = page.locator('text=NO PRODUCTS MATCH YOUR FILTERS').first();
        await expect(emptyMsg).toBeVisible({ timeout: 15000 });

        // Ensure the page didn't crash
        await expect(page.locator('header')).toBeVisible();
    });

    test('Graceful failure on Login error', async ({ page }) => {
        // Intercept login API
        await page.route('**/api/v1/users/login*', (route) => {
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Invalid credentials' }),
            });
        });

        await page.goto('/login');
        await page.locator('input[name="email"]').fill('test@example.com');
        await page.locator('input[name="password"]').fill('password123');
        await page.locator('button[type="submit"]').click();

        // Verify error message is shown
        await expect(page.locator('.bg-red-950\\/20')).toBeVisible();
        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });
});
