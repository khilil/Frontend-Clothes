import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";

const feedItems = [
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
    link: "#"
  },
  {
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop",
    link: "#"
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    link: "#"
  },
  {
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop",
    link: "#"
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    link: "#"
  },
  {
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
    link: "#"
  }
];

function InstagramFeed() {
  const navigate = useNavigate();

  return (
    <section className="py-[80px] sm:py-[120px] bg-[#0a0a0a]">
      <div className="container-wide">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-3 block">SOCIAL ARCHIVE</span>
            <h2 className="font-oswald text-[48px] md:text-[64px] lg:text-[80px] leading-[0.9] tracking-[-0.04em] uppercase font-black text-white">SHOP THE LOOK</h2>
            <p className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mt-5 opacity-50">@FENRIRERA_OFFICIAL</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[400px] sm:auto-rows-[300px] lg:auto-rows-[150px] gap-6">
          {feedItems.map((item, index) => {
            const getGridClasses = (i) => {
              switch (i) {
                case 1: return "sm:col-span-1 sm:row-span-1 lg:col-[1/4] lg:row-[1/4]";
                case 2: return "sm:col-span-1 sm:row-span-1 lg:col-[4/7] lg:row-[1/3]";
                case 3: return "sm:col-span-1 sm:row-span-1 lg:col-[7/10] lg:row-[1/4]";
                case 4: return "sm:col-span-1 sm:row-span-1 lg:col-[10/13] lg:row-[1/3]";
                case 5: return "sm:col-span-1 sm:row-span-1 lg:col-[4/7] lg:row-[3/5]";
                case 6: return "sm:col-span-1 sm:row-span-1 lg:col-[10/13] lg:row-[3/5]";
                default: return "";
              }
            };
            return (
              <motion.div
                key={index}
                className={`relative cursor-pointer group ${getGridClasses(index + 1)}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                onClick={() => navigate("/category/all")}
              >
                <div className="relative w-full h-full overflow-hidden bg-[#111]">
                  <img loading="lazy" src={item.image} alt="Social Feed" className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[5px] flex items-center justify-center opacity-0 transition-all duration-400 ease group-hover:opacity-100">
                    <div className="flex flex-col items-center gap-3 translate-y-5 transition-all duration-400 ease group-hover:translate-y-0">
                      <Instagram size={20} color="#d4c4b1" />
                      <span className="text-[9px] font-black tracking-[0.3em] text-white uppercase">VIEW ARCHIVE</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}

export default InstagramFeed;
