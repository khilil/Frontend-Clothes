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
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
 
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
        <div className="bg-background min-h-screen font-secondary text-text-primary selection:bg-accent selection:text-primary pb-32 lg:pb-0">
            {/* Header Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-32">
                {/* Progress Stepper */}
                <div className="flex items-center justify-center mb-10 md:mb-16 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 md:gap-4 group">
                        <div className="w-6 h-6 md:hidden rounded-full bg-text-primary text-primary flex items-center justify-center text-[10px] font-black">1</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Cart</span>
                        <div className="w-8 md:w-16 h-[2px] bg-text-primary"></div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 text-text-muted">
                        <div className="w-6 h-6 md:hidden rounded-full border border-border-subtle flex items-center justify-center text-[10px] font-black text-text-muted">2</div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Ship</span>
                        <div className="w-8 md:w-16 h-[2px] bg-border-subtle"></div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 text-text-muted">
                        <div className="w-6 h-6 md:hidden rounded-full border border-border-subtle flex items-center justify-center text-[10px] font-black text-text-muted">3</div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Pay</span>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-20 md:py-32 space-y-10">
                        <div className="relative inline-block">
                            <motion.div 
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mx-auto border border-border-subtle shadow-xl ring-1 ring-text-primary/5"
                            >
                                <span className="material-symbols-outlined text-5xl text-text-muted">shopping_bag</span>
                            </motion.div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full border-4 border-background flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xs font-bold">close</span>
                            </div>
                        </div>
                        <div className="max-w-md mx-auto">
                            <h2 className="text-3xl md:text-5xl font-primary uppercase tracking-tighter leading-none mb-4">Your Bag is Empty</h2>
                            <p className="text-text-muted uppercase tracking-[0.2em] text-[10px] font-black px-8">Elevate your style with our latest premium drop.</p>
                        </div>
                        <Link to="/" className="inline-flex items-center gap-4 px-10 py-5 bg-text-primary text-primary text-[11px] font-black uppercase tracking-[0.4em] hover:bg-accent hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500 rounded-2xl group active:scale-95">
                            Start Exploration
                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-8">
                            <h1 className="text-2xl md:text-3xl font-primary uppercase tracking-tight mb-8">Your Bag ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})</h1>

                            {cart.map((item) => (
                                <div key={item.cartItemId} className="flex flex-row md:flex-row gap-5 md:gap-8 py-6 md:py-8 border-b border-text-primary/5 last:border-0 group">
                                    <div
                                        className="w-24 md:w-40 aspect-[3/4] bg-secondary rounded-2xl overflow-hidden flex-shrink-0 relative cursor-zoom-in group shadow-sm border border-border-subtle/50"
                                        onClick={() => {
                                            if (item.customizations?.displayPreviews || item.customizations?.previews) {
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
                                        {(item.customizations?.displayPreviews || item.customizations?.previews) && (
                                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="material-symbols-outlined text-text-primary text-2xl">zoom_in</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0">
                                                <h3 className="text-sm md:text-lg font-primary uppercase tracking-wider md:tracking-widest truncate">{item.title}</h3>
                                                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Ref: {item.variantId?.slice(-8).toUpperCase() || "MM-OX-001"}</p>
                                            </div>
                                            <p className="text-sm md:text-xl font-primary whitespace-nowrap">₹{item.price?.toLocaleString()}</p>
                                        </div>

                                        <div className="mt-3 md:mt-4 space-y-3 md:space-y-4">
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-text-primary/80">
                                                <p>Size: <span className="text-text-muted font-bold">{item.size}</span></p>
                                                {item.color && item.color !== "N/A" && (
                                                    <p>Color: <span className="text-text-muted font-bold">{item.color}</span></p>
                                                )}
                                                {item.customizations?.printingMethod && (
                                                    <p className="text-accent flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">print</span>
                                                        {item.customizations.printingMethod.label}
                                                    </p>
                                                )}
                                            </div>

                                            {(item.customizations?.displayPreviews || item.customizations?.previews) && (
                                                <div className="flex gap-1.5 md:gap-2">
                                                    {['front', 'back'].map(side => (
                                                        (item.customizations?.displayPreviews?.[side] || item.customizations?.previews?.[side]) && (
                                                            <div
                                                                key={side}
                                                                className="w-8 h-10 md:w-12 md:h-16 rounded-lg border border-border-subtle/50 bg-background p-0.5 group/thumb relative transition-transform hover:scale-105 overflow-hidden cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedItemForPreview(item);
                                                                    setPreviewSide(side);
                                                                }}
                                                            >
                                                                <img
                                                                    src={item.customizations?.displayPreviews?.[side] || item.customizations?.previews?.[side]}
                                                                    className="w-full h-full object-contain"
                                                                    alt={side}
                                                                />
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-1">
                                                <div className="flex items-center bg-secondary rounded-full p-1 border border-border-subtle/50 shadow-inner">
                                                    <button
                                                        onClick={() => updateQty(item.id, item.variantId, item.qty - 1)}
                                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-background transition-all active:scale-90 disabled:opacity-20"
                                                        disabled={item.qty <= 1}
                                                    >
                                                        <span className="material-symbols-outlined text-base md:text-lg">remove</span>
                                                    </button>
                                                    <span className="w-8 md:w-10 text-center text-xs md:text-sm font-black text-text-primary">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.id, item.variantId, item.qty + 1)}
                                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-background transition-all active:scale-90"
                                                    >
                                                        <span className="material-symbols-outlined text-base md:text-lg">add</span>
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.cartItemId)}
                                                    className="w-10 h-10 md:w-auto md:h-auto rounded-full md:rounded-none flex items-center justify-center md:justify-start text-text-muted hover:text-danger transition-colors group/del"
                                                >
                                                    <span className="material-symbols-outlined text-lg md:text-sm">delete</span>
                                                    <span className="hidden md:inline ml-1 text-[9px] font-black uppercase tracking-widest">Remove</span>
                                                </button>
                                            </div>
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
                                    className="block text-center w-full mt-10 h-16 bg-text-primary text-primary text-[12px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-primary transition-all rounded-xl shadow-xl shadow-primary/10 flex items-center justify-center gap-3 no-underline group"
                                >
                                    PROCEED TO CHECKOUT
                                    <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">shield_with_heart</span>
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
                <>
                    {/* Summary Drawer */}
                    <AnimatePresence>
                        {isSummaryOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsSummaryOpen(false)}
                                    className="fixed inset-0 bg-text-primary/60 backdrop-blur-md z-[55] lg:hidden"
                                />
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed bottom-0 left-0 w-full bg-background z-[56] lg:hidden rounded-t-[2.5rem] border-t border-border-subtle p-8 overflow-hidden"
                                >
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-border-subtle rounded-full" />
                                    
                                    <h3 className="text-xl font-primary uppercase tracking-tight mb-8 mt-2">Bag Summary</h3>

                                    <div className="space-y-5">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-muted">
                                            <span>Subtotal ({cart.length} items)</span>
                                            <span className="text-text-primary">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        {totalDiscount > 0 && (
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-accent">
                                                <span>Savings</span>
                                                <span>-₹{totalDiscount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-muted">
                                            <span>Shipping</span>
                                            <span className={shippingCost === 0 ? "text-accent-contrast" : "text-text-primary"}>
                                                {shippingCost === 0 ? "FREE" : `₹${shippingCost.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-muted pb-6 border-b border-border-subtle/50">
                                            <span>Tax</span>
                                            <span className="text-text-primary">₹{estimatedTax.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-2">
                                            <span className="text-lg font-primary uppercase tracking-tighter">Total Price</span>
                                            <span className="text-3xl font-primary text-text-primary tracking-tight">₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center gap-3 text-text-muted">
                                            <span className="material-symbols-outlined text-lg">verified</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Premium Authenticity Guaranteed</span>
                                        </div>
                                    </div>
                                    <div className="h-24" /> {/* Spacer for sticky button */}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <div className="lg:hidden fixed bottom-0 left-0 w-full z-[60] animate-slideUp">
                        <div className="bg-background-alt/90 backdrop-blur-xl border-t border-border-subtle p-5 flex justify-between items-center shadow-[0_-20px_40px_rgba(0,0,0,0.15)] ring-1 ring-text-primary/5">
                            <button 
                                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                                className="flex flex-col items-start active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-1 group">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total</p>
                                    <span className={`material-symbols-outlined text-xs text-text-muted transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`}>expand_less</span>
                                </div>
                                <span className="text-xl md:text-2xl font-primary text-text-primary tracking-tighter leading-none">₹{total.toLocaleString()}</span>
                            </button>
                            <Link
                                to="/checkout"
                                className="h-14 px-10 bg-text-primary text-primary text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center rounded-2xl active:scale-95 transition-all shadow-xl shadow-text-primary/20 no-underline"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                </>
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
                                {(selectedItemForPreview.customizations?.displayPreviews?.[previewSide] || selectedItemForPreview.customizations?.previews?.[previewSide]) ? (
                                    <img
                                        src={selectedItemForPreview.customizations?.displayPreviews?.[previewSide] || selectedItemForPreview.customizations?.previews?.[previewSide]}
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
