import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getProductBySlug } from "../../../../services/productService";
import { useFabric } from "../../../../context/FabricContext";
import { useCart } from "../../../../context/CartContext";
import * as fabric from 'fabric'

export default function PreviewContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const frontImage = location.state?.frontImage;
    const backImage = location.state?.backImage;
    const { slug } = useParams();

    const {
        fabricCanvas,
        frontDesignRef,
        backDesignRef,
        customizationPrice,
        printingMethods,
        printingType,
        uploadedAssetsMetadataRef,
        pricingSettings
    } = useFabric();
    const { addToCart } = useCart();
    const [addingToCart, setAddingToCart] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [selectedSize, setSelectedSize] = useState("L");
    const [baseColor, setBaseColor] = useState("white");
    const [viewSide, setViewSide] = useState("front");

    const garmentBasePrice = productData?.price || 1700;
    const currentType = printingMethods?.find(t => t.id === (printingType || 'dtf'));
    const grandTotal = garmentBasePrice + customizationPrice;

    const generateTechnicalReport = () => {
        const report = [];
        const metadataMap = uploadedAssetsMetadataRef.current || {};
        const scanSide = (json) => {
            if (!json || !json.objects) return;
            json.objects.forEach(obj => {
                const assetKey = obj.src || obj.id;
                if (assetKey) {
                    const meta = metadataMap[assetKey] || {
                        name: obj.type === 'textbox' ? 'Text Element' : 'Library Graphic',
                        width: 5000, height: 5000, fileSize: 0, hasAlpha: true
                    };
                    const elementPrice = obj.type === 'textbox'
                        ? (pricingSettings?.textPricePerElement || 20)
                        : (Number(obj.price) || 0);

                    report.push({ ...meta, price: elementPrice });
                }
            });
        };
        scanSide(frontDesignRef.current);
        scanSide(backDesignRef.current);
        return report;
    };

    const handleAddToBag = async () => {
        if (!productData) return;
        setAddingToCart(true);
        try {
            const customizations = {
                frontDesign: frontDesignRef.current,
                backDesign: backDesignRef.current,
                printingMethod: currentType,
                technicalReport: generateTechnicalReport(),
                previews: { front: previewImage } // Simplification for now
            };

            // Note: In a real app we'd need high-res print files here too.
            // For now, let's just make the price flow work.

            await addToCart({ _id: (location.state?.productId || slug), ...productData }, { variantId: selectedSize }, customizations);
            alert("Added to bag!");
            navigate("/cart");
        } catch (err) {
            console.error(err);
            alert("Failed to add to bag");
        } finally {
            setAddingToCart(false);
        }
    };



    /* =============================
        GET PRODUCT IMAGE (SAFE)
     ============================= */
    useEffect(() => {
        if (location.state?.frontImage) {
            console.log("✅ Using image from location state");
            setProductData({
                frontImage: location.state.frontImage,
                backImage: location.state.backImage || location.state.frontImage
            });
        } else {
            console.log("⚠ location.state missing → fetching again");
            getProductBySlug(slug)
                .then(res => {
                    const data = res;
                    const images = [];
                    data.variants?.forEach(v => {
                        v.images?.forEach(img => {
                            if (img.url && !images.includes(img.url)) {
                                images.push(img.url);
                            }
                        });
                    });

                    setProductData({
                        frontImage: images[0] || "https://placehold.co/600x800/121212/white?text=No+Front+Image",
                        backImage: images[1] || images[0] || "https://placehold.co/600x800/121212/white?text=No+Back+Image"
                    });
                })
                .catch(err => {
                    console.error("Fetch product error in Preview:", err);
                });
        }
    }, [slug]);

    console.log("👀 FRONT in Preview:", frontDesignRef.current);
    /* =============================
       LOAD PREVIEW
    ============================= */
    useEffect(() => {
        const loadPreview = async () => {
            if (!productData) return;



            const savedDesign =
                viewSide === "front"
                    ? frontDesignRef.current
                    : backDesignRef.current;

            const baseImageURL =
                viewSide === "front"
                    ? productData.frontImage
                    : productData.backImage || productData.frontImage;


            if (!baseImageURL) {
                console.log("❌ Base image missing!");
                return;
            }

            const tempCanvas = new fabric.Canvas(null, {
                width: 450,
                height: 500
            });

            // 1️⃣ Load design JSON FIRST (it clears the canvas)
            if (savedDesign) {
                await tempCanvas.loadFromJSON(savedDesign);
            }

            // 2️⃣ Load base image AFTER design load
            const img = await fabric.Image.fromURL(baseImageURL, { crossOrigin: 'anonymous' });

            const scale = Math.min(
                tempCanvas.width / img.width,
                tempCanvas.height / img.height
            ) * 1.5;

            img.scale(scale);

            img.set({
                left: tempCanvas.width / 2,
                top: tempCanvas.height / 2,
                originX: "center",
                originY: "center",
                selectable: false,
                evented: false,
                excludeFromExport: true
            });

            tempCanvas.add(img);
            tempCanvas.sendObjectToBack(img);

            tempCanvas.renderAll();

            const dataURL = tempCanvas.toDataURL({
                format: "png",
                multiplier: 2
            });

            setPreviewImage(dataURL);

            tempCanvas.dispose();
        };

        loadPreview();
    }, [viewSide, productData]);




    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Section: Visual Preview */}
            <div className="flex-[3] relative bg-[#0a0a0a] flex items-center justify-center p-10 md:p-20 overflow-hidden">

                {/* Branding Overlay */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none hidden md:block">
                    <h2 className="text-4xl font-impact tracking-tighter mb-1 text-white">MODERN MEN</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#d4c4b1]/60">Bespoke Artisan Series</p>
                </div>

                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="absolute top-10 left-10 cursor-pointer group flex items-center gap-4 z-50">
                    <span className="material-symbols-outlined text-white text-2xl transition-transform group-hover:scale-110">arrow_back</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 group-hover:text-white">Back to Studio</span>
                </button>

                {/* Side Toggles */}
                <div className="absolute top-1/2 right-10 -translate-y-1/2 flex flex-col gap-4 z-50">
                    <button onClick={() => setViewSide("front")} className={`w-12 h-12 flex items-center justify-center border transition-all ${viewSide === 'front' ? 'border-white bg-white text-black' : 'border-white/20 text-white hover:border-white'}`}>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Front</span>
                    </button>
                    <button onClick={() => setViewSide("back")} className={`w-12 h-12 flex items-center justify-center border transition-all ${viewSide === 'back' ? 'border-white bg-white text-black' : 'border-white/20 text-white hover:border-white'}`}>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Back</span>
                    </button>
                </div>

                {/* T-Shirt Display */}
                <div className="relative w-full max-w-2xl aspect-[4/5] flex items-center justify-center">
                    {/* <img
                        alt="T-Shirt Base"
                        src={mockups[baseColor][viewSide]}
                        className={`w-full h-full object-contain transition-all duration-500 ${baseColor === 'black' ? 'brightness-75' : 'brightness-100'} drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]`}
                    /> */}

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[70%] h-[60%] relative flex items-center justify-center">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="User Design"
                                    className="max-w-full max-h-full object-contain opacity-90"
                                    style={{
                                        mixBlendMode: baseColor === 'black' ? 'screen' : 'normal'
                                    }}
                                />
                            ) : (
                                <span className="text-white/10 text-[8px] uppercase tracking-widest italic">No design on this side</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metadata Labels */}
                <div className="absolute bottom-10 left-10 hidden md:flex gap-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Lighting</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Cinematic Studio</span>
                    </div>
                </div>
            </div>

            {/* Right Section: Product Details */}
            <div className="flex-1 bg-[#121212] border-l border-white/5 flex flex-col justify-between p-8 md:p-12 overflow-y-auto no-scrollbar">
                <div className="space-y-10">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] mb-4 block">Hand-Crafted series</span>
                        <h1 className="text-5xl font-impact tracking-tighter text-white uppercase leading-none mb-4">Custom Artisan Tee</h1>
                        <p className="text-white/40 text-xs leading-relaxed max-w-xs">Hand-crafted luxury jersey. Tailored for a relaxed yet structured fit with your bespoke design.</p>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Premium Total</span>
                        <span className="text-3xl font-impact tracking-tighter text-white">₹{grandTotal.toLocaleString()}</span>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Fabric Color</span>
                        <div className="flex gap-4">
                            {['white', 'black'].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setBaseColor(color)}
                                    className={`w-8 h-8 rounded-full border transition-all ${baseColor === color ? 'ring-1 ring-white ring-offset-4 ring-offset-[#121212]' : 'border-white/10 hover:scale-110'}`}
                                    style={{ backgroundColor: color }}>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Select Size</span>
                            <button className="text-[9px] font-bold uppercase tracking-widest text-[#d4c4b1] underline underline-offset-4">Size Guide</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {['S', 'M', 'L', 'XL'].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-12 border flex items-center justify-center text-[11px] font-bold transition-all ${selectedSize === size ? 'border-white bg-white/5 text-white' : 'border-white/10 text-white/60 hover:border-white'}`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-10">
                    <button
                        onClick={handleAddToBag}
                        disabled={addingToCart}
                        className="w-full h-16 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#d4c4b1] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {addingToCart ? "ADDING..." : "ADD TO BAG"} <span className="material-symbols-outlined text-lg">shopping_bag</span>
                    </button>
                    <button
                        onClick={() => { handleAddToBag(); }}
                        className="w-full h-16 bg-transparent border-2 border-white text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-colors flex items-center justify-center gap-3"
                    >
                        BUY NOW <span className="material-symbols-outlined text-lg">bolt</span>
                    </button>
                    <p className="text-[8px] text-center text-white/30 uppercase tracking-widest mt-4 italic">
                        Free Express Shipping & Signature Packaging Included
                    </p>
                </div>
            </div>
        </div>
    );
}