import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Truck, ShieldCheck, RefreshCcw, Headset } from "lucide-react";
import "./Benefits.css";

const benefitItems = [
    {
        icon: "lock_open",
        title: "SECURE ARCHIVE",
        description: "ENCRYPTED TRANSACTIONS / PROTECTED DATA FLOW"
    },
    {
        icon: "local_shipping",
        title: "GLOBAL DISPATCH",
        description: "EXPRESS LOGISTICS TO OVER 150 TERRITORIES"
    },
    {
        icon: "refresh",
        title: "ATELIER RETURNS",
        description: "SEAMLESS 30-DAY EXCHANGE & RETURN PRIVILEGE"
    },
    {
        icon: "support_agent",
        title: "CONCIERGE 24/7",
        description: "DEDICATED SUPPORT FOR THE MODERN ICON"
    }
];

function Benefits() {
    return (
        <section className="benefits-premium">
            <div className="container-wide">
                <div className="benefits-grid">
                    {benefitItems.map((item, index) => (
                        <motion.div
                            key={index}
                            className="benefit-item-luxury"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="benefit-icon-wrap">
                                <span className="material-symbols-outlined">{item.icon}</span>
                            </div>
                            <div className="benefit-content">
                                <h3 className="benefit-title">{item.title}</h3>
                                <p className="benefit-desc">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Benefits;
