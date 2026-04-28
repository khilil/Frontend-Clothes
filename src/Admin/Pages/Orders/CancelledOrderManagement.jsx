import React, { useState } from 'react';
import CancelledOrders from './CancelledOrders';
import OrderDetailView from '../OrderDetailView';

export default function CancelledOrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Cancelled Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Full operational log for cancelled orders and customer context.</p>
        </div>
        <div className="px-4 py-2 bg-rose-600/10 text-rose-600 rounded-xl text-xs font-bold border border-rose-600/20 uppercase tracking-widest">
            Protocol: Aborted
        </div>
      </div>

      <CancelledOrders onSelectOrder={(order) => setSelectedOrder(order)} />
    </div>
  );
}
