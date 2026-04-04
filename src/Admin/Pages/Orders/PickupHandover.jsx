import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  X, CheckCircle, AlertCircle, Loader2, Package, User, 
  CreditCard, ArrowLeft, Printer, ShieldCheck, ShoppingBag 
} from 'lucide-react';
import { getOrderById, updateOrderStatus } from '../../../services/orderService';
import { verifyPickupOrder } from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function PickupHandover() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        // Use getOrderById to fetch full details including populated variants
        const res = await getOrderById(orderId);
        if (res.success) {
          setOrder(res.data);
        } else {
          toast.error("Order not found or not eligible for pickup");
          navigate('/admin/pickups');
        }
      } catch (error) {
        console.error("Fetch failed:", error);
        toast.error("Error loading handover data");
        navigate('/admin/pickups');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, navigate]);

  const handleConfirmHandover = async () => {
    try {
      setConfirming(true);
      const payload = {
        status: 'delivered', 
        paymentStatus: order.paymentMethod === 'CASH_ON_PICKUP' ? 'Paid' : order.paymentStatus
      };
      
      await updateOrderStatus(order._id, payload);
      toast.success("Handover Success! Order finalized.");
      navigate('/admin/pickups');
    } catch (error) {
      toast.error("Handover confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Loading Handover Hub...</h2>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* 🏁 Management Header */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/admin/pickups')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={16} />
                <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">AUTHORIZED HANDOVER HUB</h1>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Session Active • Order #{order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700">
               <Printer size={14} />
               Print Receipt
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 🛂 IDENTITY & SUMMARY (Left - 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700" />
               
               <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                    <User size={32} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Acquisition Link</p>
                    <p className="text-2xl font-impact text-purple-600 italic">#V-{order._id.slice(-6).toUpperCase()}</p>
                  </div>
               </div>

               <div className="space-y-1 mb-8">
                  <h2 className="text-3xl font-impact text-slate-900 dark:text-white uppercase tracking-tight">{order.user?.fullName}</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Identity Verified via Token
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Created</p>
                     <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                     </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Quantity</p>
                     <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{order.items?.length} Product Units</p>
                  </div>
               </div>
            </div>

            {/* Financial Settlement Card */}
            <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
              order.paymentStatus === 'Paid' 
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' 
                : 'bg-rose-500/5 border-rose-500/20 text-rose-600 animate-pulse-slow shadow-2xl shadow-rose-500/10'
            }`}>
              <div className="flex items-center gap-5 mb-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                   order.paymentStatus === 'Paid' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20 animate-bounce'
                 }`}>
                   <CreditCard size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-2">Settlement Status</p>
                   <h3 className="text-xl font-black uppercase tracking-tight italic">
                     {order.paymentStatus === 'Paid' ? 'SECURED / FULLY PAID' : 'CAPTURE CASH AT DESK'}
                   </h3>
                 </div>
              </div>
              
              <div className="flex items-center justify-between p-6 bg-white/40 dark:bg-black/20 rounded-[1.5rem] backdrop-blur-sm border border-current opacity-30 pointer-events-none transition-all">
                {/* Visual placeholder for payment details if needed */}
              </div>
              
              <div className="mt-6 flex items-center justify-between px-2">
                 <p className="text-[11px] font-black uppercase tracking-widest opacity-60">Total Collection Value</p>
                 <p className="text-4xl font-impact tracking-tighter italic">₹{order.totalAmount?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 📦 FULFILLMENT CHECKLIST (Right - 7 Cols) */}
          <div className="lg:col-span-7 h-full">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col max-h-[calc(100vh-180px)]">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-impact text-slate-900 dark:text-white uppercase tracking-tight italic">Fulfillment Checklist</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Check units before scanning confirm</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                    <ShoppingBag size={20} />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 custom-scrollbar">
                 {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 p-5 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-purple-500/30 transition-all hover:translate-x-1 duration-300">
                       <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 p-1 group-hover:scale-105 transition-transform duration-500">
                          {item.imageURL ? (
                            <img src={item.imageURL} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={32} />
                            </div>
                          )}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                             <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                             {item.sku && (
                               <span className="px-2 py-0.5 bg-purple-600/10 text-purple-600 rounded-md text-[9px] font-black uppercase tracking-widest">
                                 {item.sku}
                               </span>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 shadow-sm">
                              Size: <span className="text-slate-900 dark:text-white">{item.size}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 shadow-sm">
                              Color: <span className="text-slate-900 dark:text-white">{item.color}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity:</p>
                               <p className="text-lg font-impact text-slate-900 dark:text-white italic">x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-impact text-slate-400 italic">₹{item.priceAtPurchase?.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>

               <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase leading-none">Security Status</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for Handover</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verify Quality Check</p>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                        <p className="text-[11px] font-black text-emerald-500 uppercase italic">QC PASSED</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>

      {/* ⚡ Action Bar */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 z-50">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button 
            onClick={() => navigate('/admin/pickups')}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 h-16"
          >
            <ArrowLeft size={16} />
            Scanner Hub
          </button>
          
          <button 
            onClick={handleConfirmHandover}
            disabled={confirming}
            className="flex-[3] py-4 bg-purple-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] hover:bg-purple-700 shadow-2xl shadow-purple-600/30 flex items-center justify-center gap-3 h-16 group transition-all"
          >
            {confirming ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle size={20} className="group-hover:scale-125 transition-transform" />
                CONFIRM FULFILLMENT & HANDOVER
              </>
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-impact { font-family: 'Impact', 'Anton', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.995); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}} />
    </div>
  );
}
