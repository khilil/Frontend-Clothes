import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as wishlistService from '../services/wishlistService';
import { toast } from 'react-hot-toast';
import CustomToast from '../components/common/CustomToast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await wishlistService.getWishlist();
            setWishlist(res.data || []);
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (product) => {
        if (!user) {
            // Potential logic for redirecting to login or showing a message
            return;
        }

        try {
            const productId = product._id || product.id;
            const res = await wishlistService.toggleWishlist(productId);

            if (res.data.isInWishlist) {
                setWishlist(prev => [...prev, product]);
                toast.custom((t) => (
                    <CustomToast t={t} product={product} actionType="wishlist" />
                ));
            } else {
                setWishlist(prev => prev.filter(item => (item._id || item.id) !== productId));
                toast.custom((t) => (
                    <CustomToast t={t} product={product} actionType="wishlist" />
                ));
            }
            return res.data.isInWishlist;
        } catch (error) {
            toast.error("Failed to update wishlist");
            console.error("Failed to toggle wishlist:", error);
            throw error;
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => (item._id || item.id) === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleItem, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
