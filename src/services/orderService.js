import api from './api';

// --- SHOP FACING METHODS (RESTORED) ---

/**
 * 📦 Direct Buy (Buy Now)
 */
export const directBuy = async (orderData) => {
    try {
        const response = await api.post('/orders/direct', orderData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * 🛒 Cart Checkout
 */
export const cartCheckout = async (checkoutData) => {
    try {
        const response = await api.post('/orders/checkout', checkoutData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * 👤 Get User Orders
 */
export const getMyOrders = async () => {
    try {
        const response = await api.get('/orders/my-orders');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * ✅ Cancel Order
 */
export const cancelOrder = async (orderId) => {
    try {
        const response = await api.put(`/orders/cancel/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// --- ADMIN DASHBOARD METHODS (NEW) ---

export const getAllOrders = async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
};

// Aliased for backward compatibility if needed
export const getAllAdminOrders = getAllOrders;

export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const updateOrderStatus = async (id, data) => {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
};

export const markOrderQC = async (id) => {
    const response = await api.patch(`/orders/${id}/qc`);
    return response.data;
};

export const updateOrderPriority = async (id, priority) => {
    const response = await api.patch(`/orders/${id}/priority`, { priority });
    return response.data;
};

export const addOrderNote = async (id, note) => {
    const response = await api.post(`/orders/${id}/notes`, { note });
    return response.data;
};

export const addCustomerNote = async (id, note) => {
    const response = await api.post(`/orders/${id}/customer-notes`, { note });
    return response.data;
};

export const bulkUpdateOrders = async (orderIds, status) => {
    const response = await api.patch('/orders/bulk/status', { orderIds, status });
    return response.data;
};
