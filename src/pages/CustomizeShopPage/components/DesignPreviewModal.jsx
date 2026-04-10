import { useState, useEffect } from "react";
import { useFabric } from "../../../context/FabricContext";
import { useCart } from "../../../context/CartContext";
import { FiX, FiCheck, FiDownload, FiShoppingCart, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "fabric";

export default function DesignPreviewModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [previews, setPreviews] = useState({ front: null, back: null });
    const [currentSide, setCurrentSide] = useState("front");
    const [loading, setLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

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
                    const json = mainCanvas.toJSON(['id', 'price', 'excludeFromExport', 'isBaseImage']); // 🎯 Preserve metadata
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

    const getDesignOnlyJSON = (designJSON) => {
        if (!designJSON) return null;

        return {
            ...designJSON,
            objects: (designJSON.objects || []).filter((obj) => !obj.excludeFromExport)
        };
    };

    const renderSideAssets = async (side, designJSON, productData) => {
        const hiddenEl = document.createElement("canvas");
        hiddenEl.width = 500;
        hiddenEl.height = 600;

        const hiddenCanvas = new Canvas(hiddenEl, {
            width: 500,
            height: 600,
            skipOffscreen: true,
            backgroundColor: null
        });

        const designOnlyJSON = getDesignOnlyJSON(designJSON) || { objects: [] };
        await hiddenCanvas.loadFromJSON(designOnlyJSON);
        hiddenCanvas.renderAll();

        const printFile = hiddenCanvas.toDataURL({
            format: "png",
            multiplier: 4.5
        });

        const { addBaseImage } = await import("../fabric/baseImage");
        const baseURL = side === "front" ? productData.frontImage : productData.backImage;

        if (baseURL) {
            const baseImg = await addBaseImage(hiddenCanvas, baseURL);
            if (baseImg) {
                baseImg.set({ opacity: 1, visible: true });
                hiddenCanvas.sendObjectToBack(baseImg);
            }
            hiddenCanvas.renderAll();
        }

        const mockup = hiddenCanvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 4.5
        });

        const thumbnail = hiddenCanvas.toDataURL({
            format: "jpeg",
            quality: 0.8,
            multiplier: 0.6
        });

        hiddenCanvas.dispose();

        return { mockup, thumbnail, printFile };
    };

    const generateFullPreviews = async () => {
        const mainCanvas = fabricCanvas.current;
        if (!mainCanvas || !productDataRef.current) {
            return {
                front: null,
                back: null,
                thumbnails: { front: null, back: null },
                printFiles: { front: null, back: null }
            };
        }

        const results = { front: null, back: null };
        const thumbnails = { front: null, back: null };
        const printFiles = { front: null, back: null };
        const activeSide = viewSideRef.current;

        const currentCanvasJSON = mainCanvas.toJSON([
            "id",
            "price",
            "excludeFromExport",
            "isBaseImage"
        ]);

        if (activeSide === "front") {
            frontDesignRef.current = currentCanvasJSON;
        } else {
            backDesignRef.current = currentCanvasJSON;
        }

        for (const side of ["front", "back"]) {
            const sideDesignJSON = side === "front" ? frontDesignRef.current : backDesignRef.current;
            const rendered = await renderSideAssets(side, sideDesignJSON, productDataRef.current);

            results[side] = rendered.mockup;
            thumbnails[side] = rendered.thumbnail;
            printFiles[side] = rendered.printFile;
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
                navigate("/"); // Redirect to home page
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
                className="absolute inset-0 bg-[#f4f2ee]/90 backdrop-blur-xl"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-6xl h-[90vh] md:h-[85vh] bg-[#fcfbf9] rounded-[2rem] md:rounded-[2.5rem] border border-black/5 overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.1)]"
            >
                {/* Left: Preview Content */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-black/5">
                    {/* Preview Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white/40">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0A0A0A]">Final Review</span>
                            <div className="flex bg-black/5 rounded-full p-1">
                                {['front', 'back'].map(side => (
                                    <button
                                        key={side}
                                        onClick={() => setCurrentSide(side)}
                                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${currentSide === side ? 'bg-[#0A0A0A] text-white shadow-lg' : 'text-[#4A4A4A] hover:text-[#0A0A0A]'}`}
                                    >
                                        {side}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="flex-1 relative flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/[0.02] to-transparent overflow-hidden">
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
                                    {previews?.[currentSide] ? (
                                        <img
                                            src={previews[currentSide]}
                                            alt={`${currentSide} design preview`}
                                            className="max-w-full max-h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                                        />
                                    ) : (
                                        <div className="text-[8px] text-black/10 font-bold uppercase tracking-widest">
                                            Awaiting Render...
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Checkout Sidebar */}
                <div className="w-full md:w-[400px] flex flex-col bg-white/60 relative">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-black transition-all active:scale-95 z-20"
                    >
                        <FiX size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-8 pt-20 custom-scrollbar">
                        <div className="mb-8 font-primary">
                            <h3 className="text-xl font-impact uppercase tracking-tight text-[#0A0A0A] mb-2">Final Step</h3>
                            <p className="text-[10px] text-[#4A4A4A] uppercase tracking-[0.2em] font-black">Select your preferred printing method</p>
                        </div>

                        <div className="space-y-4 mb-12">
                            {printingMethods?.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setPrintingType(type.id)}
                                    className={`w-full group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 overflow-hidden ${printingType === type.id
                                        ? "border-[#d4c4b1] bg-[#d4c4b1]/5 shadow-[0_0_30px_rgba(212,196,177,0.05)]"
                                        : "border-black/5 bg-white hover:border-black/20"
                                        }`}
                                >
                                    <div className="relative z-10 text-left">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${printingType === type.id ? "text-[#0A0A0A]" : "text-[#4A4A4A]"}`}>
                                                {type.label}
                                            </span>
                                            {printingType === type.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#d4c4b1] animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-[9px] text-[#4A4A4A] uppercase tracking-wider font-bold">{type.description}</p>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <span className={`text-xs font-black uppercase tracking-widest ${printingType === type.id ? "text-[#8b7e6d]" : "text-black/20"}`}>
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
                        <div className="space-y-4 p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
                            <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
                                <span className="text-[#4A4A4A]">Garment Base</span>
                                <span className="text-[#0A0A0A] font-bold">₹{garmentBasePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
                                <span className="text-[#4A4A4A]">Customization</span>
                                <span className="text-[#0A0A0A] font-bold">₹{customizationPrice.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-black/5 my-2" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">Total Amount</span>
                                <span className="text-3xl font-impact text-[#0A0A0A] tracking-tight">₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-black/5 bg-white/40">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-14 rounded-xl border border-black/10 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black hover:bg-black/5 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleAddToBag}
                                disabled={addingToCart || success}
                                className={`h-14 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 px-6 ${success
                                    ? "bg-green-500 text-white shadow-green-500/20"
                                    : "bg-black text-white hover:bg-[#8b7e6d] shadow-black/5"
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
