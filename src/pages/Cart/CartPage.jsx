import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useOffers } from "../../context/OfferContext";
import { motion, AnimatePresence } from "framer-motion";
import { validateOffer } from "../../services/offerService";

export default function CartPage() {
    const { cart, updateQty, removeItem, isLoading, appliedCoupon, applyCoupon, removeCoupon } = useCart();
    const { getCartOffers, getProductOffer, activeOffers } = useOffers();
    const [selectedItemForPreview, setSelectedItemForPreview] = useState(null);
    const [previewSide, setPreviewSide] = useState("front");
    const [promoCode, setPromoCode] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState("");
 
    // 1. Calculate Base Subtotal
    const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 0), 0);

    // 2. Calculate Product-Level Discounts (Flash Sale, etc. if not already in item.price)
    // Note: If ProductCard already shows discounted price, item.price might be discounted. 
    // But usually cart stores base price. Let's check how item is added in CartContext.
    // In CartContext, item.price is set at fetch time. 
    
    // 3. Calculate Automatic Cart-Wide Offers (Buy More Save More)
    const cartOffers = getCartOffers(subtotal);
    const buyMoreSaveMore = cartOffers.find(o => o.offerType === "BUY_MORE_SAVE_MORE");
    
    let autoDiscountAmount = 0;
    let autoDiscountLabel = "";

    if (buyMoreSaveMore) {
        if (buyMoreSaveMore.discountType === "PERCENTAGE") {
            autoDiscountAmount = (subtotal * buyMoreSaveMore.discountValue) / 100;
        } else {
            autoDiscountAmount = buyMoreSaveMore.discountValue;
        }
        autoDiscountLabel = buyMoreSaveMore.title;
    }

    // 4. Calculate Buy X Get Y Offers
    const buyXGetYOffer = activeOffers.find(o => o.offerType === "BUY_X_GET_Y");
    let buyXGetYDiscount = 0;
    
    if (buyXGetYOffer) {
        const buyQty = buyXGetYOffer.buyXGetYConfig?.buyQty || 2;
        const getQty = buyXGetYOffer.buyXGetYConfig?.getQty || 1;
        
        // Count items in applicable categories
        const applicableItems = cart.filter(item => {
            if (!buyXGetYOffer.applicableCategories?.length) return true;
            return buyXGetYOffer.applicableCategories.includes(item.productType);
        });
        
        const totalItemsInDeal = applicableItems.reduce((acc, item) => acc + (item.qty || 0), 0);
        const freeUnits = Math.floor(totalItemsInDeal / (buyQty + getQty)) * getQty;
        
        if (freeUnits > 0) {
            // Find the cheapest item to give for free (standard practice)
            const sortedItems = [...applicableItems].sort((a, b) => a.price - b.price);
            let remainingFreeUnits = freeUnits;
            
            for (const item of sortedItems) {
                const unitsFromThisItem = Math.min(item.qty, remainingFreeUnits);
                buyXGetYDiscount += unitsFromThisItem * item.price;
                remainingFreeUnits -= unitsFromThisItem;
                if (remainingFreeUnits <= 0) break;
            }
        }
    }

    // 5. Calculate Free Shipping
    const freeShippingOffer = cartOffers.find(o => o.offerType === "FREE_SHIPPING");
    const isFreeShipping = subtotal >= (freeShippingOffer?.minPurchaseAmount || 5000) || (freeShippingOffer ? true : false);
    const shippingCost = isFreeShipping ? 0 : 250;

    // 6. Calculate Coupon Discount
    const couponDiscountAmount = appliedCoupon?.discountAmount || 0;

    // 7. Totals
    const totalDiscount = autoDiscountAmount + couponDiscountAmount + buyXGetYDiscount;
    const amountAfterDiscount = Math.max(0, subtotal - totalDiscount);
    const estimatedTax = amountAfterDiscount * 0.08; 
    const total = amountAfterDiscount + shippingCost + estimatedTax;

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsApplying(true);
        setError("");
        try {
            const res = await validateOffer(promoCode, subtotal);
            applyCoupon(res.data);
            setPromoCode("");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid coupon");
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse font-primary tracking-widest uppercase text-text-primary text-2xl">Loading Bag…</div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen font-secondary text-text-primary selection:bg-accent selection:text-primary">
            {/* Header Area - Since the main layout might have its own header, we match the style */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
                {/* Progress Stepper */}
                <div className="hidden md:flex items-center justify-center mb-16 max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 group">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Cart</span>
                        <div className="w-12 md:w-16 h-[2px] bg-text-primary"></div>
                    </div>
                    <div className="flex items-center gap-4 px-4 text-text-muted">
                        <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
                        <div className="w-12 md:w-16 h-[2px] bg-border-subtle"></div>
                    </div>
                    <div className="flex items-center gap-4 px-4 text-text-muted">
                        <span className="text-[10px] font-black uppercase tracking-widest">Payment</span>
                        <div className="w-12 md:w-16 h-[2px] bg-border-subtle"></div>
                    </div>
                    <div className="flex items-center gap-4 text-text-muted">
                        <span className="text-[10px] font-black uppercase tracking-widest">Done</span>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-32 space-y-8">
                        <h2 className="text-4xl font-primary uppercase tracking-tighter">Your Bag is Empty</h2>
                        <p className="text-text-muted uppercase tracking-widest text-[11px] font-bold">Start exploring our premium collection</p>
                        <Link to="/" className="inline-block px-12 py-5 bg-text-primary text-primary text-[11px] font-black uppercase tracking-[0.4em] hover:bg-accent hover:text-primary transition-all duration-500 rounded-xl">
                            Continue Exploration
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-8">
                            <h1 className="text-2xl md:text-3xl font-primary uppercase tracking-tight mb-8">Your Bag ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})</h1>

                            {cart.map((item) => (
                                <div key={item.cartItemId} className="flex flex-col sm:flex-row gap-4 md:gap-8 py-8 border-b border-text-primary/5 last:border-0 hover:bg-text-primary/5 transition-colors p-4 rounded-3xl group">
                                    <div
                                        className="w-full sm:w-40 aspect-[3/4] bg-background-alt rounded-2xl overflow-hidden flex-shrink-0 relative cursor-zoom-in group"
                                        onClick={() => {
                                            if (item.customizations?.previews) {
                                                setSelectedItemForPreview(item);
                                                setPreviewSide("front");
                                            }
                                        }}
                                    >
                                        <img
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                            src={item.image}
                                        />
                                        {item.customizations?.previews && (
                                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="material-symbols-outlined text-text-primary text-3xl">zoom_in</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-primary uppercase tracking-widest">{item.title}</h3>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Ref: {item.variantId?.slice(-8).toUpperCase() || "MM-OX-001"}</p>
                                            </div>
                                            <p className="text-xl font-primary">₹{item.price?.toLocaleString()}</p>
                                        </div>

                                        <div className="mt-4 space-y-4">
                                            <div className="flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-widest">
                                                <p>Size: <span className="text-text-muted font-medium">{item.size}</span></p>
                                                {item.color && item.color !== "N/A" && (
                                                    <p>Color: <span className="text-text-muted font-medium">{item.color}</span></p>
                                                )}
                                                {item.customizations?.printingMethod && (
                                                    <p className="text-accent flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">print</span>
                                                        {item.customizations.printingMethod.label}
                                                    </p>
                                                )}
                                            </div>

                                            {item.customizations?.previews && (
                                                <div className="flex gap-2 mt-2">
                                                    {['front', 'back'].map(side => (
                                                        item.customizations.previews[side] && (
                                                            <div
                                                                key={side}
                                                                className="w-12 h-16 rounded-md border border-text-primary/10 bg-secondary p-1 group/thumb relative transition-transform hover:scale-105 overflow-hidden cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedItemForPreview(item);
                                                                    setPreviewSide(side);
                                                                }}
                                                            >
                                                                <img
                                                                    src={item.customizations.previews[side]}
                                                                    className="w-full h-full object-contain"
                                                                    alt={side}
                                                                />
                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                                                    <span className="text-[6px] text-white font-black uppercase">{side}</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] font-black uppercase tracking-widest">Quantity:</span>
                                                <div className="flex items-center border border-text-primary/10 rounded-lg overflow-hidden bg-background">
                                                    <button
                                                        onClick={() => updateQty(item.id, item.variantId, item.qty - 1)}
                                                        className="px-3 py-1 hover:bg-text-primary/5 transition-colors border-r border-text-primary/10 disabled:opacity-30"
                                                        disabled={item.qty <= 1}
                                                    >-</button>
                                                    <span className="px-5 py-1 text-xs font-bold w-12 text-center text-text-primary">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.id, item.variantId, item.qty + 1)}
                                                        className="px-3 py-1 hover:bg-text-primary/10 transition-colors border-l border-text-primary/10"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 flex gap-6">
                                            <button
                                                onClick={() => removeItem(item.cartItemId)}
                                                className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-danger flex items-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span> Remove
                                            </button>
                                            <button className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-sm">favorite</span> Save for Later
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:w-[400px]">
                            <div className="sticky top-32 bg-secondary border border-text-primary/5 p-8 rounded-2xl shadow-sm">
                                <h3 className="text-2xl font-primary uppercase tracking-tight mb-8">Order Summary</h3>

                                <div className="mb-8">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-3">Promo Code</label>
                                    {!appliedCoupon ? (
                                        <>
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-background border-text-primary/10 rounded-xl py-3 px-4 text-xs text-text-primary focus:ring-accent focus:border-accent outline-none"
                                                    placeholder="Enter code"
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value)}
                                                />
                                                <button 
                                                    onClick={handleApplyPromo}
                                                    disabled={isApplying}
                                                    className="px-6 py-3 bg-text-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent hover:text-primary transition-all disabled:opacity-50"
                                                >
                                                    {isApplying ? "..." : "Apply"}
                                                </button>
                                            </div>
                                            {error && <p className="text-[9px] text-danger font-bold uppercase mt-2 tracking-widest">{error}</p>}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between bg-text-primary/5 p-4 rounded-xl border border-text-primary/10">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">local_offer</span>
                                                    {appliedCoupon.code}
                                                </p>
                                                <p className="text-[8px] text-text-muted font-bold uppercase tracking-[0.2em] mt-0.5">Applied Successfully</p>
                                            </div>
                                            <button 
                                                onClick={removeCoupon}
                                                className="text-text-secondary hover:text-danger transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-text-primary/10">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Subtotal</span>
                                        <span className="text-text-primary">₹{(subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    {autoDiscountAmount > 0 && (
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-green-500">
                                            <span>{autoDiscountLabel || 'Auto Discount'}</span>
                                            <span>-₹{(autoDiscountAmount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-blue-400">
                                            <span>Coupon: {appliedCoupon.code}</span>
                                            <span>-₹{(couponDiscountAmount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {buyXGetYDiscount > 0 && (
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-accent">
                                            <span>BOGO Offer</span>
                                            <span>-₹{(buyXGetYDiscount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Shipping</span>
                                        <span className={shippingCost === 0 ? "text-accent-contrast" : "text-text-primary"}>
                                            {shippingCost === 0 ? "FREE" : `₹${shippingCost.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Estimated Tax (8%)</span>
                                        <span className="text-text-primary">₹{(estimatedTax || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="pt-6 border-t border-text-primary/10 flex justify-between items-end">
                                        <span className="text-lg font-primary uppercase tracking-tighter">Total</span>
                                        <span className="text-3xl font-primary uppercase tracking-tight text-text-primary">₹{(total || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link
                                    to="/checkout"
                                    className="block text-center w-full mt-10 h-16 bg-text-primary text-primary text-[12px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-primary transition-all rounded-xl shadow-xl shadow-primary/10 flex items-center justify-center no-underline"
                                >
                                    Proceed to Checkout
                                </Link>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center gap-3 text-text-muted">
                                        <span className="material-symbols-outlined text-lg">local_shipping</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Free Express Shipping on orders over ₹5,000</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-text-muted">
                                        <span className="material-symbols-outlined text-lg">workspace_premium</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">30-Day Premium Returns Guarantee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Bottom Fixed Bar */}
            {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 w-full z-[60] animate-slideUp">
                    <div className="bg-background border-t border-text-primary/5 p-6 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Amount</p>
                            <span className="text-2xl font-primary text-text-primary tracking-tighter">₹{total.toLocaleString()}</span>
                        </div>
                        <Link
                            to="/checkout"
                            className="h-14 px-8 bg-text-primary text-primary text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center rounded-xl active:scale-95 transition-all no-underline"
                        >
                            Checkout
                        </Link>
                    </div>
                </div>
            )}

            {/* FULL SCREEN PREVIEW MODAL */}
            <AnimatePresence>
                {selectedItemForPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-12"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedItemForPreview(null)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-text-primary/10 hover:bg-text-primary/20 flex items-center justify-center text-text-primary transition-all z-20 group"
                        >
                            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
                        </button>

                        {/* Side Toggle */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex bg-text-primary/5 backdrop-blur-md rounded-full p-2 border border-text-primary/10">
                            {['front', 'back'].map(side => (
                                <button
                                    key={side}
                                    onClick={() => setPreviewSide(side)}
                                    className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${previewSide === side ? 'bg-text-primary text-primary shadow-2xl' : 'text-text-primary/40 hover:text-text-primary'}`}
                                >
                                    {side}
                                </button>
                            ))}
                        </div>

                        {/* Design Display */}
                        <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
                            <motion.div
                                key={previewSide}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                {selectedItemForPreview.customizations?.previews?.[previewSide] ? (
                                    <img
                                        src={selectedItemForPreview.customizations.previews[previewSide]}
                                        className="max-w-full max-h-full object-contain rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-text-primary/5"
                                        alt={`${previewSide} view`}
                                    />
                                ) : (
                                    <div className="text-center text-text-primary/10">
                                        <span className="material-symbols-outlined text-8xl mb-6">image_not_supported</span>
                                        <p className="text-xs uppercase font-black tracking-[0.5em]">Design state not available</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Info Header */}
                        <div className="absolute top-10 left-10 text-left">
                            <p className="text-accent text-[9px] font-black uppercase tracking-[0.5em] mb-2">Item Inspection</p>
                            <h3 className="text-text-primary font-primary uppercase tracking-tighter text-3xl leading-none">{selectedItemForPreview.title}</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
