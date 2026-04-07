import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAllCategories } from "../../../services/categoryService";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { fetchProducts } from "../../../api/products.api";
import MiniCart from "../../../pages/Cart/MiniCart";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, Heart, ShoppingBag, X, ArrowRight, TrendingUp } from "lucide-react";

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
  const { wishlist } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Scroll Lock for search/menu
  useEffect(() => {
    if (isMobileMenuOpen || isMobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  // Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const data = await fetchProducts({ search: searchQuery, limit: 6 });
          setLiveResults(data.products || []);
        } catch (err) {
          console.error("Live search error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setLiveResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsSearchExpanded(false);
  }, [location.pathname]);

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

              <Link className="relative text-text-secondary no-underline transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5 text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-0.5 after:bg-accent after:rounded after:-translate-x-1/2 after:transition-all after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:shadow-[0_0_10px_var(--color-accent)] hover:after:w-4" to="/custom-studio">
                Customizable
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
                          <img alt="Fenrir Era Atelier Collection" className="w-full h-full object-cover grayscale brightness-50 group-hover/promo:scale-110 group-hover/promo:grayscale-0 group-hover/promo:brightness-100 transition-all duration-[2s] ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxCDaHXAgfnZZMJ5PJyJlJu2htQPWM6diBOxWwEZCVgRqK2NioQJtdBpkA898DJ8jaVUX8zXqiqMulmIS-p9A6Vvw60YVvk7uOoV_7doTOJ1sNlbE0RcmuvhwJ2LrbI9PBFadnFpLV-RUa4tq9StHqLjSSOJHeeWnbhzilO_f0RDPVlLJFH-Gjgj2ltfyvxQ9Enril9a9C-hcpECVdFnYR7c4QcBOmkqdxTf4IDpIVmtgWbA9rPF_OT7g9mJuNlKudYCzeL9_ieJpz" />
                          <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center text-center p-8 backdrop-blur-[2px] group-hover/promo:backdrop-blur-0 transition-all duration-1000">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-4 text-text-primary/60">The Atelier Series</p>
                            <h5 className="text-3xl font-primary tracking-tighter mb-8 text-text-primary scale-90 group-hover/promo:scale-100 transition-transform duration-1000">ESSENCE OF ETERNITY<br />SS24</h5>
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
          {/* ACTIONS (Right on mobile, Auto on desktop) */}
          <div className="flex-1 lg:flex-none flex items-center justify-end gap-2 md:gap-4 z-[120] relative">
            {/* INLINE SEARCH */}
            <div className="relative flex items-center">
              <motion.div
                initial={false}
                animate={{
                  width: isSearchExpanded
                    ? (window.innerWidth < 768 ? 'calc(100vw - 120px)' : '320px')
                    : '40px',
                  backgroundColor: isSearchExpanded ? 'var(--color-secondary)' : 'rgba(26, 26, 26, 0.05)'
                }}
                className="flex items-center rounded-full border border-border-subtle overflow-hidden group/search pr-1"
              >
                <button
                  className="w-10 h-10 flex items-center justify-center shrink-0 transition-colors hover:text-accent"
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsMobileSearchOpen(true);
                    } else if (!isSearchExpanded) {
                      setIsSearchExpanded(true);
                    }
                  }}
                >
                  <Search className={`h-4 w-4 ${isSearchExpanded ? 'text-accent' : 'text-text-secondary'}`} />
                </button>
                <input
                  type="text"
                  placeholder="SEARCH..."
                  value={searchQuery}
                  autoFocus={isSearchExpanded}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsSearchExpanded(false);
                      setLiveResults([]);
                      navigate(`/shop/all?q=${searchQuery}`);
                    }
                  }}
                  className={`bg-transparent border-none outline-none text-[10px] font-black tracking-widest text-text-primary w-full pr-2 transition-opacity duration-300 placeholder:text-text-secondary/50 ${isSearchExpanded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* CLOSE BUTTON */}
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery('');
                        setLiveResults([]);
                      }}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-secondary/40 hover:text-accent transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* LIVE RESULTS DROPDOWN */}
              <AnimatePresence>
                {isSearchExpanded && (searchQuery.length > 0 || isSearching) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 left-0 right-0 sm:left-auto sm:w-[350px] bg-background backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-[130]"
                  >
                    {/* KEYWORD SUGGESTION */}
                    {searchQuery.length > 0 && (
                      <div className="p-4 border-b border-border-subtle">
                        <div className="text-[8px] font-black tracking-[0.2em] text-text-secondary/40 uppercase mb-2">Suggestions</div>
                        <button
                          onClick={() => {
                            setIsSearchExpanded(false);
                            setLiveResults([]);
                            navigate(`/shop/all?q=${searchQuery}`);
                          }}
                          className="w-full text-left flex items-center gap-3 p-2 hover:bg-text-primary/5 rounded-lg transition-colors group"
                        >
                          <Search className="h-3 w-3 text-accent" />
                          <span className="text-[11px] font-bold text-text-primary uppercase tracking-tight">
                            Search for "<span className="text-accent">{searchQuery}</span>"
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="p-4 py-2 border-b border-border-subtle flex justify-between items-center bg-secondary/30">
                      <span className="text-[9px] font-black tracking-[0.2em] text-text-secondary/40 uppercase">Product Results</span>
                      {isSearching && (
                        <div className="flex gap-1">
                          <span className="w-1 h-1 bg-accent rounded-full animate-bounce"></span>
                          <span className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {liveResults.length > 0 ? (
                        liveResults.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => {
                              setIsSearchExpanded(false);
                              setLiveResults([]);
                              navigate(`/product/${product.slug}`);
                            }}
                            className="w-full flex items-center gap-4 p-3 hover:bg-text-primary/5 transition-colors group text-left"
                          >
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary border border-border-subtle shrink-0">
                              <img
                                src={product.listImage || (product.images?.[0]?.url) || "/placeholder.jpg"}
                                alt={product.title}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-text-primary truncate uppercase tracking-tight">{product.title}</div>
                              <div className="text-[9px] text-accent font-black tracking-widest mt-0.5">₹{product.price}</div>
                            </div>
                            <ArrowRight className="h-3 w-3 text-text-secondary/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                          </button>
                        ))
                      ) : !isSearching && searchQuery.length > 1 ? (
                        <div className="p-8 text-center">
                          <div className="text-[10px] font-black text-text-secondary/30 uppercase tracking-widest">No products found</div>
                        </div>
                      ) : null}
                    </div>

                    {/* POPULAR CATEGORIES */}
                    <div className="p-4 bg-secondary/50 border-t border-border-subtle">
                      <div className="text-[8px] font-black tracking-[0.2em] text-text-secondary/40 uppercase mb-3">Quick Collections</div>
                      <div className="flex flex-wrap gap-2">
                        {['New arrivals', 'Essentials', 'Accessories'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setIsSearchExpanded(false);
                              setLiveResults([]);
                              navigate(`/shop/all?category=${cat.toLowerCase()}`);
                            }}
                            className="px-3 py-1.5 bg-background border border-border-subtle rounded-full text-[8px] font-bold text-text-secondary hover:bg-accent hover:text-primary hover:border-accent transition-all"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
            <Link
              to="/account/wishlist"
              className="relative w-10 h-10 flex items-center justify-center hover:bg-text-primary/5 rounded-full transition-colors group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 group-hover:opacity-100 group-hover:text-accent group-hover:-translate-y-[1px]">favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute top-2 right-2 bg-accent text-primary text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(197,160,89,0.5)]">
                  {wishlist.length}
                </span>
              )}
            </Link>
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

      {/* MOBILE SEARCH OVERLAY (Full Screen) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background z-[2000] flex flex-col"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-border-subtle flex items-center gap-4 bg-background">
              <div className="flex-1 flex items-center bg-secondary rounded-full border border-border-subtle px-4 h-12">
                <Search className="h-4 w-4 text-text-secondary mr-3" />
                <input
                  type="text"
                  placeholder="SEARCH FOR..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-black tracking-widest text-text-primary placeholder:text-text-secondary/30"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-4 w-4 text-text-secondary/30" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-text-primary p-2"
              >
                Close
              </button>
            </div>

            {/* Search Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
              {/* Keyword Suggestion */}
              {searchQuery.length > 0 && (
                <div className="p-6 border-b border-border-subtle">
                  <div className="text-[10px] font-black tracking-[0.2em] text-text-secondary/40 uppercase mb-4">Suggestions</div>
                  <button
                    onClick={() => {
                      setIsMobileSearchOpen(false);
                      navigate(`/shop/all?q=${searchQuery}`);
                    }}
                    className="w-full text-left flex items-center gap-4 p-4 bg-secondary rounded-2xl border border-border-subtle group transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <Search size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-text-primary uppercase tracking-tight">Search for</div>
                      <div className="text-sm font-bold text-accent">"{searchQuery}"</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Product Results */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-[10px] font-black tracking-[0.2em] text-text-secondary/40 uppercase">
                    {searchQuery.length > 1 ? "Product Results" : "Trending Now"}
                  </div>
                  {isSearching && (
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {liveResults.length > 0 ? (
                    liveResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => {
                          setIsMobileSearchOpen(false);
                          navigate(`/product/${product.slug}`);
                        }}
                        className="w-full flex items-center gap-5 p-3 hover:bg-secondary rounded-2xl transition-all text-left border border-transparent hover:border-border-subtle"
                      >
                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-secondary border border-border-subtle shrink-0">
                          <img
                            src={product.listImage || (product.images?.[0]?.url) || "/placeholder.jpg"}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-text-primary uppercase tracking-tight line-clamp-1">{product.title}</div>
                          <div className="text-[11px] text-accent font-black tracking-widest mt-1">₹{product.price}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] px-2 py-0.5 bg-secondary text-text-secondary rounded uppercase font-bold">{product.brand}</span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-text-secondary/30" />
                      </button>
                    ))
                  ) : searchQuery.length > 1 && !isSearching ? (
                    <div className="py-20 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 text-text-secondary/20">
                        <Search size={32} />
                      </div>
                      <div className="text-xs font-black text-text-primary/40 uppercase tracking-[0.2em]">No results found</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {['Hoodie', 'Tshirt', 'Cargo', 'Jacket'].map(item => (
                        <button
                          key={item}
                          onClick={() => setSearchQuery(item)}
                          className="flex items-center gap-3 p-4 bg-secondary rounded-2xl border border-border-subtle text-left"
                        >
                          <TrendingUp size={14} className="text-accent" />
                          <span className="text-[10px] font-bold text-text-primary uppercase">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick links */}
              <div className="p-6 pt-0">
                <div className="text-[10px] font-black tracking-[0.2em] text-text-secondary/40 uppercase mb-4">Quick Links</div>
                <div className="flex flex-wrap gap-2">
                  {['Shop All', 'New Arrivals', 'Best Sellers', 'Sale'].map(link => (
                    <button
                      key={link}
                      onClick={() => {
                        setIsMobileSearchOpen(false);
                        navigate('/shop/all');
                      }}
                      className="px-5 py-2.5 bg-secondary border border-border-subtle rounded-full text-[10px] font-black text-text-primary uppercase tracking-widest"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

                <nav className="flex flex-col gap-6">
                  {['New Arrivals', 'FENRIR Era', 'Collections', 'Sale', 'About', 'Contact'].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <Link
                        className={`text-2xl font-primary uppercase tracking-wider transition-colors hover:text-accent ${item === 'Sale' ? 'text-accent' : 'text-text-primary'}`}
                        to={item === 'Collections' ? '/shop' : item === 'FENRIR Era' ? '/custom-studio' : `/${item.toLowerCase().replace(' ', '-')}`}
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
