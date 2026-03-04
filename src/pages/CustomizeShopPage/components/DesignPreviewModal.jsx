import { useState, useEffect } from "react";
import { useFabric } from "../../../context/FabricContext";
import { useCart } from "../../../context/CartContext";
import { FiX, FiCheck, FiDownload, FiShoppingCart, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "fabric";

export default function DesignPreviewModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [previews, setPreviews] = useState({ front: null, back: null });
    const [currentSide, setCurrentSide] = useState("front");
    const [loading, setLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        fabricCanvas,
        frontDesignRef,
        backDesignRef,
        productDataRef,
        viewSideRef,
        printingType,
        setPrintingType,
        customizationPrice,
        pricingSettings,
        printingMethods,
        uploadedAssetsMetadataRef,
        initialVariantIdRef,
        initialSizeRef,
        initialColorRef
    } = useFabric();

    const { addToCart } = useCart();

    useEffect(() => {
        const handleOpen = async () => {
            setLoading(true);
            setIsOpen(true);
            setCurrentSide(viewSideRef.current || "front");

            try {
                // 🚀 EXTRA SAFE: Save current active design to ref before generating
                const mainCanvas = fabricCanvas.current;
                if (mainCanvas) {
                    const json = mainCanvas.toJSON();
                    if (viewSideRef.current === "front") {
                        frontDesignRef.current = json;
                    } else {
                        backDesignRef.current = json;
                    }
                }

                const results = await generateFullPreviews();
                setPreviews(results);
            } catch (err) {
                console.error("Preview Generation Error:", err);
            } finally {
                setLoading(false);
            }
        };

        window.addEventListener('open-design-preview', handleOpen);
        return () => window.removeEventListener('open-design-preview', handleOpen);
    }, [fabricCanvas]);

    const generateFullPreviews = async () => {
        const mainCanvas = fabricCanvas.current;
        if (!mainCanvas || !productDataRef.current) return { front: null, back: null, thumbnails: { front: null, back: null }, printFiles: { front: null, back: null } };

        const { addBaseImage } = await import("../fabric/baseImage");
        const results = { front: null, back: null };
        const thumbnails = { front: null, back: null };
        const printFiles = { front: null, back: null };
        const activeSide = viewSideRef.current;

        // --- 1. CAPTURE ACTIVE SIDE ---
        const activeObjects = mainCanvas.getObjects();
        const activePrintArea = activeObjects.find(o => o.excludeFromExport && o.type === 'rect');
        const activeBaseImg = activeObjects.find(o => o.excludeFromExport && o.type === 'image');

        // A. Capture Mockup (with shirt, no stroke)
        if (activePrintArea) activePrintArea.set({ stroke: 'transparent' });
        results[activeSide] = mainCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2.5 });
        thumbnails[activeSide] = mainCanvas.toDataURL({ format: 'jpeg', quality: 0.8, multiplier: 0.6 });

        // B. Capture Print File (no shirt, high-res)
        if (activeBaseImg) activeBaseImg.set({ visible: false });
        printFiles[activeSide] = mainCanvas.toDataURL({ format: 'png', multiplier: 2.5 });
        if (activeBaseImg) activeBaseImg.set({ visible: true });

        if (activePrintArea) activePrintArea.set({ stroke: 'rgba(0,0,0,0.3)' });
        mainCanvas.requestRenderAll();

        // --- 2. CAPTURE BACKGROUND SIDE ---
        for (const side of ['front', 'back']) {
            if (side === activeSide) continue;

            const sideDesignJSON = side === 'front' ? frontDesignRef.current : backDesignRef.current;
            if (sideDesignJSON) {
                const hiddenEl = document.createElement('canvas');
                hiddenEl.width = 450;
                hiddenEl.height = 500;
                const hiddenCanvas = new Canvas(hiddenEl, { skipOffscreen: true });

                await hiddenCanvas.loadFromJSON(sideDesignJSON);

                // Capture Print File first (Design only)
                printFiles[side] = hiddenCanvas.toDataURL({ format: 'png', multiplier: 2.5 });

                // Add Base Image for Mockup
                const baseURL = side === 'front' ? productDataRef.current.frontImage : productDataRef.current.backImage;
                await addBaseImage(hiddenCanvas, baseURL);

                const baseImg = hiddenCanvas.getObjects().find(o => o.excludeFromExport && o.type === 'image');
                if (baseImg) hiddenCanvas.sendObjectToBack(baseImg);

                const sPrintArea = hiddenCanvas.getObjects().find(o => o.excludeFromExport && o.type === 'rect');
                if (sPrintArea) sPrintArea.set({ stroke: 'transparent' });

                results[side] = hiddenCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2.5 });
                thumbnails[side] = hiddenCanvas.toDataURL({ format: 'jpeg', quality: 0.8, multiplier: 0.6 });

                hiddenCanvas.dispose();
            }
        }

        return { ...results, thumbnails, printFiles };
    };

    const currentType = printingMethods?.find(t => t.id === printingType);
    const garmentBasePrice = productDataRef.current?.price || 1700;
    const grandTotal = garmentBasePrice + customizationPrice;

    const generateTechnicalReport = () => {
        const report = [];
        const metadataMap = uploadedAssetsMetadataRef.current || {};

        const scanDesign = (design) => {
            if (!design || !design.objects) return;
            design.objects.forEach(obj => {
                const assetKey = obj.src || obj.id;
                if (assetKey) {
                    const meta = metadataMap[assetKey] || {
                        name: obj.type === 'textbox' ? 'Text Element' : 'Library Graphic',
                        width: 5000,
                        height: 5000,
                        fileSize: 0,
                        hasAlpha: true
                    };


                    // 💰 Calculate individual element price
                    const elementPrice = obj.type === 'textbox'
                        ? (pricingSettings?.textPricePerElement || 20)
                        : (Number(obj.price) || 0);

                    report.push({
                        ...meta,
                        price: elementPrice,
                        canvasWidth: (obj.width * (obj.scaleX || 1)).toFixed(0),
                        canvasHeight: (obj.height * (obj.scaleY || 1)).toFixed(0),
                    });
                }
            });
        };

        scanDesign(frontDesignRef.current);
        scanDesign(backDesignRef.current);
        return report;
    };

    const handleAddToBag = async () => {
        if (!productDataRef.current) {
            console.error("❌ Add to Bag failed: productDataRef.current is empty");
            alert("Product data is missing. Please refresh the page.");
            return;
        }

        console.log("🛒 Preparing Add to Bag:", {
            product: productDataRef.current,
            printing: currentType
        });

        setAddingToCart(true);
        try {
            const customizations = {
                frontDesign: frontDesignRef.current,
                backDesign: backDesignRef.current,
                previews: previews, // Using full res mockups for cart/admin list (formerly thumbnails)
                printFiles: previews.printFiles, // high-res for printing
                printingMethod: currentType,
                technicalReport: generateTechnicalReport()
            };

            // Find a default variant if none selected
            // ✅ USE PRESERVED SELECTION IF AVAILABLE
            const product = productDataRef.current;
            const finalVariantId = initialVariantIdRef.current || (product.variants?.length > 0 ? (product.variants[0].sku || product.variants[0]._id) : null);
            const finalSize = initialSizeRef.current || (product.variants?.length > 0 ? product.variants[0].size?.name : "N/A");
            const finalColor = initialColorRef.current || (product.variants?.length > 0 ? product.variants[0].color?.name : "N/A");

            if (!finalVariantId) {
                console.error("❌ No variant found to add to bag");
                return;
            }

            console.log("🆔 Resolved IDs:", { productId: product._id, variantId: finalVariantId });

            await addToCart(product, {
                variantId: finalVariantId,
                size: finalSize,
                color: finalColor
            }, customizations);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setIsOpen(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to add to bag:", err);
            const errorMsg = err.stack || err.message || "";
            if (errorMsg.includes("PayloadTooLargeError") || errorMsg.includes("too large")) {
                alert("The design is too large to save! 📦 Please ensure your backend has a sufficient payload limit (e.g., 10mb).");
            } else if (errorMsg.includes("Technical Error")) {
                alert(err.message);
            } else {
                alert("Failed to add to bag. Please try again.");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-6xl h-[90vh] md:h-[85vh] bg-[#0a0a0a] rounded-[2rem] md:rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
                {/* Left: Preview Content */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
                    {/* Preview Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4c4b1]">Final Review</span>
                            <div className="flex bg-white/5 rounded-full p-1">
                                {['front', 'back'].map(side => (
                                    <button
                                        key={side}
                                        onClick={() => setCurrentSide(side)}
                                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${currentSide === side ? 'bg-[#d4c4b1] text-black shadow-lg shadow-[#d4c4b1]/20' : 'text-white/40 hover:text-white'}`}
                                    >
                                        {side}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="flex-1 relative flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent overflow-hidden">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="w-12 h-12 border-2 border-[#d4c4b1]/20 border-t-[#d4c4b1] rounded-full animate-spin" />
                                    <span className="text-[10px] text-[#d4c4b1] font-black uppercase tracking-widest">Generating Render...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={currentSide}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    {previews[currentSide] ? (
                                        <img
                                            src={previews[currentSide]}
                                            alt="Design Preview"
                                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-3xl border border-white/5 max-w-sm">
                                            <FiX size={24} className="text-white/20 mb-4" />
                                            <p className="text-[9px] text-white/40 uppercase tracking-widest">No design found for {currentSide} side</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Checkout Sidebar */}
                <div className="w-full md:w-[400px] flex flex-col bg-black/60 relative">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95 z-20"
                    >
                        <FiX size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-8 pt-20 custom-scrollbar">
                        <div className="mb-8">
                            <h3 className="text-xl font-impact uppercase tracking-tight text-[#d4c4b1] mb-2">Final Step</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Select your preferred printing method</p>
                        </div>

                        <div className="space-y-4 mb-12">
                            {printingMethods?.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setPrintingType(type.id)}
                                    className={`w-full group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 overflow-hidden ${printingType === type.id
                                        ? "border-[#d4c4b1] bg-[#d4c4b1]/5 shadow-[0_0_30px_rgba(212,196,177,0.1)]"
                                        : "border-white/5 bg-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <div className="relative z-10 text-left">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${printingType === type.id ? "text-[#d4c4b1]" : "text-white/60"}`}>
                                                {type.label}
                                            </span>
                                            {printingType === type.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#d4c4b1] animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-[9px] text-white/20 uppercase tracking-wider">{type.description}</p>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <span className={`text-xs font-black uppercase tracking-widest ${printingType === type.id ? "text-[#d4c4b1]" : "text-white/20"}`}>
                                            +₹{type.price}
                                        </span>
                                    </div>

                                    {printingType === type.id && (
                                        <motion.div
                                            layoutId="active-bg"
                                            className="absolute inset-0 bg-gradient-to-r from-[#d4c4b1]/10 to-transparent"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                <span className="text-white/40">Garment Base</span>
                                <span className="text-white">₹{garmentBasePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                <span className="text-white/40">Customization</span>
                                <span className="text-white">₹{customizationPrice.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-white/5 my-2" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#d4c4b1]">Total Amount</span>
                                <span className="text-3xl font-impact text-[#d4c4b1] tracking-tight">₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-white/5 bg-black/40">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-14 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleAddToBag}
                                disabled={addingToCart || success}
                                className={`h-14 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 px-6 ${success
                                    ? "bg-green-500 text-white shadow-green-500/20"
                                    : "bg-white text-black hover:bg-[#d4c4b1] shadow-white/5"
                                    } disabled:opacity-50`}
                            >
                                {addingToCart ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        Adding...
                                    </>
                                ) : success ? (
                                    <>
                                        <FiCheck />
                                        Added to Bag
                                    </>
                                ) : (
                                    <>
                                        <FiShoppingCart />
                                        Add to Bag
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
