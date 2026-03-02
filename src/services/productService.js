import api from "./api";

/**
 * Fetch products from the backend with filtering.
 * Supports both new object signature: getProducts({ isOnSale: true }, signal)
 * and old positional signature: getProducts(signal, isAdmin)
 * 
 * @param {Object|AbortSignal} filtersOrSignal - Either filter object or AbortSignal (legacy)
 * @param {AbortSignal|boolean} signalOrIsAdmin - Either AbortSignal or isAdmin boolean (legacy)
 * @returns {Promise<Object>} Response data
 */
export const getProducts = async (filtersOrSignal = {}, signalOrIsAdmin) => {
    try {
        let filters = {};
        let signal = null;

        // Handle legacy signature: getProducts(signal, isAdmin)
        if (filtersOrSignal instanceof AbortSignal || (filtersOrSignal === null && typeof signalOrIsAdmin === 'boolean')) {
            signal = filtersOrSignal;
            if (signalOrIsAdmin === true) {
                filters.isAdmin = true;
            }
        }
        // Handle new signature: getProducts(filters, signal)
        else {
            filters = filtersOrSignal || {};
            signal = signalOrIsAdmin;
        }

        const queryParams = new URLSearchParams();

        // Add all filter keys to query params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        });

        const url = `/products?${queryParams.toString()}`;
        const response = await api.get(url, { signal });
        console.log("Products Fetch Response:", response.data);
        return response.data.data;
    } catch (error) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
            return null;
        }
        throw error;
    }
};

/**
 * Fetch a single product by SLUG.
 * @param {string} slug - Product Slug
 * @param {boolean} isAdmin - Whether the request is from an admin
 * @returns {Promise<Object>} Product details
 */
export const getProductBySlug = async (slug, isAdmin = false) => {
    try {
        const url = isAdmin ? `/products/${slug}?isAdmin=true` : `/products/${slug}`;
        const response = await api.get(url);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update an existing product.
 * @param {string} id - Product ID
 * @param {FormData} formData - Multipart form data
 * @returns {Promise<Object>} Response data
 */
export const updateProduct = async (id, formData) => {
    try {
        const response = await api.put(`/products/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a product by ID.
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Response data
 */
export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
