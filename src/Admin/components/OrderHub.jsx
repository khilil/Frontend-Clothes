import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Download, Eye, ChevronRight, Clock, CheckSquare, Square, Trash2 } from 'lucide-react';
import { StatusBadge, PriorityBadge, CustomDesignBadge, SLABadge } from './OrderBadges';
import { getAllOrders, bulkUpdateOrders } from '../../services/orderService';
import { generateInvoiceHTML, generateBulkInvoiceHTML } from '../utils/invoiceUtils';
import { exportOrdersToCSV } from '../utils/exportUtils';

export default function OrderHub({ onSelectOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    priority: '',
    isCustom: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const tabs = ['All', 'Custom Design 🎨', 'Pending', 'Shipped', 'Delivered'];

  useEffect(() => {
    fetchOrders();
  }, [activeTab, filters, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        paymentMethod: filters.paymentMethod,
        priority: filters.priority,
        isCustom: activeTab === 'Custom Design 🎨' ? true : filters.isCustom,
      };
      
      if (activeTab === 'Pending') params.status = 'placed';
      if (activeTab === 'Shipped') params.status = 'shipped';
      if (activeTab === 'Delivered') params.status = 'delivered';

      const res = await getAllOrders(params);
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o._id));
    }
  };

  const handleBulkUpdate = async (status) => {
    if (!status) return;
    try {
      setIsBulkUpdating(true);
      await bulkUpdateOrders(selectedIds, status);
      setSelectedIds([]);
      fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleDownloadInvoice = (order) => {
    const html = generateInvoiceHTML(order);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  const handleBulkInvoice = () => {
    const selectedOrders = orders.filter(o => selectedIds.includes(o._id));
    const html = generateBulkInvoiceHTML(selectedOrders);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="space-y-6 relative">
      {/* 1. Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab 
                ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportOrdersToCSV(orders)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 hover:text-indigo-600 flex items-center gap-2 shadow-sm"
            title="Export Orders to CSV"
          >
            <Download size={18} />
          </button>
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Order ID / Customer..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 bg-white dark:bg-slate-900 border ${showFilters ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2`}
            >
              <Filter size={18} className={showFilters ? 'text-indigo-500' : 'text-slate-500'} />
              {(filters.status || filters.paymentStatus || filters.paymentMethod || filters.priority) && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[60] p-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Advanced Filters</h3>
                  <button 
                    onClick={() => {
                      setFilters({ status: '', paymentStatus: '', paymentMethod: '', priority: '', isCustom: false });
                      setShowFilters(false);
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Payment Status</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['Pending', 'Paid', 'Failed'].map(opt => (
                         <button 
                           key={opt}
                           onClick={() => setFilters(f => ({ ...f, paymentStatus: f.paymentStatus === opt ? '' : opt }))}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filters.paymentStatus === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Payment Method</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={filters.paymentMethod}
                      onChange={(e) => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}
                    >
                      <option value="">All Methods</option>
                      <option value="COD">Cash on Delivery</option>
                      <option value="ONLINE">Razorpay Online</option>
                      <option value="UPI">UPI Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Order Priority</label>
                    <div className="flex gap-2">
                       {['High', 'Medium', 'Low'].map(opt => (
                         <button 
                           key={opt}
                           onClick={() => setFilters(f => ({ ...f, priority: f.priority === opt ? '' : opt }))}
                           className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${filters.priority === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Float Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-4 border border-slate-700">
           <div className="flex items-center gap-2 pr-6 border-r border-slate-700">
             <span className="bg-indigo-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
               {selectedIds.length}
             </span>
             <span className="text-xs font-bold whitespace-nowrap uppercase tracking-widest">Selected</span>
           </div>
           
           <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulk Action:</span>
             <select 
               className="bg-slate-800 text-xs font-bold border-0 rounded-lg px-3 py-1.5 focus:ring-0"
               onChange={(e) => handleBulkUpdate(e.target.value)}
               disabled={isBulkUpdating}
             >
                <option value="">Update Status...</option>
                <option value="placed">Placed</option>
                <option value="ready-to-ship">Ready-to-Ship</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
             </select>
             <button className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
               <Trash2 size={18} />
             </button>
             <button 
               onClick={handleBulkInvoice}
               className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
             >
               <Download size={14} /> Bulk Invoice
             </button>
           </div>
           <button 
            onClick={() => setSelectedIds([])}
            className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest ml-4"
           >
             Cancel
           </button>
        </div>
      )}

      {/* 2. Order Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-6 py-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    {selectedIds.length === orders.length && orders.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4">Timeline & Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                   <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading Orders...</p>
                      </div>
                   </td>
                </tr>
              ) : orders.length > 0 ? orders.map((order) => (
                <tr key={order._id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group ${selectedIds.includes(order._id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleSelect(order._id)} className="p-1 text-slate-300 hover:text-indigo-500 transition-colors">
                      {selectedIds.includes(order._id) ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">#{order._id.toString().slice(-6).toUpperCase()}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{order.shippingAddress?.fullName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={order.items[0]?.imageURL || order.items[0]?.image} 
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100" 
                          alt="Product"
                        />
                        {order.items.some(i => i.isCustom) && (
                          <div className="absolute -top-1 -right-1">
                            <CustomDesignBadge />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
                          {order.items[0]?.title || "Generic Product"}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-slate-400">SKU: {order.items[0]?.variantId}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300" />
                           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                             {order.items.reduce((acc, item) => acc + (item.quantity || 0), 0)} Total Pieces
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {order.paymentStatus}
                        </span>
                        {order.discount?.amount > 0 && (
                          <span className="bg-rose-500/10 text-rose-500 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            COUPON
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.orderStatus} />
                        <PriorityBadge priority={order.priority} />
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={12} />
                        <SLABadge expectedDate={order.sla?.expectedDeliveryDate} />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onSelectOrder(order)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDownloadInvoice(order)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">No orders match your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
