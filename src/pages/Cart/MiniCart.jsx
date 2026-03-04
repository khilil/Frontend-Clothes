import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";



import "./MiniCart.css";

export default function MiniCart({ open, onClose }) {
  const navigate = useNavigate();
  const { cart, updateQty, removeItem } = useCart();
  const [selectedItemForPreview, setSelectedItemForPreview] = useState(null);
  const [previewSide, setPreviewSide] = useState("front");

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  );

  const increaseQty = (productId, variantId, currentQty) => updateQty(productId, variantId, currentQty + 1);
  const decreaseQty = (productId, variantId, currentQty) => updateQty(productId, variantId, currentQty - 1);

  // 🔥 IMPORTANT CHANGE
  const handleCheckout = () => {
    onClose();
    navigate("/cart");
  };

  const FREE_SHIPPING_THRESHOLD = 5000;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="mini-cart-root">
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="mini-cart-overlay"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="mini-cart"
            >
              {/* HEADER */}
              <div className="mini-cart__header">
                <div className="mini-cart__header-top">
                  <h2 className="mini-cart__title">
                    YOUR BAG <span className="mini-cart__count">[{cart.length}]</span>
                  </h2>

                  <button className="mini-cart__close" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Free Shipping Progress Bar */}
                {cart.length > 0 && (
                  <div className="shipping-bar">
                    <div className="shipping-bar__info">
                      {remainingForFreeShipping > 0 ? (
                        <p>Spend <span>₹{remainingForFreeShipping.toFixed(0)}</span> more for free shipping</p>
                      ) : (
                        <p className="success">Congrats! You've unlocked <span>FREE SHIPPING</span></p>
                      )}
                    </div>
                    <div className="shipping-bar__track">
                      <motion.div
                        className="shipping-bar__progress"
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BODY */}
              <div className="mini-cart__body custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="mini-cart__empty">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="empty-icon"
                    >
                      <span className="material-symbols-outlined">shopping_basket</span>
                    </motion.div>
                    <p className="empty-title">Your bag is empty</p>
                    <p className="empty-text">Looks like you haven't added anything yet.</p>
                    <button
                      className="empty-cta"
                      onClick={() => { onClose(); navigate("/shop"); }}
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="mini-items-list">
                    {cart.map((item, index) => (
                      <motion.div
                        className="mini-item"
                        key={item.cartItemId || item.variantId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className="mini-item__thumb group/thumb cursor-pointer relative"
                          onClick={() => {
                            if (item.customizations?.previews) {
                              setSelectedItemForPreview(item);
                              setPreviewSide("front");
                            }
                          }}
                        >
                          <img src={item.image} alt={item.title} />
                          {item.customizations?.previews ? (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                              <span className="material-symbols-outlined text-white text-lg">zoom_in</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-xl" />
                          )}
                        </div>

                        <div className="mini-item__info">
                          <div className="mini-item__row">
                            <h4 className="mini-item__title">{item.title}</h4>
                            <span className="mini-item__price">
                              ₹{(item.price || 0).toLocaleString()}
                            </span>
                          </div>

                          <div className="mini-item__meta">
                            <span>Size: {item.size}</span>
                            <span className="divider">•</span>
                            <span>Color: {item.color}</span>
                          </div>

                          {/* 🎨 Indicator if Customized */}
                          {item.customizations?.previews && (
                            <div className="mini-item__custom-info">
                              <span className="custom-badge">Design Applied</span>
                            </div>
                          )}

                          <div className="mini-item__actions">
                            <div className="qty-control">
                              <button
                                onClick={() => decreaseQty(item.id, item.variantId, item.qty)}
                                disabled={item.qty <= 1}
                                className="qty-btn"
                              >
                                <span className="material-symbols-outlined">remove</span>
                              </button>

                              <span className="qty-value">
                                {item.qty}
                              </span>

                              <button
                                onClick={() => increaseQty(item.id, item.variantId, item.qty)}
                                className="qty-btn"
                              >
                                <span className="material-symbols-outlined">add</span>
                              </button>
                            </div>

                            <button
                              className="mini-item__remove"
                              onClick={() => removeItem(item.cartItemId)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              {cart.length > 0 && (
                <div className="mini-cart__footer">
                  <div className="mini-cart__summary">
                    <div className="mini-cart__subtotal">
                      <span className="label">Subtotal</span>
                      <span className="value">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <p className="mini-cart__tax-note">Shipping & taxes calculated at checkout</p>
                  </div>

                  <div className="mini-cart__btns">
                    <button
                      className="mini-cart__checkout"
                      onClick={handleCheckout}
                    >
                      View Bag
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </button>
                    <button
                      className="mini-cart__pay"
                      onClick={() => { onClose(); navigate("/checkout"); }}
                    >
                      Checkout Now
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>


      {/* FULL SCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {selectedItemForPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black shadow-2xl flex flex-col items-center justify-center p-4 md:p-12"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemForPreview(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-20 group"
            >
              <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
            </button>

            {/* Side Toggle */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex bg-white/5 backdrop-blur-md rounded-full p-1.5 border border-white/10">
              {['front', 'back'].map(side => (
                <button
                  key={side}
                  onClick={() => setPreviewSide(side)}
                  className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${previewSide === side ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  {side}
                </button>
              ))}
            </div>

            {/* Design Display */}
            <div className="relative w-full h-full max-w-4xl flex items-center justify-center">
              <motion.div
                key={previewSide}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex items-center justify-center"
              >
                {selectedItemForPreview.customizations?.previews?.[previewSide] ? (
                  <img
                    src={selectedItemForPreview.customizations.previews[previewSide]}
                    className="max-w-full max-h-full object-contain rounded-3xl"
                    alt={`${previewSide} view`}
                  />
                ) : (
                  <div className="text-center text-white/20">
                    <span className="material-symbols-outlined text-6xl mb-4">image_not_supported</span>
                    <p className="text-[10px] uppercase font-black tracking-widest">No {previewSide} design view</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Info Badge */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
              <h3 className="text-white font-[Oswald] uppercase tracking-widest text-xl">{selectedItemForPreview.title}</h3>
              <p className="text-[#d4c4b1] text-[9px] font-black uppercase tracking-[0.3em] mt-1">Design Exploration View</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
