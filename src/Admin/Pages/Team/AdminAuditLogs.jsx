import React, { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, AlertTriangle, Info, CheckCircle2, User, Clock, Filter, Trash2 } from 'lucide-react';
import { getAuditLogs, clearAuditLogs } from '../../utils/auditLogger';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const handleClear = () => {
    if (window.confirm("CRITICAL: Permanent deletion of operational logs requested. Authorize?")) {
      clearAuditLogs();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeStyles = (type) => {
    switch (type) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle size={14} />;
      case 'WARNING': return <ShieldCheck size={14} />;
      case 'SUCCESS': return <CheckCircle2 size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 p-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Audit & Accountability</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Immutable timeline of administrative operations</p>
        </div>
        <button 
          onClick={handleClear}
          className="px-4 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
        >
          <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
          Purge History
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search operational logs..." 
            className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'CRITICAL'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filterType === type 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' 
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 z-0" />
        
        <div className="space-y-6 relative z-10">
          {filteredLogs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <History size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Timeline Depleted</h3>
              <p className="text-sm text-slate-500 mt-1">No operational anomalies recorded within this scope.</p>
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={log.id} className="flex gap-6 group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex-none pt-2 relative">
                   <div className={`size-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${getTypeStyles(log.type).split(' ').slice(0,1).join(' ')}`}>
                      {getTypeIcon(log.type)}
                   </div>
                </div>
                
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getTypeStyles(log.type)}`}>
                         {log.type}
                       </span>
                       <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.action}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                       <div className="flex items-center gap-1.5">
                         <User size={14} />
                         <span className="font-bold text-slate-700 dark:text-slate-300">{log.user}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <Clock size={14} />
                         <span>{new Date(log.timestamp).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                      "{log.details}"
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
