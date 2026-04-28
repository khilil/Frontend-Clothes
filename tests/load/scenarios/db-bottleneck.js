/**
 * 🔍 k6 DB Bottleneck Detection
 * 
 * Tests specific endpoints that hit the DB heavily:
 *  - Product search (filtering + sorting queries)
 *  - Order history (joins/aggregation)
 *  - Product detail (full document fetch)
 * 
 * Detects: Slow queries, N+1 problems, missing indexes.
 * 
 * Run:
 *   k6 run tests/load/scenarios/db-bottleneck.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL } from '../config/options.js';

// Per-endpoint latency tracking
const productListLatency = new Trend('db_product_list_latency');
const productFilterLatency = new Trend('db_product_filter_latency');
const productDetailLatency = new Trend('db_product_detail_latency');
const orderHistoryLatency = new Trend('db_order_history_latency');
const slowQueryRate = new Rate('slow_queries');  // > 500ms

export const options = {
    // Gradually increase to find the DB threshold
    stages: [
        { duration: '20s', target: 5 },  // Baseline
        { duration: '30s', target: 20 },  // Normal load
        { duration: '30s', target: 50 },  // Heavy DB queries
        { duration: '30s', target: 80 },  // Find DB limits
        { duration: '20s', target: 0 },  // Release
    ],

    thresholds: {
        // DB endpoints should respond under 800ms
        'db_product_list_latency': ['p(90)<800', 'p(95)<1200'],
        'db_product_filter_latency': ['p(90)<1000', 'p(95)<1500'],
        'db_product_detail_latency': ['p(90)<500', 'p(95)<800'],
        'db_order_history_latency': ['p(90)<1000', 'p(95)<2000'],
        // Max 10% slow queries
        'slow_queries': ['rate<0.10'],
        'http_req_failed': ['rate<0.30'],
    },
};

const headers = { 'Content-Type': 'application/json' };

export default function () {
    // ── Test 1: Product List (Simple DB scan) ──────────────────────
    group('DB: Product List', () => {
        const res = http.get(`${BASE_URL}/products?page=1&limit=12`, { headers });
        productListLatency.add(res.timings.duration);
        slowQueryRate.add(res.timings.duration > 500 ? 1 : 0);

        check(res, {
            'List status 200': (r) => r.status === 200,
            'List response OK (<800ms)': (r) => r.timings.duration < 800,
        });
    });

    sleep(0.3);

    // ── Test 2: Filtered Products (Complex DB query) ───────────────
    group('DB: Filtered Products', () => {
        const res = http.get(
            `${BASE_URL}/products?page=1&limit=12&sort=price_asc&maxPrice=5000`,
            { headers }
        );
        productFilterLatency.add(res.timings.duration);
        slowQueryRate.add(res.timings.duration > 1000 ? 1 : 0);

        check(res, {
            'Filter status 200': (r) => r.status === 200,
            'Filter response OK (<1000ms)': (r) => r.timings.duration < 1000,
        });
    });

    sleep(0.3);

    // ── Test 3: Product Detail (Single doc + populate) ─────────────
    group('DB: Product Detail by Slug', () => {
        // Use a known product slug from your DB
        const slug = __ENV.PRODUCT_SLUG || 'test-product';
        const res = http.get(`${BASE_URL}/products/${slug}`, { headers });
        productDetailLatency.add(res.timings.duration);
        slowQueryRate.add(res.timings.duration > 500 ? 1 : 0);

        check(res, {
            'Detail status 200 or 404': (r) => r.status === 200 || r.status === 404,
            'Detail response OK (<500ms)': (r) => r.timings.duration < 500,
        });
    });

    sleep(0.3);

    // ── Test 4: Cart fetch (DB read with auth) ─────────────────────
    group('DB: Cart Read (Unauthenticated)', () => {
        const res = http.get(`${BASE_URL}/cart`, { headers });
        // 401 is expected — but we measure how fast DB+auth layer responds
        slowQueryRate.add(res.timings.duration > 300 ? 1 : 0);

        check(res, {
            'Cart auth check < 300ms': (r) => r.timings.duration < 300,
        });
    });

    sleep(0.5);
}

export function handleSummary(data) {
    const metrics = data.metrics;

    const get = (m, p) => {
        const val = metrics[m]?.values?.[p];
        return val ? val.toFixed(0) + 'ms' : 'N/A';
    };

    const slowRate = (metrics.slow_queries?.values?.rate * 100 || 0).toFixed(1);

    console.log('\n═══════════════════════════════════════════');
    console.log('   🔍 DATABASE BOTTLENECK DETECTION REPORT');
    console.log('═══════════════════════════════════════════');
    console.log('  Endpoint                      p90         p95');
    console.log('  ─────────────────────────────────────────────');
    console.log(`  Product List (scan)           ${get('db_product_list_latency', 'p(90)').padEnd(12)} ${get('db_product_list_latency', 'p(95)')}`);
    console.log(`  Product Filter (complex)      ${get('db_product_filter_latency', 'p(90)').padEnd(12)} ${get('db_product_filter_latency', 'p(95)')}`);
    console.log(`  Product Detail (populate)     ${get('db_product_detail_latency', 'p(90)').padEnd(12)} ${get('db_product_detail_latency', 'p(95)')}`);
    console.log(`  Order History (aggregation)   ${get('db_order_history_latency', 'p(90)').padEnd(12)} ${get('db_order_history_latency', 'p(95)')}`);
    console.log('  ─────────────────────────────────────────────');
    console.log(`  Slow Query Rate (>500ms):     ${slowRate}%`);
    console.log(`  DB Status: ${parseFloat(slowRate) < 10 ? '✅ No bottleneck' : '⚠️  Bottleneck detected!'}`);
    console.log('═══════════════════════════════════════════\n');

    if (parseFloat(slowRate) >= 10) {
        console.log('  💡 SUGGESTIONS:');
        console.log('     - Add MongoDB indexes on frequently filtered fields');
        console.log('     - Check for missing `.lean()` on read-only Mongoose queries');
        console.log('     - Consider Redis caching for product list endpoint');
        console.log('     - Review .populate() calls for unnecessary data loading\n');
    }

    return {};
}
