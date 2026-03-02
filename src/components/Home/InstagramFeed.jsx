import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./InstagramFeed.css";

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
        <section className="instagram-premium">
            <div className="container-wide">
                <div className="insta-header-luxury">
                    <motion.div
                        className="header-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="premium-tag">SOCIAL ARCHIVE</span>
                        <h2 className="premium-title-main">SHOP THE LOOK</h2>
                        <p className="insta-handle-luxury">@GENZ_CLOTHS_OFFICIAL</p>
                    </motion.div>
                </div>

                <div className="insta-editorial-grid">
                    {feedItems.map((item, index) => (
                        <motion.div
                            key={index}
                            className={`insta-box box-${index + 1}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            onClick={() => navigate("/category/all")}
                        >
                            <div className="insta-visual-wrap">
                                <img src={item.image} alt="Social Feed" className="insta-img" />
                                <div className="insta-overlay-premium">
                                    <div className="overlay-content">
                                        <Instagram size={20} color="#d4c4b1" />
                                        <span className="shop-tag">VIEW ARCHIVE</span>
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

export default InstagramFeed;
