import api from "./api";

/**
 * ❤️ Toggle Wishlist Item
 * @param {string} productId 
 */
export const toggleWishlist = async (productId) => {
    try {
        const response = await api.post("/wishlist/toggle", { productId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * 📜 Get User Wishlist
 */
export const getWishlist = async () => {
    try {
        const response = await api.get("/wishlist");
        return response.data;
    } catch (error) {
        throw error;
    }
};
