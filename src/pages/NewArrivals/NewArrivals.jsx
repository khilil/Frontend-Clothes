import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { getProducts } from "../../services/productService";
import ProductSection from "../ProductDetail/ProductSection/ProductSection";
import Header from "../../components/common/Header/Header";
import CollectiveFooter from "../../components/common/CollectiveFooter/CollectiveFooter";
import "./NewArrivals.css";

function NewArrivals() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            setIsLoading(true);
            try {
                const response = await getProducts();
                // Filter for new arrivals
                const newArrivals = (response.products || []).filter(p => p.isNewArrival);
                setProducts(newArrivals);
            } catch (error) {
                console.error("Error fetching new arrivals:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewArrivals();
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="new-arrivals-page">
            <Header />

            <section className="new-arrivals-hero">
                <motion.div
                    className="new-arrivals-hero-bg"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10 }}
                />
                <div className="new-arrivals-hero-overlay"></div>

                <div className="new-arrivals-hero-content">
                    <motion.span
                        className="new-arrivals-tag"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        THE ATELIER DROP
                    </motion.span>
                    <motion.h1
                        className="new-arrivals-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        NEW <br /> ARRIVALS
                    </motion.h1>
                    <motion.p
                        className="new-arrivals-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        CURATED PIECES FOR THE URBAN ICON / SEASON 2024
                    </motion.p>
                </div>
            </section>

            <div className="new-arrivals-container">
                <motion.span
                    className="products-count"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    {isLoading ? "LOADING..." : `${products.length} ARCHIVES FOUND`}
                </motion.span>

                <ProductSection products={products} />
            </div>

            <CollectiveFooter />
        </div>
    );
}

export default NewArrivals;
