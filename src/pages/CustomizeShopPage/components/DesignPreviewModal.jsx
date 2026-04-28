import { useState, useEffect, Suspense, useRef } from "react";
import { useFabric } from "../../../context/FabricContext";
import { useCart } from "../../../context/CartContext";
import { FiX, FiCheck, FiDownload, FiShoppingCart, FiLoader, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "fabric";
import { Canvas as ThreeCanvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import TShirtModel from "./3D/TShirtModel";

export default function DesignPreviewModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [previews, setPreviews] = useState({ front: null, back: null });
    const [currentSide, setCurrentSide] = useState("front");
    const [loading, setLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [success, setSuccess] = useState(false);
    const previewStageRef = useRef(null);
    const overlayImageRef = useRef(null);
    const navigate = useNavigate();
    const isMobilePreview = typeof window !== "undefined" && window.innerWidth < 768;

    const {
        fabricCanvas,
        wrapperRef,
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
        initialColorRef,
        garmentColor
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
        const editorCanvas = fabricCanvas.current;
        const editorWrapper = wrapperRef.current;
        const overlayWidth = Math.max(1, Math.round(editorWrapper?.clientWidth || editorCanvas?.getWidth?.() || 475));
        const overlayHeight = Math.max(1, Math.round(editorWrapper?.clientHeight || editorCanvas?.getHeight?.() || 420));

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

        const overlayEl = document.createElement("canvas");
        overlayEl.width = overlayWidth;
        overlayEl.height = overlayHeight;

        const overlayCanvas = new Canvas(overlayEl, {
            width: overlayWidth,
            height: overlayHeight,
            skipOffscreen: true,
            backgroundColor: null
        });

        await overlayCanvas.loadFromJSON(designOnlyJSON);
        if (editorCanvas?.viewportTransform) {
            overlayCanvas.setViewportTransform([...editorCanvas.viewportTransform]);
        } else if (editorCanvas?.getZoom) {
            overlayCanvas.setZoom(editorCanvas.getZoom());
        }
        overlayCanvas.renderAll();

        const overlayFile = overlayCanvas.toDataURL({
            format: "png",
            quality: 1
        });

        const previewFile = hiddenCanvas.toDataURL({
            format: "png",
            multiplier: 2
        });

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
        overlayCanvas.dispose();

        return { mockup, thumbnail, previewFile, printFile, overlayFile };
    };

    const generateFullPreviews = async () => {
        const mainCanvas = fabricCanvas.current;
        if (!mainCanvas || !productDataRef.current) {
            return {
                front: null,
                back: null,
                thumbnails: { front: null, back: null },
                previewFiles: { front: null, back: null },
                printFiles: { front: null, back: null },
                overlayFiles: { front: null, back: null }
            };
        }

        const results = { front: null, back: null };
        const thumbnails = { front: null, back: null };
        const previewFiles = { front: null, back: null };
        const printFiles = { front: null, back: null };
        const overlayFiles = { front: null, back: null };
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
            previewFiles[side] = rendered.previewFile;
            printFiles[side] = rendered.printFile;
            overlayFiles[side] = rendered.overlayFile;
        }

        return { ...results, thumbnails, previewFiles, printFiles, overlayFiles };
    };

    const currentType = printingMethods?.find(t => t.id === printingType);
    const garmentBasePrice = productDataRef.current?.price || 1700;
    const grandTotal = garmentBasePrice + customizationPrice;
    const getPreviewOverlaySrcForSide = (side) => (
        isMobilePreview
            ? (previews?.previewFiles?.[side] || previews?.overlayFiles?.[side] || previews?.printFiles?.[side])
            : (previews?.overlayFiles?.[side] || previews?.previewFiles?.[side] || previews?.printFiles?.[side])
    );
    const previewOverlaySrc = getPreviewOverlaySrcForSide(currentSide);

    const generateTechnicalReport = () => {
        const report = [];
        const metadataMap = uploadedAssetsMetadataRef.current || {};

        const scanDesign = (design, side) => {
            if (!design || !design.objects) return;
            design.objects.filter((obj) => !obj.excludeFromExport).forEach(obj => {
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
                        side: side.charAt(0).toUpperCase() + side.slice(1), // Capitalize Front/Back
                        price: elementPrice,
                        canvasWidth: (obj.width * (obj.scaleX || 1)).toFixed(0),
                        canvasHeight: (obj.height * (obj.scaleY || 1)).toFixed(0),
                    });
                }
            });
        };

        scanDesign(frontDesignRef.current, "front");
        scanDesign(backDesignRef.current, "back");
        return report;
    };

    const normalizeValue = (value) => String(value || "").trim().toLowerCase();

    const isVariantAvailable = (variant, product) => {
        if (!variant) return false;
        if (!product?.trackInventory) return true;
        if (variant.allowBackorder) return true;

        const stock = Number(variant.stock || 0);
        const reservedStock = Number(variant.reservedStock || 0);
        return stock - reservedStock > 0;
    };

    const getVariantIdentifier = (variant) =>
        variant?.sku || variant?._id || variant?.id || null;

    const resolveCartVariant = (product) => {
        const variants = product?.variants || [];
        if (!variants.length) return null;

        const desiredVariantId = normalizeValue(initialVariantIdRef.current);
        const desiredSize = normalizeValue(initialSizeRef.current);
        const desiredColor = normalizeValue(initialColorRef.current);

        const preferredVariant = variants.find((variant) =>
            [variant?.sku, variant?._id, variant?.id].some(
                (value) => normalizeValue(value) === desiredVariantId
            )
        );

        if (preferredVariant && isVariantAvailable(preferredVariant, product)) {
            return preferredVariant;
        }

        const exactMatch = variants.find((variant) => {
            const sameSize = !desiredSize || normalizeValue(variant?.size?.name) === desiredSize;
            const sameColor = !desiredColor || normalizeValue(variant?.color?.name) === desiredColor;
            return sameSize && sameColor && isVariantAvailable(variant, product);
        });
        if (exactMatch) return exactMatch;

        const sizeMatch = variants.find((variant) => {
            const sameSize = !desiredSize || normalizeValue(variant?.size?.name) === desiredSize;
            return sameSize && isVariantAvailable(variant, product);
        });
        if (sizeMatch) return sizeMatch;

        return variants.find((variant) => isVariantAvailable(variant, product)) || preferredVariant || variants[0] || null;
    };

    const waitForPreviewPaint = (delay = 120) =>
        new Promise((resolve) => {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    window.setTimeout(resolve, delay);
                });
            });
        });

    const waitForOverlayReady = (expectedSrc, timeout = 1200) =>
        new Promise((resolve) => {
            if (!expectedSrc) {
                resolve();
                return;
            }

            const start = Date.now();

            const check = () => {
                const overlayImg = overlayImageRef.current;
                const currentSrc = overlayImg?.currentSrc || overlayImg?.src || "";
                const isReady =
                    overlayImg &&
                    currentSrc === expectedSrc &&
                    overlayImg.complete &&
                    overlayImg.naturalWidth > 0;

                if (isReady || Date.now() - start >= timeout) {
                    resolve();
                    return;
                }

                window.requestAnimationFrame(check);
            };

            check();
        });

    const captureCurrentDisplayMockup = () => {
        const stageEl = previewStageRef.current;
        if (!stageEl) return null;

        const webglCanvas = stageEl.querySelector("canvas");
        const stageRect = stageEl.getBoundingClientRect();
        if (!webglCanvas || !stageRect.width || !stageRect.height) return null;

        const scale = 2;
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = Math.max(1, Math.round(stageRect.width * scale));
        exportCanvas.height = Math.max(1, Math.round(stageRect.height * scale));

        const ctx = exportCanvas.getContext("2d");
        if (!ctx) return null;

        const centerX = exportCanvas.width / 2;
        const centerY = exportCanvas.height / 2;
        const baseGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            exportCanvas.width * 0.08,
            centerX,
            centerY,
            exportCanvas.width * 0.75
        );
        baseGradient.addColorStop(0, "#8e8e8e");
        baseGradient.addColorStop(1, "#4a4a4a");
        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        ctx.drawImage(webglCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

        const overlayImg = overlayImageRef.current;
        if (overlayImg?.complete && overlayImg.naturalWidth && overlayImg.naturalHeight) {
            const overlayRect = overlayImg.getBoundingClientRect();
            const drawX = ((overlayRect.left - stageRect.left) / stageRect.width) * exportCanvas.width;
            const drawY = ((overlayRect.top - stageRect.top) / stageRect.height) * exportCanvas.height;
            const drawWidth = (overlayRect.width / stageRect.width) * exportCanvas.width;
            const drawHeight = (overlayRect.height / stageRect.height) * exportCanvas.height;

            if (drawWidth > 0 && drawHeight > 0) {
                ctx.drawImage(overlayImg, drawX, drawY, drawWidth, drawHeight);
            }
        }

        const vignette = ctx.createRadialGradient(
            centerX,
            centerY,
            exportCanvas.width * 0.25,
            centerX,
            centerY,
            exportCanvas.width * 0.7
        );
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.15)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        return exportCanvas.toDataURL("image/png", 1);
    };

    const captureDisplayPreviews = async () => {
        const previousSide = currentSide;
        const captures = {};

        for (const side of ["front", "back"]) {
            flushSync(() => {
                setCurrentSide(side);
            });
            await waitForPreviewPaint(120);
            await waitForOverlayReady(getPreviewOverlaySrcForSide(side));
            await waitForPreviewPaint(180);
            captures[side] = captureCurrentDisplayMockup();
        }

        if (captures.front && captures.back && captures.front === captures.back) {
            flushSync(() => {
                setCurrentSide("back");
            });
            await waitForPreviewPaint(160);
            await waitForOverlayReady(getPreviewOverlaySrcForSide("back"), 1600);
            await waitForPreviewPaint(220);
            captures.back = captureCurrentDisplayMockup();
        }

        flushSync(() => {
            setCurrentSide(previousSide);
        });
        await waitForPreviewPaint(80);

        return captures;
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
            const displayPreviews = await captureDisplayPreviews();
            const cartPreviews = {
                front: previews?.thumbnails?.front || previews?.front || previews?.previewFiles?.front || null,
                back: previews?.thumbnails?.back || previews?.back || previews?.previewFiles?.back || null
            };
            const productionPrintFiles = {
                front: previews?.previewFiles?.front || previews?.printFiles?.front || null,
                back: previews?.previewFiles?.back || previews?.printFiles?.back || null
            };
            const savedDisplayPreviews = {
                front: displayPreviews.front || cartPreviews.front || null,
                back: (displayPreviews.back && displayPreviews.back !== displayPreviews.front)
                    ? displayPreviews.back
                    : (cartPreviews.back || displayPreviews.back || null)
            };
            const displayImage = savedDisplayPreviews[currentSide] || savedDisplayPreviews.front || savedDisplayPreviews.back || captureCurrentDisplayMockup();
            const customizations = {
                frontDesign: getDesignOnlyJSON(frontDesignRef.current),
                backDesign: getDesignOnlyJSON(backDesignRef.current),
                displayImage,
                displayPreviews: savedDisplayPreviews,
                previews: savedDisplayPreviews,
                editorPreviews: cartPreviews,
                printFiles: productionPrintFiles,
                printingMethod: currentType,
                technicalReport: generateTechnicalReport(),
                isCustom: true
            };

            // Find a default variant if none selected
            // ✅ USE PRESERVED SELECTION IF AVAILABLE
            const product = productDataRef.current;
            const resolvedVariant = resolveCartVariant(product);
            const finalVariantId = getVariantIdentifier(resolvedVariant) || initialVariantIdRef.current;
            const finalSize = resolvedVariant?.size?.name || initialSizeRef.current || "N/A";
            const finalColor = resolvedVariant?.color?.name || initialColorRef.current || "N/A";

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
                navigate("/cart");
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
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8">
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
                className="relative w-full max-w-none md:max-w-6xl h-[100dvh] md:h-[85vh] bg-[#fcfbf9] rounded-none md:rounded-[2.5rem] border-0 md:border border-black/5 overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.1)]"
            >
                {/* Left: Preview Content */}
                <div className="flex-1 min-h-[44dvh] md:min-h-0 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-black/5">
                    {/* Preview Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/5 bg-white/40 shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0A0A0A]">Final Review</span>
                            <button
                                onClick={() => setCurrentSide(currentSide === 'front' ? 'back' : 'front')}
                                className="group flex items-center gap-3 bg-black/5 rounded-full px-4 py-2 hover:bg-black/10 transition-all active:scale-95"
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#0A0A0A]">
                                    Viewing: {currentSide}
                                </span>
                                <div className="w-px h-3 bg-black/10 mx-1" />
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#4A4A4A] group-hover:text-[#0A0A0A]">Flip</span>
                                    <FiRefreshCw size={12} className="text-[#4A4A4A] group-hover:text-[#0A0A0A] group-hover:rotate-180 transition-transform duration-500" />
                                </div>
                            </button>












                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/[0.02] to-transparent overflow-hidden">
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
                                    key="preview-stage"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    <div
                                        ref={previewStageRef}
                                        className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[500px] aspect-[500/600] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden"
                                        style={{ background: "radial-gradient(circle at 50% 50%, #8e8e8e 0%, #4a4a4a 100%)" }}
                                    >
                                        <div className="absolute inset-0 pointer-events-none blueprint-grid-dark" />

                                        <ThreeCanvas
                                            dpr={[1, 2]}
                                            gl={{
                                                antialias: false,
                                                powerPreference: "high-performance",
                                                preserveDrawingBuffer: true
                                            }}
                                            camera={{ position: [0, 0, 10], fov: 26 }}
                                            className="w-full h-full"
                                        >
                                            <ambientLight intensity={0.4} />
                                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                                            <pointLight position={[-10, 5, -5]} intensity={1.5} color="#ffffff" />
                                            <pointLight position={[10, 5, -5]} intensity={1.5} color="#ffffff" />
                                            <pointLight position={[0, -5, 5]} intensity={0.5} />
                                            <Suspense fallback={null}>
                                                <TShirtModel color={garmentColor} viewSide={currentSide} instantViewSwitch />
                                                <ContactShadows resolution={1024} scale={15} blur={2.5} opacity={0.4} far={10} color="#000000" />
                                                <Environment preset="city" />
                                            </Suspense>
                                        </ThreeCanvas>

                                        <div className="absolute inset-x-0 top-[5%] bottom-[5%] z-20 flex items-center justify-center pointer-events-none">
                                            <div className="relative w-[95%] h-full flex items-center justify-center pointer-events-none">
                                                {previewOverlaySrc ? (
                                                    <img loading="lazy" 
                                                        ref={overlayImageRef}
                                                        src={previewOverlaySrc}
                                                        alt={`${currentSide} design overlay`}
                                                        className="block w-full h-full object-contain mix-blend-normal pointer-events-none opacity-[0.92] drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Checkout Sidebar */}
                <div className="w-full md:w-[400px] flex flex-col bg-white/60 relative max-h-[56dvh] md:max-h-none">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 md:top-6 right-4 md:right-6 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-black transition-all active:scale-95 z-20"
                    >
                        <FiX size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 pt-16 md:pt-20 custom-scrollbar">
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
                    <div className="p-5 sm:p-6 md:p-8 border-t border-black/5 bg-white/40 shrink-0 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] md:pb-8">
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
