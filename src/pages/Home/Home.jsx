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
import { motion } from "framer-motion";

function Home() {
  return (
    <motion.main
      className="bg-black text-white w-full overflow-x-hidden selection:bg-white/90 selection:text-black pt-16 md:pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <Hero />
      <FeaturedProducts />
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
