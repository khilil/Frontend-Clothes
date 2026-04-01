import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../../../services/customerService';
import { KPICardSkeleton, TableSkeleton } from '../../components/SkeletonLoader';
import { User, Mail, MapPin, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Search } from 'lucide-react';

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Archival Customers</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Synchronized user ledger and lifetime valuation protocol.</p>
                    </div>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <KPICardSkeleton key={i} />)
                    ) : (
                        kpis.map((kpi, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 group-hover:bg-indigo-600/10 transition-colors">
                                        <TrendingUp size={20} className="text-indigo-600" />
                                    </div>
                                    <span className={`flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${kpi.trend.startsWith('+')
                                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
                                        : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
                                        }`}>
                                        {kpi.trend}
                                    </span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{kpi.value}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* --- CUSTOMERS TABLE --- */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="relative w-full md:w-96">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, or city..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 dark:text-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <TableSkeleton rows={10} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Archival User</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Orders</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">LTV</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Access</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Procedure</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20 text-center">
                                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No matching archival data found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((customer) => (
                                            <tr key={customer._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <img className="size-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" src={customer.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt={customer.name} />
                                                            {customer.isVerified && <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 border border-white dark:border-slate-800 rounded-full" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{customer.name}</p>
                                                            <p className="text-[11px] text-slate-400 font-medium tracking-tight">{customer.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        <MapPin size={12} className="text-slate-300" />
                                                        {customer.addresses?.[0] ? `${customer.addresses[0].city}` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black text-slate-700 dark:text-slate-300">{customer.totalOrders || 0}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black dark:text-white">₹{(customer.totalSpent || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'NO HISTORY'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-transparent ${customer.isVerified
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800/10 dark:text-slate-500'
                                                        }`}>
                                                        {customer.isVerified ? 'VERIFIED' : 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleViewProfile(customer._id)}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-600/20 rounded-xl transition-all shadow-sm shadow-indigo-600/5 active:scale-95"
                                                    >
                                                        View Data
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- PAGINATION FOOTER --- */}
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                            Showing <span className="text-slate-900 dark:text-white">1</span> to <span className="text-slate-900 dark:text-white">{filteredCustomers.length}</span> of <span className="text-slate-900 dark:text-white">{customers.length}</span> customers
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-all disabled:opacity-30" disabled>
                                <ChevronLeft size={16} />
                            </button>
                            <button className="min-w-[36px] h-9 flex items-center justify-center text-xs font-black bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">1</button>
                            <button className="min-w-[36px] h-9 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">2</button>
                            <button className="min-w-[36px] h-9 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">3</button>
                            <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-500 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;
