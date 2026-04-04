import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from '../../api/products.api';
import { fetchCategories } from '../../api/categories.api';
import { fetchSizes, fetchColors } from '../../api/attributes.api';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import FiltersSidebar from './Filters sidebar/FiltersSidebar';
import SkeletonCards from '../../components/product/Skeleton/SkeletonCards';
import { isBottomwear } from '../../utils/sizeConstants';

const ProductListing = () => {
  const { category: urlCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Dynamic Filters Data
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableFits, setAvailableFits] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    category: urlCategory || searchParams.get('category') || 'all',
    brand: searchParams.getAll('brand') || [],
    size: searchParams.get('size') || null,
    color: searchParams.get('color') || null,
    price: parseInt(searchParams.get('price')) || 10000,
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('q') || ''
  });

  const getColorDetail = useCallback((id) => {
    return availableColors?.find(c => c.id === id || c._id === id || c.hexCode === id);
  }, [availableColors]);

  const categorizedColors = useMemo(() => {
    const top = new Map();
    const bottom = new Map();
    
    products.forEach(p => {
      const isBottom = isBottomwear(p.slug || '', p.productType || '');
      p.variants?.forEach(v => {
        if (v.color?.name) {
          const colorName = v.color.name.trim();
          const targetMap = isBottom ? bottom : top;
          // De-duplicate by name: only add if name not already present in the target group
          if (!targetMap.has(colorName)) {
            targetMap.set(colorName, v.color);
          }
        }
      });
    });
    
    return {
      top: Array.from(top.values()),
      bottom: Array.from(bottom.values())
    };
  }, [products]);

  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

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
    const currentCategory = urlCategory || searchParams.get('category') || 'all';
    if (filters.category !== currentCategory) {
      setFilters(prev => ({
        ...prev,
        category: currentCategory,
        brand: [],
        size: null,
        color: null,
        price: 10000,
        search: searchParams.get('q') || ''
      }));
    } else if (filters.search !== (searchParams.get('q') || '')) {
      setFilters(prev => ({ ...prev, search: searchParams.get('q') || '' }));
    }
  }, [urlCategory, searchParams]);

  // Initial Fetch & Filter Change
  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      setPage(1);
      try {
        const data = await fetchProducts({
          page: 1,
          limit: 12,
          category: filters.category === 'all' ? null : filters.category,
          brand: filters.brand,
          size: filters.size, // Added size
          color: filters.color,
          minPrice: 0,
          maxPrice: filters.price,
          sort: filters.sort,
          search: filters.search
        });
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalProducts);
        setHasMore(data.currentPage < data.totalPages);

        // Derive brands and fits from products if not already set or for updates
        if (data.products.length > 0) {
          const brands = [...new Set(data.products.map(p => p.brand).filter(Boolean))];
          setAvailableBrands(prev => [...new Set([...prev, ...brands])]);
          
          const fits = [...new Set(data.products.map(p => p.productType).filter(Boolean))];
          setAvailableFits(prev => [...new Set([...prev, ...fits])]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();

    // Update URL params
    const params = new URLSearchParams();
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.brand.length > 0) params.set('brand', filters.brand.join(','));
    if (filters.size) params.set('size', filters.size);
    if (filters.color) params.set('color', filters.color);
    if (filters.price < 10000) params.set('price', filters.price.toString());
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.search) params.set('q', filters.search);
    
    setSearchParams(params, { replace: true });

  }, [filters]); // Removed urlCategory from dependencies to prevent unintended resets

  // Load More (Infinite Scroll)
  useEffect(() => {
    if (page === 1) return;

    const loadMoreProducts = async () => {
      setLoadingMore(true);
      try {
        const data = await fetchProducts({
          page: page,
          limit: 12,
          category: filters.category === 'all' ? null : filters.category,
          brand: filters.brand,
          size: filters.size, // Added size
          color: filters.color,
          minPrice: 0,
          maxPrice: filters.price,
          sort: filters.sort,
          search: filters.search
        });

        setProducts(prev => [...prev, ...data.products]);
        setHasMore(data.currentPage < data.totalPages);
      } catch (error) {
        console.error("Error loading more products:", error);
      } finally {
        setLoadingMore(false);
      }
    };

    loadMoreProducts();
  }, [page, filters]); // Added filters to dependencies

  const handleCategoryChange = (cat) => {
    setFilters(prev => ({ ...prev, category: cat }));
  };

  const handleBrandChange = (brand) => {
    setFilters(prev => ({
      ...prev,
      brand: prev.brand.includes(brand)
        ? prev.brand.filter(b => b !== brand)
        : [...prev.brand, brand]
    }));
  };

  const handleSizeChange = (size) => {
    setFilters(prev => ({ ...prev, size: prev.size === size ? null : size }));
  };

  const handleColorChange = (color) => {
    setFilters(prev => ({ ...prev, color: prev.color === color ? null : color }));
  };

  const handlePriceChange = (price) => {
    setFilters(prev => ({ ...prev, price }));
  };

  const handleSortChange = (sort) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      brand: [],
      size: null,
      color: null,
      price: 10000,
      sort: 'newest',
      search: ''
    });
  };

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-background min-h-screen text-text-primary pt-[80px] lg:pt-[100px]">
      <main className="flex max-w-[1600px] mx-auto gap-5 lg:gap-10 px-5 lg:px-10">
        {/* Sidebar Filters */}
        <aside 
          data-lenis-prevent
          className="hidden lg:block w-[300px] shrink-0 sticky top-[120px] h-[calc(100vh-150px)] overflow-y-auto pr-[15px] custom-scrollbar"
        >
          <FiltersSidebar
            filters={filters}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onSizeChange={handleSizeChange}
            onColorChange={handleColorChange}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
            onClear={handleClearFilters}
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            availableSizes={availableSizes}
            availableColors={categorizedColors}
            availableFits={availableFits}
            maxPrice={10000}
          />
        </aside>

        {/* Product Grid Area */}
        <section className="grow pb-[60px]">
          <header className="flex justify-between items-center mb-[25px] lg:mb-[35px] pb-5 border-b border-border-subtle">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-text-secondary/60">
              {filters.search ? `Results for "${filters.search}"` : `Showing`} <span className="text-text-primary">{products.length}</span> of {totalProducts} results
            </div>
            {/* Mobile Filter Trigger */}
            <button
              className="flex lg:hidden items-center gap-2.5 bg-secondary border border-border-subtle text-text-primary py-2.5 px-5 rounded-full text-[11px] font-extrabold uppercase tracking-[0.1em] cursor-pointer relative"
              onClick={() => setIsDrawerOpen(true)}
            >
              <span className="material-symbols-outlined">tune</span>
              Filters
              {(filters.brand.length > 0 || filters.size || filters.color || filters.price < 10000 || filters.sort !== 'newest') && (
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
              )}
            </button>
          </header>

          {/* ACTIVE FILTER CHIPS */}
          <AnimatePresence>
            {(filters.brand?.length > 0 || filters.size || filters.color) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {filters.brand?.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandChange(brand)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border-subtle hover:border-accent rounded-full transition-colors group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 group-hover:text-text-primary">Brand: {brand}</span>
                    <span className="material-symbols-outlined text-[14px] text-text-secondary/40 group-hover:text-text-primary">close</span>
                  </button>
                ))}

                {filters.size && (
                  <button
                    onClick={() => handleSizeChange(filters.size)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border-subtle hover:border-accent rounded-full transition-colors group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 group-hover:text-text-primary">Size: {filters.size}</span>
                    <span className="material-symbols-outlined text-[14px] text-text-secondary/40 group-hover:text-text-primary">close</span>
                  </button>
                )}

                {filters.color && (
                  <button
                    onClick={() => handleColorChange(filters.color)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border-subtle hover:border-accent rounded-full transition-colors group"
                  >
                    <div 
                      className="w-2 h-2 rounded-full shadow-sm" 
                      style={{ backgroundColor: getColorDetail(filters.color)?.hexCode || filters.color }}
                    ></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 group-hover:text-text-primary">
                      Color: {getColorDetail(filters.color)?.name || filters.color}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-text-secondary/40 group-hover:text-text-primary">close</span>
                  </button>
                )}

                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {isDrawerOpen && (
              <>
                <motion.div
                  className="fixed inset-0 bg-text-primary/10 backdrop-blur-[4px] z-[1000]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDrawerOpen(false)}
                />
                <motion.div
                  className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-border-subtle rounded-t-[25px] z-[1001] max-h-[90vh] flex flex-col no-scrollbar"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  <div className="p-4 px-6 flex justify-between items-center border-b border-border-subtle relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-border-subtle rounded-full"></div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Filters</h3>
                    <button onClick={() => setIsDrawerOpen(false)} className="bg-transparent border-none text-text-primary cursor-pointer">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div 
                    data-lenis-prevent
                    className="flex-1 overflow-y-auto pt-5 pb-5 px-6 no-scrollbar"
                  >
                    <FiltersSidebar
                      filters={filters}
                      onCategoryChange={handleCategoryChange}
                      onBrandChange={handleBrandChange}
                      onSizeChange={handleSizeChange}
                      onColorChange={handleColorChange}
                      onPriceChange={handlePriceChange}
                      onSortChange={handleSortChange}
                      onClear={handleClearFilters}
                      availableCategories={availableCategories}
                      availableBrands={availableBrands}
                      availableSizes={availableSizes}
                      availableColors={categorizedColors}
                      availableFits={availableFits}
                      maxPrice={10000}
                      isMobile={true}
                    />
                  </div>
                  <div className="p-5 px-6 pb-10 border-t border-border-subtle bg-secondary">
                    <button className="w-full bg-accent text-background border-none p-[18px] rounded-xl text-[13px] font-black uppercase tracking-[0.15em] cursor-pointer" onClick={() => setIsDrawerOpen(false)}>
                      Show {totalProducts} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {loading && page === 1 ? (
            <SkeletonCards count={8} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[15px] lg:gap-[35px] gap-y-[30px] lg:gap-y-[50px]">
              {products.map((product, index) => {
                if (products.length === index + 1) {
                  return (
                    <div ref={lastProductElementRef} key={product._id || index}>
                      <ProductCard product={product} />
                    </div>
                  );
                } else {
                  return <ProductCard key={product._id || index} product={product} />;
                }
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center flex flex-col items-center gap-[15px]"
              >
                <span className="material-symbols-outlined text-[64px] text-text-secondary/20">sentiment_dissatisfied</span>
                <h3 className="text-2xl font-black uppercase tracking-[0.1em]">No products found</h3>
                <p className="text-text-secondary text-sm">Try adjusting your filters or category.</p>
                <button onClick={handleClearFilters} className="mt-[15px] bg-transparent border border-text-primary text-text-primary py-3 px-[30px] rounded-full text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 ease hover:bg-text-primary hover:text-background">Clear All Filters</button>
              </motion.div>
            </div>
          )}

          {loadingMore && (
            <div className="flex justify-center py-[50px]">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="text-center py-[80px] border-t border-border-subtle mt-[50px]">
              <p className="text-[11px] uppercase tracking-[0.4em] text-text-secondary/40 font-extrabold">You've reached the end of the collection.</p>
            </div>
          )}
        </section>
      </main>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-[40px] right-[40px] w-[50px] h-[50px] bg-accent text-background border-none rounded-full cursor-pointer flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[100] transition-all duration-300 hover:-translate-y-[5px] hover:bg-text-primary"
            onClick={scrollToTop}
          >
            <span className="material-symbols-outlined">arrow_upward</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductListing;
