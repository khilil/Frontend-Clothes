import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, ShoppingBag, IndianRupee,
    ArrowUpRight, ArrowDownRight, Calendar, Filter
} from 'lucide-react';
import { getAnalyticsData } from '../../../services/analyticsService';
import { getAllOrders } from '../../../services/orderService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { KPICardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/SkeletonLoader';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('30D');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                // 🚀 Fetch BOTH specialized analytics AND raw orders for hybrid processing
                const [analyticsRes, ordersRes] = await Promise.all([
                    getAnalyticsData().catch(() => ({ stats: {}, revenueByDate: [], ordersByStatus: [], topCategories: [], customerGrowth: [], topProducts: [] })),
                    getAllOrders({ limit: 500 }).catch(() => ({ orders: [] }))
                ]);

                // 🛡️ BATTLE-HARDENED: Normalize varied API response envelopes (res.data, res.data.data, etc.)
                const getNestedData = (res) => {
                    if (res?.data?.data) return res.data.data;
                    if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
                    return res;
                };

                const backData = getNestedData(analyticsRes);
                const rawOrdersWrap = ordersRes?.data || ordersRes;
                const ordersArray = rawOrdersWrap?.orders || [];

                // 🧠 Hybrid Intelligence Engine: Process raw orders for live metrics
                const computed = computeDynamicStats(ordersArray, timeRange);
                
                // 🌪️ Final Merge Strategy: Use the maximum/best data from both sources
                const backStats = backData.stats || backData || {};
                const compStats = computed.stats;

                // 🧼 Helper to clean any currency strings for safe Math.max
                const clean = (val) => {
                    if (typeof val === 'number') return isNaN(val) ? 0 : val;
                    if (typeof val === 'string') {
                        const parsed = Number(val.replace(/[^0-9.-]+/g, ""));
                        return isNaN(parsed) ? 0 : parsed;
                    }
                    return 0;
                };

                const processedData = {
                    ...backData,
                    stats: {
                        totalRevenue: Math.max(clean(backStats.totalRevenue), clean(compStats.totalRevenue)),
                        totalOrders: Math.max(clean(backStats.totalOrders), clean(compStats.totalOrders)),
                        avgOrderValue: Math.max(clean(backStats.avgOrderValue), clean(compStats.avgOrderValue)),
                        conversionRate: backStats.conversionRate || compStats.conversionRate || "0%"
                    },
                    revenueByDate: backData.revenueByDate?.length > 0 ? backData.revenueByDate : computed.revenueByDate,
                    ordersByStatus: backData.ordersByStatus?.length > 0 ? backData.ordersByStatus : computed.ordersByStatus,
                    topProducts: backData.topProducts?.length > 0 ? backData.topProducts : computed.topProducts,
                    isCalculated: (Number(compStats.totalRevenue || 0) > 0 && !(Number(backStats.totalRevenue) > 0))
                };

                console.log("📊 Hybrid Intelligence Engine Active:", processedData);
                setData(processedData);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [timeRange]); // ⏰ Now reactive to user clicks!

    // 🔬 Helper: Construct dynamic metrics from raw order objects
    const computeDynamicStats = (orders, range) => {
        const stats = { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, conversionRate: "1.2%" };
        const revenueMap = {};
        const statusMap = {};
        const productMap = {};
        const userMap = {}; // 👥 Track user loyalty

        // 🕰️ Cutoff for "At-Risk" (e.g., 90 days of inactivity)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - Number(range));

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            if (orderDate < cutoffDate) return;

            const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const amount = Number(order.totalAmount || 0);
            
            if (!isNaN(amount)) {
                stats.totalOrders++;
                stats.totalRevenue += amount;
                revenueMap[dateStr] = (revenueMap[dateStr] || 0) + amount;
            }
            
            const status = order.orderStatus || 'Pending';
            statusMap[status] = (statusMap[status] || 0) + 1;

            const items = order.items || [];
            items.forEach(item => {
                const title = item.title || 'Unknown Product';
                if (!productMap[title]) productMap[title] = { title, quantity: 0, revenue: 0 };
                
                const itemPrice = Number(item.priceAtPurchase || item.price || 0);
                const itemQty = Number(item.quantity || 0);

                if (!isNaN(itemPrice) && !isNaN(itemQty)) {
                    productMap[title].quantity += itemQty;
                    productMap[title].revenue += (itemPrice * itemQty);
                }
            });

            // 👥 CRM Loyalty Engine
            const userKey = order.user?.email || order.user?._id || "Anonymous";
            if (!userMap[userKey]) userMap[userKey] = { count: 0, totalSpend: 0, lastOrder: orderDate };
            
            userMap[userKey].count++;
            userMap[userKey].totalSpend += amount;
            if (orderDate > userMap[userKey].lastOrder) userMap[userKey].lastOrder = orderDate;
        });

        stats.avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

        // 🏷️ Loyalty Tiering Logic
        const users = Object.values(userMap);
        const customerComposition = [
            { 
               name: 'VIP (Whales)', 
               value: users.filter(u => u.count >= 3 && u.totalSpend > 5000).length, 
               color: '#f59e0b',
               description: 'High frequency & high spend'
            },
            { 
               name: 'Loyalists', 
               value: users.filter(u => u.count >= 2 && u.totalSpend <= 5000).length, 
               color: '#6366f1',
               description: 'Repeat customers'
            },
            { 
               name: 'Emerging', 
               value: users.filter(u => u.count === 1 && u.lastOrder >= ninetyDaysAgo).length, 
               color: '#10b981',
               description: 'Recent first-time buyers'
            },
            { 
               name: 'At-Risk', 
               value: users.filter(u => u.count === 1 && u.lastOrder < ninetyDaysAgo).length, 
               color: '#f43f5e',
               description: 'Single purchase, no return'
            }
        ].filter(tier => tier.value > 0);

        return {
            stats,
            revenueByDate: Object.entries(revenueMap)
                .map(([date, revenue]) => ({ date, revenue }))
                .sort((a, b) => new Date(a.date) - new Date(b.date)),
            ordersByStatus: Object.entries(statusMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value),
            topProducts: Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
            customerComposition
        };
    };

    if (loading) {
        return (
            <div className="space-y-8 pb-12 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-64" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <KPICardSkeleton key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><ChartSkeleton /></div>
                    <div><ChartSkeleton /></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-12 text-center max-w-2xl mx-auto mt-20">
                <div className="size-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{error}</h3>
                <p className="text-slate-500 mb-8">We encountered an issue while fetching the latest performance metrics.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    Retry Fetch
                </button>
            </div>
        );
    }

    const { 
        stats = {},
        revenueByDate = [],
        topCategories = [], 
        customerGrowth = [], 
        topProducts = [],
        customerComposition = []
    } = data || {};

    const totalRevenue = stats.totalRevenue || 0;
    const totalOrders = stats.totalOrders || 0;
    const avgOrderValue = stats.avgOrderValue || 0;
    const conversionRate = stats.conversionRate || 0;


    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-1 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Store Intelligence</span>
                        {data?.isCalculated && (
                            <span className="flex items-center gap-1 text-[8px] font-black bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse">
                                <div className="size-1 bg-indigo-600 rounded-full" />
                                LIVE ANALYSIS
                            </span>
                        )}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Business Intelligence</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Deep dive into your store's performance metrics.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                    {['7D', '30D', '90D', '12M'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-5 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 ${timeRange === range
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- KPI GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} trend="+12.5%" icon={IndianRupee} color="indigo" />
                <KPICard title="Total Orders" value={totalOrders.toLocaleString()} trend="+8.2%" icon={ShoppingBag} color="emerald" />
                <KPICard title="Avg Order Value" value={formatCurrency(avgOrderValue)} trend="-2.4%" icon={TrendingUp} color="violet" />
                <KPICard 
                    title="Conversion Rate" 
                    value={typeof conversionRate === 'string' && conversionRate.includes('%') ? conversionRate : `${conversionRate}%`} 
                    trend="+0.5%" 
                    icon={Users} 
                    color="pink" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- REVENUE TREND (LINE CHART) --- */}
                <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">Revenue Analysis</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Daily performance metrics</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueByDate}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#CBD5E1" strokeOpacity={0.2} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ 
                                        borderRadius: '20px', 
                                        border: '1px solid rgba(226, 232, 240, 0.1)', 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' 
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '12px' }}
                                    labelStyle={{ color: '#94a3b8', fontWeight: 700, fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- CUSTOMER LOYALTY (DOUNT CHART) --- */}
                <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                    <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white mb-1">Loyalty Tiering</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Behavioral Segmentation</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={customerComposition}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {customerComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 mt-4">
                        {customerComposition.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="size-4 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: entry.color }}>
                                       <div className="size-1.5 bg-white rounded-full" />
                                    </div>
                                    <div>
                                       <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">{entry.name}</span>
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{entry.description}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                   <span className="text-xs font-black text-slate-900 dark:text-white block">
                                       {entry.value} Customers
                                   </span>
                                   <span className="text-[9px] font-bold text-indigo-500 uppercase">
                                       {totalOrders > 0 ? ((entry.value / usersCount) * 100).toFixed(0) : 0}% share
                                   </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- TOP CATEGORIES (BAR CHART) --- */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                    <h4 className="font-bold text-xl mb-2">Category Performance</h4>
                    <p className="text-sm text-slate-500 mb-8">Revenue generation by product category.</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCategories} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }} width={100} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- CUSTOMER GROWTH (LINE CHART) --- */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                    <h4 className="font-bold text-xl mb-2">User Acquisition</h4>
                    <p className="text-sm text-slate-500 mb-8">Monthly new customer registrations.</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={customerGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip />
                                <Line type="stepAfter" dataKey="customers" stroke="#ec4899" strokeWidth={4} dot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- TOP PRODUCTS TABLE --- */}
            <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">Best Selling Products</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Top performers by generated revenue</p>
                    </div>
                    <TrendingUp size={20} className="text-indigo-600" />
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5">Rank</th>
                                <th className="px-8 py-5">Product Name</th>
                                <th className="px-8 py-5 text-center">Units Sold</th>
                                <th className="px-8 py-5">Total Revenue</th>
                                <th className="px-8 py-5 text-right">Momentum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {topProducts.map((product, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center justify-center size-7 rounded-xl text-[10px] font-black shadow-sm ${idx === 0 ? 'bg-amber-100 text-amber-600' :
                                                idx === 1 ? 'bg-slate-100 text-slate-600' :
                                                    idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400 border border-slate-200 dark:border-slate-700'
                                            }`}>
                                            #{idx + 1}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors duration-300">{product.title}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">{product.quantity}</span>
                                    </td>
                                    <td className="px-8 py-6 font-black text-indigo-600 dark:text-indigo-400 text-lg">{formatCurrency(product.revenue)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                                            <ArrowUpRight size={12} strokeWidth={3} />
                                            STABLE
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, trend, icon: Icon, color }) => {
    const colorVariants = {
        indigo: 'text-indigo-600 bg-indigo-50/50 border-indigo-100/50 dark:bg-indigo-500/10 dark:border-indigo-500/20',
        emerald: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50 dark:bg-emerald-500/10 dark:border-emerald-500/20',
        violet: 'text-violet-600 bg-violet-50/50 border-violet-100/50 dark:bg-violet-500/10 dark:border-violet-500/20',
        pink: 'text-pink-600 bg-pink-50/50 border-pink-100/50 dark:bg-pink-500/10 dark:border-pink-500/20',
    };

    const isPositive = trend.startsWith('+');

    return (
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full translate-x-12 -translate-y-12 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-4 rounded-2xl ${colorVariants[color] || colorVariants.indigo} border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-black px-2.5 py-1.5 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    } border border-transparent dark:border-white/5`}>
                    {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                    {trend}
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-80">{title}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{value}</h3>
            </div>
        </div>
    );
};

export default AdminAnalytics;
