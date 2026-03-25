import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Globe, Share2 } from "lucide-react";

function CollectiveFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-secondary text-text-primary px-[6%] py-[80px] md:pt-[120px] md:pb-[60px] md:px-[8%] border-t border-border-subtle">
      <div className="max-w-[1400px] mx-auto mb-[100px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] xl:grid-cols-[2fr_1fr_1fr_1.2fr] gap-[60px] md:gap-[40px] xl:gap-20">
        {/* BRAND */}
        <motion.div
          className="max-w-[320px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-oswald text-[32px] leading-[0.9] tracking-[-0.02em] mb-[30px] text-text-primary">FENRIR</h3>
          <p className="text-[10px] leading-[2.2] tracking-[0.2em] uppercase text-text-secondary mb-[40px]">
            WE ENGINEER ARMOR FOR THE MODERN ICON. <br />
            HIGH-STREET UTILITY / FENRIR.
          </p>

          <div className="flex gap-6">
            <a href="#" aria-label="Instagram" className="text-text-secondary/50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-text-primary hover:-translate-y-[3px]"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter" className="text-text-secondary/50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-text-primary hover:-translate-y-[3px]"><Twitter size={18} /></a>
            <a href="#" aria-label="Facebook" className="text-text-secondary/50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-text-primary hover:-translate-y-[3px]"><Facebook size={18} /></a>
            <a href="#" aria-label="YouTube" className="text-text-secondary/50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-text-primary hover:-translate-y-[3px]"><Youtube size={18} /></a>
          </div>
        </motion.div>

        {/* ASSISTANCE */}
        <motion.div
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-oswald text-[11px] font-medium tracking-[0.3em] text-text-primary mb-[35px] uppercase">ASSISTANCE</h4>
          <ul className="list-none p-0 m-0">
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/shipping")}>Shipping & Delivery</button></li>
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/returns")}>Return Archive</button></li>
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/care")}>Atelier Care</button></li>
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/faq")}>FAQ</button></li>
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/contact")}>Contact Us</button></li>
          </ul>
        </motion.div>

        {/* COLLECTION */}
        <motion.div
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-oswald text-[11px] font-medium tracking-[0.3em] text-text-primary mb-[35px] uppercase">COLLECTIONS</h4>
          <ul className="list-none p-0 m-0">
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/category/shirts")}>Shirts & Polo</button></li>
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/category/jeans")}>Denim Series</button></li>
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/category/jacket")}>Outerwear</button></li>
            <li className="mb-4"><button className="bg-transparent border-none p-0 text-[10px] tracking-[0.15em] uppercase text-text-secondary cursor-pointer transition-all duration-300 font-medium hover:text-text-primary hover:pl-[5px]" onClick={() => navigate("/category/all")}>View All</button></li>
          </ul>
        </motion.div>

        {/* STUDIO */}
        <motion.div
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="font-oswald text-[11px] font-medium tracking-[0.3em] text-text-primary mb-[35px] uppercase">STUDIO</h4>
          <p className="text-[10px] leading-[2.4] tracking-[0.15em] uppercase text-text-secondary">
            VISIT OUR ATELIER <br />
            EST. 2024 / MUMBAI <br />
            INDIA <br /><br />
            CONTACT: SUPPORT@FENRIRERA.COM
          </p>
        </motion.div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-[1400px] mx-auto pt-[40px] border-t border-border-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-[30px] md:gap-0">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-[20px] md:gap-[40px]">
          <span className="text-[9px] tracking-[0.2em] text-text-secondary/30">© 2024 FENRIR. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6">
            <button className="bg-transparent border-none text-[9px] tracking-[0.2em] uppercase text-text-secondary/30 cursor-pointer transition-colors duration-300 hover:text-text-primary" onClick={() => navigate("/privacy")}>Privacy</button>
            <button className="bg-transparent border-none text-[9px] tracking-[0.2em] uppercase text-text-secondary/30 cursor-pointer transition-colors duration-300 hover:text-text-primary" onClick={() => navigate("/terms")}>Terms</button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-[8px] font-black tracking-[0.3em] text-text-secondary/20">SECURE PAYMENTS</span>
          <div className="flex gap-4 text-text-secondary/20">
            <Globe size={16} />
            <Share2 size={16} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default CollectiveFooter;
