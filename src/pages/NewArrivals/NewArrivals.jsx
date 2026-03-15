import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { getProducts } from "../../services/productService";
import ProductSection from "../ProductDetail/ProductSection/ProductSection";
import Header from "../../components/common/Header/Header";
import CollectiveFooter from "../../components/common/CollectiveFooter/CollectiveFooter";
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
        <div className="bg-[#0a0a0a] min-h-screen text-white">

            <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden text-center px-5">
                <motion.div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center z-[1]"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10 }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7)_0%,#0a0a0a_100%)] z-[2]"></div>

                <div className="relative z-[3] max-w-[800px]">
                    <motion.span
                        className="block text-[12px] font-black tracking-[0.5em] text-accent mb-5 uppercase"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        THE ATELIER DROP
                    </motion.span>
                    <motion.h1
                        className="font-[Oswald] text-[clamp(48px,8vw,120px)] leading-[0.9] font-bold mb-[30px] tracking-[-0.02em]"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        NEW <br /> ARRIVALS
                    </motion.h1>
                    <motion.p
                        className="text-[14px] tracking-[0.2em] uppercase text-white/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        CURATED PIECES FOR THE URBAN ICON / SEASON 2024
                    </motion.p>
                </div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-[60px] md:py-[80px]">
                <motion.span
                    className="text-[10px] font-black tracking-[0.3em] text-white/30 mb-10 block uppercase"
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
