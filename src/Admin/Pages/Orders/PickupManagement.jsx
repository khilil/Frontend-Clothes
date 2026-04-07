import React, { useState } from 'react';
import OrderHub from '../../components/OrderHub';
import OrderDetailView from '../OrderDetailView';
import PickupScanner from '../../components/PickupScanner';
import { QrCode } from 'lucide-react';

export default function PickupManagement() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (selectedOrder) {
    return (
      <OrderDetailView 
        order={selectedOrder} 
        onBack={() => setSelectedOrder(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Store Pickup Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Dedicated hub for in-store collection and fulfillment.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowScanner(true)}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 flex items-center gap-2 group"
          >
            <QrCode size={16} className="group-hover:scale-110 transition-transform" />
            Launch Scanner
          </button>
          <div className="px-4 py-2.5 bg-purple-600/10 text-purple-600 rounded-xl text-xs font-bold border border-purple-600/20 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Pickup Desk: Active
          </div>
        </div>
      </div>

      <OrderHub 
        key={refreshKey}
        onSelectOrder={(order) => setSelectedOrder(order)} 
        orderType="PICKUP"
      />

      {showScanner && (
        <PickupScanner 
          onClose={() => setShowScanner(false)} 
          onVerified={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
}
