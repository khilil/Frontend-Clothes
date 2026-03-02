import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { ArrowRight } from "lucide-react";
import "./Newsletter.css";

function Newsletter() {
    return (
        <section className="newsletter-premium">
            <div className="container-wide">
                <div className="newsletter-inner-wrap">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="newsletter-content-luxury"
                    >
                        <span className="premium-tag">ATELIER UPDATES</span>
                        <h2 className="premium-title-main">STAY AHEAD <br /> <span className="title-thin">OF THE CURVE</span></h2>
                        <p className="newsletter-lead">
                            Subscribe to receive early access to seasonal drops, exclusive lookbooks,
                            and our world of Fenrir. No spam, only pure intent.
                        </p>

                        <form className="newsletter-form-luxury" onSubmit={(e) => e.preventDefault()}>
                            <div className="input-field-wrap">
                                <input
                                    type="email"
                                    placeholder="EMAIL@ADDRESS.COM"
                                    required
                                    className="luxury-input"
                                />
                                <button type="submit" className="btn-join-archive">
                                    JOIN ARCHIVE
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="checkbox-wrap-premium">
                                <label className="luxury-checkbox">
                                    <input type="checkbox" required />
                                    <span className="check-mark"></span>
                                    <span className="privacy-text">I AGREE TO THE PRIVACY POLICY & TERMS</span>
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
