import React, { useState } from 'react';
import OrderHub from '../../components/OrderHub';
import OrderDetailView from '../OrderDetailView';

export default function OrderManagement() {
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Order Management Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Full-scale operational control and fulfillment suite.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-600/10 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-600/20 uppercase tracking-widest">
            Order Desk: Live
        </div>
      </div>

      <OrderHub onSelectOrder={(order) => setSelectedOrder(order)} />
    </div>
  );
}
