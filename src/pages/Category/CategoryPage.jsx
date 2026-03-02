import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchProducts } from "../../api/products.api";
import { motion, AnimatePresence } from "framer-motion";

import FiltersSidebar from "../../pages/ProductDetail/Filters sidebar/FiltersSidebar";
import ProductSection from "../../pages/ProductDetail/ProductSection/ProductSection";
import CategoryHero from "./CategoryHero";
import CollectiveFooter from "../../components/common/CollectiveFooter/CollectiveFooter";
import { TOPWEAR_SIZES, BOTTOMWEAR_SIZES, isBottomwear } from "../../utils/sizeConstants";

export default function CategoryPage() {
  const { slug } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // મોબાઈલ ડ્રોઅર કંટ્રોલ કરવા માટે
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: slug || 'all',
    brand: [],
    sizes: [], // Changed from size: null to sizes: []
    fit: [],
    price: 10000,
    sort: 'newest'
  });

  // Extract available sizes based on category/product group
  const availableSizes = useMemo(() => {
    // If we can determine the category from the slug or product types
    const firstProductType = allProducts.length > 0 ? allProducts[0].productType : '';

    if (isBottomwear(slug, firstProductType)) {
      return BOTTOMWEAR_SIZES;
    }

    // Default to Topwear for clothing if not clearly bottomwear
    return TOPWEAR_SIZES;
  }, [allProducts, slug]);

  const availableFits = useMemo(() => {
    // Current schema uses productType instead of explicit "fit" usually, 
    // but if fits exist in metadata we could pull them.
    // For now, let's use product types as "fits" or just return common ones.
    const types = new Set(allProducts.map(p => p.productType).filter(Boolean));
    return Array.from(types);
  }, [allProducts]);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 10000;
    return Math.max(...allProducts.map(p => p.price || 0));
  }, [allProducts]);

  const handleSizeChange = size => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleSortChange = sort => setFilters(prev => ({ ...prev, sort }));

  const handleFitChange = fit => {
    setFilters(prev => ({
      ...prev,
      fit: prev.fit.includes(fit)
        ? prev.fit.filter(f => f !== fit)
        : [...prev.fit, fit]
    }));
  };

  const handlePriceChange = price => setFilters(prev => ({ ...prev, price }));

  const handleClear = () => {
    setFilters({
      category: slug || 'all',
      brand: [],
      sizes: [],
      fit: [],
      price: maxPrice,
      sort: 'newest'
    });
  };

  // Sticky State for Animation
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400); // Adjust based on Hero height
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* FETCH API */
  useEffect(() => {
    setIsLoading(true);
    fetchProducts({ category: slug }).then(data => {
      setAllProducts(data?.products || []);
      setIsLoading(false);
    }).catch(err => {
      console.error("Fetch products error:", err);
      setIsLoading(false);
    });
  }, [slug]);

  /* FILTER LOGIC (FRONTEND) */
  useEffect(() => {
    let result = [...allProducts];

    // Backend already filters by category, so no need to repeat that here

    // 1. Filter by Size
    if (filters.sizes.length > 0) {
      result = result.filter(p =>
        p.variants?.some(v => filters.sizes.includes(v.size?.name))
      );
    }

    // 2. Filter by Fit (Product Type)
    if (filters.fit.length > 0) {
      result = result.filter(p => p.productType && filters.fit.includes(p.productType.toLowerCase()));
    }

    // 3. Filter by Price
    result = result.filter(p => (p.price || 0) <= filters.price);

    // 4. Apply Sorting
    switch (filters.sort) {
      case 'price-low-high':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high-low':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFiltered(result);
  }, [allProducts, filters]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">

      <main className="flex-1 flex flex-col lg:flex-row pt-5 lg:pt-20">

        {/* DESKTOP SIDEBAR - (મોબાઈલમાં છુપાઈ જશે) */}
        <aside className="hidden lg:block w-80 h-fit sticky top-20 border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar">
          <FiltersSidebar
            filters={filters}
            availableSizes={availableSizes}
            availableFits={availableFits}
            maxPrice={maxPrice}
            onSizeChange={handleSizeChange}
            onFitChange={handleFitChange}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
            onClear={handleClear}
          />
        </aside>

        {/* --- MOBILE DRAWER CONTENT (Framer Motion) --- */}
        <AnimatePresence>
          {isDrawerOpen && (
            <div className="fixed inset-0 z-[70] lg:hidden">
              {/* Dark Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
              ></motion.div>

              {/* Drawer Body */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-white/10 rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-transform duration-500"
              >
                {/* TAP TO CLOSE HANDLE */}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full pt-4 pb-2 flex flex-col items-center group active:scale-95 transition-transform"
                >
                  <div className="w-12 h-1 bg-white/20 rounded-full group-hover:bg-accent transition-colors mb-4"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">Tap to Close</h4>
                </button>

                <div className="p-8 pt-4 pb-32 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/90">Refine Collection</h4>
                  </div>

                  <FiltersSidebar
                    filters={filters}
                    availableSizes={availableSizes}
                    availableFits={availableFits}
                    maxPrice={maxPrice}
                    onSizeChange={handleSizeChange}
                    onFitChange={handleFitChange}
                    onPriceChange={handlePriceChange}
                    onSortChange={handleSortChange}
                    onClear={handleClear}
                    isMobile={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 absolute bottom-0 left-0 right-0 p-8 pt-6 pb-10 bg-black/80 backdrop-blur-xl border-t border-white/5">
                  <button
                    onClick={() => { handleClear(); setIsDrawerOpen(false); }}
                    className="py-4 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:border-white/30 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-accent text-black hover:bg-white transition-colors"
                  >
                    View Results
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 main-scroll-area">
          <CategoryHero />

          {/* --- INTEGRATED FILTER & SORT BAR (Sticky with Framer Motion) --- */}
          <motion.div
            layout
            className={`lg:hidden sticky top-0 z-40 border-b transition-colors duration-500 ${isSticky
              ? "bg-black/95 backdrop-blur-xl border-white/10 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] translate-y-0"
              : "bg-transparent border-transparent py-5 opacity-90"
              } px-6 md:px-12 flex items-center justify-between`}
          >
            <div className="flex items-center gap-8">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-3 transition-all hover:opacity-70 active:scale-95"
              >
                <motion.span
                  animate={{ color: isSticky ? "#C5A059" : "#ffffff" }}
                  className="material-symbols-outlined text-[20px]"
                >
                  tune
                </motion.span>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Filter</span>
                {filters.sizes.length > 0 || filters.fit.length > 0 || filters.price < maxPrice ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 bg-accent rounded-full mb-3 ml-[-8px]"
                  ></motion.div>
                ) : null}
              </button>

              <div className="h-4 w-px bg-white/10 mx-2"></div>
              <motion.span
                key={filtered.length}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30"
              >
                {filtered.length} PRODUCTS FOUND
              </motion.span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Sort By</span>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-accent transition-colors">
                  Featured
                  <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* ACTIVE FILTER CHIPS */}
          <AnimatePresence>
            {(filters.sizes.length > 0 || filters.fit.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-6 md:px-12 py-4 flex flex-wrap gap-2"
              >
                {filters.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/30 rounded-full transition-colors group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Size: {size}</span>
                    <span className="material-symbols-outlined text-[14px] text-white/20 group-hover:text-white">close</span>
                  </button>
                ))}
                {filters.fit.map(fit => (
                  <button
                    key={fit}
                    onClick={() => handleFitChange(fit)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/30 rounded-full transition-colors group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Fit: {fit}</span>
                    <span className="material-symbols-outlined text-[14px] text-white/20 group-hover:text-white">close</span>
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="min-h-[60vh] px-6 md:px-12 py-10">
            {filtered.length > 0 ? (
              <ProductSection products={filtered} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center"
              >
                <span className="material-symbols-outlined text-[64px] text-white/10 mb-6">inventory_2</span>
                <h3 className="text-xl font-impact tracking-widest text-white/40 mb-2">NO PRODUCTS MATCH YOUR FILTERS</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-8">Try adjusting your filters or clearing all to see more products</p>
                <button
                  onClick={handleClear}
                  className="px-10 py-4 bg-accent text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all transform hover:scale-105"
                >
                  Reset All Filters
                </button>
              </motion.div>
            )}
          </div>
          {/* <CollectiveFooter /> */}
        </div>

      </main>
    </div>
  );
}