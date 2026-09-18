import React from 'react';
import { ShieldCheck, AlertTriangle, RotateCcw, Clock, CheckCircle } from 'lucide-react';

const VerificationBadge = ({ status, verificationStatus, confidence, size = 'normal' }) => {
  const isSuspicious = status === 'SUSPICIOUS' || verificationStatus === 'SUSPICIOUS';
  const isVerified = status === 'VERIFIED' || status === 'RESOLVED' || verificationStatus === 'VERIFIED';
  const isReopened = status === 'REOPENED';

  if (isSuspicious) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 shadow-sm shadow-rose-950 ${
          size === 'small' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertTriangle className={`${size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-rose-400 shrink-0 animate-pulse`} />
        <span>⚠️ Suspicious Resolution</span>
        {confidence ? <span className="text-rose-400/90 font-mono">({confidence}%)</span> : null}
      </span>
    );
  }

  if (isReopened) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-sm shadow-amber-950 ${
          size === 'small' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <RotateCcw className={`${size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400 shrink-0`} />
        <span>Citizen Reopened</span>
      </span>
    );
  }

  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950 ${
          size === 'small' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <ShieldCheck className={`${size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-400 shrink-0`} />
        <span>✅ Verified Resolved</span>
        {confidence ? <span className="text-emerald-400/90 font-mono">({confidence}%)</span> : null}
      </span>
    );
  }

  if (status === 'IN_PROGRESS') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-300 ${
          size === 'small' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Clock className={`${size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-sky-400 shrink-0`} />
        <span>In Progress</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-slate-900 border border-slate-700 text-slate-300 ${
        size === 'small' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Clock className={`${size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-400 shrink-0`} />
      <span>Pending Resolution</span>
    </span>
  );
};

export default VerificationBadge;
