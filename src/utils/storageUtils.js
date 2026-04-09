/**
 * 💾 Storage Utilities for Browser persistence
 * Handles migration from localStorage to IndexedDB for large payloads (like customization design JSONs)
 */

const DB_NAME = 'GenzClothsDB';
const STORE_NAME = 'guest_storage';
const DB_VERSION = 1;

/**
 * 🟢 Initialize IndexedDB
 */
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

/**
 * 📥 Get Item from IndexedDB
 */
export const getItem = async (key) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(`[StorageUtils] Error getting ${key}:`, error);
        return null;
    }
};

/**
 * 📤 Set Item in IndexedDB
 */
export const setItem = async (key, value) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(`[StorageUtils] Error setting ${key}:`, error);
        throw error;
    }
};

/**
 * ❌ Remove Item from IndexedDB
 */
export const removeItem = async (key) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error(`[StorageUtils] Error removing ${key}:`, error);
        return false;
    }
};

/**
 * 🧹 Clear All from Object Store
 */
export const clearStore = async () => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('[StorageUtils] Error clearing store:', error);
        return false;
    }
};
