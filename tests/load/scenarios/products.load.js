/**
 * k6 Load Test — Products API
 * 
 * Tests:
 *  - GET /products               (product listing)
 *  - GET /products?category=...  (filtered listing)
 *  - GET /products/:slug         (product detail)
 * 
 * Run:
 *   k6 run tests/load/scenarios/products.load.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, MEDIUM_LOAD, THRESHOLDS } from '../config/options.js';

// Custom metrics
const productListErrors = new Counter('product_list_errors');
const productDetailErrors = new Counter('product_detail_errors');
const productListDuration = new Trend('product_list_duration');

export const options = {
    ...MEDIUM_LOAD,
    thresholds: THRESHOLDS,
};

// Sample product slugs to test (replace with real slugs from your DB)
const PRODUCT_SLUGS = [
    'classic-oversized-tee',
    'vintage-wash-hoodie',
    'cargo-joggers',
];

export default function () {
    const headers = { 'Content-Type': 'application/json' };

    group('Product Listing', () => {
        // Test 1: All products
        const listRes = http.get(`${BASE_URL}/products?page=1&limit=12`, { headers });
        const listOk = check(listRes, {
            'List status 200': (r) => r.status === 200,
            'List has products': (r) => {
                const body = JSON.parse(r.body);
                return body.data && Array.isArray(body.data.products);
            },
            'List response time < 500ms': (r) => r.timings.duration < 500,
        });
        productListDuration.add(listRes.timings.duration);
        if (!listOk) productListErrors.add(1);

        sleep(0.5);

        // Test 2: Filtered products
        const filteredRes = http.get(
            `${BASE_URL}/products?page=1&limit=12&sort=newest`,
            { headers }
        );
        check(filteredRes, {
            'Filtered status 200': (r) => r.status === 200,
            'Filter response time < 600ms': (r) => r.timings.duration < 600,
        });
    });

    sleep(0.5);

    group('Product Detail', () => {
        // Test 3: Product detail by slug
        const slug = PRODUCT_SLUGS[Math.floor(Math.random() * PRODUCT_SLUGS.length)];
        const detailRes = http.get(`${BASE_URL}/products/${slug}`, { headers });
        const detailOk = check(detailRes, {
            'Detail status 200 or 404': (r) => r.status === 200 || r.status === 404,
            'Detail response time < 500ms': (r) => r.timings.duration < 500,
        });
        if (!detailOk) productDetailErrors.add(1);
    });

    sleep(1);
}
