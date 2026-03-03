import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useFabric } from "../../../context/FabricContext";
import { initFabric } from "../fabric/fabricCanvas.js";
import { clampToPrintArea } from "../../../utils/printAreaClamp.js";
import { addBaseImage } from "../fabric/baseImage";
import { getProductBySlug } from "../../../services/productService";

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
        updatePrice
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
        }

        // 2. Always fetch full document for metadata (_id, variants, etc)
        setLoading(true);
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
            <div className="flex items-center justify-center h-[400px] text-white">
                Loading Design Studio...
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
       RENDER
    ============================= */
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#0f0f0f]">

            {/* FLOATING FRONT / BACK TOGGLE */}
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 md:top-6 z-30">
                <div className="flex bg-[#1a1a1d]/95 backdrop-blur-xl border border-white/10 
                    rounded-2xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                    <button
                        onClick={() => switchSide("front")}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[9px] sm:text-[10px] md:text-[11px] 
                            font-black uppercase tracking-[0.2em] 
                            rounded-xl transition-all duration-500
                            ${viewSide === "front"
                                ? "bg-[#d4c4b1] text-black shadow-[0_0_20px_rgba(212,196,177,0.3)]"
                                : "text-[#9a9a9a] hover:text-white"
                            }`}
                    >
                        Front
                    </button>

                    <button
                        onClick={() => switchSide("back")}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[9px] sm:text-[10px] md:text-[11px] 
                            font-black uppercase tracking-[0.2em] 
                            rounded-xl transition-all duration-500
                            ${viewSide === "back"
                                ? "bg-[#d4c4b1] text-black shadow-[0_0_20px_rgba(212,196,177,0.3)]"
                                : "text-[#9a9a9a] hover:text-white"
                            }`}
                    >
                        Back
                    </button>

                </div>
            </div>

            {/* CANVAS CONTAINER */}
            <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 md:p-12">
                <div className="relative w-full max-w-[450px] aspect-[450/500] bg-[#0a0a0a] shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/5 transition-transform duration-700 hover:scale-[1.01]">
                    <canvas
                        ref={canvasRef}
                        width={450}
                        height={500}
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

        </div>
    );
}
