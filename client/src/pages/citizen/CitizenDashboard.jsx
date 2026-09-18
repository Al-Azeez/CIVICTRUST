import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SLACountdown from '../../components/SLACountdown';
import VerificationBadge from '../../components/VerificationBadge';
import ReopenModal from '../../components/ReopenModal';
import {
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RotateCcw,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reopenTarget, setReopenTarget] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints);
    } catch (error) {
      console.warn('Error fetching complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Suspicious complaints requiring citizen attention
  const suspiciousComplaints = complaints.filter(
    (c) => c.status === 'SUSPICIOUS' || c.verificationStatus === 'SUSPICIOUS'
  );
  const activeComplaints = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'IN_PROGRESS' || c.status === 'REOPENED'
  );
  const resolvedComplaints = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'VERIFIED'
  );

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Banner & Action Button */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span>Verified Citizen Dashboard</span> • <span>{user?.ward || 'Ward 4 - Green Park'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Track your reported civic grievances with real-time SLA deadlines and verify municipal resolution evidence.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center gap-2 shrink-0 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Complaints</span>
            <ClipboardList className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {complaints.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-sky-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sky-400 font-medium">Active / In SLA</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300 mt-2">
            {activeComplaints.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-medium">Suspicious Closures</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-2">
            {suspiciousComplaints.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">Verified Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-2">
            {resolvedComplaints.length}
          </div>
        </div>
      </div>

      {/* SUSPICIOUS RESOLUTION ACTION ALERT (Problem Statement Step #7 & #8) */}
      {suspiciousComplaints.length > 0 && (
        <section className="p-6 rounded-3xl bg-rose-950/40 border-2 border-rose-500/40 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                Action Required: Suspicious Resolutions Flagged
              </h2>
              <p className="text-xs text-rose-200">
                "The resolution could not be confidently verified." You have the right to re-verify and reopen these complaints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {suspiciousComplaints.map((c) => (
              <div
                key={c._id || c.complaintId}
                className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 flex flex-col justify-between space-y-3"
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
                  <div className="text-xs text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-900/40">
                    <strong>AI Finding:</strong> {c.verificationReason || 'Residual debris detected in after-image.'}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setReopenTarget(c)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-950 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Re-verify & Reopen
                  </button>
                  <Link
                    to={`/citizen/complaints/${c._id || c.complaintId}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Inspect Evidence
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Complaints with SLA Clocks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Active Grievances & Live SLA Clocks
            </h2>
            <p className="text-xs text-slate-400">
              Real-time countdown tracking towards mandatory SLA deadlines
            </p>
          </div>
          <Link
            to="/citizen/complaints"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            All Complaints ({complaints.length}) →
          </Link>
        </div>

        {activeComplaints.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">No active pending grievances!</p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Report an issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeComplaints.map((c) => (
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

                <div className="space-y-3 pt-2">
                  <SLACountdown
                    submittedAt={c.submittedAt}
                    slaDeadline={c.slaDeadline}
                    category={c.category}
                    slaHours={c.slaHours}
                    status={c.status}
                    resolvedAt={c.resolvedAt}
                  />

                  <Link
                    to={`/citizen/complaints/${c._id || c.complaintId}`}
                    className="block text-center py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    View Timeline & Verification →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reopen Modal */}
      <ReopenModal
        complaint={reopenTarget}
        isOpen={!!reopenTarget}
        onClose={() => setReopenTarget(null)}
        onSuccess={() => fetchComplaints()}
      />
    </div>
  );
};

export default CitizenDashboard;
