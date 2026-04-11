import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as cartService from "../services/cartService";
import * as storageUtils from "../utils/storageUtils";
import { ensureAbsoluteUrl } from "../utils/urlUtils";
import { useOffers } from "./OfferContext";
import { toast } from "react-hot-toast";
import CustomToast from "../components/common/CustomToast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { getCartOffers } = useOffers();

  /* 🔄 HELPERS */
  const getGuestCart = async () => {
    const saved = await storageUtils.getItem("guest_cart");
    return saved || [];
  };

  const setGuestCart = async (newCart) => {
    try {
      await storageUtils.setItem("guest_cart", newCart);
      setCart(newCart);
    } catch (error) {
      console.error("[CartContext] Failed to save guest cart:", error);
      toast.error("Storage full! Please log in to save large designs permanently.");
    }
  };

  /* 🔄 STORAGE MIGRATION (localStorage -> IndexedDB) */
  useEffect(() => {
    const migrateStorage = async () => {
      const legacyCart = localStorage.getItem("guest_cart");
      if (legacyCart) {
        try {
          console.log("📦 Migrating guest cart to IndexedDB...");
          const parsed = JSON.parse(legacyCart);
          await storageUtils.setItem("guest_cart", parsed);
          localStorage.removeItem("guest_cart");
          if (!user) setCart(parsed);
          console.log("✅ Migration successful.");
        } catch (e) {
          console.error("❌ Migration failed:", e);
        }
      }
    };
    migrateStorage();
  }, [user]);

  /* 🔄 INITIAL FETCH */
  useEffect(() => {
    const fetchCart = async () => {
      if (authLoading) return;

      if (user) {
        try {
          const res = await cartService.getCart();
          const rawItems = res.data.items;

          const formattedItems = rawItems
            .filter(item => item.product) // 🛡️ Filter out items with missing products
            .map(item => {
              const product = item.product;
              const variant = product.variants?.find(v =>
                v._id?.toString() === item.variantId?.toString() ||
                v.id === item.variantId?.toString() ||
                v.sku === item.variantId?.toString()
              );

              // 💰 Calculate Total Price for Customized Items
              const basePrice = product.price || 0;
              let customizationCost = 0;
              if (item.customizations) {
                customizationCost += Number(item.customizations.printingMethod?.price || 0);
                if (item.customizations.technicalReport) {
                  customizationCost += item.customizations.technicalReport.reduce((acc, el) => acc + (Number(el.price) || 0), 0);
                }
              }

              const rawImage = item.customizations?.displayPreviews?.front || item.customizations?.displayImage || item.customizations?.previews?.front || variant?.images?.[0]?.url || product.frontImage || product.images?.[0]?.url;

              return {
                cartItemId: item._id,
                id: product._id,
                title: product.title,
                basePrice: basePrice,
                price: basePrice + customizationCost,
                image: ensureAbsoluteUrl(rawImage),
                qty: item.quantity,
                variantId: item.variantId,
                size: variant?.size?.name || product.size?.name || "N/A",
                color: variant?.color?.name || product.color?.name || "N/A",
                customizations: item.customizations || {}
              };
            });

          setCart(formattedItems);

          // 🧹 Auto-clean ghost items from backend (items filtered out because product is null)
          const ghostItems = rawItems.filter(item => !item.product);
          if (ghostItems.length > 0) {
            console.warn(`[Cart] Cleaning ${ghostItems.length} ghost item(s) with missing products...`);
            ghostItems.forEach(ghost => {
              cartService.removeFromCart(ghost._id).catch(err =>
                console.error("[Cart] Failed to remove ghost item:", ghost._id, err.message)
              );
            });
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest Cart
        const localCart = await getGuestCart();
        setCart(localCart);
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, authLoading]);

  /* 🔄 MERGE GUEST CART ON LOGIN */
  useEffect(() => {
    const mergeCarts = async () => {
      if (!authLoading && user) {
        const localCart = await getGuestCart();
        if (localCart.length > 0) {
          console.log("🛒 Merging guest cart items into user account...");
          try {
            // Merge items sequentially or in parallel?
            // Sequentially is safer for state management if the service returns full cart.
            for (const item of localCart) {
              await cartService.addToCart(
                item.id,
                item.variantId,
                item.qty,
                item.customizations
              );
            }
            // Clear local cart
            await storageUtils.removeItem("guest_cart");
            // Refresh final cart state from backend
            const res = await cartService.getCart();
            const formattedItems = res.data.items
              .filter(mappedItem => mappedItem.product) // 🛡️ Filter out items with missing products
              .map(mappedItem => {
                const product = mappedItem.product;
                const variant = product.variants?.find(v =>
                  v._id?.toString() === mappedItem.variantId?.toString() ||
                  v.sku === mappedItem.variantId?.toString()
                );
                const basePrice = product.price || 0;
                let customizationCost = 0;
                if (mappedItem.customizations) {
                  customizationCost += Number(mappedItem.customizations.printingMethod?.price || 0);
                  if (mappedItem.customizations.technicalReport) {
                    customizationCost += mappedItem.customizations.technicalReport.reduce((acc, el) => acc + (Number(el.price) || 0), 0);
                  }
                }
                const rawImage = mappedItem.customizations?.displayPreviews?.front || mappedItem.customizations?.displayImage || mappedItem.customizations?.previews?.front || variant?.images?.[0]?.url || product.frontImage || product.images?.[0]?.url;
                return {
                  cartItemId: mappedItem._id,
                  id: product._id,
                  title: product.title,
                  basePrice,
                  price: basePrice + customizationCost,
                  image: ensureAbsoluteUrl(rawImage),
                  qty: mappedItem.quantity,
                  variantId: mappedItem.variantId,
                  size: variant?.size?.name || product.size?.name || "N/A",
                  color: variant?.color?.name || product.color?.name || "N/A",
                  customizations: mappedItem.customizations || {}
                };
              });
            setCart(formattedItems);
            console.log("✅ Cart merging complete.");
          } catch (error) {
            console.error("❌ Failed to merge carts:", error);
          }
        }
      }
    };

    mergeCarts();
  }, [user, authLoading]);

  /* ➕ ADD TO CART */
  const addToCart = async (product, options = {}, customizations = {}) => {
    if (user) {
      // LOGGED IN USER FLOW
      const productId = product._id || product.id;
      const variantId = options.variantId;
      const qty = 1;

      try {
        const res = await cartService.addToCart(productId, variantId, qty, customizations);
        const formattedItems = res.data.items
          .filter(item => item.product) // 🛡️ Filter out items with missing products
          .map(item => {
            const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
            const searchId = (product._id || product.id).toString();
            const prod = prodId === searchId ? product : (item.product);
            const variant = prod.variants?.find(v => v._id === item.variantId || v.sku === item.variantId);

            const basePrice = prod.price || 0;
            let customizationCost = 0;
            if (item.customizations) {
              customizationCost += Number(item.customizations.printingMethod?.price || 0);
              if (item.customizations.technicalReport) {
                customizationCost += item.customizations.technicalReport.reduce((acc, el) => acc + (Number(el.price) || 0), 0);
              }
            }

            const isNewItem = item.variantId === variantId;
            const rawImage = item.customizations?.displayPreviews?.front || item.customizations?.displayImage || item.customizations?.previews?.front || variant?.images?.[0]?.url || prod.frontImage || prod.images?.[0]?.url;

            return {
              cartItemId: item._id,
              id: prod._id,
              title: prod.title,
              basePrice: basePrice,
              price: basePrice + customizationCost,
              image: ensureAbsoluteUrl(rawImage),
              qty: item.quantity,
              variantId: item.variantId,
              size: variant?.size?.name || (isNewItem ? (options.size || prod.size?.name || "N/A") : prod.size?.name || "N/A"),
              color: variant?.color?.name || (isNewItem ? (options.color || prod.color?.name || "N/A") : prod.color?.name || "N/A"),
              customizations: item.customizations || {}
            };
          });
        setCart(formattedItems);
        toast.custom((t) => (
          <CustomToast t={t} product={product} actionType="cart" />
        ));
      } catch (error) {
        toast.error("Failed to add to cart");
        console.error("Add to cart failed:", error);
        throw error;
      }
    } else {
      // GUEST FLOW
      const localCart = await getGuestCart();
      const variantId = options.variantId;

      const existingItem = localCart.find(item => item.variantId === variantId && JSON.stringify(item.customizations) === JSON.stringify(customizations));

      if (existingItem) {
        await setGuestCart(localCart.map(item =>
          item.variantId === variantId ? { ...item, qty: item.qty + 1 } : item
        ));
        toast.custom((t) => (
          <CustomToast t={t} product={product} actionType="cart" />
        ));
      } else {
        const basePrice = product.price || 0;
        let customizationCost = 0;
        if (customizations.printingMethod) customizationCost += Number(customizations.printingMethod.price || 0);
        if (customizations.technicalReport) customizationCost += customizations.technicalReport.reduce((acc, el) => acc + (Number(el.price) || 0), 0);

        const newItem = {
          cartItemId: `guest_${Date.now()}`,
          id: product._id || product.id,
          title: product.title,
          basePrice: basePrice,
          price: basePrice + customizationCost,
          image: ensureAbsoluteUrl(customizations?.displayPreviews?.front || customizations?.displayImage || customizations?.previews?.front || product.frontImage || product.images?.[0]?.url),
          qty: 1,
          variantId: variantId,
          size: options.size || "N/A",
          color: options.color || "N/A",
          customizations: customizations
        };
        await setGuestCart([...localCart, newItem]);
        toast.custom((t) => (
          <CustomToast t={t} product={product} actionType="cart" />
        ));
      }
    }
  };

  /* ➕➖ UPDATE QTY */
  const updateQty = async (productId, variantId, newQty) => {
    if (newQty < 1) return;
    if (user) {
      try {
        await cartService.updateCartItem(productId, variantId, newQty);
        setCart(prev => prev.map(item =>
          item.variantId === variantId ? { ...item, qty: newQty } : item
        ));
      } catch (error) {
        console.error("Update qty failed:", error);
        throw error;
      }
    } else {
      const localCart = await getGuestCart();
      await setGuestCart(localCart.map(item =>
        item.variantId === variantId ? { ...item, qty: newQty } : item
      ));
    }
  };

  /* ❌ REMOVE ITEM */
  const removeItem = async (cartItemId) => {
    if (user) {
      try {
        await cartService.removeFromCart(cartItemId);
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
      } catch (error) {
        console.error("Remove item failed:", error);
      }
    } else {
      const localCart = await getGuestCart();
      await setGuestCart(localCart.filter(item => item.cartItemId !== cartItemId));
    }
  };

  /* 🧹 CLEAR CART */
  const clearCart = async () => {
    if (!user) await storageUtils.removeItem("guest_cart");
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (couponData) => {
    setAppliedCoupon(couponData);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
