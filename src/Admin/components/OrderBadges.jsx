import React from 'react';
import { Globe, MessageCircle, Instagram } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const styles = {
    placed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "ready-to-ship": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    shipped: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    delivered: "bg-emerald-600/10 text-emerald-400 border-emerald-600/20",
    cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    "return requested": "bg-pink-500/10 text-pink-500 border-pink-500/20",
    refunded: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    // Backward compatibility for capitalized
    Placed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || styles.Placed}`}>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    High: "text-rose-500",
    Medium: "text-amber-500",
    Low: "text-emerald-500",
  };

  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-bold ${styles[priority]}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      {priority}
    </span>
  );
};

export const CustomDesignBadge = () => (
  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase flex items-center gap-1">
    <span>🎨</span> Custom
  </span>
);

export const SLABadge = ({ expectedDate }) => {
  const isDelayed = new Date() > new Date(expectedDate);
  return (
    <span className={`text-[10px] font-bold ${isDelayed ? 'text-rose-500' : 'text-slate-400'}`}>
      {isDelayed ? 'DELAYED' : 'ON-TIME'}
    </span>
  );
};

export const SourceBadge = ({ source = 'Web' }) => {
  const configs = {
    Web: { icon: Globe, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    WhatsApp: { icon: MessageCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    Instagram: { icon: Instagram, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
  };

  const { icon: Icon, color } = configs[source] || configs.Web;

  return (
    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${color}`}>
      <Icon size={12} />
      {source}
    </span>
  );
};
