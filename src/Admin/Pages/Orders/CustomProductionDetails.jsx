import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, CheckCircle2, AlertCircle, 
  Printer, Palette, StickyNote, Box, ShieldCheck,
  ChevronRight, RefreshCcw, Save
} from 'lucide-react';
import * as orderService from '../../../services/orderService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { CustomDesignBadge } from '../../components/OrderBadges';

export default function CustomProductionDetails({ order, onBack }) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [productionNotes, setProductionNotes] = useState('');
  const [techSpecs, setTechSpecs] = useState({
    gsm: '180',
    printType: 'DTF',
    fabric: '100% Cotton',
    inkType: 'Premium Pigment'
  });

  // Sync internal state if order changes
  useEffect(() => {
    if (order) setCurrentOrder(order);
  }, [order]);

  const handleConfirmDesign = async () => {
    setIsUpdating(true);
    try {
      // Add a system note and update status
      await orderService.addOrderNote(currentOrder._id, `✅ DESIGN CONFIRMED: Ready for production. Specs: ${techSpecs.printType}, ${techSpecs.gsm} GSM.`);
      const res = await orderService.updateOrderStatus(currentOrder._id, { status: 'in-production' });
      
      // Update local state
      setCurrentOrder(prev => ({ ...prev, orderStatus: 'in-production' }));
      alert("Design Confirmed! Order moved to In-Production.");
    } catch (err) {
      console.error("Failed to confirm design", err);
      alert("Confirmation failed. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSpecs = async () => {
    setIsUpdating(true);
    try {
      const noteText = `🛠️ PRODUCTION SPECS: Fabric: ${techSpecs.fabric}, GSM: ${techSpecs.gsm}, Print: ${techSpecs.printType}`;
      await orderService.addOrderNote(currentOrder._id, noteText);
      alert("Production specs saved as a private note.");
    } catch (err) {
      console.error("Save specs failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePostNote = async () => {
    if (!productionNotes.trim()) return;
    setIsUpdating(true);
    try {
      await orderService.addOrderNote(currentOrder._id, productionNotes);
      setProductionNotes('');
      alert("Production note added.");
    } catch (err) {
      console.error("Note failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = async (url, fileName) => {
    if (!url) {
      alert("Asset URL not found. Please ensure the design has been processed.");
      return;
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'design-asset.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      // Fallback: Open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm"
        >
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 transition-colors">
            <ArrowLeft size={18} />
          </div>
          Back to Custom Queue
        </button>

        <div className="flex flex-col items-end">
           <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Order {currentOrder.orderNumber || `#${currentOrder._id.slice(-8)}`}
           </h1>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production Workspace</span>
        </div>

        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Stage</span>
           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
             currentOrder.orderStatus === 'in-production' 
             ? 'bg-emerald-500 text-white border-emerald-600' 
             : 'bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-600/20'
           }`}>
              {currentOrder.orderStatus}
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Designs & Assets */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Design Verification Center */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/10 text-indigo-600 rounded-lg">
                    <Palette size={20} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest">Visual Inspection</h2>
               </div>
               <div className="flex items-center gap-2">
                  <CustomDesignBadge />
               </div>
            </div>

            <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Front Side */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Front Canvas</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                           <ShieldCheck size={12} /> VERIFIED
                        </div>
                     </div>
                     <div className="aspect-[3/4] rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 relative group">
                        <img loading="lazy" 
                          src={currentOrder.items[0]?.customizations?.displayPreviews?.front || currentOrder.items[0]?.customDesign?.frontPreview} 
                          className="w-full h-full object-contain" 
                          alt="Front" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl backdrop-blur-sm">
                           <button 
                             onClick={() => handleDownload(currentOrder.items[0]?.customizations?.displayPreviews?.front || currentOrder.items[0]?.customDesign?.frontPreview, `Front_Preview_${currentOrder._id.slice(-6)}.png`)}
                             className="p-4 bg-white rounded-2xl shadow-2xl hover:scale-110 transition-transform"
                           >
                              <Download className="text-indigo-600" />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Back Side */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Back Canvas</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Optional</span>
                     </div>
                     <div className="aspect-[3/4] rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 relative group">
                        {currentOrder.items[0]?.customizations?.displayPreviews?.back || currentOrder.items[0]?.customDesign?.backPreview ? (
                           <>
                             <img loading="lazy" 
                               src={currentOrder.items[0]?.customizations?.displayPreviews?.back || currentOrder.items[0]?.customDesign?.backPreview} 
                               className="w-full h-full object-contain" 
                               alt="Back" 
                             />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl backdrop-blur-sm">
                                <button 
                                  onClick={() => handleDownload(currentOrder.items[0]?.customizations?.displayPreviews?.back || currentOrder.items[0]?.customDesign?.backPreview, `Back_Preview_${currentOrder._id.slice(-6)}.png`)}
                                  className="p-4 bg-white rounded-2xl shadow-2xl hover:scale-110 transition-transform"
                                >
                                   <Download className="text-indigo-600" />
                                </button>
                             </div>
                           </>
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 italic text-xs">
                              <Box size={32} className="mb-2 opacity-20" />
                              No Back Design
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                 onClick={() => handleDownload(currentOrder.items[0]?.customizations?.printFiles?.front, `Front_Print_Ready_${currentOrder._id.slice(-6)}.png`)}
                 className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
               >
                  <Download size={18} /> High-Res Front Png
               </button>
               <button 
                 onClick={() => handleDownload(currentOrder.items[0]?.customizations?.printFiles?.back, `Back_Print_Ready_${currentOrder._id.slice(-6)}.png`)}
                 className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
               >
                  <Download size={18} /> High-Res Back Png
               </button>
            </div>
          </div>

          {/* 2. Technical Detailing Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
               <div className="p-2 bg-amber-600/10 text-amber-600 rounded-lg">
                 <Printer size={20} />
               </div>
               <h2 className="text-sm font-black uppercase tracking-widest">Production Detailing</h2>
            </div>
            
            <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Printing Technique</label>
                     <select 
                       value={techSpecs.printType}
                       onChange={e => setTechSpecs({...techSpecs, printType: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                     >
                        <option value="DTF">Direct to Film (DTF)</option>
                        <option value="DTG">Direct to Garment (DTG)</option>
                        <option value="Screen Print">Premium Screen Print</option>
                        <option value="Embroidery">Embroidery</option>
                        <option value="Puff Print">Puff / 3D Print</option>
                     </select>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fabric Quality (GSM)</label>
                     <div className="relative">
                        <input 
                          type="text"
                          value={techSpecs.gsm}
                          onChange={e => setTechSpecs({...techSpecs, gsm: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all pl-10"
                        />
                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Material</label>
                     <input 
                       type="text"
                       value={techSpecs.fabric}
                       onChange={e => setTechSpecs({...techSpecs, fabric: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ink Configuration</label>
                     <input 
                       type="text"
                       value={techSpecs.inkType}
                       onChange={e => setTechSpecs({...techSpecs, inkType: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                     />
                  </div>
               </div>
               
               <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button 
                    onClick={handleSaveSpecs}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                  >
                     <Save size={16} /> Save Production Specs
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Actions */}
        <div className="space-y-8">
           
           {/* 1. Decision Center */}
           <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-48 bg-indigo-600 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative z-10 space-y-6">
                 <div>
                    <h3 className="text-xl font-black tracking-tight">Design Review</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Final Authorization Step</p>
                 </div>

                 <div className="pt-4 space-y-3">
                    <button 
                      onClick={handleConfirmDesign}
                      disabled={isUpdating || currentOrder.orderStatus === 'in-production'}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${
                        currentOrder.orderStatus === 'in-production'
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'
                      }`}
                    >
                       {currentOrder.orderStatus === 'in-production' ? (
                         <><CheckCircle2 size={18} /> CONFIRMED</>
                       ) : (
                         <><ShieldCheck size={18} /> Confirm Design & Print</>
                       )}
                    </button>
                    {!['in-production', 'shipped', 'delivered'].includes(currentOrder.orderStatus) && (
                      <button className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Request Redesign
                      </button>
                    )}
                 </div>
                 
                 <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-tighter justify-center italic">
                    <AlertCircle size={10} /> After confirmation, assets are locked for printing
                 </div>
              </div>
           </div>

           {/* 2. Production Communicator */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                 <StickyNote size={14} className="text-indigo-600" /> Detailing Log
              </h3>
              <textarea 
                value={productionNotes}
                onChange={e => setProductionNotes(e.target.value)}
                placeholder="Add special instructions for the print shop..."
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-indigo-600/10 outline-none resize-none min-h-[120px]"
              />
              <button 
                onClick={handlePostNote}
                disabled={isUpdating || !productionNotes.trim()}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                 Push Instruction
              </button>
           </div>

           {/* 3. Order Reference Info */}
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Reference Context</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-black text-slate-900 dark:text-white">#{currentOrder._id.slice(-8).toUpperCase()}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Value:</span>
                    <span className="font-black text-indigo-600">{formatCurrency(currentOrder.totalAmount)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Base Unit:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{currentOrder.items?.[0]?.title}</span>
                 </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                 <RefreshCcw size={10} /> Auto-Syncs with warehouse
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
