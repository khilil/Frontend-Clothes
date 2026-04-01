import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, BarChart3, AlertCircle,
  TrendingUp, Layers, CheckCircle2, IndianRupee, Activity,
  Plus, ExternalLink, FileText, Download, AlertTriangle, History, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../features/dashboard/dashboardSlice';
import { getLowStockProducts } from '../services/inventoryService';
import OrderHub from './components/OrderHub';
import OrderDetailView from './Pages/OrderDetailView';
import { formatCurrency } from '../utils/formatCurrency';
import { KPICardSkeleton, ChartSkeleton, TableSkeleton } from './components/SkeletonLoader';


// --- Sub-components ---
const KPICard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full translate-x-1/2 -translate-y-1/2`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-indigo-600 dark:text-indigo-400`}>
        <Icon size={22} />
      </div>
    </div>

    <div className="relative z-10">
      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        {title}
      </p>
      <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
        {value}
      </h3>
      <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{subtext}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">{label}</p>
        <p className="font-black text-indigo-600 text-lg">{formatCurrency(payload[0].value)}</p>

        <p className="text-[10px] font-bold text-slate-400 mt-1">{payload[0].payload.orders} Orders</p>
      </div>
    );
  }
  return null;
};

const RevenueChartMemo = React.memo(({ revenueData }) => {
  if (!revenueData) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
          tickFormatter={(value) => formatCurrency(value)}

          dx={-10}
        />
        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }} />
        <Area 
          type="monotone" 
          dataKey="sales" 
          stroke="#4f46e5" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorSales)" 
          activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

