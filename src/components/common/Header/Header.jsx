import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAllCategories } from "../../../services/categoryService";
import { useCart } from "../../../context/CartContext";
import MiniCart from "../../../pages/Cart/MiniCart";
import { motion, AnimatePresence } from "framer-motion";

const CLOTHING_MENU = [
  {
    title: "Topwear",
    slug: "topwear",
    items: [
      { name: "Blazers", slug: "blazers" },
      { name: "Hoodies", slug: "hoodies" },
      { name: "Jackets", slug: "jackets" },
      { name: "Shirts", slug: "shirts" },
      { name: "Sweaters", slug: "sweaters" },
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "All Topwear", slug: "topwear" }
    ]
  },
  {
    title: "Bottomwear",
    slug: "bottomwear",
    items: [
      { name: "All Bottomwear", slug: "bottomwear" },
      { name: "Cargo", slug: "cargo" },
      { name: "Jeans", slug: "jeans" },
      { name: "Joggers", slug: "joggers" },
      { name: "Shorts", slug: "shorts" },
      { name: "Trousers", slug: "trousers" }
    ]
  },
  {
    title: "Occasion",
    slug: "occasion",
    items: [
      { name: "Formal", slug: "formal" },
      { name: "Casual", slug: "casual" },
      { name: "Office", slug: "office" },
      { name: "Streetwear", slug: "streetwear" }
    ]
  },
  {
    title: "Featured",
    slug: "featured",
    items: [
      { name: "Best Sellers", slug: "best-sellers" },
      { name: "New This Week", slug: "new-arrivals" },
      { name: "Premium Collection", slug: "premium" },
      { name: "Trending", slug: "trending" }
    ]
  }
];

