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
import './Home.css'

function Home() {
  return (
    <main className="home-page">
      <Header />
      <Hero />
      <Benefits />
      <Categories />
      <HomeInfiniteScroll />
      <FeaturedProducts />
      {/* <BrandStory /> */}
      <InstagramFeed />
      <Newsletter />
      <CollectiveFooter />
    </main>
  );
}

export default Home;
