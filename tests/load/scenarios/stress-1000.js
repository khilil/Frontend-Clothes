/**
 * 🔥 k6 Stress Test — 1000 Virtual Users
 * 
 * Simulates a massive traffic spike (flash sale / viral moment).
 * Tests how the server behaves under extreme load.
 * 
 * ⚠️  WARNING: This will put HEAVY load on your machine.
 *     Make sure backend server is running before starting.
 * 
 * Run:
 *   k6 run tests/load/scenarios/stress-1000.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { BASE_URL } from '../config/options.js';

// Custom Metrics
const errorRate = new Rate('errors');
const productLatency = new Trend('product_fetch_latency');
const timeouts = new Counter('request_timeouts');

export const options = {
    // 1000 users spike simulation
    stages: [
        { duration: '30s', target: 100 },  // Ramp up to 100
        { duration: '1m', target: 500 },  // Surge to 500
        { duration: '1m', target: 1000 },  // Peak: 1000 users
        { duration: '30s', target: 500 },  // Partial recovery
        { duration: '30s', target: 0 },  // Ramp down
    ],

    thresholds: {
        // Under 1000 users: p95 must be under 3 seconds
        http_req_duration: ['p(95)<3000', 'p(99)<5000'],
        // Error rate must stay below 5%
        errors: ['rate<0.05'],
        // At least 95% requests must succeed
        http_req_failed: ['rate<0.05'],
    },

    // Graceful stop after stages
    gracefulStop: '30s',
};

const headers = { 'Content-Type': 'application/json' };

export default function () {
    // Simulate real user: browse products page
    const res = http.get(
        `${BASE_URL}/products?page=1&limit=12`,
        {
            headers,
            timeout: '10s',  // 10 second timeout per request
        }
    );

    // Track custom metrics
    productLatency.add(res.timings.duration);

    const success = check(res, {
        'Status 200': (r) => r.status === 200,
        'Response time < 3s': (r) => r.timings.duration < 3000,
        'Body not empty': (r) => r.body && r.body.length > 0,
    });

    if (!success) errorRate.add(1);
    else errorRate.add(0);

    if (res.timings.duration >= 10000) timeouts.add(1);

    // Random sleep 0.5-2s to simulate human behavior
    sleep(Math.random() * 1.5 + 0.5);
}

export function handleSummary(data) {
    const p95 = data.metrics.http_req_duration.values['p(95)'];
    const rps = data.metrics.http_reqs.values.rate;
    const fail = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);

    console.log('\n════════════════════════════════════');
    console.log('   🔥 1000 USER STRESS TEST REPORT');
    console.log('════════════════════════════════════');
    console.log(`  Peak Users:     1000 VUs`);
    console.log(`  p95 Response:   ${p95 ? p95.toFixed(0) : 'N/A'}ms`);
    console.log(`  Requests/sec:   ${rps ? rps.toFixed(1) : 'N/A'}`);
    console.log(`  Failure Rate:   ${fail}%`);
    console.log(`  Status:         ${parseFloat(fail) < 5 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('════════════════════════════════════\n');

    return {};
}
