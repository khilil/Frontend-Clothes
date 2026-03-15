import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProducts } from "../../services/productService";
import ProductSection from "../ProductDetail/ProductSection/ProductSection";
import Header from "../../components/common/Header/Header";
import CollectiveFooter from "../../components/common/CollectiveFooter/CollectiveFooter";
function SalePage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSaleProducts = async () => {
            setIsLoading(true);
            try {
                // Fetch products that are ON SALE
                const data = await getProducts({ isOnSale: true, isSeasonalSale: true });
                setProducts(data.products || []);
            } catch (error) {
                console.error("Error fetching sale products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaleProducts();
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-black min-h-screen text-white">

            <section className="relative h-[60vh] md:h-[80vh] bg-black flex items-center justify-center overflow-hidden text-center">
                <motion.div
                    className="absolute inset-0 z-0"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
                        alt="Sale Hero"
                        className="w-full h-full object-cover grayscale"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10"></div>

                <div className="relative z-20 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-4 py-1 mb-6 border border-white/20 rounded-full text-[10px] font-black tracking-[0.4em] uppercase bg-white/5 backdrop-blur-md">
                            Exclusive Archive Sale
                        </span>
                        <h1 className="text-7xl md:text-9xl font-impact tracking-tighter leading-none mb-6">
                            SEASONAL<br />
                            <span className="text-accent italic">SALE</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-white/60 text-sm md:text-base leading-relaxed tracking-wide font-light">
                            DISCOVER A CURATED SELECTION OF PREVIOUS COLLECTIONS AND ICONIC ARCHIVES.
                            REDEFINED ESSENTIALS AT REDUCED PRICES.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase text-accent animate-pulse">
                            Scroll to Explore
                            <div className="w-px h-12 bg-accent/30 mx-auto mt-4"></div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 object-cover py-10 md:py-20 relative z-30">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <h2 className="text-[80px] md:text-4xl font-impact tracking-tight mb-2 uppercase">The Sale Collection</h2>
                        <div className="flex items-center gap-4">
                            <span className="h-px w-12 bg-accent"></span>
                            <span className="font-[Inter] text-[10px] font-black tracking-[0.5em] text-white/20 uppercase">
                                {isLoading ? "Synchronizing..." : `${products.length} Masterpieces Found`}
                            </span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div>
                        <ProductSection products={products} />
                    </div>
                ) : (
                    <div className="py-20 md:py-40 text-center border border-white/5 rounded-[3rem] bg-white/[0.02] mt-10 md:mt-20">
                        <h3 className="text-2xl font-impact tracking-tight mb-4 uppercase text-white/20">The Archive is Empty</h3>
                        <p className="font-[Inter] text-white/50 text-[14px] tracking-[0.1em]">New Items Arriving Shortly</p>
                    </div>
                )}
            </div>

            <CollectiveFooter />
        </div>
    );
}

export default SalePage;
