import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts } from "../../../api/products.api";
import ProductCard from "../../../components/product/ProductCard/ProductCard";

export const ProductSuggestions = ({ product }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  const navigate = useNavigate();

  const loadProducts = (pageNum, isInitial = false) => {
    if (!product) return;

    const categorySlug = product.category?.slug || product.category;

    fetchProducts({ category: categorySlug })
      .then(data => {
        const productsList = data.products || [];
        const filtered = productsList.filter(p => p._id !== product._id);

        if (isInitial) {
          setRelatedProducts(filtered.slice(0, 8));
          setHasMore(filtered.length > 8);
        } else {
          setRelatedProducts(prev => {
            const currentIds = new Set(prev.map(p => p._id));
            const newItems = filtered.filter(p => !currentIds.has(p._id)).slice(0, 4);
            if (newItems.length === 0) setHasMore(false);
            return [...prev, ...newItems];
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Suggestions fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts(1, true);
  }, [product]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
          loadProducts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  if (!loading && !relatedProducts.length) return null;

  return (
    <section className="py-24 md:py-48 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
      {/* Visual Identity Accents */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
      <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        <header className="mb-20 md:mb-32 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <span className="w-12 h-[1px] bg-accent"></span>
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-accent">FOR YOU</span>
            </div>
            <h2 className="text-6xl md:text-[8rem] lg:text-[10rem] font-impact tracking-tighter uppercase leading-[0.8] mb-4">
              EXPLORE <br /> <span className="text-white/10" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>COLLECTION</span>
            </h2>
            <p className="text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] text-white/40 max-w-xl leading-relaxed">
              Meticulously curated by our creative studio, these selections are engineered to elevate your wardrobe architecture. Explore the discovery feed.
            </p>
          </motion.div>
        </header>

        {/* Vertical Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence>
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </AnimatePresence>
        </div>

        {/* Infinite Scroll Trigger & Loader */}
        <div ref={observerTarget} className="mt-32 flex flex-col items-center justify-center gap-8 py-20 border-t border-white/5">
          {hasMore ? (
            <>
              <div className="w-12 h-12 border border-accent/20 border-t-accent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/40 animate-pulse">Synchronizing Style Discovery...</span>
            </>
          ) : (
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Discovery Feed Complete</span>
              <div className="w-24 h-[1px] bg-white/5 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

