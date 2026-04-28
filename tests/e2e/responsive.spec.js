import { test, expect } from '@playwright/test';

test.describe('Responsive Design E2E Tests', () => {
    // Mobile Viewport
    test('Mobile: Verify navbar and burger menu', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Burger menu should be visible
        const burger = page.locator('.menu-toggle');
        await expect(burger).toBeVisible();

        // Click burger
        await burger.click();

        // Check drawer
        await expect(page.locator('.fixed.top-0.left-0.w-full.max-w-\\[320px\\], .mobile-menu-drawer')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('a:has-text("Collections")').first()).toBeVisible();
    });

    // Tablet Viewport
    test('Tablet: Verify layout adjustment', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        // On tablet, we might have a mix of mobile burger or desktop nav depending on breakpoints
        // FENRIR code has @media (min-width: 1024px) for desktop-nav
        const burger = page.locator('.menu-toggle');
        await expect(burger).toBeVisible();
    });

    // Desktop Viewport
    test('Desktop: Verify navigation visibility', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');

        // Desktop nav should be visible, burger should be hidden
        const desktopNav = page.locator('nav.hidden.lg\\:flex');
        await expect(desktopNav).toBeVisible();

        const burger = page.locator('.menu-toggle');
        await expect(burger).toBeHidden();
    });
});
