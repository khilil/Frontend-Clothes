import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import { useOffers } from '../../../context/OfferContext';
import FlashSaleTimer from '../FlashSaleTimer';
import { getMainColorFromHex } from '../../../utils/colorUtils';

const ProductCard = React.memo(({ product, activeColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleItem, isInWishlist } = useWishlist();
  const { getProductOffer } = useOffers();
  const isLiked = isInWishlist(product._id || product.id);

  const activeOffer = getProductOffer(product);

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

  const { sizes } = React.useMemo(() => {
    const sizeSet = new Set();
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        if (variant.size?.name) sizeSet.add(variant.size.name);
      });
    }
    return { sizes: Array.from(sizeSet).sort() };
  }, [product.variants]);

  const primaryImage = React.useMemo(() => {
    let primary = product.image;
    
    // 🎨 Logic to switch image based on active filter
    if (product.variants && product.variants.length > 0) {
      let targetVariant = product.variants[0];
      
      if (activeColor) {
        const matchingVariant = product.variants.find(v => {
          const mColor = v.color?.mainColor || (v.color?.hexCode ? getMainColorFromHex(v.color.hexCode) : 'GREY');
          return mColor === activeColor;
        });
        if (matchingVariant) targetVariant = matchingVariant;
      }

      if (targetVariant.images && targetVariant.images.length > 0) {
        const explicitPrimary = targetVariant.images.find(img => img.isPrimary);
        primary = explicitPrimary ? explicitPrimary.url : targetVariant.images[0].url;
      }
    }
    return primary || "/images/product_placeholder.png";
  }, [product, activeColor]);

  return (
    <motion.div
      className="luxury-card group h-full bg-white overflow-hidden rounded-[24px] border border-neutral-100 transition-all duration-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -10,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1), 0 10px 20px -15px rgba(0,0,0,0.15)"
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={product.isCustomizable ? `/customize/${product.slug}` : `/product/${product.slug}`} className="no-underline text-inherit flex flex-col h-full">
        {/* Image Container with Cinematic Zoom and Quick Sizes */}
        <div className="relative aspect-[4/5] md:aspect-[3/3.8] overflow-hidden bg-neutral-50">
          {/* Badges - Premium Soft Glass */}
          <div className="absolute top-[16px] left-[16px] md:top-[20px] md:left-[20px] z-[20] flex flex-col gap-[6px] md:gap-[8px]">
            {product.isCustomizable && (
              <span className="product-card-badge text-[8px] md:text-[9px] font-black tracking-[0.2em] py-[4px] px-[10px] md:py-[6px] md:px-[12px] uppercase backdrop-blur-xl bg-accent text-white rounded-full shadow-lg">
                CUSTOMIZE
              </span>
            )}
            {product.isNewArrival && (
              <span className="product-card-badge text-[8px] md:text-[9px] font-black tracking-[0.2em] py-[4px] px-[10px] md:py-[6px] md:px-[12px] uppercase backdrop-blur-xl bg-black text-white rounded-full shadow-lg">
                NEW
              </span>
            )}
            {(product.isOnSale || hasActiveOffer) && (
              <span className="product-card-badge text-[8px] md:text-[9px] font-black tracking-[0.2em] py-[4px] px-[10px] md:py-[6px] md:px-[12px] uppercase backdrop-blur-xl bg-accent text-white rounded-full shadow-lg">
                {activeOffer?.offerType ? activeOffer.offerType.replace(/_/g, ' ') : 'SALE'}
              </span>
            )}
          </div>

          {/* Wishlist Icon - Minimal Contours */}
          <button
            className={`absolute top-[16px] right-[16px] md:top-[20px] md:right-[20px] z-[20] w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-xl border border-black/5 transition-all duration-500 hover:scale-110 ${isLiked ? 'bg-black text-white border-black' : 'bg-white/40 text-black hover:bg-black hover:text-white'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
          >
            <motion.span
              className="material-symbols-outlined text-base md:text-lg"
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </motion.span>
          </button>

          {/* Product Image - Cinematic Zoom/Pan */}
          <motion.img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1,
              y: isHovered ? -8 : 0
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Quick Sizes Glass Bar - Frosted Light Reveal */}
          <AnimatePresence>
            {isHovered && sizes.length > 0 && (
              <motion.div
                className="absolute left-0 bottom-0 w-full z-[30] backdrop-blur-lg bg-white/70 border-t border-black/5 p-3 md:p-4"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-col gap-1.5 md:gap-2">
                  <span className="text-[7px] md:text-[8px] font-black text-black/30 tracking-[0.3em] uppercase">Quick Add</span>
                  <div className="flex gap-2.5 md:gap-3 flex-wrap">
                    {sizes.map(size => (
                      <span key={size} className="text-[9px] md:text-[10px] font-black text-black/80 hover:text-accent transition-colors cursor-default tracking-widest">{size}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-3.5 md:p-6 bg-white grow flex flex-col gap-2 md:gap-4 border-t border-neutral-100">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-1.5 md:gap-2">
            <div className="flex flex-col gap-0.5 md:gap-1">
              <span className="text-[8px] md:text-[10px] font-black text-accent tracking-[0.2em] md:tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">
                {product.brand || "FENRIR ERA"}
              </span>
              <h3 className="product-card-title text-[11px] md:text-[13px] font-bold text-neutral-900 leading-tight uppercase tracking-widest group-hover:text-black transition-colors duration-500 line-clamp-2">
                {product.title}
              </h3>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-[1px] shrink-0">
              <span className="product-card-price text-[14px] md:text-lg font-[1000] text-black tracking-tighter italic">
                ₹{hasActiveOffer ? finalPrice : product.price}
              </span>
              {displayCompareAtPrice && (
                <span className="product-card-price text-[9px] md:text-[10px] text-neutral-400 line-through font-medium tracking-tighter">
                  ₹{displayCompareAtPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto pt-1 md:pt-2">
            {activeOffer?.offerType === 'FLASH_SALE' && activeOffer.endDate && (
              <FlashSaleTimer endDate={activeOffer.endDate} />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;
