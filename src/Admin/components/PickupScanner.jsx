import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { X, CheckCircle, AlertCircle, Loader2, Package, User, CreditCard, Camera, StopCircle, RefreshCw } from 'lucide-react';
import { verifyPickupOrder, updateOrderStatus } from '../../services/orderService';
import toast from 'react-hot-toast';

export default function PickupScanner({ onClose, onVerified }) {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [manualToken, setManualToken] = useState({ id: '', token: '' });
  const [scannerError, setScannerError] = useState(null);
  
  const scannerRef = useRef(null);
  const readerId = "reader";

  // Check if context is secure for camera access
  const isSecureContext = window.isSecureContext;

  const startScanner = async () => {
    try {
      setScannerError(null);
      if (!isSecureContext && window.location.hostname !== 'localhost') {
        setScannerError("Camera access requires HTTPS. Please use a secure connection.");
        return;
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId);
      }

      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setScannerError(err.message || "Failed to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  function onScanSuccess(result) {
    stopScanner();
    handleVerification(result);
  }

  function onScanError(err) {
    // Keep scanning - standard behavior
  }

  useEffect(() => {
    return () => {
      // Cleanup: Stop scanner if it's running when component unmounts
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
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
        console.log("🛠️ DEBUG PICKUP DATA:", res.data);
        toast.success("Identity Verified!");
        // Small delay for the toast to be seen before redirect
        setTimeout(() => {
          navigate(`/admin/pickups/handover/${res.data._id}`);
          onClose(); // Close the scanner modal
        }, 800);
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
        status: 'delivered', 
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
          {!verifiedOrder && (
            <div className="space-y-6">
              <div className="relative group min-h-[250px] rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-950/50 border-2 border-dashed border-slate-200 dark:border-slate-800">
                {/* 🎯 Dedicated Scanner Container (Empty for React) */}
                <div 
                  id={readerId} 
                  className={`w-full h-full ${isScanning ? 'block' : 'hidden'}`}
                />

                {/* 🛠️ Activation / Error Overlays (Separate from Reader DOM) */}
                {!isScanning && !scannerError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Camera Inactive</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 mb-6">Permission required to scan units</p>
                    <button 
                      onClick={startScanner}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Camera size={14} />
                      Activate Lens
                    </button>
                  </div>
                )}

                {scannerError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-rose-500/5 backdrop-blur-[2px] z-20">
                    <div className="w-16 h-16 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-600 mb-4">
                      <AlertCircle size={32} />
                    </div>
                    <h4 className="text-sm font-black text-rose-600 uppercase tracking-tight">Access Denied</h4>
                    <p className="text-[10px] text-rose-500/70 font-bold uppercase tracking-widest mt-1 mb-6 max-w-[200px] leading-relaxed">{scannerError}</p>
                    <button 
                      onClick={startScanner}
                      className="px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Retry Sync
                    </button>
                  </div>
                )}

                {isScanning && (
                  <button 
                    onClick={stopScanner}
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-rose-600 transition-all z-30"
                    title="Stop Camera"
                  >
                    <StopCircle size={18} />
                  </button>
                )}
              </div>
              
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
          )}
        </div>
      </div>
    </div>
  );
}
