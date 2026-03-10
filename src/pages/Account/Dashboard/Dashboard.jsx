import "./Dashboard.css";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useWishlist } from "../../../context/WishlistContext";
import * as orderService from "../../../services/orderService";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { wishlist } = useWishlist();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
  });
  const [recentOrder, setRecentOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await orderService.getMyOrders();
      const orders = res.data || [];

      setStats({
        totalOrders: orders.length,
        activeOrders: orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length,
      });

      if (orders.length > 0) {
        setRecentOrder(orders[0]);
      }
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex-1 space-y-12 pb-20"
    >
      <header className="pr-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-impact tracking-tight mb-3 text-black leading-tight sm:leading-none">Welcome back, {user?.name?.split(" ")[0] || "Friend"}!</h1>
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-black/40">Operational Status: Optimal // Core Member</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-black/[0.03] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)] transition-all duration-700 group"
        >
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#8b7e6d] group-hover:scale-110 transition-transform">package_2</span>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-black/20">Lifetime</span>
          </div>
          <p className="text-3xl sm:text-4xl font-impact tracking-tight text-black">{stats.totalOrders.toString().padStart(2, '0')}</p>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-black/30 mt-2">Total Orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-black/[0.03] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)] transition-all duration-700 group"
        >
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#8b7e6d] group-hover:scale-110 transition-transform">local_shipping</span>
            <div className="h-2 w-2 rounded-full bg-[#8b7e6d] animate-pulse shadow-[0_0_15px_rgba(139,126,109,0.5)]"></div>
          </div>
          <p className="text-3xl sm:text-4xl font-impact tracking-tight text-black">{stats.activeOrders.toString().padStart(2, '0')}</p>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-black/30 mt-2">Active Orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 md:col-span-1 bg-white border border-black/[0.03] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)] transition-all duration-700 group"
        >
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#8b7e6d] group-hover:scale-110 transition-transform">favorite_border</span>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-[#8b7e6d]">Archive</span>
          </div>
          <p className="text-3xl sm:text-4xl font-impact tracking-tight text-black">{(wishlist?.length || 0).toString().padStart(2, '0')}</p>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-black/30 mt-2">Wishlist Items</p>
        </motion.div>
      </div>

      {/* RECENT ORDERS */}
      <section>
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-impact tracking-tight text-black uppercase">Recent Orders</h2>
          <Link
            to="/account/orders"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-colors"
          >
            Access Full Logs
          </Link>
        </div>

        <div className="space-y-6">
          {recentOrder ? (
            <div className="bg-white border border-black/[0.03] p-5 sm:p-10 rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] group">
              <div className="flex items-center gap-5 sm:gap-10 flex-1 min-w-0">
                <div className="w-20 h-28 sm:w-28 sm:h-36 bg-black/[0.02] rounded-2xl sm:rounded-3xl overflow-hidden flex-shrink-0 border border-black/5 p-2">
                  <img
                    src={recentOrder.items?.[0]?.customizations?.previews?.front || recentOrder.items?.[0]?.imageURL || "https://placeholder.com/100"}
                    alt="Order Item"
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-black/20">Protocol #{recentOrder._id.slice(-8).toUpperCase()}</p>
                    <span className={`sm:hidden px-3 py-1 text-[7px] font-black uppercase tracking-[0.2em] rounded-full border ${recentOrder.orderStatus === 'delivered' ? 'bg-black/5 text-black/40 border-black/5' : 'bg-[#8b7e6d]/10 text-[#8b7e6d] border-[#8b7e6d]/20'}`}>
                      {recentOrder.orderStatus}
                    </span>
                  </div>
                  <p className="text-[13px] sm:text-[15px] font-black uppercase tracking-tight text-black truncate pr-2">
                    {recentOrder.items?.[0]?.title} {recentOrder.items?.length > 1 && `+${recentOrder.items.length - 1}`}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-black/40 uppercase tracking-[0.2em] font-black">Logged: {new Date(recentOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-10 border-t border-black/[0.03] pt-5 sm:pt-0 sm:border-0">
                <div className="hidden sm:block text-right">
                  <span className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] rounded-full border transition-all ${recentOrder.orderStatus === 'delivered' ? 'bg-black/5 text-black/40 border-black/5' : 'bg-[#8b7e6d]/10 text-[#8b7e6d] border-[#8b7e6d]/20 shadow-[0_10px_30px_rgba(139,126,109,0.1)]'
                    }`}>
                    {recentOrder.orderStatus}
                  </span>
                </div>
                <Link
                  to="/account/orders"
                  className={`flex-1 sm:flex-none text-center px-10 py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 ${recentOrder.orderStatus === 'delivered' ? 'border border-black/10 text-black hover:bg-black hover:text-white' : 'bg-black text-white hover:bg-[#8b7e6d]'}`}
                >
                  {recentOrder.orderStatus === 'delivered' ? 'Review Log' : 'Trace Order'}
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-black/20 uppercase tracking-[0.5em] py-20 text-center bg-white border border-dashed border-black/10 rounded-[3rem]">No transactions detected in primary archive.</p>
          )}
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      <section className="pt-16">
        <h2 className="text-3xl font-impact tracking-tight mb-10 text-black uppercase">Recent Discoveries</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] rounded-[2rem] bg-black/[0.02] mb-6 overflow-hidden border border-black/[0.03] relative shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                <img
                  src={`https://picsum.photos/seed/${i + 10}/400/600`}
                  alt="Product"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">visibility</span>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Discovery Protocol 00{i}</p>
              <p className="text-[15px] font-impact mt-2 text-black tracking-tight">₹4,990</p>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;