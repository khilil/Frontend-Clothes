import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { ArrowRight } from "lucide-react";

function Newsletter() {
    return (
        <section className="py-[80px] md:py-[120px] bg-primary relative overflow-hidden before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-[60%] before:h-[60%] before:bg-[radial-gradient(circle,rgba(212,196,177,0.05)_0%,transparent_70%)] before:pointer-events-none">
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
                        <p className="text-[11px] sm:text-[13px] md:text-base leading-[1.8] text-textPrimary/40 mb-10 md:mb-[60px] tracking-[0.1em] uppercase font-medium">
                            Subscribe to receive early access to seasonal drops, exclusive lookbooks,
                            and our world of Fenrir. No spam, only pure intent.
                        </p>

                        <form className="max-w-[600px] mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex flex-col md:flex-row gap-3 md:gap-5 mb-8">
                                <input
                                    type="email"
                                    placeholder="EMAIL@ADDRESS.COM"
                                    required
                                    className="flex-1 bg-textPrimary/5 border border-textPrimary/10 p-[18px] md:py-[24px] md:px-[32px] text-textPrimary text-[11px] font-bold tracking-[0.3em] transition-all duration-400 ease focus:outline-none focus:bg-textPrimary/10 focus:border-accent"
                                />
                                <button type="submit" className="bg-textPrimary text-primary border-none h-14 md:h-auto md:py-0 md:px-10 flex items-center justify-center gap-3 text-[11px] font-black tracking-[0.3em] uppercase cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                                    JOIN ARCHIVE
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <label className="flex items-center gap-3 cursor-pointer select-none group">
                                    <input type="checkbox" required className="peer hidden" />
                                    <span className="w-3.5 h-3.5 border border-textPrimary/20 inline-block relative transition-all duration-300 peer-checked:bg-accent peer-checked:border-accent after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:opacity-0 after:transition-opacity after:duration-300 peer-checked:after:opacity-100"></span>
                                    <span className="text-[9px] font-black tracking-[0.2em] text-textPrimary/30 uppercase">I AGREE TO THE PRIVACY POLICY & TERMS</span>
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
