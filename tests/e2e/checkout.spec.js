import { test, expect } from '@playwright/test';

test.describe('Checkout Flow E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Login first to ensure we can checkout with an address
        await page.goto('/login');
        const timestamp = Date.now();
        const uniqueEmail = `checkout_test_${timestamp}@example.com`;
        const uniqueName = `Checkout Tester ${timestamp}`;
        await page.locator('button:has-text("Don\'t have an account")').click();
        await page.locator('input[name="name"]').fill(uniqueName);
        await page.locator('input[name="email"]').fill(uniqueEmail);
        await page.locator('input[name="password"]').fill('Password123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL(/\/account\/dashboard/);

        // 2. Add product to cart
        await page.goto('/category/all');
        const firstProduct = page.locator('.premium-product-card-luxury').first();
        await firstProduct.waitFor({ state: 'visible' });
        await firstProduct.click();
        const sizeButtons = page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L"), button:has-text("XL")');
        if (await sizeButtons.count() > 0) {
            await sizeButtons.first().click();
        }
        await page.locator('button:has-text("Add To Bag")').click();
        await expect(page.locator('text=Successfully Added')).toBeVisible();
    });

    test('Complete checkout flow with COD', async ({ page }) => {
        // Navigate to checkout
        await page.goto('/checkout');
        await expect(page).toHaveURL(/\/checkout/);

        // Fill Shipping Address (since it's a new user)
        await page.locator('input[name="firstName"]').fill('John');
        await page.locator('input[name="lastName"]').fill('Doe');
        await page.locator('input[name="phone"]').fill('9876543210');
        await page.locator('input[name="addressLine"]').fill('123 Test Street, Suite 4');
        await page.locator('input[name="city"]').fill('Mumbai');
        await page.locator('input[name="state"]').fill('Maharashtra');
        await page.locator('input[name="pincode"]').fill('400001');

        // Proceed to Payment
        await page.locator('button:has-text("Continue to Payment")').first().click();

        // Verify we are on payment step
        await expect(page.locator('text=Payment Methodology')).toBeVisible();

        // Select COD
        await page.locator('text=Cash').click();

        // Review summary
        await expect(page.locator('text=Total Due')).toBeVisible();

        // Complete Order
        await page.locator('button:has-text("Complete Order")').click();

        // Verify Success
        // The component shows "Order Captured" and then redirects
        await expect(page.locator('text=Order Captured')).toBeVisible();

        // Wait for redirection to orders
        await page.waitForURL(/\/account\/orders/, { timeout: 10000 });
        await expect(page.locator('text=My Orders').first()).toBeVisible();
    });
});
