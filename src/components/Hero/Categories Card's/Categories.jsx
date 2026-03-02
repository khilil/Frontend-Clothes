import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
import "./Categories.css";

const categoryItems = [
  {
    title: "SHIRTS",
    slug: "shirts",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop",
    size: "large"
  },
  {
    title: "T-SHIRTS",
    slug: "t-shirt",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1974&auto=format&fit=crop",
    size: "small"
  },
  {
    title: "JEANS",
    slug: "jeans",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1926&auto=format&fit=crop",
    size: "small"
  },
  {
    title: "JACKETS",
    slug: "jacket",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop",
    size: "medium"
  },
  {
    title: "HOODIES",
    slug: "hoodie",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop",
    size: "medium"
  }
];

function Categories() {
  const navigate = useNavigate();

  return (
    <section className="categories-premium">
      <div className="container-wide">
        <div className="categories-header">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="header-left"
          >
            <span className="premium-tag">ATELIER COLLECTIONS</span>
            <h2 className="premium-title">ARCHIVE <br /> <span className="title-thin">SERIES / 24</span></h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="header-right"
          >
            <p className="premium-desc">
              Meticulously engineered garments designed for the modern urban landscape.
              Explore our curated archives of Fenrir and utility.
            </p>
          </motion.div>
        </div>

        <div className="categories-editorial-grid">
          {categoryItems.map((item, index) => (
            <motion.div
              key={index}
              className={`editorial-card card-${index + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1]
              }}
              onClick={() => navigate(`/category/${item.slug}`)}
            >
              <div className="editorial-visual">
                <img src={item.image} alt={item.title} className="editorial-img" />
                <div className="editorial-overlay"></div>

                <div className="editorial-content">
                  <div className="content-top">
                    <span className="item-count">0{index + 1}</span>
                    <span className="item-series">SPRING / SUMMER</span>
                  </div>

                  <div className="content-bottom">
                    <h3 className="item-title">{item.title}</h3>
                    <div className="item-explore">
                      <span>THE ARCHIVE</span>
                      <div className="explore-line"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
