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
                            className="group flex items-start gap-6 p-6 transition-all duration-500 hover:bg-white/[0.02] border border-transparent hover:border-white/5 relative overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-zinc-900 border border-white/5 text-accent transition-transform duration-500 group-hover:scale-110 group-hover:border-accent/20">
                                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <h3 className="text-[12px] font-black tracking-[0.25em] text-white uppercase group-hover:text-accent transition-colors duration-300">{item.title}</h3>
                                <p className="text-[9px] leading-[1.7] font-medium tracking-[0.12em] text-white/30 uppercase max-w-[180px]">{item.description}</p>
                            </div>
                            {/* Subtle line at bottom on hover */}
                            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent/30 transition-all duration-700 group-hover:w-full"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Benefits;
