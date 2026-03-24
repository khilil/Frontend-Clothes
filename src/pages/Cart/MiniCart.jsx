import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";


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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (

    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 bg-background/60 z-[1]"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full max-w-[440px] h-[100dvh] bg-background border-l border-border-subtle flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.05)] overflow-hidden z-[5] before:absolute before:inset-0 before:bg-[linear-gradient(135deg,var(--color-accent)_0%,transparent_100%)] before:opacity-[0.03] before:pointer-events-none"
            >
              {/* HEADER */}
              <div className="flex-none px-5 py-6 md:px-8 md:pt-10 md:pb-8 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-[Oswald] text-2xl font-medium tracking-[0.1em] uppercase">
                    YOUR BAG <span className="font-[Inter] text-sm text-accent-contrast ml-2 font-light">[{cart.length}]</span>
                  </h2>

                  <button className="w-10 h-10 rounded-full border border-border-subtle bg-secondary text-text-primary flex items-center justify-center cursor-pointer transition-all duration-400 hover:bg-accent hover:text-white hover:rotate-90" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Free Shipping Progress Bar */}
                {cart.length > 0 && (
                  <div className="mt-2.5">
                    <div className="text-[10px] uppercase tracking-[0.15em] mb-2 text-text-muted">
                      {remainingForFreeShipping > 0 ? (
                        <p>Spend <span className="text-text-primary font-extrabold">₹{remainingForFreeShipping.toFixed(0)}</span> more for free shipping</p>
                      ) : (
                        <p className="text-green-600">Congrats! You've unlocked <span className="text-text-primary font-extrabold">FREE SHIPPING</span></p>
                      )}
                    </div>
                    <div className="h-[2px] bg-border-subtle rounded overflow-hidden">
                      <motion.div
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BODY */}
              <div className="flex-1 relative min-h-0 overflow-hidden">
                <div className="absolute inset-0 p-5 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 rounded-full bg-secondary border border-border-subtle flex items-center justify-center mb-6"
                      >
                        <span className="material-symbols-outlined text-[32px] text-text-muted">shopping_basket</span>
                      </motion.div>
                      <p className="font-[Oswald] text-xl uppercase tracking-[0.1em] mb-2">Your bag is empty</p>
                      <p className="text-xs text-text-muted mb-8 leading-[1.6]">Looks like you haven't added anything yet.</p>
                      <button
                        className="px-10 py-4 bg-text-primary text-background uppercase text-[11px] font-black tracking-[0.2em] rounded transition-all duration-400 hover:bg-accent hover:text-white hover:tracking-[0.3em]"
                        onClick={() => { onClose(); navigate("/shop"); }}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-10 shrink-0 pb-5">
                      {cart.map((item, index) => (
                        <motion.div
                          className="flex gap-5"

                          key={item.cartItemId || item.variantId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div
                            className="w-[100px] aspect-[4/5] bg-[#111] rounded-xl overflow-hidden border border-white/10 shrink-0 group/thumb cursor-pointer relative"
                            onClick={() => {
                              if (item.customizations?.previews) {
                                setSelectedItemForPreview(item);
                                setPreviewSide("front");
                              }
                            }}
                          >
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-800 group-hover/thumb:scale-110" style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }} />
                            {item.customizations?.previews ? (
                              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                <span className="material-symbols-outlined text-text-primary text-lg">zoom_in</span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-xl" />
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-xs font-bold uppercase tracking-[0.05em] max-w-[160px]">{item.title}</h4>
                              <span className="font-[Oswald] text-sm font-normal">
                                ₹{(item.price || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-[0.1em] text-text-muted">
                              <span>Size: {item.size}</span>
                              <span className="text-[8px] opacity-30">•</span>
                              <span>Color: {item.color}</span>
                            </div>

                            {/* 🎨 Indicator if Customized */}
                            {item.customizations?.previews && (
                              <div className="mb-4">
                                <span className="text-[8px] uppercase font-black tracking-[0.1em] bg-[#d4c4b1] text-black px-1.5 py-0.5 rounded-sm">Design Applied</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-secondary border border-border-subtle rounded-lg p-0.5">
                                <button
                                  onClick={() => decreaseQty(item.id, item.variantId, item.qty)}
                                  disabled={item.qty <= 1}
                                  className="w-7 h-7 flex items-center justify-center text-text-primary transition-all duration-400 disabled:opacity-20 not:disabled:hover:bg-text-primary/10"
                                >
                                  <span className="material-symbols-outlined text-[16px]">remove</span>
                                </button>

                                <span className="text-xs font-bold min-w-[30px] text-center">
                                  {item.qty}
                                </span>

                                <button
                                  onClick={() => increaseQty(item.id, item.variantId, item.qty)}
                                  className="w-7 h-7 flex items-center justify-center text-text-primary transition-all duration-400 disabled:opacity-20 not:disabled:hover:bg-text-primary/10"
                                >
                                  <span className="material-symbols-outlined text-[16px]">add</span>
                                </button>
                              </div>

                              <button
                                className="text-text-muted transition-all duration-400 hover:text-red-500 hover:scale-110"
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
              </div>

              {/* FOOTER */}
              {cart.length > 0 && (
                <div className="shrink-0 p-5 md:p-8 bg-black border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs uppercase font-black tracking-[0.2em] text-text-muted">Subtotal</span>
                      <span className="font-[Oswald] text-2xl font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-text-muted uppercase tracking-[0.05em]">Shipping & taxes calculated at checkout</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      className="w-full h-12 md:h-14 flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded transition-all duration-400 bg-transparent border border-white text-white hover:bg-white hover:text-black"
                      onClick={handleCheckout}
                    >
                      View Bag
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </button>
                    <button
                      className="w-full h-12 md:h-14 flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded transition-all duration-400 bg-text-primary text-background hover:bg-accent hover:text-white"
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
            className="fixed inset-0 z-[100] bg-background shadow-2xl flex flex-col items-center justify-center p-4 md:p-12"
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