const PipelineChartMemo = React.memo(({ statusData }) => {
  if (!statusData) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {statusData?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip 
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          itemStyle={{ fontWeight: 800, color: '#1e293b' }}
          formatter={(value, name) => [`${value} Orders`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

const BestSellingProductsWidget = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
           <Package size={24} />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Sales Data Yet</h4>
        <p className="text-xs text-slate-500 mt-1">Best selling products will appear here once orders are processed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Top Sellers</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">High-performing products by revenue</p>
        </div>
        <TrendingUp size={18} className="text-indigo-600" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Sold</th>
              <th className="px-6 py-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {products.slice(0, 5).map((product, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center size-5 rounded-md text-[9px] font-black ${
                    idx === 0 ? 'bg-amber-100 text-amber-600' :
                    idx === 1 ? 'bg-slate-100 text-slate-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{product.title}</p>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">{product.quantity}</td>
                <td className="px-6 py-4 text-xs font-black text-indigo-600 dark:text-indigo-400 text-right">
                  {formatCurrency(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const QuickActions = () => {
  const actions = [
    { label: 'Add Product', icon: Plus, link: '/admin/products', color: 'bg-indigo-600' },
    { label: 'Categories', icon: Layers, link: '/admin/categories', color: 'bg-emerald-600' },
    { label: 'Inventory', icon: FileText, link: '/admin/inventory', color: 'bg-amber-600' },
    { label: 'Analytics', icon: BarChart3, link: '/admin/analytics', color: 'bg-violet-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, i) => (
        <Link 
          key={i} 
          to={action.link}
          className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 group"
        >
          <div className={`p-2.5 rounded-xl ${action.color} text-white shadow-lg shadow-${action.color.split('-')[1]}-600/20`}>
            <action.icon size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

const LowStockAlerts = ({ products = [], loading }) => {
  if (loading) return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Inventory Monitor</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Products below threshold</p>
        </div>
        <AlertTriangle size={18} className={products.length > 0 ? "text-rose-500" : "text-emerald-500"} />
      </div>
      
      <div className="flex-1 p-4">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="size-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-3">
               <CheckCircle2 size={20} />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Stock Healthy</p>
            <p className="text-[10px] text-slate-500 mt-1">All products are within safety limits</p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{p.name || p.title}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.sku}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs font-black text-rose-500">{p.stock} Left</span>
                   <span className="text-[8px] font-bold text-slate-400">Limit: {p.lowStockThreshold}</span>
                </div>
              </div>
            ))}
            {products.length > 4 && (
              <Link to="/admin/inventory" className="block text-center text-[10px] font-black text-indigo-600 uppercase tracking-widest pt-2 hover:underline">
                View All {products.length} Alerts
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RecentActivityWidget = ({ activities = [] }) => {
  // Mocking activities if none provided
  const displayActivities = activities.length > 0 ? activities : [
    { type: 'order', label: 'New Order #88291', time: '5 mins ago', icon: <ShoppingCart size={14}/>, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { type: 'stock', label: 'SKU FEN-TEE-BL-M updated', time: '12 mins ago', icon: <Package size={14}/>, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { type: 'status', label: 'Order #88285 marked as Shipped', time: '45 mins ago', icon: <CheckCircle2 size={14}/>, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    { type: 'product', label: 'New variant added: Oversized Tee', time: '1 hr ago', icon: <Layers size={14}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { type: 'alert', label: 'Low stock alert: Black Hoodie (L)', time: '2 hrs ago', icon: <AlertTriangle size={14}/>, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col font-sans">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Activity</h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Real-time operational stream</p>
        </div>
        <History size={18} className="text-slate-400" />
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          {displayActivities.map((act, i) => (
            <div key={i} className="flex gap-4 group cursor-default">
               <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-xl ${act.color} transition-transform group-hover:scale-110 shadow-sm border border-slate-100 dark:border-slate-800/50`}>
                    {act.icon}
                  </div>
                  {i !== displayActivities.length - 1 && <div className="w-px h-full bg-slate-100 dark:bg-slate-800 mt-2" />}
               </div>
               <div className="flex-1 pb-4">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 leading-tight mb-1">{act.label}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{act.time}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
         <button className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
            Full Audit Log <ArrowRight size={12}/>
         </button>
      </div>
    </div>
  );
};
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { data: dashboardData, loading, error } = useSelector((state) => state.dashboard);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLowStockLoading, setIsLowStockLoading] = useState(true);

  const { kpis, revenueData, statusData, topProducts } = dashboardData || {};

  useEffect(() => {
    dispatch(fetchDashboardData());
    fetchLowStock();
  }, [dispatch]);

  const fetchLowStock = async () => {
    try {
      const res = await getLowStockProducts();
      setLowStockProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch low stock", err);
    } finally {
      setIsLowStockLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-48" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-64" />
          </div>
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <KPICardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div><ChartSkeleton /></div>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetailView 
        order={selectedOrder} 
        onBack={() => {
          setSelectedOrder(null);
          dispatch(fetchDashboardData()); // Refresh stats when coming back
        }} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Real-time operational overview of Fenrir Era</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-indigo-600/10 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-600/20 flex items-center gap-2">
             <Activity size={14} className="animate-pulse" /> LIVE OPS
           </div>
        </div>
      </div>

      {/* 1.5 Quick Actions Section */}
      <QuickActions />

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Gross Revenue" 
          value={formatCurrency(kpis?.totalSales || 0)} 

          icon={IndianRupee} 
          color="bg-indigo-500" 
          subtext="Total lifetime sales"
        />
        <KPICard 
          title="Total Orders" 
          value={(kpis?.totalOrders || 0).toLocaleString()} 
          icon={ShoppingCart} 
          color="bg-blue-500" 
          subtext="Total processed orders"
        />
        <KPICard 
          title="Custom Orders %" 
          value={`${kpis?.customOrdersPercentage || 0}%`} 
          icon={Layers} 
          color="bg-purple-500" 
          subtext="Custom design volume"
        />
        <KPICard 
          title="Operational SLA" 
          value={`${kpis?.slaPercentage || 0}%`} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
          subtext="On-time delivery rate"
        />
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Revenue Chart */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Revenue Momentum</h3>
                 <p className="text-xs text-slate-500 mt-1">7-Day Rolling Volume</p>
               </div>
            </div>
            
            <div className="h-[300px] w-full">
              <RevenueChartMemo revenueData={revenueData} />
            </div>
         </div>

         {/* Pipeline Chart */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Order Pipeline</h3>
               <p className="text-xs text-slate-500 mt-1">Current Status Distribution</p>
            </div>
            
            <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
               <PipelineChartMemo statusData={statusData} />
               {/* Center Label */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis?.totalOrders}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
               </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
               {statusData?.map((status, idx) => (
                 <div key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex-1">{status.name}</span>
                    <span className="text-xs font-black text-slate-900">{status.value}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 4. Top Sellers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-2">
           <BestSellingProductsWidget products={topProducts} />
         </div>
         <div className="lg:col-span-1">
           <LowStockAlerts products={lowStockProducts} loading={isLowStockLoading} />
         </div>
         <div className="lg:col-span-1">
           <RecentActivityWidget />
         </div>
      </div>

      {/* 5. Order Hub */}
      <div className="pt-8 relative z-20">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
           <h2 className="text-xl font-black tracking-tight">Order Management Hub</h2>
        </div>
        <OrderHub onSelectOrder={(order) => setSelectedOrder(order)} />
      </div>
    </div>
  );
}
