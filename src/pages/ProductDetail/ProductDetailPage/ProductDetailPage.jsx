import React, { useEffect, useState, useMemo, useRef, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ProductSuggestions } from "./ProductSuggestions";
import Reviews from "./Reviews";
import CollectiveFooter from "../../../components/common/CollectiveFooter/CollectiveFooter";
import { useCart } from "../../../context/CartContext";
import CustomizationModal from "./CustomizationPop_popModel";
import { getProductBySlug } from "../../../services/productService";
import { OffersSection } from "./OffersSection";
import { getActiveOffers } from "../../../services/offerService";
import SizeGuideModal from "./SizeGuideModal";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [offers, setOffers] = useState([]);
    const [page, setPage] = useState(0);
    const [direction, setDirection] = useState(0);
    const activeImage = page;

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
    const [hasExplicitlySelectedSize, setHasExplicitlySelectedSize] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);





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
                variantId: selectedVariant?.sku || selectedVariant?._id,
                size: selectedSize,
                color: selectedColor?.name,
                hexColor: selectedColor?.hexCode || selectedColor?.value || null,
                title: product.title,
                frontImage: images[0],
                backImage: images[1] || images[0],
                price: product.price,
            },
        });
    };

    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const data = await getActiveOffers();
            setOffers(data.data || []);
        } catch (error) {
            console.error("Fetch offers error:", error);
        }
    };

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
        setTimeout(async () => {
            try {
                await addToCart(product, {
                    variantId: selectedVariant.sku,
                    size: selectedSize,
                    color: selectedVariant.color?.name
                });

                setIsAdding(false);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2000);
            } catch (error) {
                console.error("Cart error:", error);
                setIsAdding(false);
            }
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
        setHasExplicitlySelectedSize(true);
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

    const setActiveImage = (newIndex) => {
        const normalizedIndex = (newIndex + images.length) % images.length;
        if (normalizedIndex === page) return;

        let newDirection = normalizedIndex > page ? 1 : -1;
        
        // Edge cases for wrap-around feeling
        if (page === 0 && normalizedIndex === images.length - 1) newDirection = -1;
        if (page === images.length - 1 && normalizedIndex === 0) newDirection = 1;

        setDirection(newDirection);
        setPage(normalizedIndex);
    };


    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };


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
            <div className="min-h-screen bg-background flex items-center justify-center text-text-primary">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <div className="animate-pulse font-[Oswald] tracking-widest uppercase text-accent-contrast text-xs">Loading Architecture…</div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-text-primary">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-impact">PRODUCT NOT FOUND</h2>
                    <button onClick={() => navigate('/')} className="text-accent-contrast uppercase text-[10px] font-black tracking-widest border-b border-accent/30 p-2">Return Home</button>
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
        <main className="pt-12 md:pt-20 bg-background text-text-primary selection:bg-accent selection:text-white overflow-x-hidden">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-2 md:py-12">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-20 items-start">

                    {/* LEFT: MEDIA GALLERY */}
                    <section className="w-full lg:w-[55%] lg:sticky lg:top-28">
                        <div className="flex flex-col lg:flex-row gap-4 h-full relative">
                            {/* Thumbnails - Left Vertical on Desktop, Hidden on Mobile */}
                            <div className="hidden lg:flex flex-col gap-3 overflow-y-auto no-scrollbar h-fit lg:max-h-[700px] snap-y snap-mandatory w-20 shrink-0">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`relative flex-shrink-0 w-full aspect-[3/4] overflow-hidden transition-all snap-start rounded-sm border
                                            ${i === activeImage ? "border-accent ring-1 ring-accent ring-offset-2 ring-offset-[#0a0a0a]" : "border-white/10 opacity-40 hover:opacity-100 hover:border-white/30"}
                                        `}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        {i === activeImage && (
                                            <motion.div layoutId="thumb-active" className="absolute inset-0 bg-accent/5" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Main Gallery Area */}
                            <div className="flex-1 relative group bg-secondary rounded-sm overflow-hidden border border-border-subtle">
                                {/* Desktop/Mobile Main Stage */}
                                <div 
                                    className="relative aspect-square lg:aspect-[3/4] w-full"
                                >
                                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                        <motion.img
                                            key={page}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 400, damping: 40 },
                                                opacity: { duration: 0.2 },
                                                scale: { duration: 0.3 }
                                            }}
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            dragElastic={1}
                                            onDragEnd={(e, { offset, velocity }) => {
                                                const swipe = swipePower(offset.x, velocity.x);

                                                if (swipe < -swipeConfidenceThreshold) {
                                                    setActiveImage((activeImage + 1) % images.length);
                                                } else if (swipe > swipeConfidenceThreshold) {
                                                    setActiveImage((activeImage - 1 + images.length) % images.length);
                                                }
                                            }}
                                            src={images[activeImage]}
                                            alt={`${product.title} - ${activeImage + 1}`}
                                            className="w-full h-full object-cover cursor-grab active:cursor-grabbing touch-pan-y"
                                        />
                                    </AnimatePresence>

                                    {/* Desktop Navigation Arrows */}
                                    <div className="absolute inset-y-0 left-0 right-0 hidden lg:flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <button
                                            onClick={() => setActiveImage(activeImage - 1)}
                                            className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-all rounded-full pointer-events-auto shadow-2xl"
                                        >
                                            <span className="material-symbols-outlined !text-xl text-white group-hover:text-black">west</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveImage(activeImage + 1)}
                                            className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-all rounded-full pointer-events-auto shadow-2xl"
                                        >
                                            <span className="material-symbols-outlined !text-xl text-white group-hover:text-black">east</span>
                                        </button>
                                    </div>


                                    {/* Premium Pagination Indicator */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0">
                                        <div className="flex items-center gap-4 bg-background/40 backdrop-blur-xl border border-border-subtle px-6 py-2.5 rounded-full shadow-2xl">
                                            {/* Dot Indicators for Mobile (Visual only interaction is via arrows/swipe) */}
                                            <div className="flex gap-1.5 lg:hidden mr-2">
                                                {images.map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`w-1 h-1 rounded-full transition-all duration-300 ${i === activeImage ? 'w-4 bg-accent' : 'bg-white/20'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black tracking-[0.3em] overflow-hidden">
                                                <span className="text-accent">{String(activeImage + 1).padStart(2, '0')}</span>
                                                <span className="text-white/20 mx-2">/</span>
                                                <span className="text-white/40">{String(images.length).padStart(2, '0')}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Interaction Swipe Hint (Visible briefly or on focus) */}
                                <div className="lg:hidden absolute top-6 right-6 opacity-0 animate-pulse pointer-events-none group-active:opacity-100 transition-opacity">
                                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                                        <span className="material-symbols-outlined text-sm">swipe</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Horizontal Thumbnails */}
                            <div className="lg:hidden flex gap-2.5 overflow-x-auto no-scrollbar px-1 pb-2 h-20 snap-x snap-mandatory">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`relative flex-shrink-0 w-16 aspect-square overflow-hidden transition-all snap-center rounded-sm border
                                            ${i === activeImage ? "border-accent" : "border-white/5 opacity-50"}
                                        `}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
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
                                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
                                    <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                                    <span className="w-1 h-1 bg-border-subtle rounded-full"></span>
                                    <span className="text-text-primary">Product Details</span>
                                </nav>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-impact tracking-tighter leading-[0.9] uppercase">
                                    {product.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 pt-2">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-impact text-accent-contrast leading-none">₹{product.price}</span>
                                        {product.compareAtPrice > product.price && (
                                            <span className="text-lg font-impact text-text-tertiary line-through leading-none">₹{product.compareAtPrice}</span>
                                        )}
                                    </div>
                                    <div className="w-px h-6 bg-border-subtle"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex text-accent-contrast">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <span key={n} className="material-symbols-outlined !text-sm">star</span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest text-text-muted">15.2K REVIEWS</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Color Selection */}
                            {uniqueColors.length > 0 && (
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                                    <div className="flex justify-between items-center pr-4 border-b border-border-subtle pb-2">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-primary">Select Palette</h4>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-accent-contrast drop-shadow-[0_0_8px_rgba(184,134,11,0.1)]">{selectedColor?.name}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        {uniqueColors.map((color) => (
                                            <button
                                                key={color._id || color.name}
                                                onClick={() => handleColorSelect(color)}
                                                className={`w-14 h-14 rounded-full border transition-all duration-300 relative group/swatch
                                                    ${(selectedColor?._id || selectedColor?.name) === (color._id || color.name)
                                                        ? "border-accent ring-2 ring-accent ring-offset-[3px] ring-offset-background scale-110 shadow-[0_0_20px_rgba(184,134,11,0.2)] z-10"
                                                        : "border-border-subtle opacity-60 hover:opacity-100 hover:scale-105 hover:border-accent"}
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
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-6">
                                <div className="flex justify-between items-center pr-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-2xl font-impact uppercase tracking-tight text-text-primary">Select Size</h4>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent-contrast/70">• {selectedColor?.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => setIsSizeGuideOpen(true)}
                                        className="text-[10px] font-bold uppercase tracking-widest text-accent-contrast hover:text-accent transition-all border-b border-accent/20"
                                    >
                                        Sizing Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {filteredVariants.map(v => (
                                        <button
                                            key={v._id}
                                            onClick={() => handleSizeSelect(v)}
                                            disabled={v.stock <= 0}
                                            className={`min-w-[70px] h-14 rounded-xl flex items-center justify-center transition-all duration-300 border relative group/size
                                                ${hasExplicitlySelectedSize && selectedVariant?._id === v._id
                                                    ? "bg-text-primary text-background border-text-primary shadow-[0_0_20px_rgba(0,0,0,0.1)] z-10"
                                                    : "border-border-subtle bg-secondary text-text-secondary hover:border-accent hover:text-text-primary"}
                                                ${v.stock <= 0 ? "opacity-10 cursor-not-allowed filter grayscale pointer-events-none" : ""}
                                            `}
                                        >
                                            <span className={`text-[13px] font-bold tracking-tight uppercase transition-transform ${selectedVariant?._id === v._id ? "scale-105" : "group-hover/size:scale-105"}`}>
                                                {v.size?.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {hasExplicitlySelectedSize && selectedVariant?.measurements && (() => {
                                    const type = selectedVariant.measurements.garmentType;
                                    const measData = selectedVariant.measurements[type] || {};
                                    const items = [];

                                    // Helper to format labels
                                    const formatLabel = (key) => {
                                        const labels = {
                                            chest: 'Chest',
                                            frontLength: 'Front Length',
                                            sleeveLength: 'Sleeve Length',
                                            shoulder: 'Shoulder',
                                            waist: 'Waist',
                                            hips: 'Hips',
                                            outseamLength: 'Outseam Length',
                                            thigh: 'Thigh',
                                            inseam: 'Inseam'
                                        };
                                        return labels[key] || key;
                                    };

                                    // Add standard fields
                                    Object.entries(measData).forEach(([key, val]) => {
                                        if (key !== 'custom' && val > 0) {
                                            items.push({ label: formatLabel(key), val });
                                        }
                                    });

                                    // Add custom fields
                                    if (measData.custom) {
                                        Object.entries(measData.custom).forEach(([key, val]) => {
                                            if (key && val) {
                                                items.push({ label: key, val });
                                            }
                                        });
                                    }

                                    if (items.length === 0) return null;

                                    return (
                                        <div className="pt-2 flex flex-col gap-3">
                                            <span className="text-text-muted uppercase text-[9px] tracking-[0.3em] font-black">Garment (In Inches)</span>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                                                {items.map((item, i) => (
                                                    <Fragment key={i}>
                                                        <div className="flex items-center gap-2 bg-secondary px-2 py-1.5 rounded-lg border border-border-subtle backdrop-blur-sm">
                                                            <span className="text-text-muted uppercase font-black tracking-widest text-[8px] sm:text-[9px]">{item.label}</span>
                                                            <span className="text-text-primary font-impact text-sm sm:text-base leading-none tracking-tighter border-l border-border-subtle pl-2 ml-auto">{item.val}</span>
                                                        </div>
                                                    </Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
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
                                            ${isAdded ? 'bg-green-600 text-white' : (isAdding ? 'bg-text-primary text-background' : 'bg-text-primary text-background hover:bg-accent hover:text-white')}
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
                                        className="h-20 border border-border-subtle text-[11px] font-black uppercase tracking-[0.4em] hover:bg-secondary transition-all flex items-center justify-center gap-4 disabled:opacity-20"
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
                                        className="w-full h-16 bg-secondary border border-accent/20 text-accent text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3"
                                    >
                                        Personalize Design <span className="material-symbols-outlined">auto_fix_high</span>
                                    </button>
                                )}
                            </motion.div>

                            {/* Interactive Offers Section */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <OffersSection offers={offers} />
                            </motion.div>

                            {/* Trust signals & Benefits */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-3 gap-4 pt-6 py-10 border-y border-border-subtle">
                                {benefits.map((b, i) => (
                                    <div key={i} className="text-center space-y-2 group">
                                        <span className="material-symbols-outlined text-accent group-hover:scale-110 transition-transform">{b.icon}</span>
                                        <h5 className="text-[10px] font-black uppercase tracking-widest leading-none text-text-primary">{b.title}</h5>
                                        <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">{b.desc}</p>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Social Sharing */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-6 pt-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Share Architecture:</span>
                                <div className="flex gap-4">
                                    {[
                                        { icon: 'fa-brands fa-whatsapp', color: 'hover:text-green-500' },
                                        { icon: 'fa-brands fa-x-twitter', color: 'hover:text-text-primary' },
                                        { icon: 'fa-regular fa-copy', color: 'hover:text-accent' }
                                    ].map((s, i) => (
                                        <button key={i} className={`text-text-secondary/60 transition-all ${s.color} hover:scale-125`}>
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
                                        className="w-full bg-transparent border-b border-border-subtle py-5 text-[11px] font-black tracking-[0.3em] uppercase focus:border-accent focus:outline-none transition-colors placeholder:text-text-tertiary/60"
                                    />
                                    <button
                                        onClick={handlePincodeCheck}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-accent-contrast text-[10px] font-black uppercase tracking-widest hover:text-text-primary transition-colors"
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
                                <div className="divide-y divide-border-subtle border-t border-border-subtle">
                                    {['fabric', 'shipping'].map((tab) => (
                                        <div key={tab} className="py-6">
                                            <button
                                                onClick={() => setOpenAccordion(openAccordion === tab ? null : tab)}
                                                className="w-full flex justify-between items-center group"
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em] group-hover:text-accent transition-colors">
                                                    {tab === 'fabric' ? 'Material & Care' : 'Global Logistics'}
                                                </span>
                                                <span className={`material-symbols-outlined text-text-muted transition-transform ${openAccordion === tab ? 'rotate-180 text-accent' : ''}`}>
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
                                                        <p className="pt-6 pr-12 text-[11px] leading-loose text-text-muted uppercase font-black tracking-widest">
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
                        className="fixed bottom-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-2xl border-t border-border-subtle p-4 px-6 flex items-center justify-between lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-[calc(1rem+env(safe-area-inset-bottom))]"
                    >
                        <div className="flex flex-col flex-1 min-w-0 pr-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest truncate text-text-primary">{product.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-accent font-impact text-lg">₹{product.price}</p>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary/60 truncate">
                                    {selectedColor?.name} / {selectedSize || 'Choose Size'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                onClick={handleAddToBag}
                                whileTap={{ scale: 0.95 }}
                                className={`text-background px-6 h-14 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm transition-all shadow-xl shadow-accent/10 flex items-center justify-center min-w-[130px]
                                    ${isAdded ? 'bg-green-600' : (isAdding ? 'bg-text-primary text-background' : 'bg-accent')}
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
            <div className="mt-20 border-t border-border-subtle">
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
            <SizeGuideModal 
                isOpen={isSizeGuideOpen} 
                onClose={() => setIsSizeGuideOpen(false)} 
                garmentType={product?.variants?.[0]?.measurements?.garmentType || 'top'}
            />
        </main>
    );
}
