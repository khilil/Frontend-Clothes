import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Globe, ArrowRight, ShieldCheck, Zap, Box, Compass, Plus, Minus } from "lucide-react";
import { useState } from "react";

function CollectiveFooter() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert("PROTOCOL ACCESS GRANTED.");
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-background text-text-primary px-[6%] py-12 md:py-32 border-t border-border-subtle overflow-hidden relative">
      {/* DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-border-subtle/30 hidden lg:block" />
      <div className="absolute top-0 left-1/2 w-[1px] h-full bg-border-subtle/30 hidden lg:block" />
      <div className="absolute top-0 left-3/4 w-[1px] h-full bg-border-subtle/30 hidden lg:block" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* BRAND PHILOSOPHY & LOGO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 mb-20 md:mb-32">
          <div className="lg:col-span-6 space-y-10 md:space-y-12 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-primary text-5xl sm:text-7xl lg:text-8xl tracking-tighter uppercase mb-6 md:mb-8 transition-all duration-700">FENRIR ERA</h2>
              <p className="archival-text text-text-primary text-[10px] md:text-xs max-w-[450px] mx-auto lg:mx-0 leading-relaxed opacity-80 px-4 md:px-0">
                WE ENGINEER ARMOR FOR THE MODERN ICON. HIGH-STREET UTILITY / ARCHIVAL LUXURY. 
                DESIGNED TO WITHSTAND THE URBAN VORTEX. THE PROTOCOL IS LIVE.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-8">
               <div className="flex items-center gap-2 md:gap-3">
                 <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-accent animate-pulse" />
                 <span className="protocol-label">System Online</span>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                 <ShieldCheck size={14} className="text-text-tertiary" />
                 <span className="protocol-label">Secure Node v.2.4</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-end lg:items-end mt-12 lg:mt-0">
            <div className="space-y-6 text-center lg:text-right max-w-[400px] mx-auto lg:ml-auto">
              <h4 className="archival-text text-text-tertiary">PROTOCOL ACCESS hub</h4>
              <p className="protocol-label !text-[9px] md:!text-[10px] !text-text-muted leading-loose px-6 md:px-0">
                JOIN THE COLLECTIVE TO UNLOCK ARCHIVAL RELEASES, EARLY ATELIER DROPS, AND SYSTEM-WIDE UPDATES.
              </p>
              <form onSubmit={handleSubscribe} className="relative group px-6 md:px-0">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="IDENTITY@NODE.COM" 
                  required
                  className="w-full bg-transparent border-b border-border-subtle py-4 text-[10px] tracking-[0.3em] uppercase focus:outline-none focus:border-accent transition-all duration-500"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 hover:translate-x-2 transition-transform duration-500">
                  <ArrowRight size={18} className="text-accent" />
                </button>
              </form>
              <div className="flex flex-wrap justify-start lg:justify-end gap-x-6 gap-y-2 pt-4">
                <span className="protocol-label text-[7px]">01/ ARCHIVAL ACCESS</span>
                <span className="protocol-label text-[7px]">02/ PRIORITY DROP</span>
                <span className="protocol-label text-[7px]">03/ ATELIER INSIGHTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED NAVIGATION NODES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0 md:gap-16 lg:gap-8 pt-10 md:pt-20 border-t border-border-subtle">
          
          {/* UTILITY */}
          <MobileAccordion 
            id="utility"
            title="UTILITY"
            icon={<Zap size={14} className="text-accent" />}
            openSection={openSection}
            toggleSection={toggleSection}
            className="lg:col-span-3"
          >
            <ul className="space-y-5 py-6 md:py-0">
              <FooterLink to="/about" label="Shipping Protocol" />
              <FooterLink to="/about" label="Returns Archive" />
              <FooterLink to="/about" label="Atelier Care" />
              <FooterLink to="/contact" label="Digital Terminal" />
            </ul>
          </MobileAccordion>

          {/* ARCHIVE */}
          <MobileAccordion 
            id="archive"
            title="ARCHIVE"
            icon={<Box size={14} className="text-accent" />}
            openSection={openSection}
            toggleSection={toggleSection}
            className="lg:col-span-3"
          >
            <ul className="space-y-5 py-6 md:py-0">
              <FooterLink to="/new-arrivals" label="New Arrivals" />
              <FooterLink to="/shop/all" label="Current Core" />
              <FooterLink to="/sale" label="Sale Archive" />
              <FooterLink to="/customize/all" label="Custom Lab" />
            </ul>
          </MobileAccordion>

          {/* COMMUNITY */}
          <MobileAccordion 
            id="community"
            title="COMMUNITY"
            icon={<Compass size={14} className="text-accent" />}
            openSection={openSection}
            toggleSection={toggleSection}
            className="lg:col-span-3"
          >
            <div className="flex flex-col gap-5 py-6 md:py-0">
              <a href="#" className="archival-text text-text-muted hover:text-text-primary transition-all duration-300 hover:pl-2">Instagram</a>
              <a href="#" className="archival-text text-text-muted hover:text-text-primary transition-all duration-300 hover:pl-2">Twitter / X</a>
              <a href="#" className="archival-text text-text-muted hover:text-text-primary transition-all duration-300 hover:pl-2">Discord Node</a>
              <a href="#" className="archival-text text-text-muted hover:text-text-primary transition-all duration-300 hover:pl-2">YouTube Archive</a>
            </div>
          </MobileAccordion>

          {/* LOCATION */}
          <div className="lg:col-span-3 space-y-10 pt-12 md:pt-0">
            <h4 className="archival-text text-text-tertiary">LOCATION NODE</h4>
            <div className="space-y-6">
              <p className="archival-text !normal-case !tracking-[0.2em] text-text-muted leading-relaxed">
                FENRIR ATELIER 001<br />
                245 UPPER STREET, SURAT<br />
                GUJARAT, INDIA 395007
              </p>
              <div className="pt-4 flex md:block justify-between items-end">
                <div>
                  <p className="protocol-label mb-2">Operational Hours</p>
                  <p className="archival-text text-[8px]">MON — SAT / 10:00 — 20:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA BAR */}
        <div className="mt-32 pt-10 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <span className="protocol-label text-[9px]">© 2024 FENRIR ERA / ALL SYSTEMS OPERATIONAL</span>
            <div className="flex gap-8">
              <Link to="/privacy" className="protocol-label hover:text-text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="protocol-label hover:text-text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="flex items-center gap-10 grayscale opacity-30 hover:opacity-100 transition-all duration-700">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
             <div className="h-4 w-[1px] bg-border-subtle" />
             <button onClick={scrollToTop} className="archival-text text-[8px] hover:text-accent transition-colors flex items-center gap-2">
               ↑ BACK TO TOP
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function MobileAccordion({ id, title, icon, children, openSection, toggleSection, className }) {
  const isOpen = openSection === id;
  
  return (
    <div className={`${className} border-b border-border-subtle md:border-none`}>
      <button 
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-8 md:py-0 md:mb-10 group"
      >
        <div className="flex items-center gap-4">
          {icon}
          <h4 className="archival-text text-text-tertiary">{title}</h4>
        </div>
        <div className="md:hidden">
          {isOpen ? <Minus size={14} className="text-accent" /> : <Plus size={14} className="text-text-muted" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.div
            initial={typeof window !== 'undefined' && window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FooterLink({ to, label }) {
  return (
    <li>
      <Link 
        to={to} 
        className="archival-text text-text-muted hover:text-text-primary transition-all duration-300 hover:pl-2 flex items-center group"
      >
        <span className="w-0 group-hover:w-3 h-[1px] bg-accent mr-0 group-hover:mr-3 transition-all duration-500" />
        {label}
      </Link>
    </li>
  );
}

export default CollectiveFooter;
