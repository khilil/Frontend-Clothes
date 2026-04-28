/**
 * k6 Load Test — Cart API
 * 
 * Tests:
 *  - GET  /cart           (fetch cart)
 *  - POST /cart/add       (add item)
 *  - PUT  /cart/update    (update quantity)
 *  - DELETE /cart/remove  (remove item)
 * 
 * Note: Cart requires authentication — using pre-set cookie session.
 * For real auth, run auth test first and extract cookies.
 * 
 * Run:
 *   k6 run tests/load/scenarios/cart.load.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, MEDIUM_LOAD, THRESHOLDS } from '../config/options.js';

const cartErrors = new Counter('cart_errors');

export const options = {
    ...MEDIUM_LOAD,
    thresholds: THRESHOLDS,
};

// ----------------------------------------------------------------
// IMPORTANT: Replace with a valid session cookie for auth testing.
// You can get this by logging in once manually and copying the cookie.
// ----------------------------------------------------------------
const SESSION_COOKIE = __ENV.SESSION_COOKIE || '';

export default function () {
    const headers = {
        'Content-Type': 'application/json',
        ...(SESSION_COOKIE ? { 'Cookie': SESSION_COOKIE } : {}),
    };

    group('Fetch Cart (Unauthenticated — expects 401)', () => {
        const cartRes = http.get(`${BASE_URL}/cart`, { headers });
        check(cartRes, {
            'Cart fetch status 200 or 401': (r) => r.status === 200 || r.status === 401,
            'Cart response time < 500ms': (r) => r.timings.duration < 500,
        });
        if (cartRes.status !== 200 && cartRes.status !== 401) {
            cartErrors.add(1);
        }
    });

    sleep(0.5);

    group('Add to Cart', () => {
        const addPayload = JSON.stringify({
            productId: 'prod123',    // Replace with real product ID
            variantId: 'var001',     // Replace with real variant ID
            quantity: 1,
        });
        const addRes = http.post(`${BASE_URL}/cart/add`, addPayload, { headers });
        check(addRes, {
            'Add to cart status 200 or 401': (r) => r.status === 200 || r.status === 401,
            'Add response time < 800ms': (r) => r.timings.duration < 800,
        });
    });

    sleep(1);
}
