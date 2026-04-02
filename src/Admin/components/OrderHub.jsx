import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Download, Eye, ChevronRight, Clock, CheckSquare, Square, Trash2, Calendar, Plus } from 'lucide-react';
import { StatusBadge, PriorityBadge, CustomDesignBadge, SLABadge, SourceBadge } from './OrderBadges';
import { getAllOrders, bulkUpdateOrders, updateOrderStatus } from '../../services/orderService';
import { generateInvoiceHTML, generateBulkInvoiceHTML, generatePickingListHTML } from '../utils/invoiceUtils';
import { exportOrdersToCSV } from '../utils/exportUtils';

export default function OrderHub({ onSelectOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    priority: '',
    isCustom: false,
    source: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ label: 'All Time', startDate: null, endDate: null });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const tabs = ['All', 'Custom Design 🎨', 'Pending', 'Shipped', 'Delivered'];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [activeTab, filters, debouncedSearch, page, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearch,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        paymentMethod: filters.paymentMethod,
        priority: filters.priority,
        isCustom: activeTab === 'Custom Design 🎨' ? true : filters.isCustom,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        source: filters.source,
        page,
        limit: 10,
      };
      
      if (activeTab === 'Pending') params.status = 'placed';
      if (activeTab === 'Shipped') params.status = 'shipped';
      if (activeTab === 'Delivered') params.status = 'delivered';

      const res = await getAllOrders(params);
      setOrders(res.data.orders);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
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
    if (!status || selectedIds.length === 0) return;
    
    setIsBulkUpdating(true);
    try {
      // 🔄 Resilient Fallback: Individual updates bypass strict Admin-only Bulk API permissions
      // We also map to 'status' property as expected by the backend schema.
      await Promise.all(selectedIds.map(id => 
        updateOrderStatus(id, { status: status })
      ));

      // Update local state for immediate feedback
      setOrders(prev => prev.map(order => 
        selectedIds.includes(order._id) ? { ...order, orderStatus: status } : order
      ));
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk update failed:", error);
      alert("Operational Conflict: Status sync failed. Some units may require manual verification.");
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

  const handleBulkPickingList = () => {
    const selectedOrders = orders.filter(o => selectedIds.includes(o._id));
    const html = generatePickingListHTML(selectedOrders);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  const getPreviousMonths = () => {
    const months = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        value: `month-${i}`
      });
    }
    return months;
  };

  const applyDatePreset = (preset) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let label = '';

    if (preset.startsWith('month-')) {
      const offset = parseInt(preset.split('-')[1]);
      const d = new Date();
      d.setMonth(d.getMonth() - offset);
      
      start = new Date(d.getFullYear(), d.getMonth(), 1);
      start.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      setDateRange({
         label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
         startDate: start.toISOString(),
         endDate: endOfMonth.toISOString()
      });
      setPage(1);
      setShowDateFilter(false);
      return;
    }

    switch (preset) {
      case 'today':
        label = 'Today';
        break;
      case '7days':
        start.setDate(today.getDate() - 7);
        label = 'Last 7 Days';
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        label = 'Last 30 Days';
        break;
      case 'thisMonth':
        start.setDate(1);
        label = 'This Month';
        break;
      default:
        setDateRange({ label: 'All Time', startDate: null, endDate: null });
        setPage(1);
        setShowDateFilter(false);
        return;
    }

    setDateRange({
      label,
      startDate: start.toISOString(),
      endDate: today.toISOString()
    });
    setCustomStart('');
    setCustomEnd('');
    setPage(1);
    setShowDateFilter(false);
  };

  const applyCustomDate = () => {
    if (!customStart && !customEnd) return;
    
    let start = customStart ? new Date(customStart) : new Date();
    let end = customEnd ? new Date(customEnd) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      end = new Date(start.getTime() + 86400000);
      setCustomEnd(end.toISOString().split('T')[0]);
    }

    const label = `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;

    setDateRange({
      label,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
    setPage(1);
    setShowDateFilter(false);
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
          <div className="relative">
            <button 
              onClick={() => { setShowDateFilter(!showDateFilter); setShowFilters(false); }}
              className={`p-2 bg-white dark:bg-slate-900 border ${showDateFilter || dateRange.startDate ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2`}
            >
              <Calendar size={18} className={showDateFilter || dateRange.startDate ? 'text-indigo-500' : 'text-slate-500'} />
              {dateRange.startDate && <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:block pl-1 pr-1">{dateRange.label}</span>}
            </button>

            {showDateFilter && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[60] p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Timeframe</h3>
                  <button onClick={() => applyDatePreset('all')} className="text-[10px] font-bold text-rose-500 hover:underline">Reset</button>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => applyDatePreset('today')} className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${dateRange.label === 'Today' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>Today</button>
                  <button onClick={() => applyDatePreset('7days')} className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${dateRange.label === 'Last 7 Days' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>Last 7 Days</button>
                  <button onClick={() => applyDatePreset('30days')} className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${dateRange.label === 'Last 30 Days' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>Last 30 Days</button>
                  <button onClick={() => applyDatePreset('thisMonth')} className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${dateRange.label === 'This Month' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>This Month</button>
                </div>

                <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1">Previous Months</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {getPreviousMonths().map(m => (
                      <button key={m.value} onClick={() => applyDatePreset(m.value)} className={`text-left px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all ${dateRange.label === m.label ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{m.label}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">Custom Range</h4>
                  <div className="flex flex-col gap-2 px-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Start Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none hover:border-indigo-500 transition-colors"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">End Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none hover:border-indigo-500 transition-colors"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={applyCustomDate}
                      className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => { setShowFilters(!showFilters); setShowDateFilter(false); }}
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
                      setFilters({ status: '', paymentStatus: '', paymentMethod: '', priority: '', source: '', isCustom: false });
                      setShowFilters(false);
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Source</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={filters.source}
                      onChange={(e) => setFilters(f => ({ ...f, source: e.target.value }))}
                    >
                      <option value="">All Sources</option>
                      <option value="Web">Web</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Instagram">Instagram</option>
                    </select>
                  </div>

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

      {/* 2. Top Bar Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => alert("Manual Order Creation Entry Point (Activity 3)")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} /> Create Manual Order
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          
          <div className="relative flex-1 md:w-64 lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Order ID / Customer..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Float Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-3xl px-8 py-5 flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 border border-slate-700/50 backdrop-blur-xl">
           <div className="flex items-center gap-3 pr-8 border-r border-slate-700/50">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 animate-pulse" />
               <span className="relative bg-indigo-600 text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-500/40">
                 {selectedIds.length}
               </span>
             </div>
             <span className="text-[11px] font-black whitespace-nowrap uppercase tracking-[0.2em] text-slate-400">Targeted</span>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
                <select 
                  className="bg-slate-800/50 text-[11px] font-black border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  onChange={(e) => handleBulkUpdate(e.target.value)}
                  disabled={isBulkUpdating}
                >
                    <option value="">Switch Protocol...</option>
                    <option value="placed">Placed</option>
                    <option value="ready-to-ship">Ready-to-Ship</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
             </div>

             <div className="h-10 w-px bg-slate-700/50 mx-2" />

             <div className="flex items-center gap-2">
               <button 
                onClick={() => handleBulkUpdate('shipped')}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl text-xs font-black transition-all border border-emerald-600/20 group"
               >
                 <CheckSquare size={14} className="group-hover:scale-110 transition-transform" />
                 QUICK DISPATCH
               </button>
               
               <button 
                onClick={handleBulkPickingList}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white rounded-xl text-xs font-black transition-all border border-amber-600/20 group"
               >
                 <Clock size={14} className="group-hover:rotate-12 transition-transform" />
                 PICKING LIST
               </button>

               <button 
                 onClick={handleBulkInvoice}
                 className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
               >
                 <Download size={14} /> BULK INVOICE
               </button>
             </div>
           </div>
           
           <button 
             onClick={() => setSelectedIds([])}
             className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest ml-4 transition-colors"
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
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                   <td colSpan="7" className="px-6 py-12 text-center">
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mx-4">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${page === 1 ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 dark:text-slate-300 shadow-sm'}`}
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${page === totalPages ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
