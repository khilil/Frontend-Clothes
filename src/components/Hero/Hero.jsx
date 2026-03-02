import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="hero">
      {/* Background with subtle zoom effect */}
      <motion.div
        className="hero-bg"
        initial={{ scale: 1.2, filter: "brightness(0.8)" }}
        animate={{ scale: 1, filter: "brightness(1)" }}
        transition={{ duration: 8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-overlay"></div>
      </motion.div>

      {/* Discover Label */}
      <motion.div
        className="hero-discover-label"
        initial={{ opacity: 0, x: -20, rotate: -90 }}
        animate={{ opacity: 0.5, x: 0, rotate: -90 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span>DISCOVER FENRIR</span>
      </motion.div>

      {/* Content Wrapped in Motion for Staggered Entrance */}
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero-badge-wrap" variants={itemVariants}>
          <span className="hero-badge">NEW COLLECTION</span>
          <span className="hero-subtitle">URBAN STRIKE COLLECTION 2024</span>
        </motion.div>

        <motion.h1 className="hero-title" variants={itemVariants}>
          FENRIR
        </motion.h1>

        <motion.div className="hero-actions" variants={itemVariants}>
          <button className="btn-luxury" onClick={() => navigate("/category/all")}>
            EXPLORE COLLECTION
            <div className="btn-line"></div>
          </button>
          <button className="btn-ghost" onClick={() => navigate("/about")}>
            THE LOOKBOOK
          </button>
        </motion.div>
      </motion.div>

      {/* Floating element for premium feel */}
      <motion.div
        className="hero-footer-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className="stat-pill">
          <span className="dot"></span>
          <span>GLOBAL DISPATCH</span>
        </div>
        <div className="stat-pill">
          <span className="dot"></span>
          <span>LIMITED EDITION</span>
        </div>
      </motion.div>

      <motion.div
        className="hero-scroll-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <div className="scroll-icon">
          <motion.div
            className="scroll-dot"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </div>
        <span className="scroll-text">EVOLVE</span>
      </motion.div>
    </section>
  );
}

export default Hero;
