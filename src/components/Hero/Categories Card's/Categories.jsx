import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
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
    <section className="py-[80px] md:py-[120px] bg-[#0a0a0a] text-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-[40px] lg:px-[60px]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 md:mb-20 gap-6 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-3 md:mb-6 block">ATELIER COLLECTIONS</span>
            <h2 className="font-oswald text-5xl md:text-[64px] lg:text-[80px] leading-[0.9] tracking-[-0.02em] uppercase font-black">ARCHIVE <br /> <span className="font-light opacity-40">SERIES / 24</span></h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="max-w-[450px] text-[13px] leading-[1.8] tracking-[0.1em] text-white/40 uppercase font-medium">
              Meticulously engineered garments designed for the modern urban landscape.
              Explore our curated archives of Fenrir and utility.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-[450px] md:auto-rows-[400px] lg:auto-rows-[100px] gap-8">
          {categoryItems.map((item, index) => {
            const getCardGridClasses = (i) => {
              switch (i) {
                case 1: return "md:col-span-1 md:row-span-1 lg:col-[1/7] lg:row-[1/6]";
                case 2: return "md:col-span-1 md:row-span-1 lg:col-[7/10] lg:row-[1/4]";
                case 3: return "md:col-span-1 md:row-span-1 lg:col-[10/13] lg:row-[1/4]";
                case 4: return "md:col-span-2 lg:col-[7/13] lg:row-[4/9]";
                case 5: return "md:col-span-1 md:row-span-1 lg:col-[1/7] lg:row-[6/9]";
                default: return "";
              }
            };
            return (
            <motion.div
              key={index}
              className={`relative cursor-pointer overflow-hidden group ${getCardGridClasses(index + 1)}`}
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
              <div className="relative w-full h-full overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-60 transition-opacity duration-[0.4s] ease-in group-hover:opacity-90"></div>

                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
                  <div className="flex justify-between opacity-100 md:opacity-0 md:-translate-y-5 transition-all duration-[0.6s] ease group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="font-oswald text-sm font-bold text-accent">0{index + 1}</span>
                    <span className="text-[9px] tracking-[0.3em] font-black uppercase">SPRING / SUMMER</span>
                  </div>

                  <div className="content-bottom">
                    <h3 className="font-oswald text-2xl md:text-[32px] font-black tracking-[-0.02em] uppercase mb-3 transform md:translate-y-5 transition-transform duration-[0.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">{item.title}</h3>
                    <div className="flex items-center gap-4 opacity-100 md:opacity-0 md:translate-y-2.5 transition-all duration-[0.6s] ease delay-100 group-hover:opacity-100 group-hover:translate-y-0">
                      <span className="text-[10px] font-black tracking-[0.4em] text-accent">THE ARCHIVE</span>
                      <div className="w-[30px] md:w-0 h-[1px] bg-accent transition-[width] duration-[0.6s] ease delay-100 group-hover:w-[40px]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}

export default Categories;
