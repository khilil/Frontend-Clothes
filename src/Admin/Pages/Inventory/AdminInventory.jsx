import React, { useState, useEffect } from 'react';
import { getLowStockProducts, updateVariantStock } from '../../../services/inventoryService';
import { getProducts } from '../../../services/productService';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const Inventory = () => {
  // --- State Management ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // This will be the variant for updates

  // Modal Form State
  const [adjustmentType, setAdjustmentType] = useState('Set Fixed'); // Add, Subtract, Set
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // For a comprehensive inventory we fetch all products
      const [allProductsRes, lowStockRes] = await Promise.all([
        getProducts({ isAdmin: true }),
        getLowStockProducts()
      ]);

      // Flatten products to SKUs/Variants
      const flattened = [];
      allProductsRes.products.forEach(p => {
        p.variants.forEach(v => {
          flattened.push({
            productId: p._id,
            variantId: v._id,
            sku: v.sku,
            name: p.title,
            color: v.color?.name || 'N/A',
            hex: v.color?.hexCode || '#ccc',
            size: v.size?.name || 'N/A',
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold,
            status: v.stock <= 0 ? 'Out of Stock' : (v.stock <= v.lowStockThreshold ? 'Low Stock' : 'In Stock')
          });
        });
      });

      setItems(flattened);
      setLowStockItems(lowStockRes.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Handlers ---
  const openUpdateModal = (item) => {
    setSelectedProduct(item);
    setQuantity(item.stock);
    setNote('');
    setAdjustmentType('Set Fixed');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    let newStock = Number(quantity);
    if (adjustmentType === 'Add') newStock = selectedProduct.stock + Number(quantity);
    if (adjustmentType === 'Subtract') newStock = Math.max(0, selectedProduct.stock - Number(quantity));

    setIsSubmitting(true);
    try {
      await updateVariantStock(selectedProduct.productId, selectedProduct.variantId, newStock);
      showNotification('success', 'Stock updated successfully');
      fetchData();
      closeModal();
    } catch (error) {
      showNotification('error', error.message || 'Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSize = sizeFilter === 'All' || item.size === sizeFilter;
    const matchesColor = colorFilter === 'All' || item.color === colorFilter;

    return matchesSearch && matchesStatus && matchesSize && matchesColor;
  });

  const uniqueSizes = [...new Set(items.map(i => i.size))].sort();
  const uniqueColors = [...new Set(items.map(i => i.color))].sort();

  const metrics = {
    totalSkus: items.length,
    lowStock: items.filter(i => i.status === 'Low Stock').length,
    outOfStock: items.filter(i => i.status === 'Out of Stock').length,
    lastUpdate: 'Just now'
  };

  return (
    <main className="p-4 md:p-8 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">

      {/* 📌 MAIN HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Inventory Stock Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and monitor warehouse T-shirt stock by SKU.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-slate-200">
            <span className="material-symbols-outlined text-sm">file_download</span>
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            New SKU
          </button>
        </div>
      </header>

      {/* 📊 METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard icon="inventory_2" label="Total SKUs" value={metrics.totalSkus} trend="+0%" color="primary" />
        <MetricCard icon="warning" label="Low Stock Alerts" value={metrics.lowStock} color="orange" isAlert />
        <MetricCard icon="error_outline" label="Out of Stock" value={metrics.outOfStock} color="red" isAlert />
        <MetricCard icon="update" label="Last Update" value={metrics.lastUpdate} color="blue" />
      </div>

      {/* 📋 INVENTORY TABLE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search by SKU, Color, or Size..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm transition-all dark:text-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium italic">Click column headers to filter</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-slate-500 font-bold">Synchronizing Stock Data...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">SKU ID</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span>Color</span>
                      <select
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-bold text-primary outline-none cursor-pointer uppercase"
                      >
                        <option value="All">All Colors</option>
                        {uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span>Size</span>
                      <select
                        value={sizeFilter}
                        onChange={(e) => setSizeFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-bold text-primary outline-none cursor-pointer uppercase"
                      >
                        <option value="All">All Sizes</option>
                        {uniqueSizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-4">Available Stock</th>
                  <th className="px-6 py-4">Threshold</th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span>Status</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-bold text-primary outline-none cursor-pointer uppercase"
                      >
                        <option value="All">All Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-semibold dark:text-slate-300">{item.sku}</td>
                    <td className="px-6 py-4 text-sm dark:text-slate-400">{item.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm dark:text-slate-400">
                        <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: item.hex }}></span>
                        {item.color}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-slate-400">{item.size}</td>
                    <td className="px-6 py-4 text-sm font-medium dark:text-slate-200">{item.stock} units</td>
                    <td className="px-6 py-4 text-xs dark:text-slate-500">{item.lowStockThreshold}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openUpdateModal(item)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg leading-none">edit_note</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 📌 PAGINATION */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-500">Showing 1-5 of 1,240 SKUs</span>
          <div className="flex gap-1">
            <PaginationButton label="Previous" />
            <PaginationButton label="1" active />
            <PaginationButton label="2" />
            <PaginationButton label="3" />
            <PaginationButton label="Next" />
          </div>
        </div>
      </div>

      {/* 🪟 STOCK UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold dark:text-white">Update Stock</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Adjust inventory for <span className="font-mono font-bold text-primary">{selectedProduct?.sku}</span></p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500">Current Stock</span>
                <span className="text-xl font-bold dark:text-white">{selectedProduct?.stock} Units</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-slate-300">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Add', 'Subtract', 'Set Fixed'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAdjustmentType(type)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${adjustmentType === type
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Quantity</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Reason / Note</label>
                <textarea
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none h-24 transition-all dark:text-white"
                  placeholder="e.g. Restock from vendor"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              <button disabled={isSubmitting} onClick={closeModal} className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors dark:text-slate-300">
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleUpdateStock}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 Notifications */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right-10 duration-300 border backdrop-blur-md ${notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'
          }`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold text-sm tracking-wide">{notification.message}</p>
        </div>
      )}
    </main>
  );
};

// --- Sub-Components (Internal) ---

const MetricCard = ({ icon, label, value, trend, color, isAlert }) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600"
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1 ${isAlert ? `border-l-4 ${label.includes('Low') ? 'border-l-orange-500' : 'border-l-red-500'}` : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
      <h3 className={`text-2xl font-bold mt-1 dark:text-white ${color === 'red' ? 'text-red-600' : color === 'orange' ? 'text-orange-600' : ''}`}>{value}</h3>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'In Stock': "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    'Low Stock': "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    'Out of Stock': "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

const PaginationButton = ({ label, active }) => (
  <button className={`px-3 py-1 rounded-md text-sm transition-colors ${active
    ? 'bg-primary text-white shadow-md shadow-primary/20'
    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
    }`}>
    {label}
  </button>
);

export default Inventory;
