export function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function generateRandomUser() {
    const id = Math.random().toString(36).substring(7);
    return {
        email: `testuser_${id}@example.com`,
        password: 'Password123!', // Standard test password
        username: `user_${id}`,
        fullName: `Test User ${id}`,
    };
}

// Predefined slugs for testing detail pages
export const TEST_PRODUCT_SLUGS = [
    'classic-oversized-tee',
    'vintage-wash-hoodie',
    'cargo-joggers',
    'graphic-print-tee',
    'slim-fit-denim',
];

// Predefined product IDs for cart operations
export const TEST_PRODUCT_IDS = [
    '65e1a1a1a1a1a1a1a1a1a1a1', // Mock IDs
    '65e2b2b2b2b2b2b2b2b2b2b2',
    '65e3c3c3c3c3c3c3c3c3c3c3',
];
