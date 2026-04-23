import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchProducts } from "../../api/products.api";
import { fetchCategories } from "../../api/categories.api";
import { fetchSizes, fetchColors } from "../../api/attributes.api";
import { motion, AnimatePresence } from "framer-motion";

import FiltersSidebar from "../../pages/ProductDetail/Filters sidebar/FiltersSidebar";
import ProductSection from "../../pages/ProductDetail/ProductSection/ProductSection";
import CategoryHero from "./CategoryHero";
import CollectiveFooter from "../../components/common/CollectiveFooter/CollectiveFooter";
import { TOPWEAR_SIZES, BOTTOMWEAR_SIZES, isBottomwear } from "../../utils/sizeConstants";
import { COLOR_CATEGORIES, getColorCategoryInfo, getMainColorFromHex } from "../../utils/colorUtils";
import SEO from "../../components/common/SEO";

export default function CategoryPage() {
  const { slug } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // મોબાઈલ ડ્રોઅર કંટ્રોલ કરવા માટે
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Dynamic Filter Data
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [filters, setFilters] = useState({
    category: slug || 'all',
    brand: [],
    sizes: [], // Changed from size: null to sizes: []
    color: null,
    fit: [],
    price: 10000,
    sort: 'newest'
  });

  const availableFitsSource = useMemo(() => {
    const types = new Set(allProducts.map(p => p.productType).filter(Boolean));
    return Array.from(types);
  }, [allProducts]);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 10000;
    return Math.max(...allProducts.map(p => p.price || 0));
  }, [allProducts]);

    const categorizedColors = useMemo(() => {
        const top = new Set();
        const bottom = new Set();
        
        allProducts.forEach(p => {
            const isBottom = isBottomwear(p.slug || '', p.productType || '');
            p.variants?.forEach(v => {
                // 🤖 Smart Logic: Prioritize our new normalization engine for 100% consistency
                // This ignores any incorrect 'GREY' defaults in the database.
                let mainColor = v.color?.mainColor;
                if (!mainColor || mainColor === 'GREY') {
                    mainColor = v.color?.hexCode ? getMainColorFromHex(v.color.hexCode) : 'GREY';
                }
                
                if (isBottom) bottom.add(mainColor);
                else top.add(mainColor);
            });
        });
        
        return {
            top: Array.from(top).map(id => getColorCategoryInfo(id)),
            bottom: Array.from(bottom).map(id => getColorCategoryInfo(id))
        };
    }, [allProducts]);

  // Fetch Filter Data
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [categories, sizes, colors] = await Promise.all([
          fetchCategories(),
          fetchSizes(),
          fetchColors()
        ]);
        setAvailableCategories(categories || []);
        setAvailableSizes((sizes.data || []).map(s => s.name));
        setAvailableColors(colors.data || []);
      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };
    loadFilterData();
  }, []);

  // Sync state with URL category changes
  useEffect(() => {
    const currentCategory = slug || 'all';
    if (filters.category !== currentCategory) {
      setFilters(prev => ({
        ...prev,
        category: currentCategory,
        brand: [],
        sizes: [],
        color: null,
        fit: [],
        price: maxPrice
      }));
    }
  }, [slug, maxPrice]);

  const handleSizeChange = size => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleSortChange = sort => setFilters(prev => ({ ...prev, sort }));

  const handleBrandChange = (brand) => {
    setFilters(prev => ({
      ...prev,
      brand: prev.brand.includes(brand)
        ? prev.brand.filter(b => b !== brand)
        : [...prev.brand, brand]
    }));
  };

  const handleFitChange = fit => {
    setFilters(prev => ({
      ...prev,
      fit: prev.fit.includes(fit)
        ? prev.fit.filter(f => f !== fit)
        : [...prev.fit, fit]
    }));
  };

  const handleColorChange = (color) => {
    setFilters(prev => ({ ...prev, color: prev.color === color ? null : color }));
  };

  const handlePriceChange = price => setFilters(prev => ({ ...prev, price }));

  const handleClear = () => {
    setFilters({
      category: slug || 'all',
      brand: [],
      sizes: [],
      color: null,
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

      if (data?.products?.length > 0) {
        const brands = [...new Set(data.products.map(p => p.brand).filter(Boolean))];
        setAvailableBrands(prev => [...new Set([...prev, ...brands])]);
      }
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

        // 3. Filter by Color (New MainColor Logic)
        if (filters.color) {
            result = result.filter(p =>
                p.variants?.some(v => {
                    let mColor = v.color?.mainColor;
                    if (!mColor || mColor === 'GREY') {
                        mColor = v.color?.hexCode ? getMainColorFromHex(v.color.hexCode) : 'GREY';
                    }
                    return mColor === filters.color;
                })
            );
        }

    // 4. Filter by Price
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
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <SEO 
        title={slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "All Collections"} 
        description={`Explore our ${slug || 'all'} collection at Fenrir Era. Discover modern, premium apparel tailored for the next generation.`}
      />

      <main className="flex-1 flex flex-col lg:flex-row pt-5 lg:pt-20">

        {/* DESKTOP SIDEBAR - (મોબાઈલમાં છુપાઈ જશે) */}
        <aside 
          data-lenis-prevent
          className="hidden lg:block w-80 h-[calc(100vh-80px)] sticky top-20 border-r border-border-subtle bg-secondary/20 overflow-y-auto custom-scrollbar"
        >
          <FiltersSidebar
            filters={filters}
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            availableSizes={availableSizes}
            availableColors={categorizedColors}
            availableFits={availableFitsSource}
            maxPrice={maxPrice}
            onSizeChange={handleSizeChange}
            onBrandChange={handleBrandChange}
            onColorChange={handleColorChange}
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
                className="absolute inset-0 bg-text-primary/10 backdrop-blur-sm transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
              ></motion.div>

              {/* Drawer Body */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 bg-secondary border-t border-border-subtle rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-transform duration-500"
              >
                {/* TAP TO CLOSE HANDLE */}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full pt-4 pb-2 flex flex-col items-center group active:scale-95 transition-transform"
                >
                  <div className="w-12 h-1 bg-border-subtle rounded-full group-hover:bg-accent transition-colors mb-4"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary/60 group-hover:text-text-primary transition-colors">Tap to Close</h4>
                </button>

                <div 
                  data-lenis-prevent
                  className="p-8 pt-4 pb-32 overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-text-primary">Refine Collection</h4>
                  </div>

                  <FiltersSidebar
                    filters={filters}
                    availableCategories={availableCategories}
                    availableBrands={availableBrands}
                    availableSizes={availableSizes}
                    availableColors={categorizedColors}
                    availableFits={availableFitsSource}
                    maxPrice={maxPrice}
                    onSizeChange={handleSizeChange}
                    onBrandChange={handleBrandChange}
                    onColorChange={handleColorChange}
                    onFitChange={handleFitChange}
                    onPriceChange={handlePriceChange}
                    onSortChange={handleSortChange}
                    onClear={handleClear}
                    isMobile={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 absolute bottom-0 left-0 right-0 p-8 pt-6 pb-10 bg-secondary/80 backdrop-blur-xl border-t border-border-subtle">
                  <button
                    onClick={() => { handleClear(); setIsDrawerOpen(false); }}
                    className="py-4 text-[10px] font-black uppercase tracking-[0.2em] border border-border-subtle hover:border-accent transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-accent text-background hover:bg-text-primary hover:text-background transition-colors"
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
              ? "bg-background/95 backdrop-blur-xl border-border-subtle py-3 shadow-[0_10px_30px_rgba(0,0,0,0.1)] translate-y-0"
              : "bg-transparent border-transparent py-5 opacity-90"
              } px-6 md:px-12 flex items-center justify-between`}
          >
            <div className="flex items-center gap-8">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-3 transition-all hover:opacity-70 active:scale-95"
              >
                <motion.span
                  animate={{ color: isSticky ? "rgba(var(--accent))" : "rgba(var(--text-primary))" }}
                  className="material-symbols-outlined text-[20px]"
                >
                  tune
                </motion.span>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-text-primary">Filter</span>
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
                className="text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary/40"
              >
                {filtered.length} PRODUCTS FOUND
              </motion.span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary/40">Sort By</span>
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
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border-subtle hover:border-accent rounded-full transition-colors group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 group-hover:text-text-primary">Size: {size}</span>
                    <span className="material-symbols-outlined text-[14px] text-text-secondary/40 group-hover:text-text-primary">close</span>
                  </button>
                ))}
                {filters.fit.map(fit => (
                  <button
                    key={fit}
                    onClick={() => handleFitChange(fit)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border-subtle hover:border-accent rounded-full transition-colors group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 group-hover:text-text-primary">Fit: {fit}</span>
                    <span className="material-symbols-outlined text-[14px] text-text-secondary/40 group-hover:text-text-primary">close</span>
                  </button>
                ))}
                                {filters.color && (
                                    <button
                                        onClick={() => handleColorChange(filters.color)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border-subtle hover:border-accent rounded-full transition-colors group"
                                    >
                                        <div 
                                            className="w-2 h-2 rounded-full border border-white/20" 
                                            style={{ background: getColorCategoryInfo(filters.color).hex }}
                                        ></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 group-hover:text-text-primary">
                                            Color: {getColorCategoryInfo(filters.color).name}
                                        </span>
                                        <span className="material-symbols-outlined text-[14px] text-text-secondary/40 group-hover:text-text-primary">close</span>
                                    </button>
                                )}
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
              <ProductSection products={filtered} activeColor={filters.color} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center"
              >
                <span className="material-symbols-outlined text-[64px] text-text-secondary/20 mb-6">inventory_2</span>
                <h3 className="text-xl font-impact tracking-widest text-text-secondary/60 mb-2">NO PRODUCTS MATCH YOUR FILTERS</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/40 mb-8">Try adjusting your filters or clearing all to see more products</p>
                <button
                  onClick={handleClear}
                  className="px-10 py-4 bg-accent text-background text-[10px] font-black uppercase tracking-[0.3em] hover:bg-text-primary hover:text-background transition-all transform hover:scale-105"
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