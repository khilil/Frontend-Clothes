import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useFabric } from "../../../context/FabricContext";
import { initFabric } from "../fabric/fabricCanvas.js";
import { clampToPrintArea } from "../../../utils/printAreaClamp.js";
import { addBaseImage } from "../fabric/baseImage";
import { getProductBySlug } from "../../../services/productService";
import { motion } from "framer-motion";

export default function CanvasArea() {
    const {
        canvasRef,
        fabricCanvas,
        activeTextRef,
        printAreaRef,
        activeObjectRef,
        layersRef,
        syncLayers,
        viewSideRef,
        frontDesignRef,
        backDesignRef,
        productDataRef,
        setSelectedObject,
        saveHistory,
        updatePrice,
        initialVariantIdRef,
        initialSizeRef,
        initialColorRef,
        garmentColor,
        setGarmentColor,
        isPremiumMode,
        setIsPremiumMode
    } = useFabric();

    const location = useLocation();
    const { slug } = useParams();

    const [viewSide, setViewSide] = useState(viewSideRef.current || "front");
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isInternalChange = useRef(false);

    /* =============================
       FETCH PRODUCT DATA
    ============================= */
    useEffect(() => {
        // 1. Initial UI state from navigation if available
        if (location.state?.frontImage) {
            const data = {
                frontImage: location.state.frontImage,
                backImage: location.state.backImage || location.state.frontImage
            };
            setProductData(data);
            productDataRef.current = data;

            // ✅ CAPTURE INITIAL SELECTION (Preserved for Add to Bag)
            if (location.state.variantId) initialVariantIdRef.current = location.state.variantId;
            if (location.state.size) initialSizeRef.current = location.state.size;
            if (location.state.color) initialColorRef.current = location.state.color;

            console.log("📍 Captured Initial Selection:", {
                variantId: initialVariantIdRef.current,
                size: initialSizeRef.current,
                color: initialColorRef.current
            });
        }

        // 2. Always fetch full document for metadata (_id, variants, etc)
        setLoading(true);
        
        // INTERCEPT FOR PREMIUM MOCKUP TEST
        if (slug === "premium-oversized-tshirt-mockup") {
            setIsPremiumMode(true);
            const data = {
                title: "Premium Oversized T-Shirt Mockup",
                frontImage: "/images/mockups/premium-front.png",
                backImage: "/images/mockups/premium-back.png",
                isCustomizable: true,
                price: 499
            };
            setProductData(data);
            productDataRef.current = data;
            setLoading(false);
            return;
        }

        getProductBySlug(slug)
            .then(res => {
                const images = [];
                res.variants?.forEach(v => {
                    v.images?.forEach(img => {
                        if (img.url && !images.includes(img.url)) {
                            images.push(img.url);
                        }
                    });
                });

                // Detect images intelligently
                let front = location.state?.frontImage;
                let back = location.state?.backImage;

                if (!front || !back) {
                    // If we have at least 2 images, try to find which is which
                    if (images.length >= 2) {
                        const backIdx = images.findIndex(url => url.toLowerCase().includes('back'));
                        const frontIdx = images.findIndex(url => url.toLowerCase().includes('front'));

                        if (frontIdx !== -1) front = images[frontIdx];
                        if (backIdx !== -1) back = images[backIdx];

                        // Fallback to indices if detection fails
                        if (!front) front = images[0];
                        if (!back) back = (images[1] || images[0]);
                    } else {
                        front = front || images[0];
                        back = back || images[0];
                    }
                }

                const product = {
                    ...res,
                    frontImage: front || "https://res.cloudinary.com/dv0afouba/image/upload/v1772118992/products/rqd3n5dnrmxbzephqy5d.png",
                    backImage: back || "https://res.cloudinary.com/dv0afouba/image/upload/v1772119002/products/zbpgbv0r4l1xg0ioe3gh.png"
                };

                setProductData(product);
                productDataRef.current = product;  // ✅ FULL Object with Front/Back images
                setLoading(false);
            })
            .catch((err) => {
                console.error("Studio Metadata Fetch Error:", err);
                setLoading(false);
            });
    }, [slug]);

    /* =============================
       SIDE SWITCH LOGIC
    ============================= */
    const switchSide = async (side) => {
        const canvas = fabricCanvas.current;
        if (!canvas || !productData) return;

        isInternalChange.current = true;

        // 1️⃣ Save current design JSON
        const json = canvas.toJSON();
        if (viewSideRef.current === "front") {
            frontDesignRef.current = json;
        } else {
            backDesignRef.current = json;
        }

        // 2️⃣ Load saved design of new side
        const savedDesign =
            side === "front"
                ? frontDesignRef.current
                : backDesignRef.current;

        await canvas.loadFromJSON(savedDesign || { objects: [] });

        // 3️⃣ Add base image AFTER JSON load
        const baseImageURL =
            side === "front"
                ? productData.frontImage
                : productData.backImage || productData.frontImage;

        await addBaseImage(canvas, baseImageURL);

        // 4️⃣ Ensure base image always at bottom
        const baseImg = canvas.getObjects().find(o => o.excludeFromExport);
        if (baseImg) {
            canvas.sendObjectToBack(baseImg);
        }

        canvas.renderAll();
        updatePrice(canvas);

        viewSideRef.current = side;
        setViewSide(side);

        isInternalChange.current = false;
    };

    /* =============================
       INIT FABRIC CANVAS
    ============================= */
    useEffect(() => {
        if (!canvasRef.current || !productData) return;

        if (fabricCanvas.current) {
            fabricCanvas.current.dispose();
            fabricCanvas.current = null;
        }

        fabricCanvas.current = initFabric(
            canvasRef.current,
            printAreaRef,
            activeTextRef,
            syncLayers
        );

        const canvas = fabricCanvas.current;

        // console.log("🎨 Fabric initialized");

        const initialLoad = async () => {
            isInternalChange.current = true;
            const savedDesign =
                viewSideRef.current === "front"
                    ? frontDesignRef.current
                    : backDesignRef.current;

            await canvas.loadFromJSON(savedDesign || { objects: [] });

            const baseImageURL =
                viewSideRef.current === "front"
                    ? productData.frontImage
                    : productData.backImage || productData.frontImage;

            await addBaseImage(canvas, baseImageURL);

            const baseImg = canvas.getObjects().find(o => o.excludeFromExport);
            if (baseImg) canvas.sendObjectToBack(baseImg);

            canvas.renderAll();
            updatePrice(canvas);

            // Save initial state to refs so preview works immediately
            const json = canvas.toJSON();
            if (viewSideRef.current === "front") {
                frontDesignRef.current = json;
            } else {
                backDesignRef.current = json;
            }
            isInternalChange.current = false;
        };


        initialLoad();

        const updateDesignRef = () => {
            if (isInternalChange.current) return;
            const json = canvas.toJSON();
            if (viewSideRef.current === "front") {
                frontDesignRef.current = json;
            } else {
                backDesignRef.current = json;
            }
        };

        /* ===== EVENTS ===== */
        canvas.on("object:modified", (e) => {
            const obj = e.target;
            if (!obj || obj.excludeFromExport) return;

            clampToPrintArea(obj, canvas.printArea);
            obj.setCoords();
            canvas.requestRenderAll();

            if (!isInternalChange.current) {
                updateDesignRef();
                saveHistory(canvas); // ✅ Save to history
                updatePrice(canvas); // ✅ Update price
            }
        });

        canvas.on("object:added", (e) => {
            if (e.target && !e.target.excludeFromExport && !isInternalChange.current) {
                updateDesignRef();
                saveHistory(canvas); // ✅ Save to history
                updatePrice(canvas); // ✅ Update price
            }
        });

        canvas.on("object:removed", (e) => {
            if (e.target && !e.target.excludeFromExport && !isInternalChange.current) {
                updateDesignRef();
                saveHistory(canvas); // ✅ Save to history
                updatePrice(canvas); // ✅ Update price
            }
        });

        canvas.on("selection:created", (e) => {
            const obj = e.selected?.[0] || null;
            activeObjectRef.current = obj;
            setSelectedObject(obj);
            if (obj?.type === "textbox") {
                activeTextRef.current = obj;
            }
        });

        canvas.on("selection:updated", (e) => {
            const obj = e.selected?.[0] || null;
            activeObjectRef.current = obj;
            setSelectedObject(obj);
            if (obj?.type === "textbox") {
                activeTextRef.current = obj;
            }
        });

        canvas.on("selection:cleared", () => {
            activeObjectRef.current = null;
            setSelectedObject(null);
            activeTextRef.current = null;
        });

    }, [productData]);

    /* =============================
       LOADING UI
    ============================= */
    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center studio-void blueprint-grid">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 border-2 border-[#d4c4b1]/20 border-t-[#d4c4b1] rounded-full animate-spin" />
                    <div className="space-y-2 text-center">
                        <span className="text-[10px] text-[#0A0A0A] font-black uppercase tracking-[0.4em] block">Initializing Studio</span>
                        <span className="text-[8px] text-[#4A4A4A] font-medium uppercase tracking-widest">Architecting Custom Environment...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="flex items-center justify-center h-[400px] text-red-500">
                Failed to load product.
            </div>
        );
    }

    /* =============================
       RENDER (HD 3D ENGINE)
    ============================= */
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden studio-void blueprint-grid">
            
            {/* ARCHITECTURAL METADATA - TOP LEFT */}
            <div className="absolute top-6 left-6 hidden lg:block">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0A0A0A]">Atelier Protocol v5.0 (HD)</span>
                    <span className="text-[7px] font-medium uppercase tracking-[0.2em] text-[#4A4A4A]">3D Deep Mockup // {slug?.toUpperCase()}</span>
                </div>
            </div>

            {/* FLOATING FRONT / BACK TOGGLE */}
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 md:top-20 z-[100]">
                <div className="flex bg-white/40 backdrop-blur-md border border-black/5 
                    rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
                    
                    <motion.div 
                        animate={{ x: viewSide === "front" ? 0 : "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-[#d4c4b1] rounded-xl shadow-lg shadow-[#d4c4b1]/20 z-0"
                    />

                    <button
                        onClick={() => switchSide("front")}
                        className={`relative z-10 px-6 py-2.5 text-[9px] sm:text-[10px] md:text-[11px] 
                            font-black uppercase tracking-[0.3em] 
                            transition-colors duration-500 w-24 sm:w-28
                            ${viewSide === "front" ? "text-black" : "text-[#4A4A4A] hover:text-[#0A0A0A]"}`}
                    >
                        Front
                    </button>

                    <button
                        onClick={() => switchSide("back")}
                        className={`relative z-10 px-6 py-2.5 text-[9px] sm:text-[10px] md:text-[11px] 
                            font-black uppercase tracking-[0.3em] 
                            transition-colors duration-500 w-24 sm:w-28
                            ${viewSide === "back" ? "text-black" : "text-[#4A4A4A] hover:text-[#0A0A0A]"}`}
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* MAIN 3D STACK */}
            <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 md:p-12 font-primary z-10">
                <div className="relative w-full max-w-[500px] aspect-[500/600] studio-card-shadow rounded-[2rem] overflow-hidden bg-[#F0F0F0]">
                    
                    {/* LAYER 1: BASE COLOR OVERLAY (The color selected by user) */}
                    <div 
                        className="absolute inset-0 z-0 transition-colors duration-700"
                        style={{ backgroundColor: garmentColor }}
                    />

                    {/* LAYER 2: BASE MOCKUP (Wrinkles & Shadows - MULTIPLY) */}
                    <img 
                        src={viewSide === "front" ? productData?.frontImage : productData?.backImage}
                        alt="Garment Base"
                        className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-100 z-10 pointer-events-none"
                    />

                    {/* LAYER 3: COTTON TEXTURE (REALISM BOOST - OVERLAY) */}
                    <img 
                        src="/images/mockups/cotton-texture.png"
                        alt="Fabric Texture"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-10 z-10 pointer-events-none"
                    />

                    {/* LAYER 4: DESIGN CANVAS (THE USER'S DESIGN) */}
                    <div className="absolute inset-x-0 top-[15%] bottom-[15%] z-20 flex items-center justify-center pointer-events-none" 
                         style={{ perspective: "1500px" }}>
                        <motion.div 
                            style={{ 
                                perspective: "1500px", 
                                transform: "translateZ(10px)",
                                width: "70%",
                                height: "70%"
                            }}
                            className="relative flex items-center justify-center pointer-events-none"
                        >
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={600}
                                className="w-full h-full object-contain mix-blend-normal pointer-events-auto opacity-[0.95] drop-shadow-sm"
                            />
                        </motion.div>
                    </div>

                    {/* LAYER 5: SPECULAR HIGHLIGHTS (STUDIO LIGHTING - SCREEN) */}
                    <img 
                        src={viewSide === "front" ? productData?.frontImage : productData?.backImage}
                        alt="Highlights"
                        className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-15 brightness-125 z-30 pointer-events-none"
                    />

                    {/* VIGNETTE OVERLAY (Depth Effect) */}
                    <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.1)_100%)] pointer-events-none" />

                </div>
            </div>

            {/* STUDIO FOCUS ICON */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-black">Live HD Render Active</span>
            </div>
        </div>
    );
}
