import { motion, useScroll, useTransform } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BrandStory.css";

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
        <section className="brand-story" ref={containerRef} style={{ position: 'relative' }}>
            <motion.div
                className="story-bg"
                style={{ y }}
            >
                <div className="story-overlay"></div>
            </motion.div>

            <div className="story-content-premium">
                <div className="story-main-wrap">
                    <motion.div
                        className="story-header"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="premium-tag">THE PHILOSOPHY</span>
                        <h2 className="story-title-heavy">
                            ENGINEERING <br />
                            <span className="title-hollow">FENRIR</span>
                        </h2>
                    </motion.div>

                    <div className="story-body-grid">
                        <motion.div
                            className="story-visual-side"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <img src="https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=1974&auto=format&fit=crop" alt="Craftsmanship" className="story-main-img" />
                        </motion.div>

                        <motion.div
                            className="story-text-side"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 1 }}
                        >
                            <p className="story-lead">
                                We bridge the gap between utilitarian durability and high-street aesthetics.
                                Every garment is a statement of intent, engineered to survive trends and the test of time.
                            </p>
                            <p className="story-sub">
                                Born in 2024, Fenrir represents the fusion of urban aesthetics and utility.
                                We believe in the legacy of detail and the power of uncompromising craftsmanship.
                            </p>
                            <button onClick={() => navigate("/about")} className="btn-story-explore">
                                DISCOVER THE CRAFT
                                <div className="btn-line"></div>
                            </button>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    className="story-stats-premium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <div className="stat-box">
                        <span className="stat-num">100%</span>
                        <span className="stat-label">ORIGINAL ARCHIVE</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num">EST.</span>
                        <span className="stat-label">2024 / MUMBAI</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num">GLOBAL</span>
                        <span className="stat-label">DISPATCH AVAILABLE</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default BrandStory;
