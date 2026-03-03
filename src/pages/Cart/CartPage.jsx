import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
    const { cart, updateQty, removeItem, isLoading } = useCart();
    const [selectedItemForPreview, setSelectedItemForPreview] = useState(null);
    const [previewSide, setPreviewSide] = useState("front");

    const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 0), 0);
    const estimatedTax = subtotal * 0.08; // Example 8% tax
    const total = subtotal + estimatedTax;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-pulse font-[Oswald] tracking-widest uppercase text-black text-2xl">Loading Bag…</div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans text-black selection:bg-[#d4c4b1] selection:text-black">
            {/* Header Area - Since the main layout might have its own header, we match the style */}
            <header className="bg-black text-white h-20 flex items-center border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex justify-between items-center text-white">
                    <Link to="/" className="text-xl md:text-3xl font-[Oswald] tracking-tighter uppercase no-underline text-white">MODERN MEN</Link>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                        <span className="material-symbols-outlined text-[#d4c4b1] text-lg">shopping_bag</span>
                        <span className="hidden sm:inline">Shopping Cart ({cart.length})</span>
                        <span className="sm:hidden">Cart ({cart.length})</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                {/* Progress Stepper */}
                <div className="hidden md:flex items-center justify-center mb-16 max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 group">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black">Cart</span>
                        <div className="w-12 md:w-16 h-[2px] bg-black"></div>
                    </div>
                    <div className="flex items-center gap-4 px-4 opacity-30">
                        <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
                        <div className="w-12 md:w-16 h-[2px] bg-gray-200"></div>
                    </div>
                    <div className="flex items-center gap-4 px-4 opacity-30">
                        <span className="text-[10px] font-black uppercase tracking-widest">Payment</span>
                        <div className="w-12 md:w-16 h-[2px] bg-gray-200"></div>
                    </div>
                    <div className="flex items-center gap-4 opacity-30">
                        <span className="text-[10px] font-black uppercase tracking-widest">Done</span>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-32 space-y-8">
                        <h2 className="text-4xl font-[Oswald] uppercase tracking-tighter">Your Bag is Empty</h2>
                        <p className="text-gray-500 uppercase tracking-widest text-[11px] font-bold">Start exploring our premium collection</p>
                        <Link to="/" className="inline-block px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#d4c4b1] hover:text-black transition-all duration-500 rounded-xl">
                            Continue Exploration
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-8">
                            <h1 className="text-2xl md:text-3xl font-[Oswald] uppercase tracking-tight mb-8">Your Bag ({cart.length} Items)</h1>

                            {cart.map((item) => (
                                <div key={item.cartItemId} className="flex flex-col sm:flex-row gap-4 md:gap-8 py-8 border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors p-4 rounded-3xl group">
                                    <div
                                        className="w-full sm:w-40 aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 relative cursor-zoom-in group"
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
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-[Oswald] uppercase tracking-widest">{item.title}</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Ref: {item.variantId?.slice(-8).toUpperCase() || "MM-OX-001"}</p>
                                            </div>
                                            <p className="text-xl font-[Oswald]">₹{item.price?.toLocaleString()}</p>
                                        </div>

                                        <div className="mt-4 space-y-4">
                                            <div className="flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-widest">
                                                <p>Size: <span className="text-gray-400 font-medium">{item.size}</span></p>
                                                {item.color && item.color !== "N/A" && (
                                                    <p>Color: <span className="text-gray-400 font-medium">{item.color}</span></p>
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
                                                                className="w-12 h-16 rounded-md border border-gray-100 bg-gray-50 p-1 group/thumb relative transition-transform hover:scale-105 overflow-hidden cursor-pointer"
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
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                                                    <span className="text-[6px] text-white font-black uppercase">{side}</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] font-black uppercase tracking-widest">Quantity:</span>
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    <button
                                                        onClick={() => updateQty(item.id, item.variantId, item.qty - 1)}
                                                        className="px-3 py-1 hover:bg-gray-100 transition-colors border-r border-gray-200 disabled:opacity-30"
                                                        disabled={item.qty <= 1}
                                                    >-</button>
                                                    <span className="px-5 py-1 text-xs font-bold w-12 text-center">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.id, item.variantId, item.qty + 1)}
                                                        className="px-3 py-1 hover:bg-gray-100 transition-colors border-l border-gray-200"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 flex gap-6">
                                            <button
                                                onClick={() => removeItem(item.cartItemId)}
                                                className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-red-500 flex items-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span> Remove
                                            </button>
                                            <button className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-black flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-sm">favorite</span> Save for Later
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:w-[400px]">
                            <div className="sticky top-32 bg-gray-50 border border-gray-100 p-8 rounded-2xl shadow-sm">
                                <h3 className="text-2xl font-[Oswald] uppercase tracking-tight mb-8">Order Summary</h3>

                                <div className="mb-8">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Promo Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 border-gray-200 rounded-xl py-3 px-4 text-xs focus:ring-black focus:border-black outline-none"
                                            placeholder="Enter code"
                                            type="text"
                                        />
                                        <button className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#d4c4b1] hover:text-black transition-all">Apply</button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="text-black">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
                                        <span>Shipping</span>
                                        <span className="text-emerald-600">Calculated at next step</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
                                        <span>Estimated Tax</span>
                                        <span className="text-black">₹{estimatedTax.toLocaleString()}</span>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
                                        <span className="text-lg font-[Oswald] uppercase tracking-tighter">Total</span>
                                        <span className="text-3xl font-[Oswald] uppercase tracking-tight text-black">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link
                                    to="/checkout"
                                    className="block text-center w-full mt-10 h-16 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-[#d4c4b1] hover:text-black transition-all rounded-xl shadow-xl shadow-black/10 flex items-center justify-center no-underline"
                                >
                                    Proceed to Checkout
                                </Link>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <span className="material-symbols-outlined text-lg">local_shipping</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Free Express Shipping on orders over ₹5,000</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
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
                    <div className="bg-white border-t border-gray-100 p-6 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Amount</p>
                            <span className="text-2xl font-[Oswald] text-black tracking-tighter">₹{total.toLocaleString()}</span>
                        </div>
                        <Link
                            to="/checkout"
                            className="h-14 px-8 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center rounded-xl active:scale-95 transition-all no-underline"
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
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-12"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedItemForPreview(null)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-20 group"
                        >
                            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
                        </button>

                        {/* Side Toggle */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex bg-white/5 backdrop-blur-md rounded-full p-2 border border-white/10">
                            {['front', 'back'].map(side => (
                                <button
                                    key={side}
                                    onClick={() => setPreviewSide(side)}
                                    className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${previewSide === side ? 'bg-white text-black shadow-2xl' : 'text-white/40 hover:text-white'}`}
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
                                        className="max-w-full max-h-full object-contain rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5"
                                        alt={`${previewSide} view`}
                                    />
                                ) : (
                                    <div className="text-center text-white/10">
                                        <span className="material-symbols-outlined text-8xl mb-6">image_not_supported</span>
                                        <p className="text-xs uppercase font-black tracking-[0.5em]">Design state not available</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Info Header */}
                        <div className="absolute top-10 left-10 text-left">
                            <p className="text-[#d4c4b1] text-[9px] font-black uppercase tracking-[0.5em] mb-2">Item Inspection</p>
                            <h3 className="text-white font-[Oswald] uppercase tracking-tighter text-3xl leading-none">{selectedItemForPreview.title}</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
