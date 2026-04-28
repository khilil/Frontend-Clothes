import { test, expect } from '@playwright/test';

test.describe('Product Detail Page E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Global background mocks to prevent redirects
        await page.route('**/api/v1/cart*', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: [], totalPrice: 0 } }) });
        });
        await page.route('**/api/v1/users/refresh-token*', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Mocked refresh success' }) });
        });

        // Mock product API response
        const mockProduct = {
            _id: 'prod123',
            title: 'Premium E2E Test Shirt',
            slug: 'premium-e2e-test-shirt',
            price: 1999,
            image: 'https://via.placeholder.com/400x533?text=Shirt',
            variants: [
                { size: { name: 'M' }, color: { name: 'Black', hexCode: '#000000' } }
            ]
        };

        await page.route('**/api/v1/products*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: { products: [mockProduct], totalPages: 1, totalProducts: 1, currentPage: 1 } }),
            });
        });

        await page.route('**/api/v1/products/premium-e2e-test-shirt*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: mockProduct }),
            });
        });

        // Navigate to a specific product page
        await page.goto('/category/all', { waitUntil: 'networkidle' });
        const firstProduct = page.locator('.premium-product-card-luxury').first();
        await firstProduct.waitFor({ state: 'visible', timeout: 15000 });

        // Ensure no redirect happened before clicking
        await expect(page).toHaveURL(/\/category\/all/);

        await firstProduct.click();
        // Wait for URL to change to product detail
        await page.waitForURL(/\/product\//, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
    });

    test('Verify product details load correctly', async ({ page }) => {
        // Title
        const title = page.locator('h1');
        await expect(title).toBeVisible();
        await expect(title).not.toBeEmpty();

        // Price
        const price = page.locator('.text-accent >> text=₹');
        await expect(price).toBeVisible();

        // Image Gallery
        const mainImage = page.locator('main img[alt]').first();
        await expect(mainImage).toBeVisible();
    });

    test('Verify size selection works', async ({ page }) => {
        // Find size buttons
        const sizeButtons = page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L"), button:has-text("XL")');
        if (await sizeButtons.count() > 0) {
            const firstSize = sizeButtons.first();
            await firstSize.click();

            // Check if it's selected (usually has a different class or style)
            // Based on code, selected has bg-white text-black
            await expect(firstSize).toHaveClass(/bg-white/);
        }
    });

    test('Verify Add to Cart button functionality', async ({ page }) => {
        // Need to select a size first if required
        const sizeButtons = page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L"), button:has-text("XL")');
        if (await sizeButtons.count() > 0) {
            await sizeButtons.first().click();
        }

        const addToCartBtn = page.locator('button:has-text("Add To Bag"), button:has-text("ADD TO BAG")');
        await expect(addToCartBtn).toBeEnabled();

        await addToCartBtn.click();

        // Verify success feedback on the button
        await expect(page.locator('button:has-text("Successfully Added"), button:has-text("ADDED")').first()).toBeVisible({ timeout: 15000 });
    });
});
