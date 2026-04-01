import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../../../services/customerService';

/**
 * AdminCustomers Component
 * A comprehensive customer management dashboard.
 * Built as a single component with React hooks and Tailwind CSS.
 */
const AdminCustomers = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await getAllCustomers();
                setCustomers(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching customers:", err);
                setError("Failed to load customers. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const kpis = useMemo(() => {
        const totalCustomers = customers.length;
        const totalSpent = customers.reduce((acc, curr) => acc + curr.totalSpent, 0);
        const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

        // Mocking trends for visual effect as backend doesn't provide them yet
        return [
            { label: 'Total Customers', value: totalCustomers.toLocaleString(), trend: '+0%', icon: 'group', color: 'emerald' },
            { label: 'Total Revenue', value: `₹${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: '+0%', icon: 'payments', color: 'emerald' },
            { label: 'Avg. Customer Value', value: `₹${avgSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: '+0%', icon: 'analytics', color: 'rose' },
        ];
    }, [customers]);

    // --- LOGIC ---
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer.addresses && customer.addresses.some(addr =>
                addr.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                addr.state?.toLowerCase().includes(searchQuery.toLowerCase())
            ))
        );
    }, [searchQuery, customers]);

    const handleViewProfile = (id) => {
        navigate(`/admin/customers/${id}`);
    };


    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#101622] font-sans">

            {/* --- HEADER SECTION --- */}
            {/* <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
                <div className="max-w-md w-full relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-[#1152d4] transition-colors">search</span>
                    <input 
                        type="text" 
                        placeholder="Search customers, emails, or orders..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1152d4] dark:text-white transition-all outline-none"
                    />
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold leading-none dark:text-white">Admin User</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Super Admin</p>
                        </div>
                        <img 
                            className="size-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                            alt="Admin" 
                        />
                    </div>
                </div>
            </header> */}

            <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">

                {/* --- PAGE TITLE --- */}
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Customers</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your customer base and their lifetime value</p>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {kpis.map((kpi, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-[#1152d4]/10 transition-colors">
                                    <span className="material-symbols-outlined text-[#1152d4]">{kpi.icon}</span>
                                </div>
                                <span className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${kpi.trend.startsWith('+')
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
                                    }`}>
                                    {kpi.trend}
                                    <span className="material-symbols-outlined text-[14px] ml-1">
                                        {kpi.trend.startsWith('+') ? 'trending_up' : 'trending_down'}
                                    </span>
                                </span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* --- CUSTOMERS TABLE --- */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Order</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="size-8 border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
                                                <p>Loading customers...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-rose-500 font-medium">
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No customers found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img className="size-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" src={customer.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt={customer.name} />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                {customer.addresses?.[0] ? `${customer.addresses[0].city}, ${customer.addresses[0].state}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{customer.totalOrders || 0}</td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">₹{(customer.totalSpent || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${customer.isVerified
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500'
                                                    }`}>
                                                    {customer.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewProfile(customer._id)}
                                                    className="px-4 py-1.5 text-xs font-bold text-[#1152d4] border border-[#1152d4]/30 rounded-lg hover:bg-[#1152d4] hover:text-white transition-all transform active:scale-95"
                                                >
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION FOOTER --- */}
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                            Showing <span className="text-slate-900 dark:text-white">1</span> to <span className="text-slate-900 dark:text-white">{filteredCustomers.length}</span> of <span className="text-slate-900 dark:text-white">{customers.length}</span> customers
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-all disabled:opacity-30" disabled>
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button className="min-w-[32px] h-8 flex items-center justify-center text-xs font-black bg-[#1152d4] text-white rounded-lg shadow-sm">1</button>
                            <button className="min-w-[32px] h-8 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">2</button>
                            <button className="min-w-[32px] h-8 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">3</button>
                            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-500 transition-all">
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;
