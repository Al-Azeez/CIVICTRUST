import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import SLACountdown from '../../components/SLACountdown';
import VerificationBadge from '../../components/VerificationBadge';
import ResolutionModal from '../../components/ResolutionModal';
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Flame,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeResolutionTarget, setActiveResolutionTarget] = useState(null);

  const fetchData = async () => {
    try {
      const [kpiRes, compRes] = await Promise.all([
        api.get('/analytics/kpis'),
        api.get('/complaints?limit=6'),
      ]);
      setKpis(kpiRes.data.kpis);
      setRecentComplaints(compRes.data.complaints);
    } catch (error) {
      console.warn('Error fetching admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const suspiciousList = recentComplaints.filter(
    (c) => c.status === 'SUSPICIOUS' || c.status === 'REOPENED'
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Municipal Reviewer Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-1">
            Civic Operations & Verification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor municipal SLA compliance, inspect automated vision verification, and review citizen disputes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hotspots"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            Hotspot Map
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Ward Analytics
          </Link>
        </div>
      </div>

      {/* 7 Required KPI Cards (Problem Statement Section #8) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. Total Complaints */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400">Total Grievances</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {kpis?.totalComplaints || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <ClipboardList className="w-3 h-3 text-slate-400" /> All Wards
          </div>
        </div>

        {/* 2. Pending */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-sky-900/40 shadow-md">
          <div className="text-[11px] font-semibold text-sky-400">Pending</div>
          <div className="text-2xl font-bold font-mono text-sky-300 mt-1">
            {kpis?.pending || 0}
          </div>
          <div className="text-[10px] text-sky-400/80 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In SLA Clock
          </div>
        </div>

        {/* 3. Resolved */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/40 shadow-md">
          <div className="text-[11px] font-semibold text-emerald-400">Resolved</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            {kpis?.resolved || 0}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Closed
          </div>
        </div>

        {/* 4. SLA Met */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-teal-900/40 shadow-md">
          <div className="text-[11px] font-semibold text-teal-400">SLA Met</div>
          <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
            {kpis?.slaMet || 0}
          </div>
          <div className="text-[10px] text-teal-400/80 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Within Target
          </div>
        </div>

        {/* 5. SLA Breached */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-900/40 shadow-md">
          <div className="text-[11px] font-semibold text-amber-400">SLA Breached</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {kpis?.slaBreached || 0}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Overdue
          </div>
        </div>

        {/* 6. Suspicious Closures */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-900/50 shadow-md">
          <div className="text-[11px] font-semibold text-rose-400">Suspicious</div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
            {kpis?.suspiciousClosures || 0}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 animate-pulse" /> AI Flagged
          </div>
        </div>

        {/* 7. Reopened Complaints */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-orange-900/50 shadow-md">
          <div className="text-[11px] font-semibold text-orange-400">Reopened</div>
          <div className="text-2xl font-bold font-mono text-orange-300 mt-1">
            {kpis?.reopenedComplaints || 0}
          </div>
          <div className="text-[10px] text-orange-400/80 mt-1 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Citizen Reopened
          </div>
        </div>
      </div>

      {/* Urgent Review Section: Suspicious & Reopened Queue */}
      {suspiciousList.length > 0 && (
        <section className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  Action Required: Resolution Audit Alerts
                </h2>
                <p className="text-xs text-rose-200">
                  Cases where automated verification flagged unverified resolution or citizen disputed closure
                </p>
              </div>
            </div>

            <Link
              to="/admin/verification"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              Open Audit Queue →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {suspiciousList.map((c) => (
              <div
                key={c._id || c.complaintId}
                className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {c.complaintId}
                    </span>
                    <VerificationBadge
                      status={c.status}
                      verificationStatus={c.verificationStatus}
                      confidence={c.verificationConfidence}
                      size="small"
                    />
                  </div>
                  <h3 className="font-bold text-white text-sm font-['Outfit']">
                    {c.category} • <span className="text-slate-400 font-normal">{c.ward}</span>
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {c.description}
                  </p>
                  <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-900/40">
                    <strong>Finding:</strong> {c.verificationReason || c.reopenReason || 'Residual debris detected.'}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveResolutionTarget(c)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Re-Verify
                  </button>
                  <Link
                    to={`/citizen/complaints/${c._id || c.complaintId}`}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Grievances Table / Stream */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Live Municipal Incident Stream
            </h2>
            <p className="text-xs text-slate-400">
              Active civic complaints across all wards with SLA tracking
            </p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Manage All Complaints →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentComplaints.map((c) => (
            <div
              key={c._id || c.complaintId}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {c.complaintId}
                  </span>
                  <VerificationBadge
                    status={c.status}
                    verificationStatus={c.verificationStatus}
                    confidence={c.verificationConfidence}
                    size="small"
                  />
                </div>

                <h3 className="font-bold text-white text-base font-['Outfit']">
                  {c.category}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {c.description}
                </p>
                <div className="text-[11px] text-slate-500">
                  📍 {c.address || c.ward}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <SLACountdown
                  submittedAt={c.submittedAt}
                  slaDeadline={c.slaDeadline}
                  category={c.category}
                  slaHours={c.slaHours}
                  status={c.status}
                  resolvedAt={c.resolvedAt}
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveResolutionTarget(c)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Claim Resolution
                  </button>
                  <Link
                    to={`/citizen/complaints/${c._id || c.complaintId}`}
                    className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resolution Claim Modal */}
      <ResolutionModal
        complaint={activeResolutionTarget}
        isOpen={!!activeResolutionTarget}
        onClose={() => setActiveResolutionTarget(null)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
};

export default AdminDashboard;
