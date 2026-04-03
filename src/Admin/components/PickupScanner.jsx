import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, CheckCircle, AlertCircle, Loader2, Package, User, CreditCard } from 'lucide-react';
import { verifyPickupOrder, updateOrderStatus } from '../../services/orderService';
import toast from 'react-hot-toast';

export default function PickupScanner({ onClose, onVerified }) {
  const [scanResult, setScanResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [manualToken, setManualToken] = useState({ id: '', token: '' });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(result) {
      scanner.clear();
      handleVerification(result);
    }

    function onScanError(err) {
      // Keep scanning
    }

    return () => {
      scanner.clear().catch(error => console.error("Scanner cleanup failed", error));
    };
  }, []);

  const handleVerification = async (scannedData = null, manualId = '', manualTokenVal = '') => {
    try {
      setVerifying(true);
      let orderId = manualId;
      let token = manualTokenVal;

      if (scannedData) {
        // Data format from QR: ORDER_ID:xyz|TOKEN:V-abc
        const orderIdMatch = scannedData.match(/ORDER_ID:([^|]+)/);
        const tokenMatch = scannedData.match(/TOKEN:([^|]+)/);

        if (!orderIdMatch || !tokenMatch) {
           toast.error("Invalid QR Code Format");
           return;
        }
        orderId = orderIdMatch[1];
        token = tokenMatch[1];
      }

      const finalId = orderId || token;
      const finalToken = token || orderId;

      if (!finalId) {
        toast.error("Order ID or Token is required");
        return;
      }

      // If they only entered one field, allow it for "Smart Search"
      const res = await verifyPickupOrder(finalId, finalToken);
      if (res.success) {
        setVerifiedOrder(res.data);
        toast.success("Order Verified Successfully!");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      const msg = error.response?.data?.message || error.message || "Verification failed";
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmHandover = async () => {
    try {
      setVerifying(true);
      // Update status to delivered and payment to Paid if it was Cash on Pickup
      const payload = {
        orderStatus: 'delivered',
        paymentStatus: verifiedOrder.paymentMethod === 'CASH_ON_PICKUP' ? 'Paid' : verifiedOrder.paymentStatus
      };
      
      await updateOrderStatus(verifiedOrder._id, payload);
      toast.success("Handover confirmed! Order finalized.");
      onVerified();
      onClose();
    } catch (error) {
      toast.error("Failed to confirm handover");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Security Checkpoint</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Authorized Handover Only</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {!verifiedOrder ? (
            <div className="space-y-6">
              <div id="reader" className="w-full overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50" />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400"><span className="bg-white dark:bg-slate-900 px-4 tracking-[0.3em]">Or Manual Entry</span></div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Order ID" 
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none"
                  onChange={(e) => setManualToken(prev => ({ ...prev, id: e.target.value }))}
                />
                <input 
                  type="text" 
                  placeholder="V-XXXXXX" 
                  className="w-32 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none"
                  onChange={(e) => setManualToken(prev => ({ ...prev, token: e.target.value }))}
                />
                <button 
                  onClick={() => handleVerification(null, manualToken.id, manualToken.token)}
                  className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                >
                  <CheckCircle size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-impact text-black dark:text-white uppercase tracking-tight">Identity Confirmed</h4>
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Protocol #V-{verifiedOrder._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <User size={16} />
                      <span className="text-xs font-bold">{verifiedOrder.user?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Package size={16} />
                      <span className="text-xs font-bold">{verifiedOrder.items?.length} Items Verified</span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${verifiedOrder.paymentStatus === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 animate-pulse'}`}>
                      <CreditCard size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">
                        {verifiedOrder.paymentStatus === 'Paid' ? 'Fully Paid' : `Payment Req: ₹${verifiedOrder.totalAmount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
               </div>

               <div className="flex gap-4">
                 <button 
                  onClick={() => setVerifiedOrder(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                 >
                   Reset
                 </button>
                 <button 
                  onClick={handleConfirmHandover}
                  disabled={verifying}
                  className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2"
                 >
                   {verifying ? <Loader2 className="animate-spin" size={14} /> : <Package size={14} />}
                   Confirm Handover
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
