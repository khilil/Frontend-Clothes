import { useEffect, useState, useRef, Suspense } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useFabric } from "../../../context/FabricContext";
import { initFabric } from "../fabric/fabricCanvas.js";
import { clampToPrintArea } from "../../../utils/printAreaClamp.js";
import { addBaseImage } from "../fabric/baseImage";
import { getProductBySlug } from "../../../services/productService";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import TShirtModel from "./3D/TShirtModel";

export default function CanvasArea() {
    const {
        canvasRef,
        wrapperRef, // new ref needed for container
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
                frontImage: "/images/mockups/premium-front-alpha.png",
                backImage: "/images/mockups/premium-back-alpha.png",
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

        const { addPrintArea } = await import("../fabric/printArea");
        const isMobile = window.innerWidth < 1024;
        addPrintArea(canvas, isMobile);

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
            syncLayers,
            window.innerWidth < 1024 // isMobile parity with TShirtModel
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

            const { addPrintArea } = await import("../fabric/printArea");
            const isMobile = window.innerWidth < 1024;
            addPrintArea(canvas, isMobile);

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

        // 🛡️ REAL-TIME BOUNDARY ENFORCEMENT (v7.22)
        canvas.on("object:moving", (e) => {
            const obj = e.target;
            if (!obj || obj.excludeFromExport) return;
            clampToPrintArea(obj, canvas.printArea);
            canvas.requestRenderAll();
        });

        canvas.on("object:scaling", (e) => {
            const obj = e.target;
            if (!obj || obj.excludeFromExport) return;
            clampToPrintArea(obj, canvas.printArea);
            canvas.requestRenderAll();
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
       RESPONSIVE SYNC (v7.17)
    ============================= */
    useEffect(() => {
        if (!wrapperRef.current || !fabricCanvas.current) return;

        const observer = new ResizeObserver(async (entries) => {
            const canvas = fabricCanvas.current;
            if (!canvas || !entries[0]) return;

            const { width, height } = entries[0].contentRect;
            
            // Standardizing based on original 500x600 coordinate system
            const baseWidth = 500;
            const zoom = width / baseWidth;
            const isMobile = window.innerWidth < 1024;

            canvas.setDimensions({ width, height });
            canvas.setZoom(zoom);

            // 📐 RE-CALIBRATE PRO BOUNDARY ON RESIZE
            const { addPrintArea } = await import("../fabric/printArea");
            // Remove old markers and rect first to avoid duplication
            const objectsToRemove = canvas.getObjects().filter(o => o.excludeFromExport && !o.isBaseImage);
            objectsToRemove.forEach(o => canvas.remove(o));
            addPrintArea(canvas, isMobile);

            canvas.renderAll();
        });

        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, [fabricCanvas.current]);

    /* =============================
       ATELIER 3D ENGINE (v7.0)
    ============================= */
    const garmentCanvasRef = useRef(null);

    // Sync views when side switches
    useEffect(() => {
        if (fabricCanvas.current) {
            // Fabric canvas handles design updates
        }
    }, [viewSide]);

    /* =============================
       LOADING UI
    ============================= */
    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "radial-gradient(circle at 50% 50%, #8e8e8e 0%, #4a4a4a 100%)" }}>
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 border-2 border-[#d4c4b1]/10 border-t-[#d4c4b1] rounded-full animate-spin" />
                    <div className="space-y-2 text-center">
                        <span className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-[0.4em] block">Initializing Engine v7.13 (Balanced Studio)</span>
                        <span className="text-[8px] text-[#404040] font-medium uppercase tracking-widest">Optimizing Studio Space...</span>
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
       RENDER (v7.7 - High Contrast Studio)
    ============================= */
    return (
        <div 
            className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000"
            style={{ background: "radial-gradient(circle at 50% 50%, #8e8e8e 0%, #4a4a4a 100%)" }}
        >
            {/* 🕸️ TECHNICAL HIGH-VISIBILITY GRID */}
            <div className="absolute inset-0 pointer-events-none blueprint-grid-dark" />
            
            {/* 🛡️ SVG ALPHA MASK ENGINE (Invisible) */}
            <svg width="0" height="0" className="absolute pointer-events-none">
                <defs>
                    <mask id="garmentMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                        {/* No filter needed because we use Alpha PNGs now */}
                        <image 
                            href={viewSide === "front" ? productData?.frontImage : productData?.backImage}
                            width="100%" 
                            height="100%" 
                            preserveAspectRatio="xMidYMid meet"
                        />
                    </mask>
                </defs>
            </svg>

            {/* SAFE AREA TOP PADDING (Mobile Notch Support) */}
            <div className="h-[env(safe-area-inset-top,1.5rem)] lg:hidden" />

            {/* ARCHITECTURAL METADATA - TOP LEFT (Responsive) */}
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6 z-50 pointer-events-none">
                <div className="flex flex-col items-center sm:items-start gap-1">
                    <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-[#000000]/60 whitespace-nowrap">Atelier Protocol v7.14 (High Performance)</span>
                    <span className="text-[6px] sm:text-[7px] font-medium uppercase tracking-[0.2em] text-[#000000]/30 whitespace-nowrap">Direct Material Dyeing // {slug?.toUpperCase()}</span>
                </div>
            </div>

            {/* FLOATING FRONT / BACK TOGGLE (Bottom Position On Mobile) */}
            <div className="absolute bottom-6 sm:bottom-auto sm:top-20 md:top-24 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 z-[100]">
                <div className="flex bg-white/60 backdrop-blur-xl border border-black/5 
                    rounded-2xl p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
                    
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

            {/* MAIN 3D ATELIER STACK (v7.15 Balanced Mobile) */}
            <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center p-2 sm:p-6 md:p-12 font-primary z-10">
                <div 
                    className="relative w-full h-full lg:max-w-[500px] lg:aspect-[500/600] studio-card-shadow rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-transparent shrink-0"
                    style={{ touchAction: "none" }}
                >
                    
                    {/* ⚙️ 3D WEBGL STAGE */}
                    <Canvas 
                        dpr={[1, 2]}
                        gl={{ 
                            antialias: false, 
                            powerPreference: "high-performance",
                            preserveDrawingBuffer: true 
                        }}
                        camera={{ position: [0, 0, 10], fov: 26 }}
                        className="w-full h-full"
                    >
                        {/* 💡 ENHANCED LIGHTING FOR CONTRAST */}
                        <ambientLight intensity={0.4} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                        
                        {/* 🌟 RIM LIGHTS (Separates garment from background) */}
                        <pointLight position={[-10, 5, -5]} intensity={1.5} color="#ffffff" />
                        <pointLight position={[10, 5, -5]} intensity={1.5} color="#ffffff" />
                        <pointLight position={[0, -5, 5]} intensity={0.5} />
                        
                        <Suspense fallback={null}>
                            <TShirtModel color={garmentColor} viewSide={viewSide} />
                            <ContactShadows resolution={1024} scale={15} blur={2.5} opacity={0.4} far={10} color="#000000" />
                            <Environment preset="city" />
                        </Suspense>
                    </Canvas>

                    {/* 🧶 REALISM GRAIN (OVERLAY) */}
                    <div className="absolute inset-x-0 top-[15%] bottom-[15%] z-20 flex items-center justify-center pointer-events-none" 
                         style={{ perspective: "1500px" }}>
                        <motion.div 
                            ref={wrapperRef}
                            style={{ 
                                perspective: "1500px", 
                                transform: "translateZ(20px)",
                                width: "85%", // Increased from 70%
                                height: "85%" // Increased from 70%
                            }}
                            className="relative flex items-center justify-center pointer-events-none"
                        >
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full object-contain mix-blend-normal pointer-events-auto opacity-[0.92] drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                            />
                        </motion.div>
                    </div>

                    {/* 🌫️ STUDIO VIGNETTE & DEPTH (Enhanced for separation) */}
                    <div className="absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

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
