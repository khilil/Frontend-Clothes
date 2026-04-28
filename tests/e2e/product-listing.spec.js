import { test, expect } from '@playwright/test';

test.describe('Product Listing E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Global background mocks to prevent redirects
        await page.route('**/api/v1/cart*', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: [], totalPrice: 0 } }) });
        });
        await page.route('**/api/v1/users/refresh-token*', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Mocked refresh success' }) });
        });

        // Mock product API response
        await page.route('**/api/v1/products*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        totalProducts: 1,
                        totalPages: 1,
                        currentPage: 1,
                        products: [
                            {
                                _id: 'prod123',
                                title: 'Premium E2E Test Shirt',
                                slug: 'premium-e2e-test-shirt',
                                price: 1999,
                                compareAtPrice: 2499,
                                brand: 'GEN-Z E2E',
                                image: 'https://via.placeholder.com/400x533?text=Shirt',
                                variants: [
                                    { size: { name: 'M' }, color: { name: 'Black', hexCode: '#000000' }, images: [{ url: 'https://via.placeholder.com/400x533?text=Shirt', isPrimary: true }] }
                                ]
                            }
                        ]
                    }
                }),
            });
        });

        await page.route('**/api/v1/products/premium-e2e-test-shirt*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        _id: 'prod123',
                        title: 'Premium E2E Test Shirt',
                        slug: 'premium-e2e-test-shirt',
                        price: 1999,
                        compareAtPrice: 2499,
                        brand: 'GEN-Z E2E',
                        image: 'https://via.placeholder.com/400x533?text=Shirt',
                        variants: [
                            { _id: 'v1', size: { name: 'M' }, color: { name: 'Black', hexCode: '#000000' }, images: [{ url: 'https://via.placeholder.com/400x533?text=Shirt', isPrimary: true }] }
                        ]
                    }
                }),
            });
        });

        // Mock detail API for navigation test
        await page.route('**/api/v1/products/premium-e2e-test-shirt*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        _id: 'prod123',
                        title: 'Premium E2E Test Shirt',
                        slug: 'premium-e2e-test-shirt',
                        price: 1999,
                        compareAtPrice: 2499,
                        brand: 'GEN-Z E2E',
                        image: 'https://via.placeholder.com/400x533?text=Shirt',
                        variants: [
                            { _id: 'v1', size: { name: 'M' }, color: { name: 'Black', hexCode: '#000000' }, images: [{ url: 'https://via.placeholder.com/400x533?text=Shirt', isPrimary: true }] }
                        ]
                    }
                }),
            });
        });

        await page.goto('/');
        await page.goto('/category/all');
    });

    test('Verify product cards display correctly', async ({ page }) => {
        const productCard = page.locator('.premium-product-card-luxury').first();
        await productCard.waitFor({ state: 'visible' });
        await expect(productCard).toBeVisible();

        const title = productCard.locator('.title-product-p');
        await expect(title).not.toBeEmpty();

        const price = productCard.locator('.price-current-p');
        await expect(price).toContainText('₹');

        const image = productCard.locator('.img-primary-p');
        await expect(image).toBeVisible();
    });

    test('Verify clicking a product opens the product detail page', async ({ page }) => {
        const productCard = page.locator('.premium-product-card-luxury').first();
        await productCard.waitFor({ state: 'visible' });
        const productTitle = await productCard.locator('.title-product-p').innerText();

        await productCard.click();

        // Verify navigation to product detail page
        await page.waitForURL(/\/product\//, { timeout: 15000 });
        await expect(page).toHaveURL(/\/product\//);

        // Check if the title matches or at least is visible
        const detailTitle = page.locator('h1');
        await expect(detailTitle).toBeVisible();
        const finalTitle = await detailTitle.innerText();
        expect(finalTitle.toLowerCase()).toContain(productTitle.toLowerCase());
    });
});
