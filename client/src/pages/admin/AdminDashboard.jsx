import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import SLACountdown from '../../components/SLACountdown';
import VerificationBadge from '../../components/VerificationBadge';
import ResolutionModal from '../../components/ResolutionModal';
import AssignWorkerModal from '../../components/AssignWorkerModal';
import HotspotMap from '../../components/HotspotMap';
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
  Layers,
  Users,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Radio,
  FileCheck,
  ExternalLink,
  Send,
  Eye,
  Camera,
  Search,
  Scan,
} from 'lucide-react';

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [masterIncidents, setMasterIncidents] = useState([]);
  const [hotspotPoints, setHotspotPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('master'); // 'master' | 'complaints' | 'map'
  const [expandedIncident, setExpandedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeResolutionTarget, setActiveResolutionTarget] = useState(null);
  const [activeAssignTarget, setActiveAssignTarget] = useState(null);

  const fetchData = async () => {
    try {
      const [kpiRes, compRes, miRes, hsRes] = await Promise.all([
        api.get('/analytics/kpis'),
        api.get('/complaints?limit=12'),
        api.get('/complaints/master-incidents'),
        api.get('/analytics/hotspots'),
      ]);
      setKpis(kpiRes.data.kpis);
      setRecentComplaints(compRes.data.complaints || []);
      setMasterIncidents(miRes.data.masterIncidents || []);
      setHotspotPoints(hsRes.data.points || []);
    } catch (error) {
      console.warn('Error fetching admin dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute operational buckets
  const pendingCount = recentComplaints.filter((c) => c.status === 'SUBMITTED').length;
  const assignedCount = recentComplaints.filter((c) => c.assignedWorker || c.status === 'IN_PROGRESS').length;
  const inProgressCount = recentComplaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = recentComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'VERIFIED').length;
  const verificationRequiredCount = recentComplaints.filter(
    (c) =>
      c.status === 'SUSPICIOUS' ||
      c.status === 'REOPENED' ||
      c.status === 'REVERIFICATION_REQUIRED' ||
      c.verificationStatus === 'UNVERIFIED' ||
      c.verificationStatus === 'LOCATION_MISMATCH' ||
      c.verificationStatus === 'TIMELINE_MISMATCH' ||
      c.verificationStatus === 'REQUIRES HUMAN REVIEW'
  ).length;

  const suspiciousList = recentComplaints.filter(
    (c) =>
      c.status === 'SUSPICIOUS' ||
      c.status === 'REOPENED' ||
      c.status === 'REVERIFICATION_REQUIRED' ||
      c.verificationStatus === 'UNVERIFIED' ||
      c.verificationStatus === 'LOCATION_MISMATCH' ||
      c.verificationStatus === 'TIMELINE_MISMATCH'
  );

  return (
    <div className="space-y-8 py-6">
      {/* 1. HEADER & ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Municipal Reviewer Control Center</span> • <span>Supervisor Azeez</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
            Civic Operations & Verification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor real-world Master Incidents, assign municipal response crews, inspect Geo-Tagged evidence, and review automated verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/osint"
            className="px-4 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Scan className="w-4 h-4 text-cyan-400" />
            OSINT Verification
          </Link>
          <Link
            to="/admin/hotspots"
            className="px-4 py-2.5 rounded-xl bg-[#0d1527] hover:bg-slate-800 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center gap-2 transition-all shadow-md"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            Hotspot Map
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-950 flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Ward Analytics
          </Link>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI METRICS GRID (Total, Pending, Assigned, In Progress, Resolved, Verification Required, SLA Breached, Hotspots) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Complaints */}
        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-white/10 shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {kpis?.totalComplaints || recentComplaints.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <ClipboardList className="w-3 h-3 text-slate-400" /> Citizen Submissions
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-amber-500/20 shadow-lg">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending / Logged</div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1">
            {pendingCount || (kpis?.pending ?? 3)}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Awaiting Crew
          </div>
        </div>

        {/* Assigned / In Progress */}
        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-cyan-500/20 shadow-lg">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
            {inProgressCount || (kpis?.inProgress ?? 4)}
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> Crew Dispatched
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-emerald-500/20 shadow-lg">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Resolved Clean</div>
          <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
            {resolvedCount || (kpis?.resolved ?? 5)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified Cleared
          </div>
        </div>

        {/* Verification Required / Suspicious */}
        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-rose-500/30 shadow-lg">
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Verification Req.</div>
          <div className="text-2xl font-black font-mono text-rose-300 mt-1">
            {verificationRequiredCount || (kpis?.suspiciousClosures ?? 1)}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 animate-pulse" /> Signal Mismatch
          </div>
        </div>

        {/* Master Incidents */}
        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-violet-500/20 shadow-lg">
          <div className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">Master Incidents</div>
          <div className="text-2xl font-black font-mono text-violet-300 mt-1">
            {kpis?.masterIncidentsCount || masterIncidents.length}
          </div>
          <div className="text-[10px] text-violet-400/80 mt-1 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Deduplicated Issues
          </div>
        </div>
      </div>

      {/* 3. URGENT AUDIT & DISPUTE QUEUE (If any suspicious or disputed cases) */}
      {suspiciousList.length > 0 && (
        <section className="p-6 rounded-[26px] bg-rose-950/30 border border-rose-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  Action Required: Resolution Audit & Reverification Queue
                </h2>
                <p className="text-xs text-rose-200">
                  Cases where automated multi-signal checks (location, timestamp, image) or citizen re-verification require human supervisor review.
                </p>
              </div>
            </div>

            <Link
              to="/admin/verification"
              className="text-xs font-bold text-rose-300 hover:text-white px-3 py-1.5 rounded-xl bg-rose-900/60 border border-rose-500/40 flex items-center gap-1 shrink-0"
            >
              Open Audit Queue →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {suspiciousList.map((c) => (
              <div
                key={c._id || c.complaintId}
                className="p-4 rounded-2xl bg-[#060913]/90 border border-rose-500/30 flex flex-col justify-between space-y-3"
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
                  <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-900/40 space-y-1">
                    <div><strong>Signal Audit:</strong> {c.verificationReason || c.reopenReason || 'Evidence requires human review.'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveResolutionTarget(c)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Capture Evidence
                  </button>
                  <Link
                    to={`/citizen/complaints/${c._id || c.complaintId}`}
                    className="py-1.5 px-3 rounded-xl bg-[#0d1527] hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. MAIN OPERATIONS HUB: TABS (Master Incidents | Citizen Reports | Interactive Complaint Map) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Municipal Operations Hub
            </h2>
            <p className="text-xs text-slate-400">
              "Remove duplicate incidents, NOT duplicate citizens' evidence."
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-[#060913] border border-white/10 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'master'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Master Incidents ({masterIncidents.length})
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'complaints'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Citizen Reports ({recentComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Live Incident Map ({hotspotPoints.length})
            </button>
          </div>
        </div>

        {/* TAB 1: MASTER INCIDENTS (Grouped Real-World Civic Issues) */}
        {activeTab === 'master' && (
          <div className="space-y-4">
            {masterIncidents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 rounded-2xl bg-[#0d1527] border border-white/10">
                No Master Incidents recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {masterIncidents.map((mi) => {
                  const isExpanded = expandedIncident === mi.incidentId;
                  const isRecurring = mi.isRecurring || mi.incidentType === 'RECURRING';

                  return (
                    <div
                      key={mi.incidentId}
                      className={`p-6 rounded-[22px] bg-[#0d1527]/90 border transition-all ${
                        isRecurring
                          ? 'border-purple-500/40 shadow-lg shadow-purple-950/20'
                          : mi.status === 'RESOLVED'
                          ? 'border-emerald-500/30'
                          : 'border-white/10 hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Incident Info */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-black text-violet-300 bg-violet-950/80 border border-violet-700/50 px-3 py-0.5 rounded-lg">
                              MASTER INCIDENT {mi.incidentId}
                            </span>
                            {isRecurring && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold animate-pulse">
                                <Flame className="w-3 h-3 text-purple-400" />
                                Recurring Hotspot
                              </span>
                            )}
                            <VerificationBadge
                              status={mi.status}
                              verificationStatus={mi.verificationStatus || 'UNVERIFIED'}
                              size="small"
                            />
                          </div>

                          <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                            {mi.category}
                            <span className="text-xs font-normal text-slate-400">
                              • Ward: {mi.location?.ward || 'Central Ward'}
                            </span>
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{mi.location?.address || 'Civic Location'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-blue-400" />
                              <span>
                                Citizen Reports:{' '}
                                <strong className="text-white font-mono">{mi.reportCount || (mi.linkedComplaintIds?.length ?? 1)}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>
                                First: {new Date(mi.firstReportedAt || Date.now()).toLocaleDateString()}
                              </span>
                              <span className="text-slate-600">|</span>
                              <span>
                                Latest: {new Date(mi.lastReportedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions & SLA */}
                        <div className="flex items-center gap-3 lg:self-center">
                          <button
                            onClick={() => setExpandedIncident(isExpanded ? null : mi.incidentId)}
                            className="px-4 py-2 rounded-xl bg-[#060913] border border-cyan-500/30 hover:bg-slate-800 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-colors"
                          >
                            <span>Linked Evidence ({mi.linkedComplaintIds?.length || mi.reportCount || 1})</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Linked Reports Drawer */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-3 bg-[#060913]/70 p-4 rounded-2xl">
                          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                            <span>Individual Citizen Evidence Preserved under {mi.incidentId}:</span>
                            <span className="text-[11px] text-cyan-400 font-mono">
                              Evaluated via 4-Signal Match Engine
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(mi.linkedComplaints && mi.linkedComplaints.length > 0
                              ? mi.linkedComplaints
                              : recentComplaints.filter((c) => c.masterIncidentId === mi.incidentId || (!c.masterIncidentId && c.category === mi.category))
                            ).slice(0, 4).map((lc, idx) => (
                              <div
                                key={lc._id || lc.complaintId || idx}
                                className="p-3.5 rounded-xl bg-[#0d1527] border border-white/5 flex items-center justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-white">
                                      {lc.complaintId || `RPT-${1000 + idx}`}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      by <strong>{lc.citizen?.name || 'Citizen Abdul'}</strong>
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 line-clamp-1">
                                    {lc.description || 'Civic report logged with photo evidence.'}
                                  </div>
                                </div>

                                <Link
                                  to={`/citizen/complaints/${lc._id || lc.complaintId}`}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:text-white shrink-0"
                                >
                                  Inspect →
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INDIVIDUAL CITIZEN COMPLAINTS STREAM (Cards with Image, Location, Timestamp, Worker Assignment, Resolution) */}
        {activeTab === 'complaints' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentComplaints.map((c) => (
              <div
                key={c._id || c.complaintId}
                className="p-5 rounded-[22px] bg-[#0d1527]/85 border border-white/10 hover:border-cyan-500/30 flex flex-col justify-between shadow-xl space-y-4 transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header with Badges */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                      {c.complaintId}
                    </span>
                    <VerificationBadge
                      status={c.status}
                      verificationStatus={c.verificationStatus}
                      confidence={c.verificationConfidence}
                      size="small"
                    />
                  </div>

                  {c.masterIncidentId && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/40 text-[10px] font-mono text-violet-300">
                      <Layers className="w-3 h-3" /> Master: {c.masterIncidentId}
                    </div>
                  )}

                  {/* Photo Evidence Preview */}
                  {c.beforePhoto && (
                    <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#060913] h-32">
                      <img
                        src={c.beforePhoto}
                        alt="Citizen Evidence"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-[#060913]/90 text-[10px] text-slate-300 px-2 py-0.5 rounded font-mono border border-white/10">
                        {new Date(c.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Title & Location */}
                  <div>
                    <h3 className="font-bold text-white text-base font-['Outfit']">
                      {c.category}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between gap-1 mt-1">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{c.address || c.ward}</span>
                      </div>
                      {c.latitude && c.longitude && (
                        <span className="text-[10px] text-cyan-400 font-mono shrink-0">
                          GIS Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {c.description}
                  </p>

                  {/* Assigned Worker Info if present */}
                  {c.assignedWorker && (
                    <div className="p-2.5 rounded-xl bg-[#060913] border border-cyan-500/20 text-xs text-slate-300 space-y-0.5">
                      <div className="text-[10px] text-cyan-400 font-bold uppercase">Assigned Unit:</div>
                      <div className="font-bold text-white">{c.assignedWorker.name}</div>
                      <div className="text-[11px] text-slate-400">{c.assignedWorker.team}</div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer: Worker Assignment & Resolution Capture */}
                <div className="space-y-3 pt-2 border-t border-white/5">
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
                      onClick={() => setActiveAssignTarget(c)}
                      className="px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold text-xs flex items-center gap-1 transition-all"
                      title="Dispatch / Assign Field Crew"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Assign
                    </button>

                    <button
                      onClick={() => setActiveResolutionTarget(c)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-950 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Verify Evidence
                    </button>

                    <Link
                      to={`/citizen/complaints/${c._id || c.complaintId}`}
                      className="p-2 rounded-xl bg-[#060913] border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Full Audit Inspection"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: LIVE INTERACTIVE COMPLAINT MAP */}
        {activeTab === 'map' && (
          <div className="bg-[#0d1527] border border-cyan-500/20 rounded-[26px] p-6 shadow-2xl space-y-4">
            <HotspotMap points={hotspotPoints} height="560px" />
          </div>
        )}
      </section>

      {/* Resolution Claim & Vision Verification Modal */}
      <ResolutionModal
        complaint={activeResolutionTarget}
        isOpen={!!activeResolutionTarget}
        onClose={() => setActiveResolutionTarget(null)}
        onSuccess={() => fetchData()}
      />

      {/* Worker Dispatch Assignment Modal */}
      <AssignWorkerModal
        complaint={activeAssignTarget}
        isOpen={!!activeAssignTarget}
        onClose={() => setActiveAssignTarget(null)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
};

export default AdminDashboard;
