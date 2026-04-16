import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../product/ProductCard/ProductCard";
function FeaturedProducts() {
    const [activeTab, setActiveTab] = useState("NEW ARRIVALS");
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductsData = async () => {
            setIsLoading(true);
            try {
                // Fetch a limited set of products that could fit into our tabs
                const response = await getProducts({ limit: 40 }); 
                setProducts(response.products || []);
            } catch (error) {
                console.error("Error fetching featured products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProductsData();
    }, []);

    const filteredProducts = products.filter(product => {
        if (activeTab === "NEW ARRIVALS") return product.isNewArrival;
        if (activeTab === "BEST SELLERS") return product.isBestSeller;
        if (activeTab === "TRENDING") return product.isTrending;
        return true;
    }).slice(0, 8); // Limits to 8 products for the home page

    return (
        <section className="py-[80px] md:py-[120px] bg-background text-text-primary">
            <div className="container-wide">
                <div className="flex flex-col lg:flex-row justify-start lg:justify-between items-start lg:items-end mb-[60px] gap-8 lg:gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <span className="text-[10px] font-black tracking-[0.6em] text-accent-contrast uppercase mb-4 block">ELITE ARCHIVE</span>
                        <h2 className="font-oswald text-[56px] md:text-[80px] lg:text-[110px] leading-[0.85] tracking-[-0.04em] uppercase font-black">FRAGMENT <br className="md:hidden" /> EDIT</h2>
                        {/* Subtle background glow */}
                        <div className="absolute -left-20 -top-20 w-[300px] h-[300px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
                    </motion.div>

                    <motion.div
                        className="flex gap-6 lg:gap-10 pb-3 overflow-x-auto w-full lg:w-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        {["NEW ARRIVALS", "BEST SELLERS", "TRENDING"].map((tab) => (
                            <button
                                key={tab}
                                className={`relative bg-transparent border-none text-[11px] font-black tracking-[0.3em] uppercase cursor-pointer py-3 transition-colors duration-300 whitespace-nowrap ${activeTab === tab ? 'text-text-primary' : 'text-text-muted'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabLine"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                </div>

                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8"
                            >
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="bg-secondary aspect-[4/5] relative overflow-hidden after:absolute after:inset-0 after:-left-full after:bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.03),transparent)] after:animate-[loading-shimmer_1.5s_infinite]">
                                    </div>
                                ))}
                            </motion.div>
                        ) : filteredProducts.length > 0 ? (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8"
                            >
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="no-archives">NO ARCHIVES FOUND FOR THIS CATEGORY.</div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div
                    className="mt-[80px] flex justify-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <button onClick={() => navigate("/category/all")} className="bg-transparent border-none text-text-primary text-[11px] font-black tracking-[0.5em] uppercase cursor-pointer flex flex-col items-center gap-3 group">
                        VIEW ALL PRODUCTS
                        <span className="w-10 h-[1px] bg-accent transition-[width] duration-400 ease group-hover:w-[100px]"></span>
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

export default FeaturedProducts;
