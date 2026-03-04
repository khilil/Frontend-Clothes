import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAllCategories } from "../../../services/categoryService";
import { useCart } from "../../../context/CartContext";
import MiniCart from "../../../pages/Cart/MiniCart";
import { motion, AnimatePresence } from "framer-motion";
import "./Header.css";

export default function Header() {
  const location = useLocation();
  const isAccountPage = location.pathname.startsWith("/account");

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current user from Redux
  const { user } = useSelector((state) => state.auth);

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

    // 1. Get Root Categories (Headings)
    const roots = categories.filter(c => !c.parentCategory);

    // 2. Map children to each root
    return roots.map(root => ({
      ...root,
      children: categories.filter(c =>
        (typeof c.parentCategory === 'string' ? c.parentCategory === root._id : c.parentCategory?._id === root._id)
      )
    })).slice(0, 4); // Show max 4 columns to leave room for Promo
  }, [categories]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isMobileMenuOpen ? 'bg-black' : 'bg-black/90 backdrop-blur-2xl'} border-b border-white/5 h-20`}>
        <div className="max-w-[1920px] mx-auto h-full px-6 md:px-12 flex items-center justify-between relative">

          {/* MOBILE BURGER (Visible on mobile/tablet) */}
          <div className="lg:hidden z-[110]">
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

          {/* LOGO */}
          <div className={`z-[110] transition-all duration-500 ${isMobileMenuOpen ? 'md:opacity-100' : 'opacity-100'}`}>
            <Link className="text-xl md:text-2xl font-impact tracking-tighter text-white hover:text-accent transition-colors" to="/" onClick={() => setIsMobileMenuOpen(false)}>FENRIR</Link>
          </div>

          {/* DESKTOP NAV */}
          {!isAccountPage && (
            <nav className="hidden lg:flex items-center gap-10 h-full">
              <Link className="nav-link text-[10px] font-black uppercase tracking-[0.3em]" to="/new-arrivals">
                New Arrivals
              </Link>

              <div className="mega-menu-trigger group h-full flex items-center">
                <span className="nav-link text-[10px] font-black uppercase tracking-[0.3em] cursor-default">
                  Clothing
                </span>

                {/* MEGA MENU */}
                <div className="mega-menu">
                  <div className="max-w-[1920px] mx-auto grid grid-cols-5 gap-0 min-h-[500px]">

                    {isLoading ? (
                      // Skeleton Loading
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="p-12 border-r border-white/5 animate-pulse">
                          <div className="h-4 w-24 bg-white/10 mb-8 rounded"></div>
                          <div className="space-y-4">
                            <div className="h-3 w-32 bg-white/5 rounded"></div>
                            <div className="h-3 w-28 bg-white/5 rounded"></div>
                            <div className="h-3 w-36 bg-white/5 rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : menuGroups.length > 0 ? (
                      // Dynamic Columns
                      menuGroups.map(group => (
                        <div key={group._id} className="p-12 border-r border-white/5 flex flex-col">
                          <h4 className="text-accent text-[11px] font-black uppercase tracking-[0.4em] mb-8">
                            <Link to={`/category/${group.slug}`} className="hover:text-white transition-colors">
                              {group.name}
                            </Link>
                          </h4>
                          <ul className="space-y-4">
                            {group.children.map(child => (
                              <li key={child._id}>
                                <Link className="text-[14px] text-white-80 hover:text-accent transition-colors" to={`/category/${child.slug}`}>
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                            {group.children.length === 0 && (
                              <li className="text-[13px] text-white/30 italic">No sub-items</li>
                            )}
                          </ul>
                        </div>
                      ))
                    ) : (
                      // Ultimate Fallback if DB is empty
                      <>
                        <div className="p-12 border-r border-white/5 flex flex-col">
                          <h4 className="text-accent text-[11px] font-black uppercase tracking-[0.4em] mb-8">Topwear</h4>
                          <ul className="space-y-4">
                            <li><Link className="text-[14px] text-white-80 hover:text-accent transition-colors" to="/category/t-shirts">T-Shirts</Link></li>
                            <li><Link className="text-[14px] text-white-80 hover:text-accent transition-colors" to="/category/shirts">Shirts</Link></li>
                          </ul>
                        </div>
                        <div className="p-12 border-r border-white/5 flex flex-col" />
                        <div className="p-12 border-r border-white/5 flex flex-col" />
                        <div className="p-12 border-r border-white/5 flex flex-col" />
                      </>
                    )}

                    {/* PROMO BOX (ALWAYS COLUMN 5) */}
                    <div className="relative overflow-hidden group/promo">
                      <img alt="Model in Atelier" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxCDaHXAgfnZZMJ5PJyJlJu2htQPWM6diBOxWwEZCVgRqK2NioQJtdBpkA898DJ8jaVUX8zXqiqMulmIS-p9A6Vvw60YVvk7uOoV_7doTOJ1sNlbE0RcmuvhwJ2LrbI9PBFadnFpLV-RUa4tq9StHqLjSSOJHeeWnbhzilO_f0RDPVlLJFH-Gjgj2ltfyvxQ9Enril9a9C-hcpECVdFnYR7c4QcBOmkqdxTf4IDpIVmtgWbA9rPF_OT7g9mJuNlKudYCzeL9_ieJpz" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white">The Atelier Series</p>
                        <h5 className="text-2xl font-impact tracking-tight mb-6 text-white">SS24 EDITORIAL</h5>
                        <Link className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-colors" to="/shop">Shop Now</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <Link className="nav-link text-[10px] font-black uppercase tracking-[0.3em]" to="/collections">Collections</Link> */}
              <Link className="nav-link text-[10px] font-black uppercase tracking-[0.3em] text-accent" to="/sale">Sale</Link>
            </nav>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-4 md:gap-6 z-50">
            <button className="flex items-center">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </button>

            {user ? (
              <Link to="/account/dashboard" className="hidden md:block">
                <div className="account-avatar">
                  <span>{getInitials(user.name)}</span>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="hidden md:block flex items-center">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </Link>
            )}

            <button
              className="relative flex items-center"
              onClick={() => setCartOpen(true)}
            >
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              <span className="absolute -top-1 -right-1 bg-white text-black text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-full max-w-[320px] h-full bg-[#0a0a0a] z-[105] shadow-2xl lg:hidden flex flex-col border-r border-white/5"
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
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-[10px] font-black tracking-widest text-white focus:border-accent outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[18px]">search</span>
                </motion.div>

                {/* NAV LINKS */}
                <nav className="flex flex-col gap-6">
                  {['New Arrivals', 'Collections', 'Sale'].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <Link
                        className={`text-2xl font-impact uppercase tracking-wider transition-colors hover:text-accent ${item === 'Sale' ? 'text-accent' : 'text-white'}`}
                        to={`/${item.toLowerCase().replace(' ', '-')}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    </motion.div>
                  ))}

                  {/* MOBILE ACCORDION (Clothing) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 pt-4 border-t border-white/5"
                  >
                    <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em] block">Clothing</span>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
                      {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="h-4 w-20 bg-white/5 rounded animate-pulse"></div>
                        ))
                      ) : categories.filter(c => !c.parentCategory).map(root => (
                        <li key={root._id}>
                          <Link
                            className="text-[13px] text-white/50 hover:text-white uppercase tracking-widest font-black"
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
                  className="pt-8 mt-auto border-t border-white/5"
                >
                  {user ? (
                    <Link to="/account/dashboard" className="flex items-center gap-4 group" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="account-avatar">
                        <span>{getInitials(user.name)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Logged In As</span>
                        <span className="text-[14px] text-white font-bold group-hover:text-accent transition-colors">{user.name}</span>
                      </div>
                    </Link>
                  ) : (
                    <Link to="/login" className="flex items-center gap-4 group" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="material-symbols-outlined text-[32px]">person</span>
                      <span className="text-[14px] font-black text-white uppercase tracking-[0.2em] group-hover:text-accent transition-colors">Sign In</span>
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