export default function Header({ forceSolid = false }) {
  const location = useLocation();
  const isAccountPage = location.pathname.startsWith("/account");

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate initials
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  useEffect(() => {
    setIsLoading(true);
    getAllCategories().then((res) => {
      setCategories(res.data || []);
    }).catch(err => console.error("Header fetch error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Dynamic Grouping Logic
  const menuGroups = useMemo(() => {
    if (!categories.length) return [];
    const roots = categories.filter(c => !c.parentCategory);
    return roots.map(root => ({
      ...root,
      children: categories.filter(c =>
        (typeof c.parentCategory === 'string' ? c.parentCategory === root._id : c.parentCategory?._id === root._id)
      )
    })).slice(0, 4);
  }, [categories]);

  const headerBgClass = isMobileMenuOpen || isMegaMenuOpen
    ? `bg-background border-border-subtle ${scrolled ? 'h-14 md:h-16' : 'h-16 md:h-24'}`
    : (scrolled || forceSolid)
      ? 'header-scrolled h-14 md:h-16 shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
      : 'lg:bg-transparent bg-background h-16 md:h-24';

  return (
    <>
      <header className={`header-base md:header-noise fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${headerBgClass} border-b border-border-subtle`}>
        <div className="max-w-[1920px] mx-auto h-full px-4 md:px-12 flex items-center justify-between relative">

          {/* MOBILE BURGER (Left on mobile, hidden on desktop) */}
          <div className="lg:hidden z-[110] flex-1 flex items-center justify-start">
            <button
              className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <div className="burger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>

          {/* LOGO (Center absolutely on mobile, inline on desktop) */}
          <div className={`z-[110] transition-all duration-500 absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none`}>
            <Link className="text-xl md:text-2xl font-primary tracking-tighter text-text-primary transition-all hover:scale-105 active:scale-95 whitespace-nowrap" to="/" onClick={() => setIsMobileMenuOpen(false)}>F E N R I R</Link>
          </div>

          {/* DESKTOP NAV */}
          {!isAccountPage && (
            <nav className="hidden lg:flex items-center gap-10 h-full">
              <Link className="relative text-text-secondary no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5 text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-accent after:rounded after:-translate-x-1/2 after:transition-all after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:shadow-[0_0_10px_var(--color-accent)] hover:after:w-4" to="/new-arrivals">
                New Arrivals
              </Link>

              {/* CLOTHING MEGA MENU TRIGGER */}
              <div
                className="mega-menu-trigger h-full flex items-center"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <span className={`relative text-text-secondary no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5 text-[10px] font-black uppercase tracking-[0.3em] cursor-default after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-accent after:rounded after:-translate-x-1/2 after:transition-all after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:shadow-[0_0_10px_var(--color-accent)] hover:after:w-4 ${isMegaMenuOpen ? 'text-accent after:w-4' : 'hover:text-accent'}`}>
                  Clothing
                </span>

                {/* MEGA MENU */}
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="mega-menu"
                    >
                      <div className="max-w-[1920px] mx-auto grid grid-cols-5 gap-0 min-h-[500px] border-t border-border-subtle">
                        {CLOTHING_MENU.map((group, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + idx * 0.03 }}
                            className="p-12 flex flex-col hover:bg-text-primary/[0.02] border-r border-border-subtle transition-colors mega-menu-col group/col"
                          >
                            <h4 className="text-accent text-[11px] font-black uppercase tracking-[0.4em] mb-8 group-hover/col:translate-x-1 transition-transform relative z-10">
                              <Link
                                to={`/category/${group.slug}`}
                                className="hover:text-text-primary transition-colors"
                                onClick={() => setIsMegaMenuOpen(false)}
                              >
                                {group.title}
                              </Link>
                            </h4>
                            <ul className="space-y-4">
                              {group.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="relative z-10">
                                  <Link
                                    className="text-[13px] text-text-secondary hover:text-text-primary hover:translate-x-1 inline-block transition-all duration-300"
                                    to={`/category/${item.slug}`}
                                    onClick={() => setIsMegaMenuOpen(false)}
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}

                        {/* PROMO BOX */}
                        <motion.div
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="relative overflow-hidden group/promo"
                        >
                          <img alt="Model in Atelier" className="w-full h-full object-cover grayscale brightness-50 group-hover/promo:scale-110 group-hover/promo:grayscale-0 group-hover/promo:brightness-100 transition-all duration-[2s] ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxCDaHXAgfnZZMJ5PJyJlJu2htQPWM6diBOxWwEZCVgRqK2NioQJtdBpkA898DJ8jaVUX8zXqiqMulmIS-p9A6Vvw60YVvk7uOoV_7doTOJ1sNlbE0RcmuvhwJ2LrbI9PBFadnFpLV-RUa4tq9StHqLjSSOJHeeWnbhzilO_f0RDPVlLJFH-Gjgj2ltfyvxQ9Enril9a9C-hcpECVdFnYR7c4QcBOmkqdxTf4IDpIVmtgWbA9rPF_OT7g9mJuNlKudYCzeL9_ieJpz" />
                          <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center text-center p-8 backdrop-blur-[2px] group-hover/promo:backdrop-blur-0 transition-all duration-1000">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-4 text-text-primary/60">The Atelier Series</p>
                            <h5 className="text-3xl font-primary tracking-tighter mb-8 text-text-primary scale-90 group-hover/promo:scale-100 transition-transform duration-1000">SS24<br />EDITORIAL</h5>
                            <Link
                              className="px-10 py-4 bg-text-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all hover:px-12"
                              to="/shop"
                              onClick={() => setIsMegaMenuOpen(false)}
                            >
                              Explore
                            </Link>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link className="relative text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-accent no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5 after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-accent after:rounded after:-translate-x-1/2 after:transition-all after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:shadow-[0_0_10px_var(--color-accent)] hover:after:w-4" to="/sale">Sale</Link>
              <Link className="relative text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-accent no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5 after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-accent after:rounded after:-translate-x-1/2 after:transition-all after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:shadow-[0_0_10px_var(--color-accent)] hover:after:w-4" to="/about">About</Link>
              <Link className="relative text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-accent no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5 after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-accent after:rounded after:-translate-x-1/2 after:transition-all after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:shadow-[0_0_10px_var(--color-accent)] hover:after:w-4" to="/contact">Contact</Link>
            </nav>
          )}

          {/* ACTIONS (Right on mobile, Auto on desktop) */}
          <div className="flex-1 lg:flex-none flex items-center justify-end gap-2 md:gap-4 z-50 [&_.material-symbols-outlined]:text-text-secondary [&_.material-symbols-outlined]:transition-all [&_.material-symbols-outlined]:duration-500 [&_.material-symbols-outlined]:ease-[cubic-bezier(0.16,1,0.3,1)]">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-text-primary/5 rounded-full transition-colors group">
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 group-hover:opacity-100 group-hover:text-accent group-hover:-translate-y-[1px]">search</span>
            </button>

            {user ? (
              <Link to="/account/dashboard" className="hidden md:flex w-10 h-10 items-center justify-center hover:bg-text-primary/5 rounded-full transition-colors">
                <div className="account-avatar scale-90">
                  <span className="text-[10px]">{getInitials(user.name)}</span>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="hidden md:flex w-10 h-10 items-center justify-center hover:bg-text-primary/5 rounded-full transition-colors group">
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 group-hover:opacity-100 group-hover:text-accent group-hover:-translate-y-[1px]">person</span>
              </Link>
            )}

            <button
              className="relative w-10 h-10 flex items-center justify-center hover:bg-text-primary/5 rounded-full transition-colors group"
              onClick={() => setCartOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 group-hover:opacity-100 group-hover:text-accent group-hover:-translate-y-[1px]">shopping_cart</span>
              {cart.length > 0 && (
                <span id="cart-count" className="absolute top-2 right-2 bg-accent text-primary text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(197,160,89,0.5)]">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* MOBILE MENU DRAWER (Framer Motion) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-[101] lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed top-0 left-0 w-full max-w-[320px] h-full bg-background z-[105] shadow-[0_0_50px_rgba(0,0,0,0.8)] lg:hidden flex flex-col border-r border-border-subtle"
            >
              <div className="drawer-inner p-8 pt-24 space-y-10 h-full overflow-y-auto custom-scrollbar">

                {/* SEARCH BAR */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="SEARCH COLLECTION"
                    className="w-full bg-text-primary/5 border border-text-primary/10 px-4 py-3 text-[10px] font-black tracking-widest text-text-primary focus:border-accent outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[18px]">search</span>
                </motion.div>

                <nav className="flex flex-col gap-6">
                  {['New Arrivals', 'Collections', 'Sale', 'About', 'Contact'].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <Link
                        className={`text-2xl font-primary uppercase tracking-wider transition-colors hover:text-accent ${item === 'Sale' ? 'text-accent' : 'text-text-primary'}`}
                        to={item === 'Collections' ? '/shop' : `/${item.toLowerCase().replace(' ', '-')}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    </motion.div>
                  ))}

                  {/* MOBILE ACCORDION (Clothing) - Restored by User Request */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 pt-4 border-t border-border-subtle"
                  >
                    <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em] block">Clothing</span>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
                      {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="h-4 w-20 bg-text-primary/5 rounded animate-pulse"></div>
                        ))
                      ) : categories.filter(c => !c.parentCategory).map(root => (
                        <li key={root._id}>
                          <Link
                            className="text-[13px] text-text-primary/50 hover:text-text-primary uppercase tracking-widest font-black"
                            to={`/category/${root.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {root.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </nav>

                {/* USER ACTIONS */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="pt-8 mt-auto border-t border-text-primary/5"
                >
                  {user ? (
                    <Link to="/account/dashboard" className="flex items-center gap-4 group" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="account-avatar">
                        <span>{getInitials(user.name)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest">Logged In As</span>
                        <span className="text-[14px] text-text-primary font-bold group-hover:text-accent transition-colors">{user.name}</span>
                      </div>
                    </Link>
                  ) : (
                    <Link to="/login" className="flex items-center gap-4 group" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="material-symbols-outlined text-[32px]">person</span>
                      <span className="text-[14px] font-black text-text-primary uppercase tracking-[0.2em] group-hover:text-accent transition-colors">Sign In</span>
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
