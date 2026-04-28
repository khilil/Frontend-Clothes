import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, CheckSquare, Square, Trash2, Calendar } from 'lucide-react';
import { getAllOrders } from '../../../services/orderService';
import { generateInvoiceHTML } from '../../utils/invoiceUtils';

export default function CancelledOrders({ onSelectOrder }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        fetchOrders();
    }, [debouncedSearch, page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                search: debouncedSearch,
                status: 'cancelled',
                page,
                limit: 10,
            };
            const res = await getAllOrders(params);
            setOrders(res.data.orders || []);
            if (res.data.pagination) {
                setTotalPages(res.data.pagination.totalPages);
            }
        } catch (err) {
            console.error("Failed to fetch cancelled orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = (order) => {
        const html = generateInvoiceHTML(order);
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="relative flex-1 md:w-64 lg:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Order ID / Customer..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full text-slate-900 dark:text-slate-100"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Cancellation Reason</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? orders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-sm text-rose-600">{order.orderNumber || `#${order._id.toString().slice(-6).toUpperCase()}`}</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                {order.shippingAddress?.fullName || order.pickupDetails?.storeName || "Store Pickup"}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img loading="lazy" 
                                                src={order.items[0]?.customizations?.displayPreviews?.front || order.items[0]?.customizations?.displayImage || order.items[0]?.imageURL || order.items[0]?.image || "https://via.placeholder.com/100"} 
                                                className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" 
                                                alt="Product"
                                            />
                                            <div className="flex flex-col gap-0.5 max-w-[200px]">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                    {order.items[0]?.title || "Generic Product"}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {order.items.reduce((acc, item) => acc + (item.quantity || 0), 0)} Total Pieces
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">
                                        ₹{order.totalAmount.toLocaleString()}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-3 py-2 rounded-xl text-xs font-semibold max-w-[250px] break-words">
                                            {order.cancellationReason || "No reason provided."}
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
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium italic">No cancelled orders logged.</td>
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
