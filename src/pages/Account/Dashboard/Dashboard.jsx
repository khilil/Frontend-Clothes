import "./Dashboard.css";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="flex-1 space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-impact tracking-tight mb-2">Welcome back, {user?.name?.split(" ")[0] || "Friend"}!</h1>
        <p className="text-sm text-muted">Here's an overview of your recent activity and account status.</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-3xl text-accent">package_2</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Lifetime</span>
          </div>
          <p className="text-3xl font-impact tracking-tight">{stats.totalOrders.toString().padStart(2, '0')}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">Total Orders</p>
        </div>

        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-3xl text-accent">local_shipping</span>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
          <p className="text-3xl font-impact tracking-tight">{stats.activeOrders.toString().padStart(2, '0')}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">Active Orders</p>
        </div>

        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-3xl text-accent">favorite_border</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">New</span>
          </div>
          <p className="text-3xl font-impact tracking-tight">{(wishlist?.length || 0).toString().padStart(2, '0')}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">Wishlist Items</p>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-impact tracking-tight">Recent Orders</h2>
          <Link
            to="/account/orders"
            className="text-[10px] font-black uppercase tracking-widest hover:text-accent transition-colors"
          >
            View All Orders
          </Link>
        </div>

        <div className="space-y-4">
          {recentOrder ? (
            <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black/10 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={recentOrder.items?.[0]?.customizations?.previews?.front || recentOrder.items?.[0]?.imageURL || "https://placeholder.com/100"}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">Order #{recentOrder._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm font-bold uppercase tracking-tight">
                    {recentOrder.items?.[0]?.title} {recentOrder.items?.length > 1 && `& ${recentOrder.items.length - 1} more`}
                  </p>
                  <p className="text-[11px] text-muted">Placed on {new Date(recentOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto">
                <div className="text-right">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${recentOrder.orderStatus === 'delivered' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'
                    }`}>
                    {recentOrder.orderStatus}
                  </span>
                  {recentOrder.orderStatus !== 'delivered' && (
                    <p className="text-[10px] text-muted mt-1">Status Update: {recentOrder.orderStatus}</p>
                  )}
                  {recentOrder.orderStatus === 'delivered' && (
                    <p className="text-[10px] text-muted mt-1">on {new Date(recentOrder.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  )}
                </div>
                <Link
                  to="/account/orders"
                  className={`${recentOrder.orderStatus === 'delivered' ? 'border border-black text-black' : 'bg-black text-white'} px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all`}
                >
                  {recentOrder.orderStatus === 'delivered' ? 'View Details' : 'Track Order'}
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">No recent orders found.</p>
          )}
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      <section className="pt-8">
        <h2 className="text-2xl font-impact tracking-tight mb-8">Recently Viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl bg-gray-50 mb-3 overflow-hidden border border-gray-100">
                <img
                  src={`https://picsum.photos/seed/${i + 10}/400/600`}
                  alt="Product"
                  className="w-full h-full object-cover grayscale group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Premium Item 00{i}</p>
              <p className="text-xs font-impact mt-1">₹4,990</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;