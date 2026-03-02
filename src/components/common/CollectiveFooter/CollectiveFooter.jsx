import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Globe, Share2 } from "lucide-react";
import "./CollectiveFooter.css";

function CollectiveFooter() {
  const navigate = useNavigate();

  return (
    <footer className="footer-main">
      <div className="footer-inner">
        {/* BRAND */}
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="brand-title">FENRIR</h3>
          <p className="brand-mission">
            WE ENGINEER ARMOR FOR THE MODERN ICON. <br />
            HIGH-STREET UTILITY / FENRIR.
          </p>

          <div className="footer-social-premium">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
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
          <h4>ASSISTANCE</h4>
          <ul className="footer-links">
            <li><button onClick={() => navigate("/shipping")}>Shipping & Delivery</button></li>
            <li><button onClick={() => navigate("/returns")}>Return Archive</button></li>
            <li><button onClick={() => navigate("/care")}>Atelier Care</button></li>
            <li><button onClick={() => navigate("/faq")}>FAQ</button></li>
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
          <h4>COLLECTIONS</h4>
          <ul className="footer-links">
            <li><button onClick={() => navigate("/category/shirts")}>Shirts & Polo</button></li>
            <li><button onClick={() => navigate("/category/jeans")}>Denim Series</button></li>
            <li><button onClick={() => navigate("/category/jacket")}>Outerwear</button></li>
            <li><button onClick={() => navigate("/category/all")}>View All</button></li>
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
          <h4>STUDIO</h4>
          <p className="footer-studio-info">
            VISIT OUR ATELIER <br />
            EST. 2024 / LONDON <br />
            UNITED KINGDOM <br /><br />
            CONTACT: HELLO@FENRIR.COM
          </p>
        </motion.div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom-premium">
        <div className="bottom-left">
          <span>© 2024 FENRIR. ALL RIGHTS RESERVED.</span>
          <div className="bottom-links">
            <button onClick={() => navigate("/privacy")}>Privacy</button>
            <button onClick={() => navigate("/terms")}>Terms</button>
          </div>
        </div>

        <div className="payment-methods">
          <span className="payment-label">SECURE PAYMENTS</span>
          <div className="payment-icons">
            <Globe size={16} />
            <Share2 size={16} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default CollectiveFooter;
