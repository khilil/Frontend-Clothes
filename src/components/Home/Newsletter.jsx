import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { ArrowRight } from "lucide-react";

function Newsletter() {
    return (
        <section className="py-[80px] md:py-[120px] luxury-gradient-bg relative overflow-hidden border-t border-[#1f1f1f]">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
            <div className="container-wide">
                <div className="flex justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="w-full max-w-[800px]"
                    >
                        <span className="text-[10px] font-black tracking-[0.5em] text-accent uppercase mb-3 block">ATELIER UPDATES</span>
                        <h2 className="font-primary text-[40px] md:text-[64px] lg:text-[80px] leading-[0.9] tracking-[-0.04em] uppercase font-black text-textPrimary">STAY AHEAD <br /> <span className="font-light opacity-40">OF THE CURVE</span></h2>
                        <p className="text-[11px] sm:text-[13px] md:text-base leading-[1.8] text-textSecondary mb-10 md:mb-[60px] tracking-[0.1em] uppercase font-medium">
                            Subscribe to receive early access to seasonal drops, exclusive lookbooks,
                            and our world of Fenrir. No spam, only pure intent.
                        </p>

                        <form className="max-w-[600px] mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex flex-col md:flex-row gap-3 md:gap-5 mb-8">
                                <input
                                    type="email"
                                    placeholder="EMAIL@ADDRESS.COM"
                                    required
                                    className="luxury-input flex-1"
                                />
                                <button type="submit" className="luxury-button flex items-center justify-center gap-3">
                                    JOIN ARCHIVE
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <label className="flex items-center gap-3 cursor-pointer select-none group">
                                    <input type="checkbox" required className="peer hidden" />
                                    <span className="w-3.5 h-3.5 border border-[#1f1f1f] bg-secondary inline-block relative transition-all duration-300 peer-checked:bg-accent peer-checked:border-accent after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:opacity-0 after:transition-opacity after:duration-300 peer-checked:after:opacity-100"></span>
                                    <span className="text-[9px] font-black tracking-[0.2em] text-textSecondary uppercase hover:text-textPrimary transition-colors">I AGREE TO THE PRIVACY POLICY & TERMS</span>
                                </label>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default Newsletter;
