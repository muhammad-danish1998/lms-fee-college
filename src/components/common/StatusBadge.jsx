import React from 'react';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  const normStatus = (status || '').toUpperCase();

  switch (normStatus) {
    case 'PAID IN FULL':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          PAID IN FULL
        </span>
      );
    case 'DUE':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          DUE
        </span>
      );
    case 'OVERDUE':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/30 animate-pulse ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          OVERDUE
        </span>
      );
    case 'UNPAID':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-950/80 text-orange-300 border border-orange-500/30 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          UNPAID
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
          {status || 'UNKNOWN'}
        </span>
      );
  }
}
