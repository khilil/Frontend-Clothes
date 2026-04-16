import React, { useState } from 'react';
import OrderHub from '../../components/OrderHub';
import CustomProductionDetails from './CustomProductionDetails';
import { Palette, Box, CheckCircle2 } from 'lucide-react';

export default function CustomOrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (selectedOrder) {
    return (
      <CustomProductionDetails 
        order={selectedOrder} 
        onBack={() => setSelectedOrder(null)} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600/10 text-indigo-600 rounded-lg">
              <Palette size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 opacity-70">
              Production Workflow
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Custom Design Orders
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1 max-w-2xl">
            Dedicated queue for orders requiring graphic inspection, design confirmation, and physical printing.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
           <div className="flex flex-col px-4 border-r border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Queue</span>
              <span className="text-lg font-black text-indigo-600">Custom Mode</span>
           </div>
           <div className="px-4">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                 <CheckCircle2 size={14} /> LIVE DESIGN SYNC
              </div>
           </div>
        </div>
      </div>

      {/* Stats Summary specifically for Custom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
            <Palette className="absolute -right-4 -bottom-4 size-32 text-white/10 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Printing Queue</p>
            <h3 className="text-3xl font-black">All Designs</h3>
            <p className="text-xs mt-1 font-medium italic opacity-80">Ready for confirmation</p>
         </div>
         
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Detailing Pending</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Active</h3>
            <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
               <div className="h-full w-2/3 bg-amber-500 rounded-full" />
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Verified Prints</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Completed</h3>
            <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
               <div className="h-full w-full bg-emerald-500 rounded-full" />
            </div>
         </div>
      </div>

      {/* The Order Hub locked to Custom tab (UI Hack: We'll tell OrderHub to start on Custom) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
            <Box size={18} className="text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-widest">Order Verification Matrix</h2>
         </div>
         <OrderHub 
           onSelectOrder={(order) => setSelectedOrder(order)} 
           defaultTab="Custom Design 🎨" 
         />
      </div>
    </div>
  );
}
