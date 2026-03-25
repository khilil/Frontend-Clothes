import Hero from "../../components/Hero/Hero";
import Categories from "../../components/Hero/Categories Card's/Categories";
import FeaturedProducts from "../../components/Home/FeaturedProducts";
import BrandStory from "../../components/Home/BrandStory";
import Benefits from "../../components/Home/Benefits";
import Newsletter from "../../components/Home/Newsletter";
import InstagramFeed from "../../components/Home/InstagramFeed";
import CollectiveFooter from "../../components/common/CollectiveFooter/CollectiveFooter";
import Header from "../../components/common/Header/Header";
import HomeInfiniteScroll from "../../components/Home/HomeInfiniteScroll";
import { useOffers } from "../../context/OfferContext";
import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";

const PromotionalBanner = ({ banner }) => {
  const navigate = useNavigate();
  if (!banner) return null;

  const handleClaim = () => {
    if (banner.applicableCategories && banner.applicableCategories.length > 0) {
      const slug = banner.applicableCategories[0].toLowerCase().replace(/\s+/g, '-');
      navigate(`/category/${slug}`);
    } else if (banner.offerType === 'FLASH_SALE' || banner.offerType === 'SEASONAL') {
      navigate('/sale');
    } else {
      navigate('/category/all');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="container-wide mb-12"
      onClick={handleClaim}
    >
      <div className="relative h-[200px] md:h-[300px] rounded-3xl overflow-hidden group cursor-pointer">
        <img 
          src={banner.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2070"} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          alt={banner.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent flex flex-col justify-center px-8 md:px-16">
          <span className="text-accent text-[10px] font-black tracking-[0.5em] uppercase mb-4">{banner.offerType?.replace(/_/g, ' ') || 'PROMOTION'}</span>
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-text-primary mb-2 leading-none">
            {banner.bannerText || banner.title}
          </h3>
          <p className="text-text-secondary/80 text-xs md:text-sm max-w-md line-clamp-2 uppercase tracking-widest font-bold">
            {banner.description}
          </p>
          <div className="mt-8">
            <button className="bg-text-primary text-primary text-[10px] font-black py-4 px-10 rounded-xl uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-colors">
              Claim Offer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function Home() {
  const { activeBanners } = useOffers();
  const heroBanner = activeBanners.find(b => b.position === "HERO");
  const middleBanners = activeBanners.filter(b => b.position === "BETWEEN_SECTIONS");
  const topGridBanners = activeBanners.filter(b => b.position === "TOP_GRID");

  return (
    <motion.main
      className="bg-background text-text-primary w-full overflow-x-hidden selection:bg-accent selection:text-white pt-16 md:pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {heroBanner && <PromotionalBanner banner={heroBanner} />}
      <Hero />
      {topGridBanners.length > 0 && topGridBanners.map(b => (
        <PromotionalBanner key={b.id} banner={b} />
      ))}
      <FeaturedProducts />
      {middleBanners.length > 0 && (
         <div className="space-y-12 py-12">
            {middleBanners.map(b => <PromotionalBanner key={b.id} banner={b} />)}
         </div>
      )}
      <Categories />
      <Benefits />
      <HomeInfiniteScroll />
      {/* <BrandStory /> */}
      <InstagramFeed />
      <Newsletter />
      <CollectiveFooter />
    </motion.main>
  );
}

export default Home;
