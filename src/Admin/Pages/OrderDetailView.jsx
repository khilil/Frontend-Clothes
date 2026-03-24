import React, { useState } from 'react';
import { 
  ArrowLeft, User, MapPin, Phone, Mail, 
  CreditCard, Package, Ruler, Info, CheckCircle, 
  Clock, Truck, Download, FileText, Send, Trash2
} from 'lucide-react';
import { StatusBadge, PriorityBadge, CustomDesignBadge } from '../components/OrderBadges';
import { updateOrderStatus, markOrderQC, addOrderNote, addCustomerNote, updateOrderPriority } from '../../services/orderService';
import { generateInvoiceHTML, generateShippingLabelHTML, generatePackingSlipHTML } from '../utils/invoiceUtils';

const TimelineStep = ({ status, active, completed, date }) => (
  <div className="flex flex-col items-center gap-2 flex-1 relative">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
      completed ? 'bg-emerald-500 border-emerald-500 text-white' : 
      active ? 'bg-indigo-600 border-indigo-600 text-white' : 
      'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
    }`}>
      {completed ? <CheckCircle size={16} /> : active ? <Clock size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
    </div>
    <div className="text-center">
      <p className={`text-[10px] font-bold uppercase tracking-wider ${active || completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
        {status}
      </p>
      {date && <p className="text-[9px] text-slate-400 mt-0.5">{new Date(date).toLocaleDateString()}</p>}
    </div>
    {/* Connector Line */}
    <div className="absolute top-4 -right-1/2 w-full h-[2px] bg-slate-100 dark:bg-slate-800 -z-10 hidden md:block opacity-50 last:hidden" />
  </div>
);

