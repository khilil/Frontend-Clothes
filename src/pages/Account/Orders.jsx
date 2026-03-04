import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as orderService from "../../services/orderService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Fetch orders failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to abort this transaction?")) return;
    try {
      await orderService.cancelOrder(orderId);
      fetchOrders();
    } catch (error) {
      alert(error.message || "Failed to cancel order");
    }
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          dot: 'bg-emerald-500',
          border: 'border-emerald-100'
        };
      case 'shipped':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          dot: 'bg-blue-500',
          border: 'border-blue-100'
        };
      case 'processing':
      case 'placed':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          dot: 'bg-amber-500',
          border: 'border-amber-100'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          dot: 'bg-red-500',
          border: 'border-red-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          dot: 'bg-gray-500',
          border: 'border-gray-100'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40 min-h-screen">
        <div className="animate-pulse text-black uppercase tracking-[0.6em] font-black text-[10px]">
          [ INITIALIZING PROTOCOL TRACE ]
        </div>
      </div>
    );
  }

  const currentOrders = orders.slice(0, currentPage * ordersPerPage);
  const hasMore = orders.length > currentOrders.length;

  return (
    <div className="flex-1 pb-20">
      {/* HEADER & FILTERS */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-impact tracking-tight mb-2">My Orders History</h2>
          <p className="text-muted text-xs md:text-sm uppercase tracking-widest font-medium">Review and track your recent purchases</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-1">
            <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-3 pl-5 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:border-black cursor-pointer">
              <option>Sort by: Last 6 Months</option>
              <option>2024</option>
              <option>2023</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-sm">expand_more</span>
          </div>
          <div className="relative group flex-1">
            <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-3 pl-5 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:border-black cursor-pointer">
              <option>Status: All Orders</option>
              <option>Delivered</option>
              <option>Shipped</option>
              <option>Processing</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-sm">filter_list</span>
          </div>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="py-40 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
          <p className="text-black/20 uppercase tracking-[0.5em] text-[10px] font-black">
            Empty Archive: No Transaction Traces Detected
          </p>
          <Link to="/" className="inline-block mt-8 text-[9px] font-black uppercase tracking-widest bg-black text-white px-8 py-4 rounded-xl hover:bg-accent hover:text-black transition-all">
            Initiate New Transaction
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {currentOrders.map((order) => {
            const status = getStatusStyles(order.orderStatus);
            return (
              <div key={order._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
                {/* CARD HEADER */}
                <div className="p-5 md:p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Order Date</p>
                      <p className="text-[11px] md:text-[12px] font-bold uppercase">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Order ID</p>
                      <p className="text-[11px] md:text-[12px] font-bold uppercase">#MM-{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Total Amount</p>
                      <p className="text-[11px] md:text-[12px] font-impact tracking-tight">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 ${status.bg} ${status.text} rounded-full text-[10px] font-black uppercase tracking-widest border ${status.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' ? 'animate-pulse' : ''}`}></span>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-5 md:p-8 flex flex-col lg:flex-row gap-8 items-center">
                  <div className="flex gap-3 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-start">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="w-20 h-28 sm:w-24 sm:h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          alt="Item"
                          className="w-full h-full object-cover"
                          src={item.customizations?.previews?.front || item.imageURL || "https://placeholder.com/100"}
                        />
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="w-20 h-28 sm:w-24 sm:h-32 bg-white rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest">+{order.items.length - 2} Item</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <p className="text-sm md:text-base font-medium text-gray-900 line-clamp-1 uppercase tracking-tight">
                      {order.items[0]?.title} {order.items.length > 1 && `and ${order.items.length - 1} more`}
                    </p>
                    <p className="text-[10px] md:text-[11px] text-muted mt-2 uppercase tracking-widest">
                      {order.orderStatus === 'delivered' ? `Delivered on ${new Date(order.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : `Current Status: ${order.orderStatus}`}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {order.orderStatus === 'processing' || order.orderStatus === 'placed' ? (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex-1 lg:flex-none px-6 py-3.5 border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                      >
                        Cancel Order
                      </button>
                    ) : (
                      <button className="flex-1 lg:flex-none px-6 py-3.5 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Track Order</button>
                    )}
                    <Link
                      to={`/account/orders/${order._id}`}
                      className="flex-1 lg:flex-none px-6 py-3.5 bg-black text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOAD MORE */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            className="px-8 py-4 border border-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
          >
            Load More Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
