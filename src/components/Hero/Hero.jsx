import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
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
    <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background with subtle zoom effect */}
      <motion.div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center z-1"
        initial={{ scale: 1.2, filter: "brightness(0.8)" }}
        animate={{ scale: 1, filter: "brightness(1)" }}
        transition={{ duration: 8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%),linear-gradient(to_bottom,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.8)_100%)] z-2"></div>
      </motion.div>

      {/* Discover Label */}
      <motion.div
        className="absolute left-10 top-1/2 z-[4] pointer-events-none hidden lg:block"
        initial={{ opacity: 0, x: -20, rotate: -90 }}
        animate={{ opacity: 0.5, x: 0, rotate: -90 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="text-[10px] font-black tracking-[0.6em] uppercase text-white whitespace-nowrap">DISCOVER FENRIR</span>
      </motion.div>

      {/* Content Wrapped in Motion for Staggered Entrance */}
      <motion.div
        className="relative z-[5] w-full max-w-[1400px] px-6 md:px-10 flex flex-col items-center text-center text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="flex flex-col gap-3 mb-6 md:mb-8" variants={itemVariants}>
          <span className="text-[9px] font-black tracking-[0.4em] text-accent border border-accent/30 py-2 px-4 backdrop-blur-[10px] w-fit mx-auto">NEW COLLECTION</span>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.4em] sm:tracking-[0.8em] uppercase opacity-60">URBAN STRIKE COLLECTION 2024</span>
        </motion.div>

        <motion.h1 className="font-oswald text-[50px] md:text-[72px] lg:text-[clamp(60px,18vw,220px)] leading-[0.85] tracking-[-0.04em] uppercase font-black mb-10 lg:mb-[60px]" variants={itemVariants}>
          FENRIR
        </motion.h1>

        <motion.div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center w-full md:w-auto" variants={itemVariants}>
          <button className="relative bg-white text-black py-5 md:py-6 px-[56px] w-full md:w-auto text-[11px] font-black tracking-[0.3em] uppercase border-none cursor-pointer overflow-hidden transition-transform duration-300 hover:-translate-y-1 group" onClick={() => navigate("/category/all")}>
            EXPLORE COLLECTION
            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent transition-[width] duration-300 group-hover:w-full"></div>
          </button>
          <button className="text-[11px] font-black tracking-[0.3em] uppercase text-white bg-transparent border-b-2 border-white/20 py-3 cursor-pointer transition-all duration-300 hover:border-accent hover:tracking-[0.4em]" onClick={() => navigate("/about")}>
            THE LOOKBOOK
          </button>
        </motion.div>
      </motion.div>

      {/* Floating element for premium feel */}
      <motion.div
        className="absolute bottom-[60px] left-[60px] hidden lg:flex gap-10 z-[5]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className="flex items-center gap-3">
          <span className="w-1 h-1 bg-accent rounded-full mt-1.5"></span>
          <span className="text-[9px] font-black tracking-[0.3em] text-white opacity-50 uppercase">GLOBAL DISPATCH</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-1 h-1 bg-accent rounded-full mt-1.5"></span>
          <span className="text-[9px] font-black tracking-[0.3em] text-white opacity-50 uppercase">LIMITED EDITION</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-5 lg:right-[60px] h-[160px] hidden sm:flex flex-col items-center z-[5]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <div className="relative w-[1px] h-[100px] bg-white/10">
          <motion.div
            className="absolute top-0 -left-[1.5px] w-1 h-5 bg-accent rounded-[2px]"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </div>
        <span className="mt-5 text-[9px] font-black tracking-[0.8em] text-white opacity-30 uppercase [writing-mode:vertical-rl]">EVOLVE</span>
      </motion.div>
    </section>
  );
}

export default Hero;
