import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";

const Sidebar = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate("/");
        if (onClose) onClose();
    };

    const navLinks = [
        { to: "/account/dashboard", label: "Dashboard", icon: "grid_view" },
        { to: "/account/orders", label: "My Orders", icon: "shopping_cart" },
        { to: "/account/wishlist", label: "Wishlist", icon: "favorite" },
        { to: "/account/addresses", label: "Address Book", icon: "location_on" },
        { to: "/account/profile", label: "Profile Settings", icon: "settings" },
    ];

    return (
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-40 h-fit">
            <div className="border-r border-black/[0.03] pr-5 space-y-2">
                <div className="px-6 mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Account Menu</h3>
                </div>

                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `group flex items-center justify-between px-8 py-4 rounded-2xl transition-all duration-500 relative overflow-hidden border ${isActive
                                ? "bg-[#d4c4b1]/12 border-[#d4c4b1]/10 text-[#8b7e6d] shadow-[0_10px_30px_rgba(0,0,0,0.05)] before:content-[''] before:absolute before:left-0 before:top-1/4 before:h-2/4 before:w-[2px] before:bg-[#8b7e6d] before:shadow-[0_0_10px_rgba(139,126,109,0.2)]"
                                : "border-transparent text-black/40 hover:text-black hover:bg-black/5"
                            }`
                        }
                    >
                        <div className="flex items-center gap-5">
                            <span className="material-symbols-outlined text-[22px] transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-px group-hover:text-[#8b7e6d] group-hover:drop-shadow-[0_0_4px_rgba(139,126,109,0.2)]">
                                {link.icon}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{link.label}</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">chevron_right</span>
                    </NavLink>
                ))}

                <div className="pt-10 mt-10 border-t border-black/[0.03]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-5 px-8 py-5 rounded-2xl text-rose-500/60 hover:text-rose-600 hover:bg-rose-500/5 transition-all group"
                    >
                        <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">logout</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;