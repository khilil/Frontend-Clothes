import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Edit3,
    Eye,
    Trash2,
    Layers,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Package,
    ArrowUpDown,
    Loader2
} from 'lucide-react';
import { getProducts, deleteProduct } from '../../../services/productService';
import { getAllCategories } from '../../../services/categoryService';
import { productAttributes } from '../../../config/productAttributes';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AdminProducts() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [limit, setLimit] = useState(12);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [notification, setNotification] = useState(null);

    // Filter and Sort State
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [filters, setFilters] = useState({
        category: 'All',
        stockStatus: 'All',
        gender: 'All',
        productType: 'All',
        priceMin: '',
        priceMax: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const params = {
                    isAdmin: true,
                    page: currentPage,
                    limit: limit,
                    search: searchTerm,
                    category: filters.category !== 'All' ? filters.category : undefined,
                    gender: filters.gender !== 'All' ? filters.gender : undefined,
                    productType: filters.productType !== 'All' ? filters.productType : undefined,
                    minPrice: filters.priceMin || undefined,
                    maxPrice: filters.priceMax || undefined
                };

                const [productData, categoryData] = await Promise.all([
                    getProducts(params, controller.signal),
                    getAllCategories()
                ]);

                // Parse Products and Pagination
                if (productData) {
                    setProducts(productData.products || []);
                    setTotalPages(productData.totalPages || 1);
                    setTotalProducts(productData.totalProducts || 0);
                }

                // Parse Categories
                let catList = [];
                if (Array.isArray(categoryData)) catList = categoryData;
                else if (categoryData?.data) catList = categoryData.data;
                setCategories(catList);

                setError(null);
            } catch (err) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error("Fetch Error:", err);
                    setError("Failed to load catalog data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [currentPage, searchTerm, filters, limit]);

    // Reset page when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Note: Since we are using server-side pagination, filteredProducts is 
    // now just the products from the current page.
    const filteredProducts = products;

    const sortedProducts = useMemo(() => {
        const items = [...filteredProducts];
        if (sortConfig.key) {
            items.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested or special fields
                if (sortConfig.key === 'stock') {
                    aValue = a.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                    bValue = b.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                }

                if (sortConfig.key === 'category') {
                    aValue = a.category || (Array.isArray(a.categories) ? a.categories[0] : '');
                    bValue = b.category || (Array.isArray(b.categories) ? b.categories[0] : '');
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [filteredProducts, sortConfig]);

    const handleExport = () => {
        const headers = ["ID", "Title", "Category", "Price", "Gender", "Total Stock"];
        const rows = sortedProducts.map(p => [
            p._id || p.id,
            p.title || p.name,
            p.category || (Array.isArray(p.categories) ? p.categories[0] : 'N/A'),
            p.price,
            p.gender,
            p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleSelectProduct = (id) => {
        const next = new Set(selectedProducts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedProducts(next);
    };

    const toggleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id || p._id)));
        }
    };

    const handleDeleteClick = (product) => {
        setDeleteModal({
            isOpen: true,
            productId: product.id || product._id,
            productName: product.name || product.title || "Untitled Product"
        });
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProduct(deleteModal.productId);
            setProducts(prev => prev.filter(p => (p.id || p._id) !== deleteModal.productId));
            showNotification('success', `${deleteModal.productName} deleted successfully`);
            setDeleteModal({ isOpen: false, productId: null, productName: '' });
        } catch (err) {
            console.error("Delete Error:", err);
            showNotification('error', err.response?.data?.message || "Failed to delete product");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-slate-950 font-sans text-slate-200">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {/* Filter Bar Section */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm ring-1 ring-white/5">
                        <div className="flex flex-1 items-center gap-4 min-w-[300px]">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600"
                                    placeholder="Search by name, ID, or SKU..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <select
                                    className="appearance-none rounded-xl border border-slate-800 bg-slate-950 pl-4 pr-10 py-2.5 text-sm text-slate-300 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="All">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-500 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${isFilterExpanded ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <Filter size={16} />
                                {isFilterExpanded ? 'Hide Filters' : 'Advanced Filters'}
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-bold text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                            >
                                <Download size={16} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filter Panel */}
                    <AnimatePresence>
                        {isFilterExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm ring-1 ring-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gender</label>
                                        <select
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
                                            value={filters.gender}
                                            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                                        >
                                            <option value="All">All Genders</option>
                                            <option value="men">Men</option>
                                            <option value="women">Women</option>
                                            <option value="unisex">Unisex</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stock Status</label>
                                        <select
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
                                            value={filters.stockStatus}
                                            onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                                        >
                                            <option value="All">All Availability</option>
                                            <option value="In Stock">In Stock</option>
                                            <option value="Low Stock">Low Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Min Price ($)</label>
                                        <input
                                            type="number"
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
                                            placeholder="0"
                                            value={filters.priceMin}
                                            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Price ($)</label>
                                        <input
                                            type="number"
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
                                            placeholder="1000"
                                            value={filters.priceMax}
                                            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Type</label>
                                        <select
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
                                            value={filters.productType}
                                            onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
                                        >
                                            <option value="All">All Types</option>
                                            {Object.keys(productAttributes).map(type => (
                                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="lg:col-span-5 flex justify-end gap-3 mt-2">
                                        <button
                                            onClick={() => setFilters({ category: 'All', stockStatus: 'All', gender: 'All', productType: 'All', priceMin: '', priceMax: '' })}
                                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                                        >
                                            <X size={14} />
                                            Reset All Filters
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Products Table Section */}
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl ring-1 ring-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-800 bg-slate-800/50">
                                <tr>
                                    <th className="w-12 px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={() => handleSort('title')}>
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                            Product Details
                                            <ArrowUpDown size={12} className={sortConfig.key === 'title' ? 'text-indigo-400' : ''} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={() => handleSort('category')}>
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                            Category
                                            <ArrowUpDown size={12} className={sortConfig.key === 'category' ? 'text-indigo-400' : ''} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={() => handleSort('price')}>
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                            Base Price
                                            <ArrowUpDown size={12} className={sortConfig.key === 'price' ? 'text-indigo-400' : ''} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={() => handleSort('stock')}>
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                            Variants
                                            <ArrowUpDown size={12} className={sortConfig.key === 'stock' ? 'text-indigo-400' : ''} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-500">Actions</div>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-800/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 text-indigo-500">
                                                    <Loader2 size={32} className="animate-spin" />
                                                </div>
                                                <p className="mt-4 text-sm font-bold text-slate-400">Loading products...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                                                    <AlertCircle size={32} />
                                                </div>
                                                <h3 className="mt-4 text-lg font-bold text-white">Something went wrong</h3>
                                                <p className="mt-1 text-sm text-slate-500">{error}</p>
                                                <button
                                                    className="mt-6 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                                    onClick={() => window.location.reload()}
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedProducts.length > 0 ? (
                                    sortedProducts.map((product) => (
                                        <ProductRow
                                            key={product.id || product._id}
                                            product={product}
                                            isSelected={selectedProducts.has(product.id || product._id)}
                                            onToggle={() => toggleSelectProduct(product.id || product._id)}
                                            onView={() => navigate(`/admin/products/view/${product.slug}`)}
                                            onEdit={() => navigate(`/admin/products/edit/${product.slug}`)}
                                            onDelete={() => handleDeleteClick(product)}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-600">
                                                    <Package size={32} />
                                                </div>
                                                <h3 className="mt-4 text-lg font-bold text-white">No products found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                                                <button
                                                    className="mt-6 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                                    onClick={() => { setSearchTerm(''); setFilters({ category: 'All', stockStatus: 'All', gender: 'All', productType: 'All', priceMin: '', priceMax: '' }); }}
                                                >
                                                    Clear all filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Section */}
                    <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/50 px-6 py-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Showing <span className="text-slate-200">{(currentPage - 1) * limit + 1}</span> to{" "}
                            <span className="text-slate-200">{Math.min(currentPage * limit, totalProducts)}</span> of{" "}
                            <span className="text-slate-200">{totalProducts}</span> results
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-500 transition-all hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-1.5 px-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page</span>
                                <span className="flex h-9 min-w-[36px] items-center justify-center rounded-xl bg-indigo-600 px-2 text-xs font-black text-white shadow-lg shadow-indigo-600/20">
                                    {currentPage}
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">of {totalPages}</span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition-all hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals and Toasts */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Delete Product?</h2>
                            <p className="text-slate-400 mb-8 font-medium">
                                Are you sure you want to delete <span className="text-white font-bold">"{deleteModal.productName}"</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                    className="flex-1 rounded-xl border border-slate-800 py-3 text-sm font-bold text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Delete Product'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-[110] flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 pr-6 shadow-2xl backdrop-blur-xl"
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{notification.type === 'success' ? 'Success' : 'Error'}</span>
                            <span className="text-xs text-slate-400">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProductRow({ product, isSelected, onToggle, onView, onEdit, onDelete }) {
    const { title, name, _id, id, category, price, variants, images } = product;

    const displayName = title || name || "Untitled Product";
    const displayId = _id || id || "N/A";
    const displayImage = images?.[0]?.url || images?.[0] || "https://premium-clothing.com/placeholder.jpg";
    const variantCount = Array.isArray(variants) ? variants.length : (variants || 0);
    const totalStock = Array.isArray(variants) ? variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0;

    return (
        <tr className={`group transition-colors hover:bg-slate-800/30 ${isSelected ? 'bg-indigo-600/5' : ''}`}>
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    checked={isSelected}
                    onChange={onToggle}
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1">
                        <img className="h-full w-full rounded-lg object-cover" src={displayImage} alt={displayName} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{displayName}</p>
                        <p className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-tighter">REF: {displayId}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {category || (Array.isArray(product.categories) ? product.categories[0] : 'Uncategorized')}
                </span>
            </td>
            <td className="px-6 py-4 font-mono text-xs font-black text-slate-200">
                ${(price || 0).toFixed(2)}
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">{variantCount} Variants</span>
                    </div>
                    <span className={`text-[10px] font-bold ${totalStock <= 0 ? 'text-rose-500' : totalStock <= 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {totalStock} in stock
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <button onClick={onView} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-indigo-400"><Eye size={16} /></button>
                    <button onClick={onEdit} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-indigo-400"><Edit3 size={16} /></button>
                    <button onClick={onDelete} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
}
