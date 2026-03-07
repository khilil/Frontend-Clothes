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
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] pt-24 lg:pt-40">
      {/* MOBILE DRAWER OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[120] transition-opacity duration-500 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* MOBILE DRAWER */}
      <aside className={`fixed top-0 left-0 h-full w-[300px] bg-white z-[130] flex flex-col p-8 transition-transform duration-500 ease-out border-r border-black/5 shadow-2xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12">
          <span className="text-black text-xl font-impact tracking-tighter">FENRIR ERA</span>
          <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 hover:text-black transition-colors" onClick={() => setIsDrawerOpen(false)}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-12 pb-12 border-b border-black/[0.03]">
          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white font-impact text-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-black text-[14px] font-black uppercase tracking-tight">{user?.name || 'User'}</p>
            <p className="text-[#8b7e6d] text-[10px] font-black uppercase tracking-[0.3em]">Architect Member</p>
          </div>
        </div>

        <nav className="space-y-4 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-5 group transition-all duration-300 py-3.5 px-6 rounded-2xl ${isActive ? 'bg-[#d4c4b1]/15 text-[#8b7e6d]' : 'text-black/40 hover:text-black hover:bg-black/5'}`
              }
            >
              <span className={`material-symbols-outlined text-[20px] transition-transform duration-500 group-hover:scale-110 group-hover:text-[#8b7e6d]`}>{link.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-5 py-5 px-6 rounded-2xl text-rose-500/60 hover:text-rose-600 hover:bg-rose-500/5 transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">logout</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Logout Protocol</span>
          </button>
        </div>
      </aside>

      {/* MOBILE NAVIGATION PILLS */}
      <div className="lg:hidden sticky top-20 z-40 bg-white/80 backdrop-blur-2xl border-b border-black/[0.03] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 px-6 py-5 whitespace-nowrap min-w-max">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${isActive
                  ? "bg-black text-white border-black shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                  : "bg-black/5 text-black/40 border-black/5 hover:border-black/20 hover:text-black"
                }`
              }
            >
              {link.shortLabel}
            </NavLink>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1920px] mx-auto px-6 md:px-12 py-10 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          <Sidebar />
          <section className="flex-1 w-full animate-fadeIn">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
