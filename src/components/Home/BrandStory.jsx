import { motion, useScroll, useTransform } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
function BrandStory() {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section className="relative min-h-[100vh] bg-black py-[100px] sm:py-[160px] overflow-hidden" ref={containerRef}>
            <motion.div
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center z-[1] opacity-30"
                style={{ y }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,transparent_50%,#000_100%)] z-[2]"></div>
            </motion.div>

            <div className="relative z-[5] max-w-[1400px] mx-auto px-10">
                <div>
                    <motion.div
                        className="mb-[60px] md:mb-[100px]"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-3 block">THE PHILOSOPHY</span>
                        <h2 className="font-oswald text-[clamp(60px,12vw,140px)] leading-[0.85] tracking-[-0.04em] uppercase font-black text-white">
                            ENGINEERING <br />
                            <span className="[-webkit-text-stroke:1.5px_rgba(212,196,177,0.5)] text-transparent">FENRIR</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] lg:gap-[120px] items-center mb-[120px]">
                        <motion.div
                            className="relative aspect-[4/5] overflow-hidden border border-white/10 order-2 md:order-1"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <img src="https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=1974&auto=format&fit=crop" alt="Craftsmanship" className="w-full h-full object-cover" />
                        </motion.div>

                        <motion.div
                            className="max-w-full md:max-w-[500px] order-1 md:order-none"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 1 }}
                        >
                            <p className="text-xl leading-[1.6] font-normal text-white mb-10 tracking-[-0.01em]">
                                We bridge the gap between utilitarian durability and high-street aesthetics.
                                Every garment is a statement of intent, engineered to survive trends and the test of time.
                            </p>
                            <p className="text-sm leading-[1.8] text-white/50 mb-[60px] uppercase tracking-[0.1em]">
                                Born in 2024, Fenrir represents the fusion of urban aesthetics and utility.
                                We believe in the legacy of detail and the power of uncompromising craftsmanship.
                            </p>
                            <button onClick={() => navigate("/about")} className="relative bg-transparent text-accent text-[11px] font-black tracking-[0.4em] uppercase border-none cursor-pointer pb-3 group">
                                DISCOVER THE CRAFT
                                <div className="absolute bottom-0 left-0 w-10 h-[2px] bg-accent transition-[width] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></div>
                            </button>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    className="flex flex-wrap md:flex-nowrap justify-between pt-[100px] border-t border-white/10 gap-10 md:gap-0"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <div className="flex flex-col gap-3 w-full sm:w-[45%] lg:w-auto">
                        <span className="font-oswald text-[40px] font-black text-white">100%</span>
                        <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">ORIGINAL ARCHIVE</span>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-[45%] lg:w-auto">
                        <span className="font-oswald text-[40px] font-black text-white">EST.</span>
                        <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">2024 / MUMBAI</span>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-[45%] lg:w-auto">
                        <span className="font-oswald text-[40px] font-black text-white">GLOBAL</span>
                        <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">DISPATCH AVAILABLE</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default BrandStory;
