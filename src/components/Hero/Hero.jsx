import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1920&auto=format&fit=crop",
    label: "EDITORIAL",
    subheading: "VOL. 04 / URBAN EXPLORATION",
    heading: "ESSENTIALS",
    cta: "SHOP THE DROP",
    link: "/category/all"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=1920&auto=format&fit=crop",
    label: "ARCHIVE SERIES",
    subheading: "THE TAILORED MINIMALIST",
    heading: "LIMITLESS",
    cta: "DISCOVER MORE",
    link: "/category/shirts"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=1920&auto=format&fit=crop",
    label: "OUTDOOR TECH",
    subheading: "ALL-WEATHER PERFORMANCE",
    heading: "VANGUARD",
    cta: "EXPLORE GEER",
    link: "/category/jacket"
  }
];

function Hero() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get("/hero");
        if (response.data.success && response.data.data.length > 0) {
          setSlides(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching hero slides:", error);
      }
    };
    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isAutoPlaying, slides.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section 
      className="relative h-[75vh] md:h-screen w-full overflow-hidden bg-background flex items-center justify-center pt-16 md:pt-0"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 z-1"
          initial={{ scale: 1.1, filter: "brightness(0.5)" }}
          animate={{ scale: 1, filter: "brightness(1)" }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          transition={{ duration: 7, ease: [0.16, 1, 0.3, 1] }}
        >
          <img 
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].heading}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/60 z-2"></div>
        </motion.div>
      </AnimatePresence>

      {/* Discover Label - Side */}
      <motion.div
        className="absolute left-10 top-1/2 z-[4] pointer-events-none hidden lg:block"
        initial={{ opacity: 0, x: -20, rotate: -90 }}
        animate={{ opacity: 0.4, x: 0, rotate: -90 }}
        transition={{ duration: 1.5 }}
      >
        <span className="text-[10px] font-black tracking-[0.8em] uppercase text-text-primary whitespace-nowrap">DISCOVER THE ARCHIVE</span>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-[5] w-full max-w-[1400px] px-6 md:px-10 flex flex-col items-center text-center text-text-primary">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div className="flex flex-col gap-4 mb-8" variants={itemVariants}>
              <span className="text-[9px] font-black tracking-[0.4em] text-accent border border-accent/20 py-2.5 px-6 backdrop-blur-[12px] bg-accent/5 w-fit mx-auto">
                {slides[currentSlide].label}
              </span>
              <span className="text-[10px] md:text-[11px] font-medium tracking-[0.6em] md:tracking-[0.8em] uppercase opacity-50">
                {slides[currentSlide].subheading}
              </span>
            </motion.div>

            <motion.h1 
              className="font-oswald text-[50px] md:text-[80px] lg:text-[clamp(80px,20vw,240px)] leading-[0.85] tracking-[-0.04em] uppercase font-black mb-8 md:mb-12 lg:mb-[70px]" 
              variants={itemVariants}
            >
              {slides[currentSlide].heading}
            </motion.h1>

            <motion.div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center w-full md:w-auto" variants={itemVariants}>
              <button 
                className="relative bg-text-primary text-primary py-5 md:py-6 px-[64px] w-full md:w-auto text-[11px] font-black tracking-[0.3em] uppercase border-none cursor-pointer overflow-hidden transition-all duration-300 hover:bg-accent hover:text-primary group" 
                onClick={() => navigate(slides[currentSlide].link)}
              >
                {slides[currentSlide].cta}
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-primary transition-[width] duration-300 group-hover:w-full"></div>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10] flex items-center gap-12 sm:gap-20">
        <button 
          onClick={prevSlide}
          className="text-text-primary/30 hover:text-text-primary transition-colors duration-300 bg-transparent border-none cursor-pointer p-2"
        >
          <ChevronLeft size={24} strokeWidth={1} />
        </button>

        {/* Slide Indicators */}
        <div className="flex gap-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="relative w-[40px] md:w-[60px] h-[2px] bg-border-subtle cursor-pointer border-none overflow-hidden"
            >
              <div className={`absolute left-0 top-0 h-full bg-accent transition-all duration-300 ${currentSlide === index ? 'w-full' : 'w-0'}`}></div>
            </button>
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="text-text-primary/30 hover:text-text-primary transition-colors duration-300 bg-transparent border-none cursor-pointer p-2"
        >
          <ChevronRight size={24} strokeWidth={1} />
        </button>
      </div>

      {/* Floating Info - Quick Scroll */}
      <motion.div
        className="absolute bottom-[60px] right-[60px] hidden lg:flex flex-col items-center gap-6 z-[5]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="relative w-[1px] h-[120px] bg-border-subtle">
          <motion.div
            className="absolute top-0 -left-[1.5px] w-1 h-6 bg-accent"
            animate={{ y: [0, 94, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
        </div>
        <span className="text-[9px] font-black tracking-[0.8em] text-text-primary/30 uppercase [writing-mode:vertical-rl] select-none">SCROLL</span>
      </motion.div>
    </section>
  );
}

export default Hero;
