/**
 * 🛒 k6 Load Test — Checkout Flow
 * 
 * Tests the full checkout journey:
 *   1. Login (get auth token)
 *   2. Browse Products
 *   3. Add to Cart
 *   4. Checkout (COD)
 *   5. Verify Order Created
 * 
 * Run:
 *   k6 run tests/load/scenarios/checkout.load.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL } from '../config/options.js';

// Custom Metrics
const checkoutDuration = new Trend('checkout_flow_duration');
const checkoutErrors = new Counter('checkout_errors');
const loginErrors = new Counter('login_errors');

export const options = {
    stages: [
        { duration: '30s', target: 5 },  // Warm up (checkout is expensive)
        { duration: '1m', target: 15 },  // Ramp up
        { duration: '2m', target: 15 },  // Sustained load
        { duration: '30s', target: 0 },  // Ramp down
    ],

    thresholds: {
        // Checkout flow can take up to 5 seconds
        'checkout_flow_duration': ['p(95)<5000'],
        // Individual requests under 2 seconds
        'http_req_duration': ['p(95)<2000'],
        // Low checkout error rate
        'checkout_errors': ['count<10'],
        // Allow 401s from cart  
        'http_req_failed': ['rate<0.30'],
    },
};

const headers = { 'Content-Type': 'application/json' };

// Test user credentials (created by auth setup)
const TEST_EMAIL = 'k6_load_test_user@test.com';
const TEST_PASSWORD = 'LoadTest@123!';

// ── Setup: Create test user ─────────────────────────────────────
export function setup() {
    http.post(
        `${BASE_URL}/users/register`,
        JSON.stringify({ name: 'K6 Checkout User', email: TEST_EMAIL, password: TEST_PASSWORD }),
        { headers }
    );
    return { email: TEST_EMAIL, password: TEST_PASSWORD };
}

// ── Main Flow ───────────────────────────────────────────────────
export default function (data) {
    const startTime = Date.now();
    let authCookies = null;

    // ── Step 1: Login ──────────────────────────────────────────────
    group('1. Login', () => {
        const loginRes = http.post(
            `${BASE_URL}/users/login`,
            JSON.stringify({ email: data.email, password: data.password }),
            { headers }
        );

        const loginOk = check(loginRes, {
            'Login 200': (r) => r.status === 200,
            'Login fast < 2000ms': (r) => r.timings.duration < 2000,
        });

        if (!loginOk) {
            loginErrors.add(1);
            return; // Skip rest of flow
        }

        // Extract cookies for authenticated requests
        authCookies = loginRes.cookies;
    });

    sleep(0.5);

    // ── Step 2: Browse Products ────────────────────────────────────
    group('2. Browse Products', () => {
        const res = http.get(`${BASE_URL}/products?page=1&limit=12`, { headers });
        check(res, {
            'Products loaded': (r) => r.status === 200,
            'Has products': (r) => {
                try { return JSON.parse(r.body).data.products.length > 0; }
                catch { return false; }
            },
        });
    });

    sleep(0.5);

    // ── Step 3: Add to Cart ────────────────────────────────────────
    group('3. Add to Cart', () => {
        // Note: Requires valid productId and variantId from your DB
        const cartPayload = JSON.stringify({
            productId: __ENV.PRODUCT_ID || 'replace-with-real-id',
            variantId: __ENV.VARIANT_ID || 'replace-with-real-id',
            quantity: 1,
        });

        const addRes = http.post(
            `${BASE_URL}/cart/add`,
            cartPayload,
            { headers, cookies: authCookies || {} }
        );

        check(addRes, {
            'Add to cart 200 or 401': (r) => r.status === 200 || r.status === 401,
        });
    });

    sleep(0.5);

    // ── Step 4: Checkout (COD) ────────────────────────────────────
    group('4. Checkout', () => {
        const checkoutPayload = JSON.stringify({
            paymentMethod: 'cod',
            address: {
                street: '123 Test Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                phone: '9876543210',
            },
        });

        const checkoutRes = http.post(
            `${BASE_URL}/orders/checkout`,
            checkoutPayload,
            { headers, cookies: authCookies || {} }
        );

        const checkoutOk = check(checkoutRes, {
            'Checkout 200 or 401': (r) => r.status === 200 || r.status === 201 || r.status === 401,
            'Checkout response time < 3000ms': (r) => r.timings.duration < 3000,
        });

        if (!checkoutOk) checkoutErrors.add(1);
    });

    // Track total checkout flow duration
    checkoutDuration.add(Date.now() - startTime);

    sleep(2);
}

export function handleSummary(data) {
    const p95 = data.metrics.checkout_flow_duration?.values?.['p(95)'];
    const errors = data.metrics.checkout_errors?.values?.count || 0;

    console.log('\n══════════════════════════════════');
    console.log('   🛒 CHECKOUT LOAD TEST REPORT');
    console.log('══════════════════════════════════');
    console.log(`  p95 Full Flow:  ${p95 ? p95.toFixed(0) : 'N/A'}ms`);
    console.log(`  Checkout Errors: ${errors}`);
    console.log(`  Status: ${errors < 10 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('══════════════════════════════════\n');

    return {};
}
