import api from "./api";

/**
 * Fetch global store settings (COD, Store Pickup, etc.)
 * @returns {Promise}
 */
export const getStoreSettings = async () => {
    try {
        const response = await api.get("/store-settings");
        return response.data;
    } catch (error) {
        console.error("Error fetching store settings:", error);
        throw error?.response?.data || error;
    }
};

/**
 * Update global store settings (Admin only)
 * @param {Object} settings - { isCodEnabled, isStorePickupEnabled }
 * @returns {Promise}
 */
export const updateStoreSettings = async (settings) => {
    try {
        const response = await api.patch("/store-settings", settings);
        return response.data;
    } catch (error) {
        console.error("Error updating store settings:", error);
        throw error?.response?.data || error;
    }
};
