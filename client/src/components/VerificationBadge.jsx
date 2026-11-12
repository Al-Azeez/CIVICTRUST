import React from 'react';
import { ShieldCheck, AlertTriangle, RotateCcw, Clock, MapPin, XCircle, Sparkles } from 'lucide-react';

const VerificationBadge = ({ status, verificationStatus, confidence, size = 'normal' }) => {
  const currentStatus = (verificationStatus || status || '').toUpperCase();
  const textSize = size === 'small' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';
  const iconSize = size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (currentStatus === 'VERIFIED' || status === 'RESOLVED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] ${textSize}`}>
        <ShieldCheck className={`${iconSize} text-emerald-400 shrink-0`} />
        <span>Verified Clean</span>
        {confidence ? <span className="text-emerald-400 font-mono">({confidence}%)</span> : null}
      </span>
    );
  }

  if (currentStatus === 'LOCATION MISMATCH' || currentStatus === 'LOCATION_MISMATCH') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)] animate-pulse ${textSize}`}>
        <MapPin className={`${iconSize} text-rose-400 shrink-0`} />
        <span>⚠ Location Mismatch</span>
      </span>
    );
  }

  if (currentStatus === 'TIMELINE MISMATCH' || currentStatus === 'TIMELINE_MISMATCH') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] ${textSize}`}>
        <Clock className={`${iconSize} text-amber-400 shrink-0`} />
        <span>⚠ Timeline Mismatch</span>
      </span>
    );
  }

  if (currentStatus === 'IMAGE VERIFICATION FAILED' || currentStatus === 'IMAGE_VERIFICATION_FAILED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)] ${textSize}`}>
        <XCircle className={`${iconSize} text-rose-400 shrink-0`} />
        <span>Image Failed</span>
      </span>
    );
  }

  if (currentStatus === 'REQUIRES HUMAN REVIEW' || currentStatus === 'UNVERIFIED' || currentStatus === 'SUSPICIOUS') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)] animate-pulse ${textSize}`}>
        <AlertTriangle className={`${iconSize} text-rose-400 shrink-0`} />
        <span>Unverified — Audit Req.</span>
        {confidence ? <span className="text-rose-400 font-mono">({confidence}%)</span> : null}
      </span>
    );
  }

  if (currentStatus === 'REVERIFICATION_REQUIRED' || currentStatus === 'REOPENED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-orange-950/80 border border-orange-500/50 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.25)] ${textSize}`}>
        <RotateCcw className={`${iconSize} text-orange-400 shrink-0`} />
        <span>Re-verification Required</span>
      </span>
    );
  }

  if (currentStatus === 'RECURRING') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)] ${textSize}`}>
        <RotateCcw className={`${iconSize} text-purple-400 shrink-0`} />
        <span>Recurring Hotspot</span>
      </span>
    );
  }

  if (status === 'IN_PROGRESS') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] ${textSize}`}>
        <Clock className={`${iconSize} text-cyan-400 shrink-0`} />
        <span>In Progress</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-xl bg-[#060913] border border-white/10 text-slate-300 ${textSize}`}>
      <Clock className={`${iconSize} text-slate-400 shrink-0`} />
      <span>Pending Resolution</span>
    </span>
  );
};

export default VerificationBadge;
