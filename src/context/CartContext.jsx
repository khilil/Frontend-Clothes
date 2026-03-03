import { createContext, useContext, useEffect, useState } from "react";
import * as cartService from "../services/cartService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* 🔄 INITIAL FETCH FROM BACKEND */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await cartService.getCart();
        const formattedItems = res.data.items.map(item => {
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
            // 1. Add Printing Method Price
            customizationCost += Number(item.customizations.printingMethod?.price || 0);

            // 2. Add Element Prices (from Technical Report)
            if (item.customizations.technicalReport) {
              customizationCost += item.customizations.technicalReport.reduce((acc, el) => acc + (Number(el.price) || 0), 0);
            }
          }

          return {
            cartItemId: item._id,
            id: product._id,
            title: product.title,
            basePrice: basePrice,
            price: basePrice + customizationCost, // The final price shown to user
            image: item.customizations?.previews?.front || variant?.images?.[0]?.url || product.images?.[0]?.url,
            qty: item.quantity,
            variantId: item.variantId,
            size: variant?.size?.name || "N/A",
            color: variant?.color?.name || "N/A",
            customizations: item.customizations || {}
          };
        });
        setCart(formattedItems);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  /* ➕ ADD TO CART */
  const addToCart = async (product, options = {}, customizations = {}) => {
    const productId = product._id || product.id;
    const variantId = options.variantId;
    const qty = 1;

    console.log("☎️ Calling CartService.addToCart:", { productId, variantId, qty, customizations });

    try {
      const res = await cartService.addToCart(productId, variantId, qty, customizations);

      // Full refresh of cart state from backend response for absolute accuracy
      const formattedItems = res.data.items.map(item => {
        const prodId = item.product._id ? item.product._id.toString() : item.product.toString();
        const searchId = (product._id || product.id).toString();

        const prod = prodId === searchId ? product : (item.product);
        const variant = prod.variants?.find(v =>
          v._id === item.variantId ||
          v.sku === item.variantId
        );

        // 💰 Calculate Total Price for Customized Items
        const basePrice = prod.price || 0;
        let customizationCost = 0;
        if (item.customizations) {
          customizationCost += Number(item.customizations.printingMethod?.price || 0);
          if (item.customizations.technicalReport) {
            customizationCost += item.customizations.technicalReport.reduce((acc, el) => acc + (Number(el.price) || 0), 0);
          }
        }

        return {
          cartItemId: item._id,
          id: prod._id,
          title: prod.title,
          basePrice: basePrice,
          price: basePrice + customizationCost,
          image: item.customizations?.previews?.front || variant?.images?.[0]?.url || prod.images?.[0]?.url,
          qty: item.quantity,
          variantId: item.variantId,
          size: variant?.size?.name || options.size || "N/A",
          color: variant?.color?.name || options.color || "N/A",
          customizations: item.customizations || {}
        };
      });
      setCart(formattedItems);
    } catch (error) {
      console.error("Add to cart failed:", error);
      throw error;
    }
  };

  /* ➕➖ UPDATE QTY */
  const updateQty = async (productId, variantId, newQty) => {
    if (newQty < 1) return;
    try {
      await cartService.updateCartItem(productId, variantId, newQty);
      setCart(prev => prev.map(item =>
        item.variantId === variantId ? { ...item, qty: newQty } : item
      ));
    } catch (error) {
      console.error("Update qty failed:", error);
      throw error;
    }
  };

  /* ❌ REMOVE ITEM */
  const removeItem = async (cartItemId) => {
    try {
      await cartService.removeFromCart(cartItemId);
      setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    } catch (error) {
      console.error("Remove item failed:", error);
    }
  };

  /* 🧹 CLEAR CART */
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQty,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
