import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ProductSuggestions } from "./ProductSuggestions";
import Reviews from "./Reviews";
import CollectiveFooter from "../../../components/common/CollectiveFooter/CollectiveFooter";
import { useCart } from "../../../context/CartContext";
import CustomizationModal from "./CustomizationPop_popModel";
import { getProductBySlug } from "../../../services/productService";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const [pincode, setPincode] = useState("");
    const [pincodeStatus, setPincodeStatus] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('fabric');
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isAdded, setIsAdded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isQuickBuying, setIsQuickBuying] = useState(false);
    const [showStickyBar, setShowStickyBar] = useState(false);

    // For Sticky Bar scroll logic
    const mainActionRef = useRef(null);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (mainActionRef.current) {
            const offset = mainActionRef.current.offsetTop + mainActionRef.current.offsetHeight;
            setShowStickyBar(latest > offset && window.innerWidth < 1024);
        }
    });

    const showNotification = (message, type = "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const { addToCart } = useCart();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleContinueCustomization = () => {
        setIsModalOpen(false);
        navigate(`/customize/${product.slug}`, {
            state: {
                productId: product._id,
                title: product.title,
                frontImage: images[0],
                backImage: images[1] || images[0],
                price: product.price,
            },
        });
    };

    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        getProductBySlug(slug)
            .then(res => {
                if (!res) {
                    setIsLoading(false);
                    return;
                }
                const fetchedProduct = res;
                setProduct(fetchedProduct);

                if (fetchedProduct.variants?.length > 0) {
                    const firstVariant = fetchedProduct.variants[0];
                    setSelectedVariant(firstVariant);
                    setSelectedColor(firstVariant.color);
                    setSelectedSize(firstVariant.size?.name || "");
                }
                setIsLoading(false);
                window.scrollTo(0, 0);
            })
            .catch(err => {
                console.error("Fetch product error:", err);
                setIsLoading(false);
            });
    }, [slug]);

    const handleAddToBag = () => {
        if (!selectedVariant) {
            showNotification("Please select a size first");
            return;
        }

        setIsAdding(true);

        // Artificial delay for smooth interaction feedback
        setTimeout(() => {
            addToCart(product, {
                variantId: selectedVariant.sku,
                size: selectedSize,
                color: selectedVariant.color?.name
            });

            setIsAdding(false);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        }, 800);
    };

    const handleQuickBuy = () => {
        if (!product || !selectedVariant) {
            showNotification("Please select a size first");
            return;
        }

        setIsQuickBuying(true);
        setTimeout(() => {
            navigate("/checkout", {
                state: {
                    directBuy: {
                        productId: product._id,
                        variantId: selectedVariant.sku,
                        quantity: 1,
                        title: product.title,
                        price: product.price,
                        image: selectedVariant.images?.[0]?.url || product.images?.[0]?.url,
                        size: selectedSize
                    }
                }
            });
            setIsQuickBuying(false);
        }, 800);
    };

    const handleSizeSelect = (v) => {
        setSelectedVariant(v);
        setSelectedSize(v.size?.name);

        if (v.images && v.images.length > 0) {
            const imgUrl = v.images[0].url;
            const fullIndex = images.findIndex(url => url === imgUrl);
            if (fullIndex !== -1) {
                setActiveImage(fullIndex);
            }
        }
    };

    const handlePincodeCheck = () => {
        if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
            showNotification("Please enter a valid 6-digit numeric pincode");
            return;
        }

        setPincodeStatus("checking");
        setTimeout(() => {
            if (pincode.startsWith('0') || pincode.startsWith('9')) {
                setPincodeStatus("unserviceable");
                showNotification("Sorry, we do not ship to this pincode yet", "error");
            } else {
                setPincodeStatus("available");
                showNotification("Delivery available to " + pincode, "success");
            }
        }, 1200);
    };

    const images = useMemo(() => {
        if (!product) return ["https://placehold.co/600x800/121212/white?text=No+Image"];

        let relevantImages = [];

        if (!selectedColor) {
            // Collect all images from all variants if no color selected
            const allImgsMap = new Map();
            product.variants?.forEach(v => {
                v.images?.forEach(img => {
                    if (img.url && !allImgsMap.has(img.url)) {
                        allImgsMap.set(img.url, img);
                    }
                });
            });
            relevantImages = Array.from(allImgsMap.values());
        } else {
            // Collect images only for the selected color
            const colorImgsMap = new Map();
            product.variants?.forEach(v => {
                if ((v.color?._id || v.color?.name) === (selectedColor._id || selectedColor.name)) {
                    v.images?.forEach(img => {
                        if (img.url && !colorImgsMap.has(img.url)) {
                            colorImgsMap.set(img.url, img);
                        }
                    });
                }
            });
            relevantImages = Array.from(colorImgsMap.values());
        }

        if (relevantImages.length === 0) {
            return ["https://placehold.co/600x800/121212/white?text=No+Image"];
        }

        // Sort images: primary image first
        return relevantImages
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map(img => img.url);
    }, [product, selectedColor]);

    const uniqueColors = useMemo(() => {
        if (!product || !product.variants) return [];
        const colors = [];
        const seen = new Set();
        product.variants.forEach(v => {
            const col = v.color;
            if (!col) return;
            const colorId = typeof col === 'object' ? (col._id || col.name) : col;
            if (colorId && !seen.has(colorId)) {
                seen.add(colorId);
                colors.push(typeof col === 'object' ? col : { _id: col, name: 'Standard', hexCode: '#000000' });
            }
        });
        return colors;
    }, [product]);

    const filteredVariants = useMemo(() => {
        if (!product || !product.variants || !selectedColor) return [];
        return product.variants.filter(v => (v.color?._id || v.color?.name) === (selectedColor._id || selectedColor.name));
    }, [product, selectedColor]);

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setActiveImage(0);
        const firstAvailable = product.variants.find(v => (v.color?._id || v.color?.name) === (color._id || color.name));
        if (firstAvailable) {
            setSelectedVariant(firstAvailable);
            setSelectedSize(firstAvailable.size?.name);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <div className="animate-pulse font-[Oswald] tracking-widest uppercase text-accent text-xs">Loading Architecture…</div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-impact">PRODUCT NOT FOUND</h2>
                    <button onClick={() => navigate('/')} className="text-accent uppercase text-[10px] font-black tracking-widest border-b border-accent/30 p-2">Return Home</button>
                </div>
            </div>
        );
    }

    const isCustomizable = product.isCustomizable;
    const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : true;

    const benefits = [
        { icon: 'local_shipping', title: 'Express Delivery', desc: 'Ships in 3-5 days' },
        { icon: 'p2p', title: 'Easy Returns', desc: '7-day window' },
        { icon: 'verified_user', title: 'Secure Checkout', desc: 'Encrypted payment' }
    ];

    return (
        <main className="pt-20 bg-[#0a0a0a] text-white selection:bg-[#d4c4b1] selection:text-black overflow-x-hidden">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-6 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

                    {/* LEFT: MEDIA GALLERY */}
                    <section className="w-full lg:w-[48%] space-y-6 lg:sticky lg:top-28">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#0d0d0d] border border-white/5 rounded-sm cursor-zoom-in">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    src={images[activeImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />

                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Scroll to Explore</span>
                                </div>
                            </div>

                            {/* Gallery Navigation Buttons */}
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setActiveImage(i => (i === 0 ? images.length - 1 : i - 1))}
                                    className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-all"
                                >
                                    <span className="material-symbols-outlined">west</span>
                                </button>
                                <button
                                    onClick={() => setActiveImage(i => (i === images.length - 1 ? 0 : i + 1))}
                                    className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-all"
                                >
                                    <span className="material-symbols-outlined">east</span>
                                </button>
                            </div>
                        </motion.div>

                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`flex-shrink-0 w-20 md:w-28 aspect-[4/5] overflow-hidden transition-all snap-start border-2
                                        ${i === activeImage ? "border-accent" : "border-transparent opacity-40 hover:opacity-100"}
                                    `}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* RIGHT: PRODUCT INFO */}
                    <aside className="w-full lg:w-[52%] space-y-10">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="space-y-8"
                        >
                            {/* Breadcrumbs & Title */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                                    <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                    <span className="text-white/60">Product Details</span>
                                </nav>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-impact tracking-tighter leading-[0.9] uppercase">
                                    {product.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 pt-2">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-impact text-accent leading-none">₹{product.price}</span>
                                        {product.compareAtPrice > product.price && (
                                            <span className="text-lg font-impact text-white/20 line-through leading-none">₹{product.compareAtPrice}</span>
                                        )}
                                    </div>
                                    <div className="w-px h-6 bg-white/10"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex text-accent">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <span key={n} className="material-symbols-outlined !text-sm">star</span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest text-white/40">15.2K REVIEWS</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Color Selection */}
                            {uniqueColors.length > 0 && (
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                                    <div className="flex justify-between items-center pr-4 border-b border-white/5 pb-2">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">Select Palette</h4>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-accent drop-shadow-[0_0_8px_rgba(212,196,177,0.3)]">{selectedColor?.name}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        {uniqueColors.map((color) => (
                                            <button
                                                key={color._id || color.name}
                                                onClick={() => handleColorSelect(color)}
                                                className={`w-14 h-14 rounded-full border transition-all duration-300 relative group/swatch
                                                    ${(selectedColor?._id || selectedColor?.name) === (color._id || color.name)
                                                        ? "border-accent ring-2 ring-accent ring-offset-[3px] ring-offset-black scale-110 shadow-[0_0_20px_rgba(212,196,177,0.3)] z-10"
                                                        : "border-white/10 opacity-40 hover:opacity-100 hover:scale-105 hover:border-white/30"}
                                                `}
                                                style={{
                                                    backgroundColor: color.hexCode ? (color.hexCode.startsWith('#') ? color.hexCode : `#${color.hexCode}`) : color.name?.toLowerCase()
                                                }}
                                            >
                                                {(selectedColor?._id || selectedColor?.name) === (color._id || color.name) && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <span className="material-symbols-outlined !text-base text-black mix-blend-difference">check</span>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Size Selection */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                                <div className="flex justify-between items-center pr-4 border-b border-white/5 pb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">Choose Size</h4>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#d4c4b1]/50">• {selectedColor?.name} Edition</span>
                                    </div>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:text-accent border-b border-accent/20 transition-all">Sizing Guide</button>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                    {filteredVariants.map(v => (
                                        <button
                                            key={v._id}
                                            onClick={() => handleSizeSelect(v)}
                                            disabled={v.stock <= 0}
                                            className={`h-16 flex flex-col items-center justify-center transition-all duration-300 border-2 relative group/size
                                                ${selectedVariant?._id === v._id
                                                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)] z-10"
                                                    : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white"}
                                                ${v.stock <= 0 ? "opacity-10 cursor-not-allowed filter grayscale pointer-events-none" : ""}
                                            `}
                                        >
                                            <span className={`text-[12px] font-black tracking-[0.2em] uppercase transition-transform ${selectedVariant?._id === v._id ? "scale-110" : "group-hover/size:scale-105"}`}>
                                                {v.size?.name}
                                            </span>
                                            {selectedVariant?._id === v._id && (
                                                <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-accent" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {selectedVariant && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedVariant.stock > 5 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                        <p className="text-[10px] font-black tracking-[0.2em] uppercase">
                                            {selectedVariant.stock > 5 ? 'Available in Stock' : `Only ${selectedVariant.stock} Items left`}
                                        </p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Main CTA Section */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} ref={mainActionRef} className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <motion.button
                                        onClick={handleAddToBag}
                                        disabled={isOutOfStock}
                                        whileTap={{ scale: 0.98 }}
                                        className={`h-20 text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 relative overflow-hidden
                                            ${isAdded ? 'bg-green-600 text-white' : (isAdding ? 'bg-black text-white' : 'bg-[#d4c4b1] text-black hover:bg-white')}
                                            disabled:opacity-20 disabled:cursor-not-allowed
                                        `}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isAdding ? (
                                                <motion.span key="adding" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                                                    Processing... <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                </motion.span>
                                            ) : isAdded ? (
                                                <motion.span key="added" initial={{ y: 20, scale: 0.8, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="flex items-center gap-2">
                                                    Successfully Added <span className="material-symbols-outlined !text-base">check_circle</span>
                                                </motion.span>
                                            ) : (
                                                <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                                                    Add To Bag <span className="material-symbols-outlined !text-base">shopping_bag</span>
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {/* Ripple effect background would go here if needed */}
                                    </motion.button>

                                    <motion.button
                                        onClick={handleQuickBuy}
                                        disabled={isOutOfStock}
                                        whileTap={{ scale: 0.98 }}
                                        className="h-20 border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all flex items-center justify-center gap-4 disabled:opacity-20"
                                    >
                                        {isQuickBuying ? (
                                            <span className="animate-pulse">Processing...</span>
                                        ) : (
                                            "Quick Purchase"
                                        )}
                                    </motion.button>
                                </div>

                                {isCustomizable && (
                                    <button
                                        onClick={handleOpenModal}
                                        className="w-full h-16 bg-[#1a1a1a] border border-accent/20 text-accent text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-3"
                                    >
                                        Personalize Design <span className="material-symbols-outlined">auto_fix_high</span>
                                    </button>
                                )}
                            </motion.div>

                            {/* Trust signals & Benefits */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-3 gap-4 pt-6 py-10 border-y border-white/5">
                                {benefits.map((b, i) => (
                                    <div key={i} className="text-center space-y-2 group">
                                        <span className="material-symbols-outlined text-accent group-hover:scale-110 transition-transform">{b.icon}</span>
                                        <h5 className="text-[10px] font-black uppercase tracking-widest leading-none">{b.title}</h5>
                                        <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{b.desc}</p>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Social Sharing */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-6 pt-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Share Architecture:</span>
                                <div className="flex gap-4">
                                    {[
                                        { icon: 'fa-brands fa-whatsapp', color: 'hover:text-green-500' },
                                        { icon: 'fa-brands fa-x-twitter', color: 'hover:text-white' },
                                        { icon: 'fa-regular fa-copy', color: 'hover:text-accent' }
                                    ].map((s, i) => (
                                        <button key={i} className={`text-white/40 transition-all ${s.color} hover:scale-125`}>
                                            <i className={`${s.icon} text-sm`}></i>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Shipping Check */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter Delivery Pincode"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        className="w-full bg-transparent border-b border-white/10 py-5 text-[11px] font-black tracking-[0.3em] uppercase focus:border-accent focus:outline-none transition-colors placeholder:text-white/10"
                                    />
                                    <button
                                        onClick={handlePincodeCheck}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-accent text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        {pincodeStatus === "checking" ? "Verifying..." : "Check"}
                                    </button>
                                </div>

                                {pincodeStatus && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${pincodeStatus === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className="material-symbols-outlined text-sm">{pincodeStatus === 'available' ? 'verified' : 'cancel'}</span>
                                        {pincodeStatus === 'available' ? 'Delivery Available in 3-5 days' : 'Non-serviceable location'}
                                    </motion.div>
                                )}

                                {/* Collapsible Specs */}
                                <div className="divide-y divide-white/5 border-t border-white/5">
                                    {['fabric', 'shipping'].map((tab) => (
                                        <div key={tab} className="py-6">
                                            <button
                                                onClick={() => setOpenAccordion(openAccordion === tab ? null : tab)}
                                                className="w-full flex justify-between items-center group"
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em] group-hover:text-accent transition-colors">
                                                    {tab === 'fabric' ? 'Material & Care' : 'Global Logistics'}
                                                </span>
                                                <span className={`material-symbols-outlined text-white/20 transition-transform ${openAccordion === tab ? 'rotate-180 text-accent' : ''}`}>
                                                    expand_circle_down
                                                </span>
                                            </button>
                                            <AnimatePresence>
                                                {openAccordion === tab && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="pt-6 pr-12 text-[11px] leading-loose text-white/50 uppercase font-black tracking-widest">
                                                            {tab === 'fabric'
                                                                ? (product.composition || "Premium Architecture. Hand-cold wash. Dry in shade. Engineered for durability.")
                                                                : "Dispatched from Mumbai within 24 hours. Air-travel 3-4 days to most metro cities worldwide."}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </aside>
                </div>
            </div>

            <ProductSuggestions product={product} />

            {/* Sticky Mobile Actions Bar */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 p-4 px-6 flex items-center justify-between lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-[calc(1rem+env(safe-area-inset-bottom))]"
                    >
                        <div className="flex flex-col flex-1 min-w-0 pr-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest truncate text-white/90">{product.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[#d4c4b1] font-impact text-lg">₹{product.price}</p>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 truncate">
                                    {selectedColor?.name} / {selectedSize || 'Choose Size'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                onClick={handleAddToBag}
                                whileTap={{ scale: 0.95 }}
                                className={`text-black px-6 h-14 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm transition-all shadow-xl shadow-[#d4c4b1]/10 flex items-center justify-center min-w-[130px]
                                    ${isAdded ? 'bg-green-600' : (isAdding ? 'bg-black text-white' : 'bg-[#d4c4b1]')}
                                `}
                            >
                                <AnimatePresence mode="wait">
                                    {isAdding ? (
                                        <motion.span key="adding_m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </motion.span>
                                    ) : isAdded ? (
                                        <motion.span key="added_m" initial={{ y: 10, scale: 0.8, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="flex items-center gap-1 text-white">
                                            ADDED <span className="material-symbols-outlined !text-sm">done</span>
                                        </motion.span>
                                    ) : (
                                        <motion.span key="add_m" initial={{ y: 10 }} animate={{ y: 0 }}>
                                            ADD TO BAG
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Sections */}
            <div className="mt-20 border-t border-white/5">
                <Reviews />
                <CollectiveFooter />
            </div>

            <CustomizationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onContinue={handleContinueCustomization}
            />

            {/* Premium Notification UI */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-10 left-1/2 z-[100] px-10 py-5 rounded-full backdrop-blur-xl border flex items-center gap-4 shadow-2xl
                            ${notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-accent/10 border-accent/20 text-accent'}
                        `}
                    >
                        <span className="material-symbols-outlined !text-base">{notification.type === 'error' ? 'warning' : 'verified'}</span>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
