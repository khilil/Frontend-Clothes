import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import './ProductCard.css';

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
      className="premium-product-card-luxury"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.slug}`} className="card-link-luxury">
        <div className="visual-container-p">
          {/* Badges */}
          <div className="card-badges-luxury">
            {product.isNewArrival && <span className="badge-luxury new">NEW</span>}
            {product.isOnSale && <span className="badge-luxury sale">SALE</span>}
          </div>

          {/* Wishlist Icon */}
          <button
            className={`wishlist-btn-luxury ${isLiked ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
          >
            <motion.span
              className="material-symbols-outlined"
              animate={isLiked ? { scale: [1, 1.3, 1], color: '#ff4b4b' } : { scale: 1, color: 'rgba(255,255,255,0.4)' }}
              whileTap={{ scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </motion.span>
          </button>

          {/* Product Images */}
          <div className="image-wrap-luxury">
            <motion.img
              src={primaryImage}
              alt={product.title}
              className="img-primary-p"
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 0 : 1
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.img
              src={secondaryImage}
              alt={`${product.title} hover`}
              className="img-secondary-p"
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
                className="card-quick-meta"
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

        <div className="info-container-p">
          <div className="info-top-p">
            <span className="brand-label-p">{product.brand || "GEN-Z ARCHIVE"}</span>
            <div className="price-wrap-p">
              <span className="price-current-p">₹{product.price}</span>
              {product.compareAtPrice > product.price && (
                <span className="price-old-p">₹{product.compareAtPrice}</span>
              )}
            </div>
          </div>

          <h3 className="title-product-p">{product.title}</h3>

          <div className="meta-footer-p">
            {colors.length > 0 && (
              <div className="swatches-mini-p">
                {colors.map((color, i) => (
                  <div
                    key={i}
                    className="swatch-dot-p"
                    style={{ backgroundColor: color.hexCode.startsWith('#') ? color.hexCode : `#${color.hexCode}` }}
                    title={color.name}
                  />
                ))}
              </div>
            )}

            {sizes.length > 0 && (
              <div className="sizes-mini-p">
                {sizes.map(size => (
                  <span key={size} className="size-label-p">{size}</span>
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
