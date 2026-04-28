import http from 'k6/http';
import { check } from 'k6';

export function login(baseUrl, credentials) {
    const res = http.post(`${baseUrl}/users/login`, JSON.stringify(credentials), {
        headers: { 'Content-Type': 'application/json' },
    });

    const success = check(res, {
        'login successful': (r) => r.status === 200,
        'has access token': (r) => {
            try {
                if (r.status !== 200 && __VU <= 1) {
                    console.error(`Login failed with status ${r.status}: ${r.body}`);
                }
                const body = JSON.parse(r.body);
                return body && body.data && body.data.accessToken;
            } catch (e) {
                return false;
            }
        },
    });

    if (success) {
        try {
            const body = JSON.parse(res.body);
            return body.data.accessToken;
        } catch (e) {
            return null;
        }
    }
    return null;
}

export function getProducts(baseUrl, params = '') {
    return http.get(`${baseUrl}/products${params}`);
}

export function getProductDetail(baseUrl, slug) {
    return http.get(`${baseUrl}/products/${slug}`);
}

export function addToCart(baseUrl, token, productId, variantId, quantity = 1) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    const body = JSON.stringify({ productId, variantId, quantity });
    return http.post(`${baseUrl}/cart/add`, body, params);
}

export function getCart(baseUrl, token) {
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };
    return http.get(`${baseUrl}/cart`, params);
}

export function checkout(baseUrl, token) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    const body = JSON.stringify({
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
    return http.post(`${baseUrl}/orders/checkout`, body, params);
}
export function directBuy(baseUrl, token, payload) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    return http.post(`${baseUrl}/orders/direct`, JSON.stringify(payload), params);
}
