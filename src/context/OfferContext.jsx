import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getActiveOffers } from '../services/offerService';

const OfferContext = createContext();

export const OfferProvider = ({ children }) => {
    const [activeOffers, setActiveOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOffers = async (force = false) => {
        // Only show loading if we don't have cached data
        const cached = sessionStorage.getItem('active_offers');
        if (cached && !force) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 min TTL
                if (!isExpired) {
                    setActiveOffers(data);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.warn("Failed to parse cached offers", e);
            }
        }

        setIsLoading(true);
        try {
            const res = await getActiveOffers();
            const offers = res.data || [];
            setActiveOffers(offers);
            
            // Store in sessionStorage
            sessionStorage.setItem('active_offers', JSON.stringify({
                data: offers,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error("Failed to fetch active offers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
        // Refresh every 5 minutes - passes force=true to bypass cache on interval
        const interval = setInterval(() => fetchOffers(true), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Helper: Get applicable product-level offer
    const getProductOffer = (product) => {
        if (!product || !activeOffers.length) return null;

        return activeOffers.find(offer => {
            // Priority 1: Flash Sale, Clearance, Seasonal, Festival
            const promoTypes = ["FLASH_SALE", "CLEARANCE", "SEASONAL", "FESTIVAL"];
            if (!promoTypes.includes(offer.offerType)) return false;

            // Check category applicability
            if (offer.applicableCategories && offer.applicableCategories.length > 0) {
                const productCategory = product.productType || product.categories?.[0];
                return offer.applicableCategories.includes(productCategory);
            }

            return true;
        });
    };

    // Helper: Get cart-wide offers (tiered, buy more save more, free shipping)
    const getCartOffers = (subtotal) => {
        return activeOffers.filter(offer => {
            if (offer.offerType === "BUY_MORE_SAVE_MORE" || offer.offerType === "FREE_SHIPPING") {
                return subtotal >= (offer.minPurchaseAmount || 0);
            }
            return false;
        });
    };

    // Helper: Get active banners
    const activeBanners = useMemo(() => {
        return activeOffers
            .filter(offer => offer.bannerConfig?.showBanner)
            .map(offer => ({
                id: offer._id,
                ...offer.bannerConfig,
                title: offer.title,
                description: offer.description,
                offerType: offer.offerType,
                applicableCategories: offer.applicableCategories
            }));
    }, [activeOffers]);

    return (
        <OfferContext.Provider value={{ 
            activeOffers, 
            isLoading, 
            getProductOffer, 
            getCartOffers, 
            activeBanners,
            getProductOffer, 
            getCartOffers, 
            activeBanners,
            refreshOffers: () => fetchOffers(true)
        }}>
            {children}
        </OfferContext.Provider>
    );
};

export const useOffers = () => useContext(OfferContext);
