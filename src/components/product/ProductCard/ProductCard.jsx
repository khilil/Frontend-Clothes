import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
const ProductCard = React.memo(({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleItem, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(product._id || product.id);

  // Extract unique colors and sizes from variants
  const { colors, sizes } = React.useMemo(() => {
    const colorMap = new Map();
    const sizeSet = new Set();

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        if (variant.color) {
          const colorKey = variant.color._id || variant.color.name;
          if (!colorMap.has(colorKey)) {
            colorMap.set(colorKey, variant.color);
          }
        }
        if (variant.size?.name) {
          sizeSet.add(variant.size.name);
        }
      });
    }

    return {
      colors: Array.from(colorMap.values()),
      sizes: Array.from(sizeSet).sort()
    };
  }, [product.variants]);

  // Get primary and secondary images
  const { primaryImage, secondaryImage } = React.useMemo(() => {
    let primary = product.image;
    let secondary = product.hoverImage;

    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.images && firstVariant.images.length > 0) {
        // Try to find an image explicitly marked as primary
        const explicitPrimary = firstVariant.images.find(img => img.isPrimary);

        if (explicitPrimary) {
          primary = explicitPrimary.url;
          // Secondary should be the first image that is NOT the primary one
          const nextImage = firstVariant.images.find(img => img.url !== primary);
          secondary = nextImage ? nextImage.url : primary;
        } else {
          // Fallback to the first image if none marked primary
          primary = firstVariant.images[0].url;
          secondary = firstVariant.images[1]?.url || primary;
        }
      }
    }

    return {
      primaryImage: primary || "https://via.placeholder.com/400x533?text=No+Image",
      secondaryImage: secondary || primary || "https://via.placeholder.com/400x533?text=No+Image"
    };
  }, [product]);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      className="relative bg-[#0d0d0d] overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] border border-white/5 h-full hover:border-[#d4c4b1]/20 hover:-translate-y-[5px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.slug}`} className="no-underline text-inherit flex flex-col h-full">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
          {/* Badges */}
          <div className="absolute top-[15px] left-[15px] z-[10] flex flex-col gap-[6px]">
            {product.isNewArrival && <span className="text-[8px] font-black tracking-[0.15em] py-[6px] px-[10px] uppercase backdrop-blur-[10px] border border-white/10 bg-white/90 text-black">NEW</span>}
            {product.isOnSale && <span className="text-[8px] font-black tracking-[0.15em] py-[6px] px-[10px] uppercase backdrop-blur-[10px] border-[#d4c4b1]/20 bg-[#d4c4b1]/90 text-black">SALE</span>}
          </div>

          {/* Wishlist Icon */}
          <button
            className={`absolute top-[15px] right-[15px] z-10 bg-black/20 backdrop-blur-[10px] border border-white/10 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-400 ease hover:bg-white/90 hover:text-[#ff4b4b] hover:border-[#ff4b4b] ${isLiked ? '!bg-white/90 !border-[#ff4b4b]' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
          >
            <motion.span
              className="material-symbols-outlined text-base transition-all duration-300"
              animate={isLiked ? { scale: [1, 1.3, 1], color: '#ff4b4b' } : { scale: 1, color: 'rgba(255,255,255,0.4)' }}
              whileTap={{ scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </motion.span>
          </button>

          {/* Product Images */}
          <div className="w-full h-full relative">
            <motion.img
              src={primaryImage}
              alt={product.title}
              className="w-full h-full object-cover absolute top-0 left-0"
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 0 : 1
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.img
              src={secondaryImage}
              alt={`${product.title} hover`}
              className="w-full h-full object-cover absolute top-0 left-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 1.1
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Quick Details Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
              >
                {/* Removed size and color rendering from here */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 md:p-5 md:pb-6 bg-[#0d0d0d] grow flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black text-[#d4c4b1] tracking-[0.3em] uppercase mt-1">{product.brand || "GEN-Z ARCHIVE"}</span>
            <div className="flex flex-col items-end gap-[2px]">
              <span className="text-[14px] md:text-base font-[950] text-white tracking-[-0.01em]">₹{product.price}</span>
              {product.compareAtPrice > product.price && (
                <span className="text-[11px] text-white/20 line-through font-medium">₹{product.compareAtPrice}</span>
              )}
            </div>
          </div>

          <h3 className="text-[12px] md:text-[13px] font-medium text-white/50 leading-[1.4] uppercase tracking-[0.05em] m-0 line-clamp-1">{product.title}</h3>

          <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
            {colors.length > 0 && (
              <div className="flex gap-2">
                {colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-[0_0_5px_rgba(0,0,0,0.3)]"
                    style={{ backgroundColor: color.hexCode.startsWith('#') ? color.hexCode : `#${color.hexCode}` }}
                    title={color.name}
                  />
                ))}
              </div>
            )}

            {sizes.length > 0 && (
              <div className="flex gap-2.5">
                {sizes.map(size => (
                  <span key={size} className="text-[11px] font-black text-white/40 tracking-[0.05em] uppercase">{size}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;
