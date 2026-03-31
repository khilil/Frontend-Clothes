import { Bell, Plus, Menu, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductPageHeader({ onMenuClick, isDarkMode, toggleTheme }) {
    const navigate = useNavigate();

    return (
        <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 px-4 md:px-8 py-6 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                     {/* Mobile Menu Button */}
                    <button 
                        onClick={onMenuClick}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 md:hidden hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Product Catalog</h1>
                        <p className="mt-1 text-xs md:text-sm font-medium text-slate-500">Manage and track your inventory across all categories</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Isolated Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all hover:shadow-sm active:scale-90 border border-slate-200/50 dark:border-slate-800/50"
                    >
                        {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
                    </button>

                    <button
                        onClick={() => navigate('/admin/products/new')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-95"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add New Product</span>
                        <span className="sm:hidden">Add New</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