export default function OrderDetailView({ order: initialOrder, onBack }) {
  const [order, setOrder] = useState(initialOrder);
  const [newNote, setNewNote] = useState('');
  const [newCustomerNote, setNewCustomerNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const steps = ["placed", "ready-to-ship", "shipped", "delivered"];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await updateOrderStatus(order._id, { status: newStatus });
      setOrder(res.data);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkQC = async () => {
    try {
      setUpdating(true);
      const res = await markOrderQC(order._id);
      setOrder(res.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async (newPriority) => {
    try {
      setUpdating(true);
      const res = await updateOrderPriority(order._id, newPriority);
      setOrder(res.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await addOrderNote(order._id, newNote);
      setOrder(res.data);
      setNewNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomerNote = async (e) => {
    e.preventDefault();
    if (!newCustomerNote.trim()) return;
    try {
      const res = await addCustomerNote(order._id, newCustomerNote);
      setOrder(res.data);
      setNewCustomerNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateInvoice = () => {
    const html = generateInvoiceHTML(order);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  const handleDownloadShippingLabel = () => {
    const html = generateShippingLabelHTML(order);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  const handleDownloadPackingSlip = () => {
    const html = generatePackingSlipHTML(order);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <div className="flex items-center gap-3">
          {['placed', 'ready-to-ship'].includes(order.orderStatus) && !order.qualityCheck?.isApproved && (
             <button 
              onClick={handleMarkQC}
              disabled={updating}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
             >
                <CheckCircle size={14} /> Mark QC OK
             </button>
          )}

          <button onClick={handleDownloadShippingLabel} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold shadow-sm" title="Shipping Label">
            <Truck size={16} />
          </button>
          
          <button onClick={handleDownloadPackingSlip} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold shadow-sm" title="Packing Slip">
            <Package size={16} />
          </button>

          <button 
            onClick={handleGenerateInvoice}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm border border-slate-800"
          >
            <FileText size={14} /> Invoice
          </button>
          
          <select 
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={order.orderStatus}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updating}
          >
            {steps.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* 2. Timeline Tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-start">
           {steps.map((step, idx) => (
             <TimelineStep
                key={step}
                status={step.charAt(0).toUpperCase() + step.slice(1)}
                active={order.orderStatus === step}
                completed={idx < currentStepIndex || order.orderStatus === 'delivered'}
             />
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-6 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
               <Package size={14} /> Products in Order
             </div>
             <div className="space-y-6">
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex flex-col gap-6">
                   <div className="flex gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                      <div className="w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden relative group">
                        <img src={item.imageURL || item.image} className="w-full h-full object-cover" alt={item.title || item.name} />
                        {item.isCustom && <div className="absolute top-2 right-2"><CustomDesignBadge /></div>}
                      </div>
                      <div className="flex-1 flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{item.title || item.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 block mt-1 uppercase tracking-widest">SKU: {item.variantId}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{(item.priceAtPurchase || 0).toLocaleString()}</p>
                          <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity}</p>
                        </div>
                      </div>
                   </div>

                   {/* Custom Design System (If Custom) */}
                   {item.isCustom && (
                     <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-6">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                            🎨 Custom Design Specs
                          </h5>
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all">
                             <Download size={14} /> Download Ready-to-Print
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Front Preview</p>
                             <div className="aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden p-2">
                                <img src={item.customDesign?.frontPreview} className="w-full h-full object-contain" alt="Front" />
                             </div>
                           </div>
                           <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Back Preview</p>
                             <div className="aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden p-2">
                                <img src={item.customDesign?.backPreview} className="w-full h-full object-contain" alt="Back" />
                             </div>
                           </div>
                           <div className="space-y-4">
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Design Metadata</p>
                                <div className="space-y-2">
                                   <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500">Res</span>
                                      <span className="font-bold">{item.customDesign?.metadata?.resolution}</span>
                                   </div>
                                   <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500">DPI</span>
                                      <span className="font-bold">{item.customDesign?.metadata?.dpi} DP</span>
                                   </div>
                                   <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500">Transparency</span>
                                      <span className="font-bold text-emerald-500">PASSED</span>
                                   </div>
                                </div>
                              </div>
                              <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-500 hover:text-indigo-500 hover:border-indigo-500 transition-all uppercase flex items-center justify-center gap-2">
                                 <FileText size={12} /> View Raw JSON
                              </button>
                           </div>
                        </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>

          {/* Activity Log / Internal Notes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                 <FileText size={14} /> Internal Notes
               </div>
               <span className="text-[10px] text-slate-400 italic">Admin Only Access</span>
             </div>

             <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {order.internalNotes?.length > 0 ? order.internalNotes.map((note, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{note.author}</span>
                      <span className="text-[9px] text-slate-400 font-medium uppercase">{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{note.note}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic text-center py-8">No notes added yet.</p>
                )}
             </div>

             <form onSubmit={handleAddNote} className="relative">
                <textarea
                  placeholder="Add an internal note..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pr-16 min-h-[100px]"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <Send size={18} />
                </button>
             </form>
          </div>

          {/* Customer Communications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mt-6">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
                 <Send size={14} /> Customer Communication Hub
               </div>
               <span className="text-[10px] text-slate-400 italic">Visible to Customer</span>
             </div>

             <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {order.customerNotes?.length > 0 ? order.customerNotes.map((note, idx) => (
                  <div key={idx} className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100">{note.author}</span>
                       <span className="text-[9px] text-indigo-400 font-medium uppercase">{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-indigo-800/80 dark:text-indigo-200/80 leading-relaxed">{note.note}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic text-center py-8">No messages sent to the customer yet.</p>
                )}
             </div>

             <form onSubmit={handleAddCustomerNote} className="relative">
                <textarea
                  placeholder="Send an update to the customer..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pr-16 min-h-[100px]"
                  value={newCustomerNote}
                  onChange={(e) => setNewCustomerNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <Send size={18} />
                </button>
             </form>
          </div>
        </div>

        {/* Right Column (Side Detail Cards) */}
        <div className="space-y-6">
           {/* QC & Status Summary Card */}
           <div className="bg-indigo-600 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg shadow-indigo-600/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10 space-y-4">
                 <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Operational Status</p>
                    {order.qualityCheck?.isApproved ? (
                       <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-400/30 flex items-center gap-1">
                         <CheckCircle size={10} /> QC OK
                       </span>
                    ) : (
                       <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1">
                         <Clock size={10} /> PENDING QC
                       </span>
                    )}
                 </div>
                 <h2 className="text-2xl font-black uppercase">{order.orderStatus}</h2>
                  <div className="flex items-center gap-3">
                     <select 
                       value={order.priority}
                       onChange={(e) => handlePriorityUpdate(e.target.value)}
                       disabled={updating}
                       className="bg-white/10 border-none rounded-lg text-[10px] font-black uppercase tracking-widest text-white focus:ring-0 cursor-pointer"
                     >
                        <option value="Low" className="text-slate-900">Low Priority</option>
                        <option value="Medium" className="text-slate-900">Medium Priority</option>
                        <option value="High" className="text-slate-900">High Priority</option>
                     </select>
                     <span className="w-1 h-1 rounded-full bg-white/30" />
                     <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">SLA: On-Time</span>
                  </div>
              </div>
           </div>

           {/* Customer Card */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-6 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
               <User size={14} /> Customer Profile
             </div>
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-lg uppercase shadow-inner">
                   {order.user?.fullName?.charAt(0) || order.shippingAddress?.fullName?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white leading-none mb-1">{order.user?.fullName || order.shippingAddress?.fullName}</h4>
                  <span className="text-xs text-slate-400 font-medium">Verified Customer</span>
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><Mail size={16} /></div>
                   <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Email</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{order.user?.email}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><Phone size={16} /></div>
                   <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Phone</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{order.shippingAddress?.phone}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><MapPin size={16} /></div>
                   <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Shipping Address</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                        {order.shippingAddress?.addressLine}<br/>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                      </p>
                   </div>
                </div>
             </div>
           </div>

           {/* Payment Card */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <CreditCard size={14} /> Financial Snapshot
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex justify-between items-center">
                     <div>
                        <p className="text-[10px] text-emerald-600/60 font-black uppercase mb-1">Payment Status</p>
                        <span className="text-sm font-black text-emerald-600 uppercase">{order.paymentStatus}</span>
                     </div>
                    <CheckCircle className="text-emerald-500" size={24} />
                 </div>

                 <div className="space-y-2 border-t border-slate-50 dark:border-slate-800 pt-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">Subtotal</span>
                       <span className="font-bold">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">Shipping</span>
                       <span className="font-bold text-emerald-500">FREE</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-800 pt-2 mt-2">
                       <span className="text-slate-900 dark:text-white font-bold uppercase tracking-wider">Total Amount</span>
                       <span className="font-black text-indigo-600 text-base">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                 </div>

                  <div className="text-[9px] text-slate-400 space-y-1 pt-4 opacity-70 italic">
                     <p>Method: {order.paymentMethod}</p>
                     <p>Order ID: {order._id}</p>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
