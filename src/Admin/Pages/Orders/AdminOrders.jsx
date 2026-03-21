import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as orderService from '../../../services/orderService';

/**
 * AdminOrders Component
 * Fetches real orders and allows status updates.
 */
const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('placed');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await orderService.getAllAdminOrders();
            setOrders(res.data.orders || []);
        } catch (error) {
            console.error("Admin: fetch orders failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            fetchOrders(); // refresh
        } catch (error) {
            alert(error.message || "Failed to update status");
        }
    };

    const filteredOrders = orders.filter(order => {
        let matchesTab = activeTab === 'all' || order.orderStatus === activeTab;

        // Custom filter logic
        const hasCustomItems = order.items?.some(item => item.customizations && Object.keys(item.customizations).length > 0);
        if (activeTab === 'custom') {
            matchesTab = hasCustomItems;
        }

        const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'placed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'shipped': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#101622] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101622] text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-200">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order Management Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time oversight of site-wide transactions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-accent">search</span>
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent w-full md:w-64 text-sm transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 overflow-x-auto no-scrollbar">
                    {['all', 'custom', 'placed', 'ready-to-ship', 'shipped', 'delivered', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-4 border-b-2 text-sm whitespace-nowrap transition-colors duration-200 font-bold uppercase tracking-widest ${activeTab === tab
                                ? 'border-accent text-accent'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab === 'custom' ? '🎨 Custom Designs' : tab}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">Order Identity</th>
                                <th className="px-6 py-4">Patron Details</th>
                                <th className="px-6 py-4">Creation Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4">Transaction</th>
                                <th className="px-6 py-4 text-right">Operational Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filteredOrders.map((order) => {
                                const isCustom = order.items?.some(item => item.customizations && Object.keys(item.customizations).length > 0);
                                return (
                                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-accent">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{order.user?.fullName || "Anonymous"}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{order.user?.email || "No Email"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border-none focus:ring-0 cursor-pointer ${getStatusStyles(order.orderStatus)}`}
                                            >
                                                <option value="placed">Placed</option>
                                                <option value="ready-to-ship">Ready-to-Ship</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                                    {order.items?.[0]?.title || "Generic Product"}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                                                        {order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0)} TOTAL PIECES
                                                    </span>
                                                    {order.items?.length > 1 && (
                                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[8px] px-1 rounded font-black">
                                                            +{order.items.length - 1} MORE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="font-bold text-sm">₹{order.totalAmount}</span>
                                                {order.couponCode && (
                                                    <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">local_offer</span>
                                                        {order.couponCode}
                                                    </span>
                                                )}
                                                {isCustom && (
                                                    <span className="bg-accent/10 text-accent text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                                                        Contains Custom
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="p-2 hover:bg-accent/10 hover:text-accent rounded-lg text-slate-400 transition-all inline-block"
                                            >
                                                <span className="material-symbols-outlined !text-xl">visibility</span>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;