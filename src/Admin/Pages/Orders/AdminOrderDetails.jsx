import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as orderService from '../../../services/orderService';

/**
 * AdminOrderDetails Component
 * A comprehensive order detail view for an e-commerce admin panel.
 * Includes status tracking, item details, customer info, and production workflow.
 */
const AdminOrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [note, setNote] = useState('');
    const [isQualityChecked, setIsQualityChecked] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [courierService, setCourierService] = useState('');

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setIsLoading(true);
            const res = await orderService.getOrderById(orderId);
            setOrder(res.data);
        } catch (error) {
            console.error("Admin: fetch order details failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (order) {
            setTrackingNumber(order.trackingNumber || '');
            setCourierService(order.courierService || '');
        }
    }, [order]);

    const handleStatusUpdate = async (newStatus, extraData = {}) => {
        try {
            setIsUpdating(true);
            await orderService.updateOrderStatus(orderId, {
                status: newStatus,
                ...extraData
            });
            fetchOrderDetails(); // refresh
        } catch (error) {
            alert(error.message || "Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDownload = async (url, fileName) => {
        if (!url) {
            alert("No download URL available.");
            return;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'design-asset.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
            window.open(url, '_blank');
        }
    };

    const handleSaveLogistics = async () => {
        try {
            setIsUpdating(true);
            await orderService.updateOrderStatus(orderId, {
                status: order.orderStatus,
                trackingNumber,
                courierService
            });
            fetchOrderDetails();
            alert("Logistics updated successfully");
        } catch (error) {
            alert("Failed to save logistics");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#101622] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#101622] flex flex-col items-center justify-center text-white">
                <p className="text-xl font-bold mb-4">Order Details Not Found</p>
                <button onClick={() => navigate('/admin/orders')} className="text-accent underline">Back to Orders</button>
            </div>
        );
    }

    const timelineSteps = order.orderType === 'PICKUP' ? [
        { label: 'Placed', icon: 'check', date: new Date(order.createdAt).toLocaleDateString(), completed: true },
        { label: 'Processing', icon: 'precision_manufacturing', date: order.orderStatus, active: order.orderStatus === 'processing', completed: ['ready-for-pickup', 'delivered'].includes(order.orderStatus) },
        { label: 'Ready for Pickup', icon: 'storefront', date: order.pickupDetails?.pickupTime || 'Pending', completed: order.orderStatus === 'delivered', active: order.orderStatus === 'ready-for-pickup' },
        { label: 'Picked Up', icon: 'done_all', date: order.orderStatus === 'delivered' ? 'Completed' : 'Pending', completed: order.orderStatus === 'delivered' },
    ] : [
        { label: 'Placed', icon: 'check', date: new Date(order.createdAt).toLocaleDateString(), completed: true },
        { label: 'Production', icon: 'precision_manufacturing', date: order.orderStatus, active: ['in-production', 'ready-to-ship'].includes(order.orderStatus), completed: ['shipped', 'delivered'].includes(order.orderStatus) },
        { label: 'Shipped', icon: 'local_shipping', date: order.trackingNumber || 'Pending', completed: order.orderStatus === 'delivered' || order.orderStatus === 'shipped', active: order.orderStatus === 'shipped' },
        { label: 'Delivered', icon: 'done_all', date: order.orderStatus === 'delivered' ? 'Completed' : 'Pending', completed: order.orderStatus === 'delivered' },
    ];

    return (
        <div className="bg-slate-50 dark:bg-[#101622] min-h-screen text-slate-900 dark:text-slate-100 font-sans pb-24 lg:pb-8">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* --- HEADER SECTION --- */}
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="text-[#1152d4] hover:text-[#1152d4]/80 flex items-center gap-1 transition-colors text-sm font-semibold group"
                        >
                            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Orders List
                        </button>
                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-3xl font-bold tracking-tight uppercase">Order {order.orderNumber || `#${order._id.slice(-8)}`}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${order.orderStatus === 'placed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                ['in-production', 'processing'].includes(order.orderStatus) ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                    order.orderStatus === 'shipped' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                        order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                {order.orderStatus.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            disabled={isUpdating}
                            className="px-4 py-2.5 bg-[#1152d4] text-white rounded-lg hover:bg-[#1152d4]/90 transition-all font-semibold text-sm shadow-md outline-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="placed">Mark as Placed</option>
                            <option value="processing">Mark as Processing</option>
                            {order.orderType === 'PICKUP' ? (
                                <option value="ready-for-pickup">Mark as Ready for Pickup</option>
                            ) : (
                                <>
                                    <option value="in-production">Mark as In-Production</option>
                                    <option value="ready-to-ship">Mark as Ready-to-Ship</option>
                                    <option value="shipped">Mark as Shipped</option>
                                </>
                            )}
                            <option value="delivered">Mark as Delivered</option>
                            <option value="cancelled">Mark as Cancelled</option>
                        </select>
                    </div>
                </header>

                {/* --- ORDER TIMELINE --- */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 overflow-x-auto">
                    <div className="min-w-[500px] relative flex items-center justify-between mx-10">
                        {/* Timeline Line Background */}
                        <div className="absolute left-0 top-5 w-full h-1 bg-slate-100 dark:bg-slate-700 z-0"></div>

                        {timelineSteps.map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center text-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${step.completed ? 'bg-[#1152d4] text-white' :
                                    step.active ? 'bg-[#1152d4] text-white ring-4 ring-[#1152d4]/20 border-2 border-white dark:border-slate-800 scale-110' :
                                        'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-lg font-bold">{step.completed ? 'check' : step.icon}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${step.active || step.completed ? 'text-[#1152d4]' : 'text-slate-400'}`}>
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Fulfillment & Logistics */}
                        {order.orderType === 'PICKUP' ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-accent">storefront</span> Store Pickup Logistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Selected Store</p>
                                            <p className="font-bold text-sm">{order.pickupDetails?.storeName}</p>
                                            <p className="text-xs text-slate-500 mt-1">{order.pickupDetails?.storeAddress}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Requested Time Slot</p>
                                            <p className="font-bold text-sm text-accent">{order.pickupDetails?.pickupTime}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="material-symbols-outlined text-purple-600">info</span>
                                                <p className="text-xs font-bold text-purple-900 dark:text-purple-400 uppercase tracking-tight">Pickup Instructions</p>
                                            </div>
                                            <ul className="text-[11px] space-y-2 text-purple-800/80 dark:text-purple-400/80 list-disc pl-4">
                                                <li>Verify order items are correctly picked and packed.</li>
                                                <li>Ensure the Order ID matches the customer's confirmation.</li>
                                                <li>Mark as "Ready for Pickup" to notify the customer.</li>
                                                {order.paymentMethod === 'CASH_ON_PICKUP' && (
                                                    <li className="font-black text-purple-900 dark:text-purple-300 uppercase underline">Collect Payment: ₹{order.totalAmount.toLocaleString()}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    {order.orderStatus === 'processing' && (
                                        <button
                                            onClick={() => handleStatusUpdate('ready-for-pickup')}
                                            className="px-8 py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                                        >
                                            Notify: Ready for Pickup
                                        </button>
                                    )}
                                    {order.orderStatus === 'ready-for-pickup' && (
                                        <button
                                            onClick={() => handleStatusUpdate('delivered')}
                                            className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Confirm Pickup (Delivered)
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-accent">local_shipping</span> Fulfillment & Logistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Courier Service</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. BlueDart, Delhivery"
                                            value={courierService}
                                            onChange={(e) => setCourierService(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tracking Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter AWB or tracking ID"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate('shipped', { trackingNumber, courierService })}
                                        className="px-6 py-2 bg-black text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
                                    >
                                        Mark as Shipped & Notify
                                    </button>
                                    <button
                                        onClick={handleSaveLogistics}
                                        className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold"
                                    >
                                        Save Info Only
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Order Items Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/50 flex items-center justify-between">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#1152d4]">inventory_2</span> Order Items
                                </h2>
                                <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                                    {order.items?.length} TOTAL
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] uppercase tracking-[0.1em] font-black">
                                            <th className="px-6 py-4">Product Details</th>
                                            <th className="px-4 py-4 text-center">Qty</th>
                                            <th className="px-4 py-4 text-right">Price</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {order.items?.map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={item.imageURL || item.product?.images?.[0]?.url}
                                                                alt={item.title}
                                                                className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-600 shadow-sm"
                                                            />
                                                            <div className="space-y-1">
                                                                <p className="font-bold text-sm leading-none flex items-center gap-2">
                                                                    {item.title || item.product?.title}
                                                                    {item.customizations?.previews && (
                                                                        <span className="bg-accent/10 text-accent text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Custom</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-slate-500 font-medium">
                                                                    Size: {item.size} | Color: {item.color}
                                                                </p>
                                                                <p className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded w-fit">
                                                                    SKU: {item.variantId}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5 text-center text-sm font-bold text-slate-500">{item.quantity}</td>
                                                    <td className="px-4 py-5 text-right text-sm font-medium text-slate-600 dark:text-slate-400">₹{item.priceAtPurchase || item.product?.price}</td>
                                                    <td className="px-6 py-5 text-right text-sm font-black text-slate-900 dark:text-white">₹{(item.quantity * (item.priceAtPurchase || item.product?.price)).toLocaleString()}</td>
                                                </tr>
                                                {/* 🎨 Customization Row */}
                                                {item.customizations?.previews && (
                                                    <tr className="bg-slate-50/20 dark:bg-slate-900/10">
                                                        <td colSpan="4" className="px-6 py-4">
                                                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                                                <div className="flex gap-3">
                                                                    {item.customizations.previews.front && (
                                                                        <div className="space-y-1">
                                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Front View</p>
                                                                            <img
                                                                                src={item.customizations.previews.front}
                                                                                className="w-24 h-32 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 object-contain p-1"
                                                                                alt="Front Preview"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {item.customizations.previews.back && (
                                                                        <div className="space-y-1">
                                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Back View</p>
                                                                            <img
                                                                                src={item.customizations.previews.back}
                                                                                className="w-24 h-32 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 object-contain p-1"
                                                                                alt="Back Preview"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-4 flex-1">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-[#1152d4] uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                            <span className="material-symbols-outlined text-[14px]">precision_manufacturing</span> Production Assets
                                                                        </p>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                            {/* High-Res Downloads */}
                                                                            {item.customizations?.printFiles?.front && (
                                                                                <button
                                                                                    onClick={() => handleDownload(item.customizations.printFiles.front, `Front_Print_Ready_${order._id.slice(-6)}.png`)}
                                                                                    className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent hover:text-accent transition-all text-[11px] font-bold shadow-sm group"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">download</span>
                                                                                    Front (Transparent PNG)
                                                                                </button>
                                                                            )}
                                                                            {item.customizations?.printFiles?.back && (
                                                                                <button
                                                                                    onClick={() => handleDownload(item.customizations.printFiles.back, `Back_Print_Ready_${order._id.slice(-6)}.png`)}
                                                                                    className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent hover:text-accent transition-all text-[11px] font-bold shadow-sm group"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">download</span>
                                                                                    Back (Transparent PNG)
                                                                                </button>
                                                                            )}

                                                                            {/* Full Mockup Download */}
                                                                            <button
                                                                                onClick={() => handleDownload(item.customizations.previews?.front || item.imageURL, `Full_Mockup_${order._id.slice(-6)}.png`)}
                                                                                className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 border border-transparent rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-[11px] font-bold shadow-sm group col-span-full"
                                                                            >
                                                                                <span className="material-symbols-outlined text-sm">image</span>
                                                                                Download Full Mockup
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* 🧩 Technical Quality Report (Production Ready) */}
                                                                    {item.designReference && (
                                                                        <div className="bg-slate-900/5 dark:bg-black/20 rounded-xl p-4 border border-dashed border-slate-200 dark:border-slate-700 mt-4">
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                                                    <span className="material-symbols-outlined text-[14px]">query_stats</span> Technical Audit
                                                                                </p>
                                                                                {item.designReference.qualityStatus?.isLowQuality ? (
                                                                                    <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest">LOW QUALITY WARNING</span>
                                                                                ) : (
                                                                                    <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">PRODUCTION READY</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                                                <div className="space-y-0.5">
                                                                                    <p className="text-[8px] text-slate-400 font-bold uppercase">Resolution</p>
                                                                                    <p className={`text-xs font-black ${item.designReference.metadata?.width < 4500 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                                                                        {item.designReference.metadata?.width} x {item.designReference.metadata?.height}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="space-y-0.5">
                                                                                    <p className="text-[8px] text-slate-400 font-bold uppercase">Estimated DPI</p>
                                                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                                                        {Math.round(item.designReference.metadata?.width / 15)} DPI
                                                                                    </p>
                                                                                </div>
                                                                                <div className="space-y-0.5">
                                                                                    <p className="text-[8px] text-slate-400 font-bold uppercase">Has Alpha</p>
                                                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                                                        {item.designReference.metadata?.hasAlpha ? "✅ YES" : "❌ NO"}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="space-y-0.5">
                                                                                    <p className="text-[8px] text-slate-400 font-bold uppercase">Format</p>
                                                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">
                                                                                        {item.designReference.printType}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            {item.designReference.qualityStatus?.warnings?.length > 0 && (
                                                                                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                                                                                    {item.designReference.qualityStatus.warnings.map((w, wi) => (
                                                                                        <p key={wi} className="text-[9px] text-rose-500 flex items-center gap-1">
                                                                                            <span className="material-symbols-outlined text-[12px]">warning</span> {w}
                                                                                        </p>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-[#1152d4] uppercase tracking-widest mb-1">Printing Method</p>
                                                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 flex items-center gap-2 shadow-sm">
                                                                                <span className="material-symbols-outlined text-accent text-sm">print</span>
                                                                                <div>
                                                                                    <p className="text-xs font-bold leading-none">{item.customizations.printingMethod?.label || "Standard"}</p>
                                                                                    <p className="text-[9px] text-slate-500 mt-0.5">{item.customizations.printingMethod?.description}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex flex-col justify-end gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    const json = JSON.stringify(item.customizations, null, 2);
                                                                                    navigator.clipboard.writeText(json);
                                                                                    alert("Design JSON copied to clipboard!");
                                                                                }}
                                                                                className="text-[10px] font-bold text-slate-400 hover:text-accent transition-colors flex items-center gap-1 uppercase tracking-widest"
                                                                            >
                                                                                <span className="material-symbols-outlined text-xs">content_copy</span> Copy Design JSON
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const win = window.open("", "_blank");
                                                                                    win.document.write(`<pre style="background:#111; color:#eee; padding:20px;">${JSON.stringify(item.customizations, null, 2)}</pre>`);
                                                                                }}
                                                                                className="text-[10px] font-bold text-slate-400 hover:text-accent transition-colors flex items-center gap-1 uppercase tracking-widest"
                                                                            >
                                                                                <span className="material-symbols-outlined text-xs">code</span> Technical View
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-end gap-3">
                                <div className="flex justify-between w-full max-w-[280px] text-sm text-slate-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-[280px] text-sm text-slate-500 font-medium">
                                    <span>Shipping Cost</span>
                                    <span className="text-emerald-600 font-bold uppercase text-[11px] tracking-tighter">FREE</span>
                                </div>
                                <div className="flex justify-between w-full max-w-[280px] pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-base font-bold">Grand Total</span>
                                    <span className="text-2xl font-black text-[#1152d4]">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Internal Notes Placeholder */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-[#1152d4]">sticky_note_2</span> Internal Production Notes
                            </h3>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full text-sm border-slate-200 dark:border-slate-700 dark:bg-[#101622] rounded-lg focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] transition-all resize-none outline-none p-3"
                                placeholder="Type production reminders..."
                                rows="3"
                            ></textarea>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    <span className="material-symbols-outlined text-[12px]">visibility_off</span> Visible: Admins Only
                                </span>
                                <button
                                    onClick={() => { alert('Note saved!'); setNote(''); }}
                                    className="text-xs font-black text-[#1152d4] px-4 py-2 hover:bg-[#1152d4]/5 rounded-lg transition-colors border border-[#1152d4]/20 uppercase tracking-widest"
                                >
                                    Post Note
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">

                        {/* Customer Details */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#1152d4]">person</span> Patron Information
                                </h3>
                            </div>
                            <div className="flex items-center gap-4 mb-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1152d4] to-blue-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 uppercase">
                                    {order.user?.fullName?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-base leading-tight truncate max-w-[150px]">{order.user?.fullName || "Anonymous"}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate max-w-[150px]">{order.user?.email || "No Email"}</p>
                                </div>
                            </div>
                            <div className="space-y-4 px-1">
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">phone</span>
                                    <span>{order.shippingAddress?.phone}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">payments</span>
                                    <span className="uppercase text-[10px] font-black tracking-widest">{order.paymentMethod} - {order.paymentStatus}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping/Pickup Address */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#1152d4]">{order.orderType === 'PICKUP' ? 'store' : 'map'}</span> 
                                    {order.orderType === 'PICKUP' ? 'Pickup Location' : 'Delivery Address'}
                                </h3>
                            </div>
                            <div className="text-sm font-medium space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                {order.orderType === 'PICKUP' ? (
                                    <>
                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{order.pickupDetails?.storeName}</p>
                                        <p className="text-xs">{order.pickupDetails?.storeAddress}</p>
                                        <p className="text-[10px] font-black text-blue-500 uppercase mt-4 block">Self-Pickup Protocol</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-black text-slate-900 dark:text-white">{order.shippingAddress?.fullName}</p>
                                        <p>{order.shippingAddress?.addressLine}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                        <p>{order.shippingAddress?.pincode}</p>
                                        <p>India</p>
                                    </>
                                )}
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Snapshot</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {order.paymentStatus.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                                    <span className="text-[10px] font-black text-slate-400">REFERENCE:</span>
                                    <span className="text-[10px] font-mono break-all text-slate-600 dark:text-slate-300">{order.razorpayOrderId || order.paymentMethod}</span>
                                </div>
                            </div>
                        </div>

                        {/* Production Workflow */}
                        <div className="bg-slate-900 dark:bg-black rounded-xl shadow-2xl p-6 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1152d4] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 relative z-10">Production Workflow</h3>
                            <div className="space-y-4 relative z-10">
                                <button
                                    onClick={() => setIsQualityChecked(!isQualityChecked)}
                                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-bold ${isQualityChecked ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{isQualityChecked ? 'verified' : 'check_circle'}</span>
                                    <span className="text-sm">{isQualityChecked ? 'Quality Checked' : 'Mark Quality Check OK'}</span>
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('delivered')}
                                    disabled={order.orderStatus === 'delivered'}
                                    className="w-full py-4 bg-[#1152d4] hover:bg-[#1152d4]/90 text-white rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-bold disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">task_alt</span>
                                    <span className="text-sm">Finalize Order</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
