import React from 'react';

/**
 * Skeleton Components for Admin Panel
 * Provides premium-feel loading states with shimmering animations.
 */

export const KPICardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse w-12 h-12" />
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-24" />
      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-32" />
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-40" />
    </div>
    {/* Shimmer effect overlay */}
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col justify-between">
    <div className="space-y-2 mb-8">
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-48" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-32" />
    </div>
    <div className="flex-1 flex items-end gap-2 px-2">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t animate-pulse" 
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
    <div className="mt-4 flex justify-between">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-10" />
      ))}
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-32" />
    </div>
    <div className="p-0">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-6 border-b border-slate-50 dark:border-slate-800 last:border-0">
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/4" />
          </div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-16" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-24" />
        </div>
      ))}
    </div>
  </div>
);
