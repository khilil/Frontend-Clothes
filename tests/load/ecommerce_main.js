/**
 * Professional k6 Load Testing — E-commerce Platform
 * 
 * Features:
 *  - 500 Concurrent Users Ramp-up
 *  - Realistic Traffic Distribution (40/25/20/10/5)
 *  - Automated Thresholds (P95 < 1s, <1% error rate)
 *  - Separate functions for Each User Behavior
 * 
 * Run with:
 *   k6 run tests/load/ecommerce_main.js
 * 
 * Override Base URL:
 *   k6 run -e BASE_URL=http://your-production-url/api/v1 tests/load/ecommerce_main.js
 */

import { sleep, group, check } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, ECOMMERCE_LOAD, THRESHOLDS } from './config/options.js';
import * as api from './helpers/api_helpers.js';
import * as data from './helpers/data_generator.js';

// Custom Metrics
const loginFailures = new Counter('login_failures');
const cartFailures = new Counter('cart_failures');
const orderFailures = new Counter('order_failures');
const productBrowseDuration = new Trend('product_browse_duration');
const productDetailDuration = new Trend('product_detail_duration');

export const options = {
    ...ECOMMERCE_LOAD,
    thresholds: THRESHOLDS,
};

/**
 * SCENARIO 1: Browsing Products (40%)
 */
function browseProducts() {
    group('Browse Products', () => {
        const res = api.getProducts(BASE_URL, '?page=1&limit=12');
        check(res, {
            'browse status is 200': (r) => r.status === 200,
        });
        productBrowseDuration.add(res.timings.duration);
        sleep(data.randomIntBetween(1, 3));
    });
}

/**
 * SCENARIO 2: Viewing Product Details (25%)
 */
function viewProductDetails() {
    group('View Product Details', () => {
        // 1. Get a fresh product list to pick a valid slug
        const listRes = api.getProducts(BASE_URL, '?limit=10');
        let slug = 'graphic-print-tee'; // fallback

        try {
            const products = JSON.parse(listRes.body).data.products;
            if (products && products.length > 0) {
                slug = data.randomItem(products).slug;
            }
        } catch (e) {
            // If list fails, the detail check will catch it
        }

        const res = api.getProductDetail(BASE_URL, slug);
        check(res, {
            'detail status is 200': (r) => r.status === 200,
        });
        productDetailDuration.add(res.timings.duration);
        sleep(data.randomIntBetween(2, 5));
    });
}

/**
 * SCENARIO 3: Cart Operations (20%)
 */
function cartOperations() {
    group('Cart Operations', () => {
        const token = api.login(BASE_URL, {
            email: 'testuser@example.com',
            password: 'Password123!'
        });

        if (token) {
            // 1. Get real product list to find a valid ID and Variant
            const productsRes = api.getProducts(BASE_URL, '?limit=5');
            let productId, variantId;

            try {
                const products = JSON.parse(productsRes.body).data.products;
                if (products && products.length > 0) {
                    const product = products[0];
                    productId = product._id;
                    variantId = product.variants[0]?.sku; // Using SKU as variantId per backend logic
                }
            } catch (e) { }

            if (productId && variantId) {
                const addRes = api.addToCart(BASE_URL, token, productId, variantId);
                check(addRes, {
                    'add to cart status is 200/201': (r) => r.status === 200 || r.status === 201,
                });
                if (addRes.status !== 200 && addRes.status !== 201) cartFailures.add(1);

                sleep(1);
                api.getCart(BASE_URL, token);
            }
        } else {
            loginFailures.add(1);
        }
        sleep(data.randomIntBetween(1, 3));
    });
}

/**
 * SCENARIO 4: User Login (10%)
 */
function userLogin() {
    group('User Login', () => {
        const credentials = {
            email: 'testuser@example.com', // Replace with dynamic if DB is seeded
            password: 'Password123!'
        };
        const token = api.login(BASE_URL, credentials);
        if (!token) loginFailures.add(1);
        sleep(data.randomIntBetween(2, 4));
    });
}

/**
 * SCENARIO 5: Checkout / Order (5%)
 */
function placeOrder() {
    group('Place Order', () => {
        const token = api.login(BASE_URL, {
            email: 'testuser@example.com',
            password: 'Password123!'
        });

        if (token) {
            // Pick a real product
            const productsRes = api.getProducts(BASE_URL, '?limit=5');
            let productId, variantId;

            try {
                const products = JSON.parse(productsRes.body).data.products;
                if (products && products.length > 0) {
                    const product = products[0];
                    productId = product._id;
                    variantId = product.variants[0]?.sku;
                }
            } catch (e) { }

            if (productId && variantId) {
                const res = api.directBuy(BASE_URL, token, {
                    productId,
                    variantId,
                    quantity: 1,
                    shippingAddress: {
                        fullName: "K6 Load Test User",
                        phone: "9876543210",
                        addressLine: "123 Test Street",
                        city: "Surat",
                        state: "Gujarat",
                        pincode: "395001"
                    },
                    paymentMethod: "COD"
                });
                check(res, {
                    'checkout status is 200/201': (r) => r.status === 200 || r.status === 201,
                });
                if (res.status !== 200 && res.status !== 201) orderFailures.add(1);
            }
        } else {
            loginFailures.add(1);
        }
        sleep(data.randomIntBetween(5, 10));
    });
}

/**
 * MAIN EXECUTION
 * Simulates Traffic Distribution
 */
export default function () {
    const rand = Math.random() * 100;

    if (rand <= 40) {
        browseProducts();
    } else if (rand <= 65) {
        // 40 + 25 = 65
        viewProductDetails();
    } else if (rand <= 85) {
        // 65 + 20 = 85
        cartOperations();
    } else if (rand <= 95) {
        // 85 + 10 = 95
        userLogin();
    } else {
        // Remaining 5%
        placeOrder();
    }
}
