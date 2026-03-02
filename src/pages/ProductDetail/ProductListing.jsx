import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from '../../api/products.api';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import FiltersSidebar from './Filters sidebar/FiltersSidebar';
import SkeletonCards from '../../components/product/Skeleton/SkeletonCards';
import './ProductListing.css';

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

  // Filters State
  const [filters, setFilters] = useState({
    category: urlCategory || searchParams.get('category') || 'all',
    brand: searchParams.getAll('brand') || [],
    size: searchParams.get('size') || null,
    color: searchParams.get('color') || null,
    price: parseInt(searchParams.get('price')) || 10000,
    sort: searchParams.get('sort') || 'newest'
  });

  const availableColors = [
    { name: "Black", hexCode: "#000000" },
    { name: "White", hexCode: "#FFFFFF" },
    { name: "Grey", hexCode: "#808080" },
    { name: "Beige", hexCode: "#F5F5DC" },
    { name: "Navy", hexCode: "#000080" },
    { name: "Olive", hexCode: "#808000" }
  ];

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
          color: filters.color,
          minPrice: 0,
          maxPrice: filters.price,
          sort: filters.sort
        });
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalProducts);
        setHasMore(data.currentPage < data.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();

    // Update URL params
    const params = {};
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.brand.length > 0) params.brand = filters.brand;
    if (filters.size) params.size = filters.size;
    if (filters.color) params.color = filters.color;
    if (filters.price < 10000) params.price = filters.price;
    if (filters.sort !== 'newest') params.sort = filters.sort;
    setSearchParams(params);

  }, [filters, urlCategory]);

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
          color: filters.color,
          minPrice: 0,
          maxPrice: filters.price,
          sort: filters.sort
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
  }, [page]);

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
      sort: 'newest'
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
    <div className="shop-page-container">
      <main className="shop-main">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <FiltersSidebar
            filters={filters}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onSizeChange={handleSizeChange}
            onColorChange={handleColorChange}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
            onClear={handleClearFilters}
            availableColors={availableColors}
            maxPrice={10000}
          />
        </aside>

        {/* Product Grid Area */}
        <section className="shop-content">
          <header className="shop-header">
            <div className="results-count">
              Showing <span>{products.length}</span> of {totalProducts} results
            </div>
            {/* Mobile Filter Trigger */}
            <button
              className="mobile-filter-btn lg:hidden"
              onClick={() => setIsDrawerOpen(true)}
            >
              <span className="material-symbols-outlined">tune</span>
              Filters
              {(filters.brand.length > 0 || filters.size || filters.color || filters.price < 10000 || filters.sort !== 'newest') && (
                <span className="filter-dot"></span>
              )}
            </button>
          </header>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {isDrawerOpen && (
              <>
                <motion.div
                  className="drawer-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDrawerOpen(false)}
                />
                <motion.div
                  className="drawer-content"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  <div className="drawer-header">
                    <div className="drawer-handle"></div>
                    <h3>Filters</h3>
                    <button onClick={() => setIsDrawerOpen(false)} className="close-drawer">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="drawer-body">
                    <FiltersSidebar
                      filters={filters}
                      onCategoryChange={handleCategoryChange}
                      onBrandChange={handleBrandChange}
                      onSizeChange={handleSizeChange}
                      onColorChange={handleColorChange}
                      onPriceChange={handlePriceChange}
                      onSortChange={handleSortChange}
                      onClear={handleClearFilters}
                      availableColors={availableColors}
                      maxPrice={10000}
                      isMobile={true}
                    />
                  </div>
                  <div className="drawer-footer">
                    <button className="apply-btn" onClick={() => setIsDrawerOpen(false)}>
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
            <div className="product-grid">
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
            <div className="empty-state">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="empty-msg"
              >
                <span className="material-symbols-outlined">sentiment_dissatisfied</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or category.</p>
                <button onClick={handleClearFilters}>Clear All Filters</button>
              </motion.div>
            </div>
          )}

          {loadingMore && (
            <div className="loading-more-wrap">
              <div className="loader-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="end-msg">
              <p>You've reached the end of the collection.</p>
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
            className="scroll-to-top"
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
