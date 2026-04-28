/**
 * k6 Full Load Test Suite
 * Runs all scenarios together simulating real user behavior.
 * 
 * Tuned for LOCAL DEV server with realistic load.
 * 
 * Run:
 *   k6 run tests/load/run-all.js
 */

import { sleep, group } from 'k6';
import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config/options.js';

const TEST_EMAIL = 'k6_load_test_user@test.com';
const TEST_PASSWORD = 'LoadTest@123!';

export const options = {
    scenarios: {
        // Scenario 1: Browse products (most common user action)
        browse_products: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 10 },
                { duration: '1m', target: 20 },
                { duration: '30s', target: 0 },
            ],
            gracefulRampDown: '10s',
            exec: 'browseProducts',
        },

        // Scenario 2: Authentication flow
        auth_flow: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 5 },
                { duration: '1m', target: 10 },
                { duration: '30s', target: 0 },
            ],
            gracefulRampDown: '10s',
            exec: 'authFlow',
        },

        // Scenario 3: Cart operations (unauthenticated — will get 401)
        cart_ops: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 5 },
                { duration: '1m', target: 8 },
                { duration: '30s', target: 0 },
            ],
            gracefulRampDown: '10s',
            exec: 'cartOps',
        },
    },

    thresholds: {
        // Overall: p95 under 1.5 seconds on dev server
        'http_req_duration': ['p(95)<1500'],
        'http_req_duration{scenario:browse_products}': ['p(95)<1000'],
        'http_req_duration{scenario:auth_flow}': ['p(95)<2000'],
        'http_req_duration{scenario:cart_ops}': ['p(95)<1000'],

        // Cart returns 401 (unauthenticated) — allow up to 30% "failed"
        'http_req_failed': ['rate<0.30'],
    },
};

const headers = { 'Content-Type': 'application/json' };

// ── Setup: Runs ONCE — creates test user in DB ──────────────────
export function setup() {
    const res = http.post(
        `${BASE_URL}/users/register`,
        JSON.stringify({ name: 'K6 Test User', email: TEST_EMAIL, password: TEST_PASSWORD }),
        { headers }
    );
    if (res.status === 200 || res.status === 201) {
        console.log('✅ Test user created: ' + TEST_EMAIL);
    } else {
        console.log('ℹ️ Test user exists or registration returned: status=' + res.status);
    }
    return { email: TEST_EMAIL, password: TEST_PASSWORD };
}

// ── Scenario Functions ──────────────────────────────────────────

export function browseProducts() {
    group('Browse Products', () => {
        const res = http.get(`${BASE_URL}/products?page=1&limit=12`, { headers });
        check(res, {
            'Products status 200': (r) => r.status === 200,
            'Response < 1000ms': (r) => r.timings.duration < 1000,
        });
    });
    sleep(1);
}

export function authFlow(data) {
    group('Auth Flow', () => {
        const payload = JSON.stringify({
            email: data.email,
            password: data.password,
        });
        const res = http.post(`${BASE_URL}/users/login`, payload, { headers });
        check(res, {
            'Login status 200': (r) => r.status === 200,
            'Response < 2000ms': (r) => r.timings.duration < 2000,
        });
    });
    sleep(2);
}

export function cartOps() {
    group('Cart Operations', () => {
        const res = http.get(`${BASE_URL}/cart`, { headers });
        // 401 is expected (not authenticated) — this is correct behavior
        check(res, {
            'Cart status 200 or 401': (r) => r.status === 200 || r.status === 401,
            'Response < 1000ms': (r) => r.timings.duration < 1000,
        });
    });
    sleep(1);
}
