import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/AdminSidebar";
import ProductPageHeader from "./Pages/Product/ProductPageHeader";
import Header from "./components/AdminHeader";

export default function AdminLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Isolated theme logic for Admin Panel — default is LIGHT mode
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('admin-theme');
        // Only dark if explicitly saved as 'dark'; null/unset = light
        return savedTheme === 'dark';
    });

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('admin-theme', newTheme ? 'dark' : 'light');
    };

    const isProductPage = location.pathname === "/admin/products";

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-100'}`}>
            {/* The 'dark' class above isolates Tailwind's dark: selectors to this container and its children */}
            <div className="dark:bg-slate-950 dark:text-slate-100 text-slate-900 min-h-screen flex flex-col">
                
                {/* Sidebar with mobile state */}
                <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

                {/* Overlay for mobile */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <main className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
                    {/* 🔥 Dynamic Header Switch with Menu Toggle and Theme Props */}
                    {isProductPage ? (
                        <ProductPageHeader 
                            onMenuClick={() => setIsMobileMenuOpen(true)} 
                            isDarkMode={isDarkMode}
                            toggleTheme={toggleTheme}
                        />
                    ) : (
                        <Header 
                            onMenuClick={() => setIsMobileMenuOpen(true)} 
                            isDarkMode={isDarkMode}
                            toggleTheme={toggleTheme}
                        />
                    )}

                    <div className="p-4 md:p-8 flex-1">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}


