import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerDetail } from '../../../services/customerService';

/**
 * AdminCustomerDetail Component
 * Recreates a full Detailed Customer Profile page.
 */
const AdminCustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getCustomerDetail(id);
                setCustomer(response.data.customer);
                setOrders(response.data.orders);
                setStats(response.data.stats);
                setError(null);
            } catch (err) {
                console.error("Error fetching customer details:", err);
                setError("Failed to load customer details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const getStatusBadge = (status) => {
        const styles = {
            delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
            shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
            placed: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
            cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        };
        return styles[status] || styles.cancelled;
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#101622] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#101622] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-rose-500 font-bold mb-4">{error || "Customer not found"}</p>
                    <button
                        onClick={() => navigate('/admin/customers')}
                        className="px-6 py-2 bg-[#1152d4] text-white rounded-lg font-bold"
                    >
                        Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101622] text-slate-900 dark:text-slate-100 transition-colors">
            <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-8">

                {/* --- TOP SECTION: Breadcrumb + Actions --- */}
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <nav className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                            <button
                                onClick={() => navigate('/admin/customers')}
                                className="hover:text-[#1152d4] transition-colors"
                            >
                                Customers
                            </button>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            <span className="font-medium text-slate-900 dark:text-slate-200">{customer.name}</span>
                        </nav>
                        <h1 className="text-3xl font-extrabold tracking-tight">Customer Profile</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            Edit Profile
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-[#1152d4] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 hover:bg-[#1152d4]/90 transition-all">
                            <span className="material-symbols-outlined text-[20px]">mail</span>
                            Send Email
                        </button>
                    </div>
                </div>

                {/* --- MAIN LAYOUT GRID --- */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* LEFT COLUMN */}
                    <aside className="lg:col-span-4 flex flex-col gap-6">
                        {/* Summary Card */}
                        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="mb-6 flex flex-col items-center text-center">
                                <img loading="lazy" 
                                    src={customer.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                                    alt={customer.name}
                                    className="mb-4 h-32 w-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 object-cover"
                                />
                                <h3 className="text-xl font-bold">{customer.name}</h3>
                                <span className={`mt-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${customer.isVerified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                    {customer.isVerified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400">email</span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Email Address</p>
                                        <p className="text-sm font-medium">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400">call</span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Phone Number</p>
                                        <p className="text-sm font-medium">{customer.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400">calendar_today</span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Joined Date</p>
                                        <p className="text-sm font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-slate-400">location_on</span>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Primary Shipping Address</p>
                                            {customer.addresses?.length > 0 ? (
                                                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                    {customer.addresses[0].fullName}<br />
                                                    {customer.addresses[0].streetAddress}<br />
                                                    {customer.addresses[0].city}, {customer.addresses[0].state} {customer.addresses[0].pinCode}<br />
                                                    {customer.addresses[0].phone}
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-sm text-slate-400 italic">No addresses saved.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Admin Notes Placeholder */}
                        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-sm font-bold">Internal Admin Notes</h4>
                                <button className="text-[#1152d4] text-xs font-bold hover:underline">Edit</button>
                            </div>
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                                <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">
                                    "No internal notes for this customer yet."
                                </p>
                            </div>
                        </section>
                    </aside>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        {/* Lifetime Statistics */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow group">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Spent</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-[#1152d4] tracking-tight">₹{stats?.totalSpent.toFixed(2)}</span>
                                    <span className="text-xs font-bold text-emerald-600">+0%</span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</p>
                                <div className="mt-2">
                                    <span className="text-2xl font-black tracking-tight">{stats?.totalOrders}</span>
                                    <span className="ml-1 text-sm text-slate-500 font-medium uppercase tracking-tighter">orders</span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Order Value</p>
                                <div className="mt-2">
                                    <span className="text-2xl font-black tracking-tight">₹{stats?.avgValue.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order History Table */}
                        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                                <h3 className="text-lg font-bold">Order History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm tabular-nums">
                                        {orders.length > 0 ? orders.map((order) => (
                                            <tr
                                                key={order._id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                            >
                                                <td className="px-6 py-4 font-bold text-[#1152d4] group-hover:underline">#{order._id.slice(-8).toUpperCase()}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-bold">₹{order.totalAmount.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusBadge(order.orderStatus)}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-slate-400 hover:text-[#1152d4] transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">This customer hasn't placed any orders yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Pagination */}
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
                                <p className="text-xs font-bold uppercase tracking-tighter text-slate-500">
                                    Showing <span className="text-slate-900 dark:text-white">1</span> to <span className="text-slate-900 dark:text-white">{orders.length}</span> of <span className="text-slate-900 dark:text-white">{orders.length}</span> orders
                                </p>
                                <div className="flex gap-1.5">
                                    <button className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all">
                                        <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                                    </button>
                                    <button className={`rounded-lg px-3 py-1 text-xs font-black shadow-sm bg-[#1152d4]/10 text-[#1152d4] ring-1 ring-[#1152d4]/20`}>
                                        1
                                    </button>
                                    <button className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                        <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminCustomerDetail;
