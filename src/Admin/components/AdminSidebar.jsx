import {
    LayoutGrid,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    HelpCircle,
    LogOut,
    ShoppingBasket,
    Layers,
    Palette,
    Ticket,
    Image as ImageIcon,
    X,
    UsersRound,
    Crown,
    Store
} from 'lucide-react';
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";

const Sidebar = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector((state) => state.auth);

    const isAdmin = role === 'admin';

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate("/login");
    };

    // All navigation items with role restriction
    // roles: undefined = all staff, ['admin'] = admin only
    const menuItems = [
        // ─── Admin Only ───
        { name: 'Overview',       path: '/admin',                icon: LayoutGrid,   end: true,  roles: ['admin'] },
        { name: 'Analytics',      path: '/admin/analytics',      icon: BarChart3,                roles: ['admin'] },
        // ─── All Staff ───
        { name: 'Products',       path: '/admin/products',       icon: ShoppingBasket              },
        { name: 'Inventory',      path: '/admin/inventory',      icon: Package                     },
        { name: 'Orders',         path: '/admin/orders',         icon: ShoppingCart                },
        { name: 'Custom Orders',  path: '/admin/custom-orders',  icon: Palette,                    },
        { name: 'Store Pickups',  path: '/admin/pickups',        icon: Store                      },
        { name: 'Attributes',     path: '/admin/attributes',     icon: Palette                     },
        { name: 'Customization',  path: '/admin/customization',  icon: Settings                    },
        // ─── Admin Only ───
        { name: 'Categories',     path: '/admin/categories',     icon: Layers,                 roles: ['admin'] },
        { name: 'Customers',      path: '/admin/customers',      icon: Users,                  roles: ['admin'] },
        { name: 'Offers',         path: '/admin/offers',         icon: Ticket,                 roles: ['admin'] },
        { name: 'Hero Slider',    path: '/admin/hero-slider',    icon: ImageIcon,              roles: ['admin'] },
        { name: 'Team',           path: '/admin/team',           icon: UsersRound,             roles: ['admin'] },
    ];

    // Filter based on current role
    const visibleItems = menuItems.filter(item =>
        !item.roles || item.roles.includes(role)
    );

    // Group into two sections
    const mainItems = visibleItems.filter(i => !['Settings', 'Help Center'].includes(i.name));

    const handleLinkClick = () => {
        if (window.innerWidth < 768) onClose();
    };

    return (
        <aside className={`
            w-64 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0f172a]/90 
            backdrop-blur-xl fixed h-full z-50 flex flex-col transition-transform duration-500 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Header */}
            <div className="p-6 pb-4 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 px-2 group cursor-pointer" onClick={() => navigate('/admin')}>
                        <img loading="lazy" 
                            src="/assets/main-logo.png" 
                            alt="FENRIR" 
                            className="h-20 w-auto object-contain transition-all duration-300 group-hover:scale-110" 
                        />
                    </div>
                    {/* Mobile Close */}
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 md:hidden bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Role badge */}
                <div className={`mt-3 mx-2 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit ${
                    isAdmin
                        ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                        : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                }`}>
                    {isAdmin ? <Crown size={10} /> : <UsersRound size={10} />}
                    {isAdmin ? 'Admin' : 'Employee'}
                </div>
            </div>

            {/* Scrollable Nav */}
            <div
                className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-1 pb-10 min-h-0 h-0"
                data-lenis-prevent="true"
            >
                <p className="px-4 text-[10px] font-black uppercase text-slate-400 mb-3 mt-2 tracking-[0.2em] opacity-70">
                    Management
                </p>
                <nav className="space-y-1">
                    {mainItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={!!item.end}
                            onClick={handleLinkClick}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={20}
                                        className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} transition-colors duration-300`}
                                    />
                                    <span className="text-[14px] flex-1">{item.name}</span>
                                    {isActive && (
                                        <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                                    )}
                                    {!isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-transparent hover:border-indigo-500/30 transition-all group">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                            <img loading="lazy" 
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=fff&color=6366f1`}
                                alt="User"
                                className="w-full h-full rounded-[10px] object-cover border-2 border-white dark:border-slate-800"
                            />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-full shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate leading-none mb-1 translate-y-0.5">
                            {user?.name || "User"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate opacity-60">
                            {role || "Staff"}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                    >
                        <LogOut size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
