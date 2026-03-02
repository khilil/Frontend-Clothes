import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../product/ProductCard/ProductCard";
import "./FeaturedProducts.css";

function FeaturedProducts() {
    const [activeTab, setActiveTab] = useState("NEW ARRIVALS");
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductsData = async () => {
            setIsLoading(true);
            try {
                const response = await getProducts();
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
        <section className="featured-premium">
            <div className="container-wide">
                <div className="featured-header-wrap">
                    <motion.div
                        className="header-left"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="premium-tag">CURATED SELECTION</span>
                        <h2 className="premium-title-main">THE EDIT</h2>
                    </motion.div>

                    <motion.div
                        className="featured-tabs-luxury"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        {["NEW ARRIVALS", "BEST SELLERS", "TRENDING"].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-btn-minimal ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabLine"
                                        className="tab-line-premium"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                </div>

                <div className="featured-grid-premium">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid-sub-wrap"
                            >
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="product-skeleton-premium">
                                        <div className="skeleton-visual"></div>
                                        <div className="skeleton-info"></div>
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
                                className="grid-sub-wrap"
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
                    className="featured-footer"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <button onClick={() => navigate("/category/all")} className="btn-view-all-premium">
                        VIEW ALL PRODUCTS
                        <span className="line"></span>
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

export default FeaturedProducts;
