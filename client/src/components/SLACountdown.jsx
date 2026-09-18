import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

const SLACountdown = ({
  submittedAt,
  slaDeadline,
  category,
  slaHours,
  status,
  resolvedAt,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    formatted: '',
    state: 'WITHIN_SLA',
    percentElapsed: 0,
    isBreached: false,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const subTime = new Date(submittedAt).getTime();
      const deadTime = new Date(slaDeadline).getTime();
      const totalDuration = deadTime - subTime;
      
      const isResolved = status === 'RESOLVED' || status === 'VERIFIED';
      const effectiveEnd = isResolved && resolvedAt ? new Date(resolvedAt).getTime() : now.getTime();
      
      const remainingMs = deadTime - effectiveEnd;
      const elapsedMs = effectiveEnd - subTime;
      const percent = Math.min(100, Math.max(0, (elapsedMs / totalDuration) * 100));
      
      let state = 'WITHIN_SLA';
      const isBreached = effectiveEnd > deadTime;

      if (isBreached) {
        state = 'SLA_BREACHED';
      } else if (!isResolved && remainingMs <= totalDuration * 0.25) {
        state = 'SLA_AT_RISK';
      } else {
        state = 'WITHIN_SLA';
      }

      if (isResolved) {
        const resolvedWithinSla = new Date(resolvedAt || now).getTime() <= deadTime;
        setTimeLeft({
          formatted: resolvedWithinSla ? 'Resolved in SLA' : 'Resolved (Post-SLA)',
          state: resolvedWithinSla ? 'WITHIN_SLA' : 'SLA_BREACHED',
          percentElapsed: Math.round(percent),
          isBreached: !resolvedWithinSla,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const diffSec = Math.floor((deadTime - now.getTime()) / 1000);
      if (diffSec <= 0) {
        const overSec = Math.abs(diffSec);
        const oH = Math.floor(overSec / 3600);
        const oM = Math.floor((overSec % 3600) / 60);
        setTimeLeft({
          formatted: `Breached by ${oH}h ${oM}m`,
          state: 'SLA_BREACHED',
          percentElapsed: 100,
          isBreached: true,
          hours: oH,
          minutes: oM,
          seconds: 0,
        });
      } else {
        const h = Math.floor(diffSec / 3600);
        const m = Math.floor((diffSec % 3600) / 60);
        const s = diffSec % 60;
        setTimeLeft({
          formatted: `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`,
          state,
          percentElapsed: Math.round(percent),
          isBreached: false,
          hours: h,
          minutes: m,
          seconds: s,
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [submittedAt, slaDeadline, status, resolvedAt]);

  // SLA Color configurations
  const config = {
    WITHIN_SLA: {
      bg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      label: 'Within SLA',
    },
    SLA_AT_RISK: {
      bg: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
      bar: 'bg-amber-500',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse',
      icon: AlertTriangle,
      label: 'SLA At Risk (<25% left)',
    },
    SLA_BREACHED: {
      bg: 'bg-rose-950/60 border-rose-500/30 text-rose-300',
      bar: 'bg-rose-600',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: AlertOctagon,
      label: 'SLA Breached',
    },
  }[timeLeft.state] || {
    bg: 'bg-slate-900 border-slate-800 text-slate-300',
    bar: 'bg-slate-500',
    badge: 'bg-slate-800 text-slate-400',
    icon: Clock,
    label: 'Standard SLA',
  };

  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badge}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{timeLeft.formatted}</span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl border ${config.bg} backdrop-blur-sm space-y-2.5`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-200">
            {category} SLA Target: <span className="text-white font-bold">{slaHours} Hours</span>
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${config.badge}`}>
          {config.label}
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-xs text-slate-400 font-medium">Remaining Clock:</div>
        <div className="text-lg font-mono font-bold tracking-tight text-white">
          {timeLeft.formatted}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800/60">
        <div
          className={`h-full transition-all duration-1000 ${config.bar}`}
          style={{ width: `${timeLeft.percentElapsed}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Submitted: {new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>Deadline: {new Date(slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default SLACountdown;
