import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Palette, Layers, Wand2, ArrowRight, Zap, Target, Star } from 'lucide-react';

const CustomStudio = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const floatVariants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary pt-24 pb-16 overflow-hidden">
            {/* HERO SECTION */}
            <section className="relative px-6 md:px-12 lg:px-24 mb-32">
                <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="relative z-10"
                    >
                        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                            <div className="h-px w-12 bg-accent/40" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">FENRIR Era Atelier</span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-6xl md:text-8xl font-primary tracking-tighter leading-[0.9] mb-8"
                        >
                            THE ART OF <br />
                            <span className="text-accent italic">CREATION.</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-text-secondary max-w-md mb-12 font-secondary leading-relaxed"
                        >
                            Step into our digital sanctuary. From conceptual sketches to wearable art, customize every fiber of your identity.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
                            <button
                                onClick={() => navigate('/shop/all?isCustomizable=true')}
                                className="group relative px-10 py-5 bg-text-primary text-primary overflow-hidden transition-all hover:pr-14"
                            >
                                <span className="relative z-10 text-[10px] font-black uppercase tracking-widest">Start From Scratch</span>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={16} />
                            </button>
                            <button className="px-10 py-5 border border-border-subtle hover:bg-secondary transition-colors text-[10px] font-black uppercase tracking-widest">
                                View Collection
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative h-[600px] rounded-3xl overflow-hidden group shadow-2xl"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000"
                            alt="Atelier Studio"
                            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                        {/* Floating elements for extra "wow" */}
                        <motion.div
                            variants={floatVariants}
                            animate="animate"
                            className="absolute top-12 left-12 p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hidden md:block"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 flex items-center justify-center bg-accent/20 rounded-full text-accent">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent">Real-time</p>
                                    <p className="text-xs font-bold text-white">Visualizer 3.0</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* PATHWAYS SECTION */}
            <section className="px-6 md:px-12 lg:px-24 mb-32">
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4">Choose Your Path</h2>
                            <h3 className="text-4xl md:text-5xl font-primary tracking-tighter">CRAFTING MODES</h3>
                        </div>
                        <p className="max-w-xs text-sm text-text-secondary font-secondary italic">
                            Three ways to manifest your vision. Select a method that fits your creative rhythm.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {[
                            {
                                icon: <Palette size={32} />,
                                title: "FENRIR Studio",
                                desc: "Full creative control. Upload graphics, add text, and layer patterns.",
                                items: ["Multi-layering", "Hi-Res Uploads", "3D Preview"],
                                path: '/shop/all?isCustomizable=true'
                            },
                            {
                                icon: <Layers size={32} />,
                                title: "Bespoke Builder",
                                desc: "Choose from pre-set archival designs and tweak them to your liking.",
                                items: ["Heritage Patterns", "Size Adjusting", "Material Select"],
                                path: '/shop/all'
                            }
                        ].map((path, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                onClick={() => navigate(path.path)}
                                className="luxury-card p-12 relative group cursor-pointer"
                            >
                                {path.tag && (
                                    <span className="absolute top-6 right-6 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[8px] font-black uppercase tracking-widest text-accent">
                                        {path.tag}
                                    </span>
                                )}
                                <div className="text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
                                    {path.icon}
                                </div>
                                <h4 className="text-2xl font-primary tracking-tighter mb-4">{path.title}</h4>
                                <p className="text-sm text-text-secondary font-secondary leading-relaxed mb-8">
                                    {path.desc}
                                </p>
                                <ul className="space-y-3">
                                    {path.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-primary/60">
                                            <div className="h-1 w-1 bg-accent rounded-full" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST/PROCESS SECTION */}
            <section className="py-32 bg-secondary/30 border-y border-border-subtle px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-12 text-accent"
                    >
                        <Target size={32} />
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-primary tracking-tighter mb-8 italic">HUMAN-MAD LOGIC</h2>
                    <p className="text-xl text-text-secondary font-secondary leading-relaxed mb-12 px-6">
                        "Every stitch is calculated. Every design is validated. We bridge the gap between digital imagination and physical perfection."
                    </p>
                    <div className="flex justify-center items-center gap-12 border-t border-border-subtle pt-12">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-primary text-accent">100%</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Cotton Blend</span>
                        </div>
                        <div className="h-12 w-px bg-border-subtle" />
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-primary text-accent">FAST</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Studio Pickup</span>
                        </div>
                        <div className="h-12 w-px bg-border-subtle" />
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-primary text-accent">EXPERT</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Design Verify</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomStudio;
