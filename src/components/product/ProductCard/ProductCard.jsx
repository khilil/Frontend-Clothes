import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import { useOffers } from '../../../context/OfferContext';
import FlashSaleTimer from '../FlashSaleTimer';
const ProductCard = React.memo(({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleItem, isInWishlist } = useWishlist();
  const { getProductOffer } = useOffers();
  const isLiked = isInWishlist(product._id || product.id);

  const activeOffer = getProductOffer(product);
  
  // Calculate final price based on active offer
  const hasActiveOffer = !!activeOffer;
  let finalPrice = product.price;
  let discountPercentage = 0;

  if (hasActiveOffer) {
    if (activeOffer.discountType === "PERCENTAGE") {
        discountPercentage = activeOffer.discountValue;
        finalPrice = Math.round(product.price * (1 - discountPercentage / 100));
    } else {
        finalPrice = product.price - activeOffer.discountValue;
        discountPercentage = Math.round((activeOffer.discountValue / product.price) * 100);
    }
  }

  const displayCompareAtPrice = product.compareAtPrice > product.price ? product.compareAtPrice : (hasActiveOffer ? product.price : null);

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
      className="luxury-card group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.slug}`} className="no-underline text-inherit flex flex-col h-full">
        <div className="relative aspect-[3/3.8] overflow-hidden bg-secondary">
          {/* Badges */}
          <div className="absolute top-[15px] left-[15px] z-[10] flex flex-col gap-[6px]">
            {product.isNewArrival && <span className="text-[8px] font-black tracking-[0.15em] py-[6px] px-[10px] uppercase backdrop-blur-[10px] border border-text-primary/10 bg-text-primary/90 text-primary">NEW</span>}
            {(product.isOnSale || hasActiveOffer) && (
                <span className="text-[8px] font-black tracking-[0.15em] py-[6px] px-[10px] uppercase backdrop-blur-[10px] border-accent/20 bg-accent/90 text-primary">
                    {activeOffer?.offerType ? activeOffer.offerType.replace(/_/g, ' ') : 'SALE'}
                </span>
            )}
          </div>

          {/* Wishlist Icon */}
          <button
            className={`absolute top-[15px] right-[15px] z-10 bg-primary/20 backdrop-blur-[10px] border border-text-primary/10 text-text-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-400 ease hover:bg-text-primary/90 hover:text-danger hover:border-danger ${isLiked ? '!bg-text-primary/90 !border-danger' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
          >
            <motion.span
              className="material-symbols-outlined text-base transition-all duration-300"
              animate={isLiked ? { scale: [1, 1.3, 1], color: 'var(--color-danger)' } : { scale: 1, color: 'rgba(255,255,255,0.4)' }}
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

        <div className="p-4 md:p-5 md:pb-6 bg-secondary grow flex flex-col gap-2 border-t border-border-subtle">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black text-accent-contrast tracking-[0.3em] uppercase mt-1 leading-none">{product.brand || "FENRIR ARCHIVE"}</span>
            <div className="flex flex-col items-end gap-[1px]">
              <span className="text-[14px] md:text-base font-[950] text-text-primary tracking-[-0.01em]">₹{hasActiveOffer ? finalPrice : product.price}</span>
              {displayCompareAtPrice && (
                <span className="text-[11px] text-text-tertiary line-through font-medium">₹{displayCompareAtPrice}</span>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            {activeOffer?.offerType === 'FLASH_SALE' && activeOffer.endDate && (
                <FlashSaleTimer endDate={activeOffer.endDate} />
            )}
            <h3 className="text-[12px] md:text-[13px] font-medium text-text-secondary leading-[1.4] uppercase tracking-[0.05em] m-0 line-clamp-1 group-hover:text-text-primary transition-colors duration-300">{product.title}</h3>
          </div>

          <div className="mt-auto pt-3 border-t border-border-subtle flex justify-between items-center">
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
                  <span key={size} className="text-[11px] font-black text-text-secondary tracking-[0.05em] uppercase hover:text-accent transition-colors cursor-default">{size}</span>
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
