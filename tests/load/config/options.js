/**
 * Shared k6 Load Test Options
 * 
 * Profiles designed for LOCAL DEV server (not production).
 * Production servers can handle much higher loads.
 */

export const ECOMMERCE_LOAD = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 400 },
        { duration: '1m', target: 800 }, // 🚀 Bumping to 800 VUs per user request
        { duration: '2m', target: 800 },
        { duration: '30s', target: 0 },
    ],
};

// User requested thresholds
export const THRESHOLDS = {
    http_req_duration: ['p(95)<1000'],  // 95% of requests must complete under 1000ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
};

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';
