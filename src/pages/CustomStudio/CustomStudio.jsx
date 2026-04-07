import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Palette, Wand2, Star, CheckCircle2, ShoppingBag, ArrowRight, Sparkles, Layout, MousePointer2, CheckCircle } from 'lucide-react';
import { fetchProducts } from '../../api/products.api';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import SkeletonCards from '../../components/product/Skeleton/SkeletonCards';

const CustomStudio = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCustomProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts({
                    isCustomizable: true,
                    limit: 20
                });
                setProducts(data.products || []);
            } catch (error) {
                console.error("Error fetching custom products:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCustomProducts();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const tutorialSteps = [
        {
            icon: <Layout className="w-6 h-6" />,
            title: "Choose Base",
            desc: "Select a premium garment from our customizable collection to start your journey."
        },
        {
            icon: <MousePointer2 className="w-6 h-6" />,
            title: "Open Studio",
            desc: "Click 'Customize' on any product to enter our state-of-the-art 3D Design Studio."
        },
        {
            icon: <Wand2 className="w-6 h-6" />,
            title: "Design & Manifest",
            desc: "Add your graphics, text, and patterns in real-time. See your creation come alive."
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: "Expert Review",
            desc: "Our team of master designers will verify your creation for perfection before production."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-text-primary pt-28 pb-20">
            {/* MINIMALIST HEADER */}
            <section className="px-6 md:px-12 lg:px-24 mb-16">
                <div className="max-w-[1400px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center space-y-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">FENRIR Era Atelier</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-primary tracking-tighter leading-none uppercase italic">
                            Custom <span className="text-accent not-italic">Studio</span>
                        </h1>
                        <p className="text-text-secondary max-w-xl text-sm font-secondary tracking-wide opacity-80 uppercase leading-relaxed">
                            Transform premium apparel into your personal canvas. <br />
                            Professional grade tools for the modern creator.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* PRODUCT GRID SECTION */}
            <section className="px-6 md:px-12 lg:px-24 mb-32">
                <div className="max-w-[1400px] mx-auto px-4">
                    <div className="flex justify-between items-end mb-12 border-b border-border-subtle pb-6">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Studio Collection</h2>
                            <h3 className="text-2xl md:text-3xl font-primary tracking-tighter uppercase italic">Select Your Base</h3>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60">
                            {products.length} Customizable Items
                        </div>
                    </div>

                    {loading ? (
                        <SkeletonCards count={8} />
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[15px] lg:gap-8 lg:gap-y-12">
                            {products.map((product, idx) => (
                                <ProductCard key={product._id || idx} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border-subtle rounded-3xl">
                            <ShoppingBag className="w-12 h-12 text-text-secondary/20 mb-4" />
                            <p className="text-sm uppercase tracking-widest text-text-secondary">No customizable products found at the moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* HOW IT WORKS / TUTORIAL SECTION */}
            <section className="px-6 md:px-12 lg:px-24 py-24 bg-secondary/30 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-[1400px] mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4">The Process</h2>
                        <h3 className="text-4xl md:text-5xl font-primary tracking-tighter uppercase">How It Works</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {tutorialSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="p-8 luxury-card bg-background/50 backdrop-blur-sm border border-border-subtle group hover:border-accent/40 transition-all duration-500"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
                                    {step.icon}
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[8px] font-black text-accent border border-accent/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Step 0{idx + 1}</span>
                                </div>
                                <h4 className="text-xl font-primary tracking-tighter uppercase mb-3">{step.title}</h4>
                                <p className="text-sm text-text-secondary leading-relaxed font-secondary opacity-70">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 flex flex-col items-center gap-8 p-12 rounded-3xl bg-background border border-border-subtle text-center">
                        <div>
                            <h4 className="text-2xl font-primary tracking-tighter uppercase mb-4 italic">Ready to make your mark?</h4>
                            <p className="text-sm text-text-secondary max-w-sm mx-auto font-secondary opacity-70">
                                Join the era of creators. High performance meets aesthetic perfection.
                            </p>
                        </div>
                        <button
                            onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
                            className="bg-accent text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:gap-6 transition-all hover:pr-14 group relative"
                        >
                            <span>Browse Masterbases</span>
                            <ArrowRight className="w-4 h-4 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* TRUST MARK SECTION */}
            <section className="py-20 border-t border-border-subtle px-6">
                <div className="max-w-[1400px] mx-auto flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex flex-col items-center gap-2">
                        <Star className="w-6 h-6 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Premium Fabric</span>
                    </div>
                    <div className="h-10 w-px bg-border-subtle hidden md:block" />
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Hand Inspected</span>
                    </div>
                    <div className="h-10 w-px bg-border-subtle hidden md:block" />
                    <div className="flex flex-col items-center gap-2">
                        <Palette className="w-6 h-6 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest">High Definition Prints</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomStudio;
