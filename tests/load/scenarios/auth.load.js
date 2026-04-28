/**
 * k6 Load Test — Authentication API
 * 
 * Strategy:
 *  1. setup() runs ONCE: Creates a dedicated load-test user in DB.
 *  2. default() runs for all VUs: Tests login with that real user.
 *  3. teardown() runs ONCE: Can optionally delete the test user.
 * 
 * Run:
 *   k6 run tests/load/scenarios/auth.load.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, LIGHT_LOAD, THRESHOLDS } from '../config/options.js';

const loginErrors = new Counter('login_errors');
const invalidLoginPassed = new Counter('invalid_login_correctly_rejected');

export const options = {
    ...LIGHT_LOAD,
    thresholds: {
        ...THRESHOLDS,
        http_req_duration: ['p(95)<1000'],
    },
};

const headers = { 'Content-Type': 'application/json' };

// ─── SETUP (Runs Once Before All Tests) ───────────────────────
// Creates a dedicated load-test user so login tests work correctly.
export function setup() {
    const testEmail = `k6_load_test_user@test.com`;
    const testPassword = `LoadTest@123!`;

    // Try to create the user via /register endpoint (may already exist — that's fine)
    const signupRes = http.post(
        `${BASE_URL}/users/register`,
        JSON.stringify({ name: 'K6 Load Test User', email: testEmail, password: testPassword }),
        { headers }
    );

    // If 201 = created fresh, 400/409 = already exists — both are fine
    const created = signupRes.status === 200 || signupRes.status === 201;
    const alreadyExists = signupRes.status === 400 || signupRes.status === 409;

    if (created) {
        console.log(`✅ Test user created: ${testEmail}`);
    } else if (alreadyExists) {
        console.log(`ℹ️ Test user already exists: ${testEmail}`);
    } else {
        console.error(`❌ User creation failed: status=${signupRes.status} body=${signupRes.body}`);
    }

    // Return credentials for VUs to use
    return { email: testEmail, password: testPassword };
}

// ─── MAIN TEST (Runs for all VUs) ────────────────────────────
export default function (data) {
    // data = { email, password } from setup()
    const { email, password } = data;

    group('Valid Login', () => {
        const loginRes = http.post(
            `${BASE_URL}/users/login`,
            JSON.stringify({ email, password }),
            { headers }
        );

        const ok = check(loginRes, {
            'Login status 200': (r) => r.status === 200,
            'Login response time < 1000ms': (r) => r.timings.duration < 1000,
            'Login returns user data': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    return body.success === true;
                } catch { return false; }
            },
        });

        if (!ok) loginErrors.add(1);
    });

    sleep(0.5);

    group('Invalid Login (Should Return 401)', () => {
        const badLoginRes = http.post(
            `${BASE_URL}/users/login`,
            JSON.stringify({ email: 'wrong@invalid.com', password: 'WrongPass123!' }),
            { headers }
        );

        const ok = check(badLoginRes, {
            'Invalid login returns 400 or 401': (r) => r.status === 400 || r.status === 401,
            'Error response time < 500ms': (r) => r.timings.duration < 500,
        });

        if (ok) invalidLoginPassed.add(1);
    });

    sleep(1.5);
}

// ─── TEARDOWN (Runs Once After All Tests) ────────────────────
export function teardown(data) {
    console.log(`\n✅ Load test complete. Test user: ${data.email}`);
    // Note: We intentionally keep the test user in DB for reuse.
    // Delete it manually if needed.
}
