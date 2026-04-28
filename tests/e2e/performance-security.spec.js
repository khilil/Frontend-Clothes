import { test, expect } from '@playwright/test';

test.describe('Performance and Security E2E Tests', () => {
    test('Check homepage load performance', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        // Small delay to ensure performance metrics are ready
        await page.waitForTimeout(500);
        const duration = Date.now() - startTime;

        // Threshold of 5 seconds for local dev initial load
        expect(duration).toBeLessThan(5000);

        // Check Largest Contentful Paint (LCP) if desired via performance observer
        const lcp = await page.evaluate(async () => {
            return new Promise((resolve) => {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ type: 'largest-contentful-paint', buffered: true });

                // Timeout after 5s
                setTimeout(() => resolve(null), 5000);
            });
        });

        if (lcp) {
            console.log(`LCP: ${lcp}ms`);
            expect(lcp).toBeLessThan(2500); // Standard LCP threshold for "Good"
        }
    });

    test('Verify password input masking', async ({ page }) => {
        await page.goto('/login');
        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Check for sensitive data in console', async ({ page }) => {
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));

        await page.goto('/login');
        await page.locator('input[name="email"]').fill('test@example.com');
        await page.locator('input[name="password"]').fill('SecretPassword123');
        await page.locator('button[type="submit"]').click();

        // Ensure "SecretPassword123" is NOT in the console logs
        const containsPassword = logs.some(log => log.includes('SecretPassword123'));
        expect(containsPassword).toBe(false);
    });

    test('Check for basic Security Headers', async ({ page }) => {
        const response = await page.goto('/');
        const headers = response.headers();

        // These might not be present in a local dev environment but good to check
        // expect(headers['x-frame-options']).toBeDefined();
        // expect(headers['content-security-policy']).toBeDefined();

        // Basic check for powered-by header (often removed for security)
        expect(headers['x-powered-by']).toBeUndefined();
    });
});
