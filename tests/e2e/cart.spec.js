import { test, expect } from '@playwright/test';

test.describe('Cart Functionality E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Global background mocks to prevent redirects during setup
        await page.route('**/api/v1/users/refresh-token*', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Mocked refresh success' }) });
        });

        // 1. Signup a new user (Cart requires auth)
        await page.goto('/login', { waitUntil: 'networkidle' });
        const timestamp = Date.now();
        const uniqueEmail = `cart_test_${timestamp}@example.com`;
        const uniqueName = `Cart Tester ${timestamp}`;

        await page.locator('button:has-text("Don\'t have an account")').click();
        await page.locator('input[name="name"]').fill(uniqueName);
        await page.locator('input[name="email"]').fill(uniqueEmail);
        await page.locator('input[name="password"]').fill('Password123!');
        await page.locator('button[type="submit"]').click();

        // Wait for dashboard or just proceed
        await page.waitForURL(/\/account\/dashboard/, { timeout: 20000 });
        await page.waitForLoadState('networkidle');

        // 2. Add an item to cart
        await page.goto('/category/all');
        const firstProduct = page.locator('.premium-product-card-luxury').first();
        await firstProduct.waitFor({ state: 'visible' });
        await firstProduct.click();

        await page.waitForLoadState('networkidle');
        const sizeButtons = page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L"), button:has-text("XL")');
        if (await sizeButtons.count() > 0) {
            await sizeButtons.first().click();
        }

        // Wait for page to be stable
        await page.waitForTimeout(1000);

        const addToBagBtn = page.locator('button:has-text("Add To Bag"), button:has-text("ADD TO BAG")');
        await addToBagBtn.click();

        // Wait for the success state on the button
        await expect(page.locator('button:has-text("Successfully Added"), button:has-text("ADDED")').first()).toBeVisible({ timeout: 15000 });
    });

    test('Verify cart count updates in navbar', async ({ page }) => {
        const cartCount = page.locator('#cart-count');
        await expect(cartCount).toContainText('1');
    });

    test('Increase and decrease quantity in MiniCart', async ({ page }) => {
        // Open MiniCart
        await page.locator('span.material-symbols-outlined:has-text("shopping_cart")').click();

        const miniCart = page.locator('.mini-cart');
        await expect(miniCart).toBeVisible();

        const qtyValue = miniCart.locator('.qty-value');
        await expect(qtyValue).toHaveText('1');

        // Increase
        await miniCart.locator('.qty-btn:has(span:has-text("add"))').click();
        await expect(qtyValue).toHaveText('2');

        // Decrease
        await miniCart.locator('.qty-btn:has(span:has-text("remove"))').click();
        await expect(qtyValue).toHaveText('1');
    });

    test('Remove item from MiniCart', async ({ page }) => {
        // Open MiniCart
        await page.locator('span.material-symbols-outlined:has-text("shopping_cart")').click();

        const removeBtn = page.locator('.mini-item__remove');
        await removeBtn.click();

        await expect(page.locator('.mini-cart__empty')).toBeVisible();
    });

    test('Verify total price updates correctly on Cart Page', async ({ page }) => {
        // Open MiniCart then go to View Bag
        await page.locator('span.material-symbols-outlined:has-text("shopping_cart")').click();
        await page.locator('button:has-text("View Bag")').click();

        await expect(page).toHaveURL(/\/cart/);

        const subtotal = page.locator('span:has-text("Subtotal") + span').first();
        const total = page.locator('span:has-text("Total") + span').first();

        const initialSubtotalText = await subtotal.innerText();

        // Increase quantity on Cart Page
        await page.locator('button:has-text("+")').click();

        // Total should update (might need a wait or check for change)
        await expect(subtotal).not.toHaveText(initialSubtotalText);
    });
});
