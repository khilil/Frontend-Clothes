import { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../Sidebar";
import { logoutUser } from "../../../features/auth/authSlice";
import "./AccountLayout.css";

const AccountLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
    setIsDrawerOpen(false);
  };

  const navLinks = [
    { to: "/account/dashboard", label: "Dashboard", shortLabel: "Dashboard", icon: "grid_view" },
    { to: "/account/orders", label: "My Orders", shortLabel: "Orders", icon: "shopping_cart" },
    { to: "/account/wishlist", label: "Wishlist", shortLabel: "Wishlist", icon: "favorite" },
    { to: "/account/addresses", label: "Address Book", shortLabel: "Address", icon: "location_on" },
    { to: "/account/profile", label: "Profile Settings", shortLabel: "Profile", icon: "settings" },
  ];

  return (
    <div className="min-h-screen bg-white text-black pt-20 lg:pt-32">
      {/* MOBILE DRAWER OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/60 z-[120] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* MOBILE DRAWER */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-charcoal z-[130] shadow-2xl flex flex-col p-8 transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <span className="text-white text-2xl font-impact tracking-tighter">MODERN MEN</span>
          <button className="text-white/50 hover:text-white" onClick={() => setIsDrawerOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/10 text-white">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-black font-impact text-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-white text-sm font-bold tracking-tight">{user?.name || 'User'}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Premium Member</p>
          </div>
        </div>

        <nav className="space-y-4 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 group transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`
              }
            >
              <span className="material-symbols-outlined text-accent group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-red-400 hover:text-red-300 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HORIZONTAL PILLS - Offset by Header Height (h-20 / 80px) */}
      <div className="lg:hidden sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 overflow-x-auto no-scrollbar text-black">
        <div className="flex items-center gap-3 px-4 py-4 whitespace-nowrap min-w-max">
          {/* <button
            className="p-2 mr-2 text-black"
            onClick={() => setIsDrawerOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button> */}
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isActive
                  ? "bg-black text-white border-black"
                  : "bg-gray-50 text-muted border-gray-100 hover:bg-gray-100"
                }`
              }
            >
              {link.shortLabel}
            </NavLink>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 lg:py-0">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <Sidebar />
          <section className="flex-1">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
