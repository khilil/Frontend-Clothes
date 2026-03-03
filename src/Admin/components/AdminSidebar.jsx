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
    Printer
} from 'lucide-react';
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";

const Sidebar = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate("/login");
    };

    // Navigation items config - jethi future ma add/remove karvu easy rahe
    const menuItems = [
        { name: 'Overview', path: '/admin', icon: LayoutGrid },
        { name: 'Product ', path: '/admin/products', icon: ShoppingBasket },
        { name: 'Inventory', path: '/admin/inventory', icon: Package },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Attributes', path: '/admin/attributes', icon: Palette },
        { name: 'Customization', path: '/admin/customization', icon: Settings },
        { name: 'Print Queue', path: '/admin/production', icon: Printer },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    ];

    const supportItems = [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
        { name: 'Help Center', path: '/admin/help', icon: HelpCircle },
    ];

    return (
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] fixed h-full z-50 flex flex-col">
            {/* Brand Logo Section */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <LayoutGrid size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white font-display">
                        T-Dash
                    </span>
                </div>

                {/* Main Navigation */}
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin'} // Exact match for dashboard
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold'
                                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900'}
              `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={20}
                                        className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'}
                                    />
                                    <span className="text-[14px]">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* System / Support Section */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="px-3 text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-[0.1em]">
                        System
                    </p>
                    <div className="space-y-1">
                        {supportItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold'
                                        : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900'}
                `}
                            >
                                <item.icon size={20} className="text-slate-400 group-hover:text-slate-600" />
                                <span className="text-[14px]">{item.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Profile Card - Bottom Section */}
            <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3 p-2 rounded-xl transition-colors">
                    <div className="relative">
                        <img
                            src={
                                user?.avatar ||
                                `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=6366f1&color=fff`
                            }
                            alt="User"
                            className="w-9 h-9 rounded-full border border-white dark:border-slate-700 object-cover shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none mb-1">
                            {user?.name || "User"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate"> {user?.role || "Store Admin"}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;