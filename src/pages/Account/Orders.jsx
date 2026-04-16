import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as orderService from "../../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

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
          bg: 'bg-black/5',
          text: 'text-black/40',
          dot: 'bg-black/20',
          border: 'border-black/5'
        };
      case 'shipped':
        return {
          bg: 'bg-[#8b7e6d]/10',
          text: 'text-[#8b7e6d]',
          dot: 'bg-[#8b7e6d]',
          border: 'border-[#8b7e6d]/20'
        };
      case 'processing':
      case 'placed':
        return {
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-600',
          dot: 'bg-indigo-500',
          border: 'border-indigo-500/20'
        };
      case 'ready-for-pickup':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-600',
          dot: 'bg-purple-500',
          border: 'border-purple-500/20'
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-600',
          dot: 'bg-rose-500',
          border: 'border-rose-500/20'
        };
      default:
        return {
          bg: 'bg-black/5',
          text: 'text-black/40',
          dot: 'bg-black/20',
          border: 'border-black/5'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 pb-20 space-y-12">
        <div className="animate-pulse space-y-8">
          <div className="h-20 bg-black/[0.02] rounded-[2rem] w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-black/[0.01] border border-black/[0.03] rounded-[2.5rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  const currentOrders = orders.slice(0, currentPage * ordersPerPage);
  const hasMore = orders.length > currentOrders.length;

  return (
    <div className="flex-1 pb-20">
      {/* HEADER */}
      <header className="mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-impact tracking-tight mb-3 text-black">Order History</h2>
        <p className="text-black/30 text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-black">Archive Trace: Tracking your luxury acquisitions</p>
      </header>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-40 text-center bg-white border border-dashed border-gray-200 rounded-3xl"
        >
          <p className="text-black/20 uppercase tracking-[0.5em] text-[10px] font-black">
            Empty Archive: No Transaction Traces Detected
          </p>
          <Link to="/" className="inline-block mt-8 text-[9px] font-black uppercase tracking-widest bg-black text-white px-8 py-4 rounded-xl hover:bg-accent hover:text-black transition-all">
            Initiate New Transaction
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {currentOrders.map((order, index) => {
              const status = getStatusStyles(order.orderStatus);
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-black/[0.03] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] group"
                >
                  {/* CARD HEADER */}
                  <div className="p-5 sm:p-6 md:p-12 bg-black/[0.01] border-b border-black/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 md:gap-20">
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-black/20 mb-1 sm:mb-2">Cycle Log</p>
                        <p className="text-[11px] sm:text-[13px] font-black uppercase text-black">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-black/20 mb-1 sm:mb-2">Protocol ID</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <p className="text-[11px] sm:text-[13px] font-black uppercase text-black">{order.orderNumber || `#MM-${order._id.slice(-8).toUpperCase()}`}</p>
                          {order.orderType === 'PICKUP' && (
                            <span className="text-[7px] font-black uppercase bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded tracking-widest w-fit">Pickup</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 lg:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0">
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-black/20 mb-1 sm:mb-2 text-center lg:text-left">Investment</p>
                        <p className="text-[18px] sm:text-[20px] md:text-[24px] font-impact tracking-tight text-black text-center lg:text-left leading-none">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center md:justify-end gap-4 scale-90 sm:scale-100">
                      <span className={`flex items-center gap-3 px-6 py-2.5 ${status.bg} ${status.text} rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] border ${status.border} shadow-[0_10px_30px_rgba(0,0,0,0.02)]`}>
                        <span className={`w-2 h-2 rounded-full ${status.dot} ${!['delivered', 'cancelled'].includes(order.orderStatus?.toLowerCase()) ? 'animate-pulse shadow-[0_0_10px_currentColor]' : ''}`}></span>
                        {order.orderStatus?.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-5 sm:p-6 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
                    <div className="flex gap-4 sm:gap-6 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-start">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="w-20 h-28 sm:w-32 sm:h-44 bg-black/[0.02] rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-black/5 group-hover:border-black/10 transition-all duration-700 p-1.5 sm:p-2">
                          <img
                            alt="Item"
                            className="w-full h-full object-cover rounded-xl sm:rounded-3xl group-hover:scale-110 transition-all duration-1000"
                            src={item.customizations?.displayPreviews?.front || item.customizations?.displayImage || item.customizations?.previews?.front || item.imageURL || "https://placeholder.com/100"}
                          />
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="w-20 h-28 sm:w-32 sm:h-44 bg-black/[0.01] rounded-2xl sm:rounded-[2.5rem] border border-dashed border-black/5 flex items-center justify-center">
                          <p className="text-[8px] sm:text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">+{order.items.length - 2}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center lg:text-left space-y-3 sm:space-y-4">
                      <p className="text-lg sm:text-xl md:text-3xl font-impact tracking-tight text-black uppercase group-hover:text-[#8b7e6d] transition-colors leading-none line-clamp-2">
                        {order.items[0]?.title} {order.items.length > 1 && `[ +${order.items.length - 1} MORE ]`}
                      </p>
                      <p className="text-[9px] sm:text-[11px] text-black/30 md:max-w-md uppercase tracking-[0.3em] font-black leading-relaxed">
                        {order.orderStatus === 'delivered' ? `Transaction finalized on ${new Date(order.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : `Active logistics protocol: ${order.orderStatus} state.`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full lg:w-auto">
                      {(order.orderStatus === 'processing' || order.orderStatus === 'placed') && order.orderStatus !== 'ready-for-pickup' ? (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex-1 lg:flex-none px-6 sm:px-10 py-4 sm:py-5 border border-rose-500/20 text-rose-500/60 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500/10 hover:text-rose-600 transition-all"
                        >
                          Abort
                        </button>
                      ) : (
                        <button className="flex-1 lg:flex-none px-6 sm:px-10 py-4 sm:py-5 border border-black/10 text-black/60 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/5 hover:text-black transition-all">
                          {order.orderType === 'PICKUP' ? 'Store Location' : 'Track'}
                        </button>
                      )}
                      <Link
                        to={`/account/orders/${order._id}`}
                        className="flex-1 lg:flex-none px-8 sm:px-12 py-4 sm:py-5 bg-black text-white text-center rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#8b7e6d] transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(0,0,0,0.1)]"
                      >
                        View Protocol
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
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
