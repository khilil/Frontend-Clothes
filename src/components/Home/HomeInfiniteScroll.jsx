import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from '../../api/products.api';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import SkeletonCards from '../../components/product/Skeleton/SkeletonCards';

const HomeInfiniteScroll = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const sentinelRef = useRef(null);

    // Stable IntersectionObserver logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !loading && !loadingMore) {
                    setPage(prev => prev + 1);
                }
            },
            { rootMargin: '600px' }
        );

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel);
            }
        };
    }, [hasMore, loading, loadingMore]);

    const isFetching = useRef(false);

    useEffect(() => {
        const loadProducts = async () => {
            if (isFetching.current) return;
            
            isFetching.current = true;
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                const data = await fetchProducts({
                    page: page,
                    limit: 12,
                    sort: 'newest'
                });

                const newProducts = data.products || [];

                if (page === 1) {
                    setProducts(newProducts);
                } else {
                    setProducts(prev => [...prev, ...newProducts]);
                }

                setHasMore((data.currentPage || page) < (data.totalPages || 1));
            } catch (error) {
                console.error("Error loading home products:", error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
                isFetching.current = false;
            }
        };

        loadProducts();
    }, [page]);

    return (
        <section className="py-20 md:py-32 bg-background text-text-primary">
            <div className="max-w-[1800px] mx-auto px-4 md:px-12">
                {/* HEADER */}
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <span className="text-[10px] md:text-xs font-black tracking-[0.6em] text-accent uppercase">Archive Discovery</span>
                        <h2 className="text-6xl md:text-8xl lg:text-9xl font-impact tracking-tighter uppercase leading-none">For You</h2>
                    </motion.div>
                </div>

                {/* GRID */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {loading && page === 1 ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <SkeletonCards 
                                    count={8} 
                                    gridClass="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16" 
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
                            >
                                {products.map((product, index) => (
                                    <ProductCard key={product.slug || product._id || `p-${index}`} product={product} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* SENTINEL */}
                    <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />

                    {/* LOADING STATE */}
                    {loadingMore && (
                        <div className="flex flex-col items-center gap-6 py-20">
                            <div className="w-32 h-[1px] bg-border-subtle relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 bg-accent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                />
                            </div>
                            <span className="text-[10px] font-black tracking-[0.4em] text-text-secondary/70 uppercase">Expanding Archive...</span>
                        </div>
                    )}

                    {/* END STATE */}
                    {!hasMore && products.length > 0 && (
                        <div className="flex items-center justify-center gap-8 py-32 opacity-60">
                            <div className="h-[1px] w-12 md:w-24 bg-accent/20"></div>
                            <span className="text-[10px] md:text-xs font-black tracking-[0.6em] text-accent uppercase">Discovery Feed Complete</span>
                            <div className="h-[1px] w-12 md:w-24 bg-accent/20"></div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HomeInfiniteScroll;
