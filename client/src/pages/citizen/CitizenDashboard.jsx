import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SLACountdown from '../../components/SLACountdown';
import VerificationBadge from '../../components/VerificationBadge';
import ReopenModal from '../../components/ReopenModal';
import GoogleLocationMap from '../../components/GoogleLocationMap';
import {
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RotateCcw,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
  Camera,
  MapPin,
  ExternalLink,
  Sparkles,
  Layers,
  History,
  Activity,
  Navigation,
  Globe,
  Radio,
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reopenTarget, setReopenTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'nearby' | 'history'

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints || []);
    } catch (error) {
      console.warn('Error fetching complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filtered complaint subsets
  const suspiciousComplaints = complaints.filter(
    (c) =>
      c.status === 'SUSPICIOUS' ||
      c.verificationStatus === 'SUSPICIOUS' ||
      c.status === 'REVERIFICATION_REQUIRED'
  );
  const activeComplaints = complaints.filter(
    (c) =>
      c.status === 'SUBMITTED' ||
      c.status === 'IN_PROGRESS' ||
      c.status === 'REOPENED' ||
      c.status === 'REVERIFICATION_REQUIRED'
  );
  const resolvedComplaints = complaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'VERIFIED'
  );
  const nearbyComplaints = complaints.slice(0, 4);

  // Latest complaint for live location map preview
  const primaryComplaint = activeComplaints[0] || complaints[0];

  return (
    <div className="space-y-8 py-6">
      {/* 1. WELCOME SECTION & PRIMARY CTA */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#0c1328] via-[#0d162d] to-[#0a1024] border border-cyan-500/25 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Verified Citizen Portal</span> • <span>{user?.ward || 'Ward 4 - Green Park'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
            Welcome back, {user?.name || 'Abdul'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Track your logged municipal grievances, monitor real-time SLA countdown clocks, and audit photo evidence captured by field workers.
          </p>
        </div>

        {/* Primary CTA: Report an Issue */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/citizen/report"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <Camera className="w-4 h-4" />
            <span>Report an Issue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d1527]/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Reports</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">
            {complaints.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Grievances logged</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527]/80 border border-cyan-500/20 shadow-lg">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold">Active in SLA</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
            {activeComplaints.length}
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1">Under strict deadline</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527]/80 border border-rose-500/20 shadow-lg">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold">Suspicious / Reopen</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black font-mono text-rose-300 mt-1">
            {suspiciousComplaints.length}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1">Action required</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527]/80 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Verified Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-300 mt-1">
            {resolvedComplaints.length}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Confirmed closed</div>
        </div>
      </div>

      {/* 3. SUSPICIOUS RESOLUTION ACTION ALERT BANNER */}
      {suspiciousComplaints.length > 0 && (
        <section className="p-6 rounded-[24px] bg-rose-950/40 border-2 border-rose-500/40 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                Action Required: Suspicious Resolutions Flagged
              </h2>
              <p className="text-xs text-rose-200">
                "The resolution could not be confidently verified." You have the right to inspect ground evidence and reopen the ticket.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {suspiciousComplaints.map((c) => (
              <div
                key={c._id || c.complaintId}
                className="p-4 rounded-2xl bg-[#060913]/90 border border-rose-500/30 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-300">
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
                  <div className="text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-900/40">
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
                    className="py-2 px-3 rounded-xl bg-[#0d1527] hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Inspect Evidence
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. INTERACTIVE GOOGLE MAPS LOCATION PREVIEW & TABS */}
      <section className="bg-[#0d1527]/85 border border-cyan-500/20 rounded-[26px] p-6 space-y-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Interactive Location & Ward Map Preview
            </h2>
            <p className="text-xs text-slate-400">
              Live geospatial view of your complaints and nearby civic issues in {user?.ward || 'Ward 4 - Green Park'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-[#060913] border border-white/10 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'active'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Active ({activeComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'nearby'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Nearby Ward Issues ({nearbyComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({complaints.length})
            </button>
          </div>
        </div>

        {/* Live Interactive Map */}
        {primaryComplaint && (
          <div className="space-y-2">
            <GoogleLocationMap
              latitude={primaryComplaint.latitude}
              longitude={primaryComplaint.longitude}
              accuracy={6}
              address={primaryComplaint.address || primaryComplaint.ward}
              title={`Ward Geospatial Center: ${primaryComplaint.ward}`}
              height="300px"
              primaryLabel="Active Grievance Location"
            />
          </div>
        )}
      </section>

      {/* 5. TAB VIEW: ACTIVE GRIEVANCES / NEARBY / HISTORY */}
      {activeTab === 'active' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                Active Grievances & Live SLA Clocks
              </h2>
              <p className="text-xs text-slate-400">
                Real-time countdown tracking towards mandatory municipal SLA deadlines
              </p>
            </div>
            <Link
              to="/citizen/complaints"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All Complaints ({complaints.length}) →
            </Link>
          </div>

          {activeComplaints.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0d1527]/50 border border-white/5 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">No active pending grievances!</p>
              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Report an issue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeComplaints.map((c) => (
                <div
                  key={c._id || c.complaintId}
                  className="p-5 rounded-[22px] bg-[#0d1527]/85 border border-white/10 hover:border-cyan-500/30 flex flex-col justify-between shadow-xl space-y-4 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
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
                    <div className="text-[11px] text-slate-400 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{c.address || c.ward}</span>
                      </div>
                      {c.latitude && c.longitude && (
                        <span className="text-[10px] text-cyan-400/90 font-mono shrink-0">
                          GIS Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/5">
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
                      className="block text-center py-2 px-3 rounded-xl bg-[#060913] border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
                    >
                      View Timeline & Verification →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. TAB VIEW: NEARBY COMPLAINTS */}
      {activeTab === 'nearby' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Nearby Ward Complaints
            </h2>
            <p className="text-xs text-slate-400">
              Recent civic issues reported in your immediate locality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyComplaints.map((c) => (
              <div
                key={c._id || c.complaintId}
                className="p-4 rounded-2xl bg-[#0d1527]/80 border border-white/10 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
                      {c.complaintId}
                    </span>
                    <span className="text-xs font-bold text-white">{c.category}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{c.description}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{c.address || c.ward}</span>
                  </div>
                </div>

                <Link
                  to={`/citizen/complaints/${c._id || c.complaintId}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 shrink-0"
                >
                  Inspect →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. TAB VIEW: HISTORY */}
      {activeTab === 'history' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Complete Complaint History
            </h2>
            <p className="text-xs text-slate-400">
              Audit archive of all your past and present grievances
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1527]/90 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#060913] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 font-semibold">
                <tr>
                  <th className="px-4 py-3">ID & Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {complaints.map((c) => (
                  <tr key={c._id || c.complaintId} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-white">{c.complaintId}</span>
                      <div className="text-slate-400 text-[11px]">{c.category}</div>
                    </td>
                    <td className="px-4 py-3">{c.ward}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(c.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <VerificationBadge
                        status={c.status}
                        verificationStatus={c.verificationStatus}
                        size="small"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/citizen/complaints/${c._id || c.complaintId}`}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
