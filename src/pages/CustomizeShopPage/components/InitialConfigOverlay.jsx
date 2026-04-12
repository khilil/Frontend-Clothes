import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProductBySlug } from "../../../services/productService";
import { motion, AnimatePresence } from "framer-motion";

export default function InitialConfigOverlay({ slug }) {
    const navigate = useNavigate();
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    useEffect(() => {
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

                const finalFront = images[0] || "https://placehold.co/600x800/121212/white?text=No+Front+Image";
                const finalBack = images[1] || images[0] || "https://placehold.co/600x800/121212/white?text=No+Back+Image";

                setProductData({
                    ...data,
                    frontImage: finalFront,
                    backImage: finalBack
                });

                if (data.variants && data.variants.length > 0) {
                    let defaultVariant = data.variants.find(v => v.stock > 0) || data.variants[0];
                    setSelectedVariant(defaultVariant);
                    setSelectedColor(defaultVariant.color);
                }
            })
            .catch(err => {
                console.error("Fetch product error in Initial Config:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [slug]);

    const uniqueColors = useMemo(() => {
        if (!productData || !productData.variants) return [];
        const colors = [];
        const seen = new Set();
        productData.variants.forEach(v => {
            const col = v.color;
            if (!col) return;
            const colorId = typeof col === 'object' ? (col._id || col.name) : col;
            if (colorId && !seen.has(colorId)) {
                seen.add(colorId);
                colors.push(typeof col === 'object' ? col : { _id: col, name: 'Standard', hexCode: '#000000' });
            }
        });
        return colors;
    }, [productData]);

    const filteredVariants = useMemo(() => {
        if (!productData || !productData.variants || !selectedColor) return [];
        return productData.variants.filter(v => (v.color?._id || v.color?.name) === (selectedColor._id || selectedColor.name));
    }, [productData, selectedColor]);

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        const firstAvailable = productData?.variants?.find(v => (v.color?._id || v.color?.name) === (color._id || color.name));
        if (firstAvailable) {
            setSelectedVariant(firstAvailable);
        }
    };

    const handleStartDesigning = () => {
        if (!selectedVariant || selectedVariant.stock <= 0) return;

        navigate(`/customize/${slug}`, {
            replace: true,
            state: {
                productId: productData._id,
                variantId: selectedVariant.sku,
                size: selectedVariant.size?.name,
                color: selectedColor?.name,
                hexColor: selectedColor?.hexCode || selectedColor?.value || null,
                title: productData.title,
                frontImage: productData.frontImage,
                backImage: productData.backImage,
                price: productData.price,
                stock: selectedVariant.stock
            }
        });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center">
                    <p className="text-black font-semibold mb-4">Product not found.</p>
                    <button onClick={() => navigate('/shop/all')} className="px-6 py-2 bg-black text-white rounded-lg">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-t-[28px] sm:rounded-[20px] overflow-hidden shadow-2xl max-w-[420px] w-full flex flex-col max-h-[92dvh] sm:max-h-none initial-config-modal"
            >
                {/* Header Image Area */}
                <div className="relative h-[170px] sm:h-[200px] w-full bg-[#f4f2ee] flex items-center justify-center overflow-hidden border-b border-black/5 shrink-0 initial-config-image">
                    <img 
                        src={productData.frontImage} 
                        alt="Product Preview" 
                        className="h-full object-cover mix-blend-multiply opacity-90 p-4"
                    />
                </div>

                <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-5 overflow-y-auto">
                    <div className="text-center space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black initial-config-title">{productData.title}</h2>
                        <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest">Select Base Options</p>
                    </div>

                    {/* Color Section */}
                    {uniqueColors.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex justify-between">
                                Color <span className="text-black/50 capitalize font-medium">{selectedColor?.name}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {uniqueColors.map((color) => {
                                    const isSelected = (selectedColor?._id || selectedColor?.name) === (color._id || color.name);
                                    return (
                                        <button
                                            key={color._id || color.name}
                                            onClick={() => handleColorSelect(color)}
                                            title={color.name}
                                            className={`relative w-10 h-10 rounded-full transition-all flex items-center justify-center
                                                ${isSelected ? 'ring-2 ring-black ring-offset-2' : 'border border-black/10 hover:scale-105'}
                                            `}
                                            style={{ backgroundColor: color.hexCode ? (color.hexCode.startsWith('#') ? color.hexCode : `#${color.hexCode}`) : color.name?.toLowerCase() }}
                                        >
                                            {isSelected && (
                                                <span className={`material-symbols-outlined text-[18px] ${color.name?.toLowerCase() === 'white' ? 'text-black' : 'text-white'}`}>
                                                    check
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Size Section */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-black uppercase tracking-wider">Select Size</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {filteredVariants.length > 0 ? filteredVariants.map((v) => {
                                const outOfStock = v.stock <= 0;
                                const isSelected = selectedVariant?._id === v._id;

                                return (
                                    <button
                                        key={v._id || v.sku}
                                        onClick={() => setSelectedVariant(v)}
                                        disabled={outOfStock}
                                        className={`h-12 border rounded-lg flex flex-col items-center justify-center transition-all relative
                                            ${isSelected 
                                                ? 'border-black bg-black text-white shadow-md' 
                                                : outOfStock 
                                                    ? 'border-black/5 bg-black/5 text-black/30 cursor-not-allowed'
                                                    : 'border-black/20 text-black hover:border-black/50 hover:bg-black/5'}
                                        `}
                                    >
                                        <span className="font-bold text-sm tracking-wide">{v.size?.name || "N/A"}</span>
                                    </button>
                                );
                            }) : (
                                <p className="text-xs text-black/50 col-span-4">No sizes available.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
                        <button
                            onClick={handleStartDesigning}
                            disabled={!selectedVariant || selectedVariant.stock <= 0}
                            className={`w-full h-14 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-[12px] transition-all
                                ${selectedVariant && selectedVariant.stock > 0 
                                    ? 'bg-black text-white hover:bg-black/90 active:scale-[0.98]' 
                                    : 'bg-black/10 text-black/40 cursor-not-allowed'}
                            `}
                        >
                            Start Designing
                            {selectedVariant && selectedVariant.stock > 0 && (
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            )}
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
