import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, Command, Sun, Moon, ChevronDown, LogOut, Menu } from 'lucide-react';
import { logoutUser } from "../../features/auth/authSlice";

const Header = ({ title = "Dashboard Overview", subtitle, onMenuClick, isDarkMode, toggleTheme }) => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate("/login");
    };


    return (
        <header className="h-20 sticky top-0 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 z-40 px-4 md:px-8 flex items-center justify-between transition-all">
            
            {/* Left Section: Menu Toggle + Title */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button 
                    onClick={onMenuClick}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 md:hidden hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden sm:block">
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                        {title}
                    </h2>
                    <p className="text-[10px] md:text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {subtitle || `Welcome back, ${user?.name || "User"}!`}
                    </p>
                </div>
            </div>

            {/* Right: Actions Section */}
            <div className="flex items-center gap-3 md:gap-5">

                {/* Search - Hidden on very small screens */}
                <div className="relative group hidden lg:block">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Search size={17} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-10 w-48 xl:w-72 bg-slate-100/80 dark:bg-slate-800/50 border-transparent focus:border-indigo-500/40 focus:bg-white dark:focus:bg-slate-800 border-2 rounded-xl pl-11 pr-12 text-sm transition-all duration-300 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 font-medium"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 shadow-sm">
                        <Command size={11} />
                        <span>K</span>
                    </div>
                </div>

                {/* Action Buttons Group */}
                <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/30 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 md:p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all hover:shadow-sm active:scale-90"
                    >
                        {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
                    </button>


                    {/* Notifications */}
                    <button className="p-2 md:p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all relative hover:shadow-sm active:scale-90">
                        <Bell size={19} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/admin/products/new')}
                        className="p-2 text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl md:hidden"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Primary Action Button - Desktop */}
                <button 
                    onClick={() => navigate('/admin/products/new')}
                    className="hidden md:flex group bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 rounded-xl text-sm font-bold items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 whitespace-nowrap"
                >

                    <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create New</span>
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 ml-1">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                        <img
                            src={
                                user?.avatar ||
                                `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=fff&color=6366f1`
                            }
                            alt="User"
                            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
                        />
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;

