import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Truck, ShieldCheck, RefreshCcw, Headset } from "lucide-react";
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
        <section className="py-20 bg-[#0a0a0a] border-y border-white/5">
            <div className="container-wide">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                    {benefitItems.map((item, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start gap-6 p-3 sm:p-5 transition-transform duration-300 hover:-translate-y-1.5"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="shrink-0 w-11 h-11 flex items-center justify-center bg-accent/5 border border-accent/10 text-accent">
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-[11px] font-black tracking-[0.2em] text-white uppercase">{item.title}</h3>
                                <p className="text-[9px] leading-[1.6] font-medium tracking-[0.1em] text-white/30 uppercase max-w-[180px]">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Benefits;
