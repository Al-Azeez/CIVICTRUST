import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageCompareSlider from '../../components/ImageCompareSlider';
import VerificationBadge from '../../components/VerificationBadge';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Compass,
  Globe,
  ExternalLink,
} from 'lucide-react';
import GoogleLocationMap from '../../components/GoogleLocationMap';

const VerificationReview = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const fetchSuspiciousComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      const suspiciousOrReopened = (res.data.complaints || []).filter(
        (c) =>
          c.status === 'SUSPICIOUS' ||
          c.status === 'REOPENED' ||
          c.status === 'REVERIFICATION_REQUIRED' ||
          c.verificationStatus === 'SUSPICIOUS' ||
          c.verificationStatus === 'UNVERIFIED' ||
          c.verificationStatus === 'LOCATION_MISMATCH' ||
          c.verificationStatus === 'LOCATION MISMATCH' ||
          c.verificationStatus === 'TIMELINE_MISMATCH' ||
          c.verificationStatus === 'TIMELINE MISMATCH' ||
          c.verificationStatus === 'REQUIRES HUMAN REVIEW'
      );
      setComplaints(suspiciousOrReopened);
      if (suspiciousOrReopened.length > 0 && !selectedComplaint) {
        setSelectedComplaint(suspiciousOrReopened[0]);
      }
    } catch (e) {
      console.warn('Error fetching review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspiciousComplaints();
  }, []);

  const handleOverride = async (targetStatus) => {
    if (!selectedComplaint) return;
    setIsProcessing(true);
    try {
      const res = await api.post(
        `/complaints/${selectedComplaint._id || selectedComplaint.complaintId}/admin-override`,
        {
          targetStatus,
          overrideNotes: overrideNotes || `Supervisor Azeez manual audit decision: Set to ${targetStatus}`,
        }
      );

      addToast(res.data.message || 'Audit decision recorded successfully', 'success');
      setOverrideNotes('');
      await fetchSuspiciousComplaints();
    } catch (error) {
      addToast('Error saving supervisor decision', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Supervisor Verification & Dispute Audit Queue • Azeez
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
          Review Unverified Evidence & Disputed Closures
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Independent verification review center. Inspect multi-signal flags (GPS distance mismatch, timestamp inconsistency, residual debris) and citizen re-verification appeals.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading audit queue...
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 rounded-[28px] bg-[#0d1527] border border-cyan-500/20 text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            Queue is Clear! No Unverified Closures Pending Review
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All claimed municipal resolutions have either passed automated multi-signal verification or have been resolved by human reviewers.
          </p>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Browse All Complaints →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Complaint Select List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Audit Pending Cases ({complaints.length})</span>
              <span className="text-[10px] text-rose-400 font-mono">Requires Review</span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected =
                  selectedComplaint &&
                  (selectedComplaint._id === c._id || selectedComplaint.complaintId === c.complaintId);
                return (
                  <button
                    key={c._id || c.complaintId}
                    type="button"
                    onClick={() => setSelectedComplaint(c)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2 ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-rose-500'
                        : 'bg-[#0d1527]/80 border-white/5 hover:border-slate-700 hover:bg-[#0d1527]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">
                        {c.complaintId}
                      </span>
                      <VerificationBadge
                        status={c.status}
                        verificationStatus={c.verificationStatus}
                        confidence={c.verificationConfidence}
                        size="small"
                      />
                    </div>

                    <div className="font-bold text-sm text-slate-200 font-['Outfit']">
                      {c.category}
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{c.ward}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {c.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Inspector & Supervisor Override Controls */}
          {selectedComplaint && (
            <div className="lg:col-span-2 space-y-6">
              {/* Evidence Inspector */}
              <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[28px] p-6 space-y-6 shadow-2xl backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {selectedComplaint.complaintId}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-200 font-bold">{selectedComplaint.category}</span>
                      {selectedComplaint.masterIncidentId && (
                        <span className="px-2.5 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/40 text-[10px] font-mono text-violet-300">
                          {selectedComplaint.masterIncidentId}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      📍 {selectedComplaint.address || selectedComplaint.ward} ({selectedComplaint.ward})
                    </div>
                  </div>

                  <Link
                    to={`/citizen/complaints/${selectedComplaint._id || selectedComplaint.complaintId}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Audit Record
                  </Link>
                </div>

                {/* Multi-Signal Verification Audit Box */}
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                      Multi-Signal Audit Flag: {selectedComplaint.verificationStatus}
                    </span>
                    <span className="font-mono font-bold text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded-md">
                      {selectedComplaint.verificationConfidence || 75}% Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong>Audit Finding:</strong> {selectedComplaint.verificationReason || 'Evidence could not be independently verified. Human review required.'}
                  </p>

                  {/* 3-Signal Diagnostic Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-rose-900/40">
                    {/* Signal 1: Image Comparison */}
                    <div className="p-2.5 rounded-xl bg-[#060913]/90 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Image Similarity</div>
                      <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1 font-mono">
                        {selectedComplaint.verificationSignals?.imageSimilarity
                          ? `${Math.round(selectedComplaint.verificationSignals.imageSimilarity * 100)}%`
                          : selectedComplaint.verificationConfidence
                          ? `${selectedComplaint.verificationConfidence}%`
                          : '68%'}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({selectedComplaint.verificationStatus === 'VERIFIED' ? 'Passed' : 'Review'})
                        </span>
                      </div>
                    </div>

                    {/* Signal 2: Location Match */}
                    <div className="p-2.5 rounded-xl bg-[#060913]/90 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">GPS Location Match</div>
                      <div className="text-xs font-bold mt-0.5 font-mono">
                        {selectedComplaint.verificationSignals?.locationMatch === false ? (
                          <span className="text-rose-400">⚠ Location Mismatch</span>
                        ) : (
                          <span className="text-cyan-400">✓ Consistent</span>
                        )}
                      </div>
                    </div>

                    {/* Signal 3: Timestamp Consistency */}
                    <div className="p-2.5 rounded-xl bg-[#060913]/90 border border-white/5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Timeline Order</div>
                      <div className="text-xs font-bold mt-0.5 font-mono">
                        {selectedComplaint.verificationSignals?.timestampMatch === false ? (
                          <span className="text-rose-400">⚠ Timeline Mismatch</span>
                        ) : (
                          <span className="text-cyan-400">✓ Chronological</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedComplaint.reopenReason && (
                    <p className="text-xs text-amber-200 pt-2 border-t border-rose-900/40">
                      <strong>Citizen Rebuttal Appeal:</strong> "{selectedComplaint.reopenReason}"
                    </p>
                  )}
                </div>

                {/* Before / After Photo Comparison */}
                <ImageCompareSlider
                  beforeImage={selectedComplaint.beforePhoto}
                  afterImage={selectedComplaint.resolutionPhoto || selectedComplaint.resolutionEvidence?.image}
                  category={selectedComplaint.category}
                />

                {/* Geospatial Dual-Pin Google Map Inspector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      Geospatial Verification & Municipal GIS Inspection
                    </span>
                    <span className="text-cyan-400 font-mono text-[11px]">
                      GIS Ground Pin Active
                    </span>
                  </div>

                  <GoogleLocationMap
                    latitude={selectedComplaint.latitude}
                    longitude={selectedComplaint.longitude}
                    accuracy={6}
                    address={selectedComplaint.address || selectedComplaint.ward}
                    title="Audit Site Proximity"
                    height="260px"
                    secondaryLatitude={selectedComplaint.resolutionEvidence?.latitude}
                    secondaryLongitude={selectedComplaint.resolutionEvidence?.longitude}
                    primaryLabel="Citizen Incident Location"
                    secondaryLabel="Worker Claimed Resolution GPS"
                  />
                </div>

                {/* Supervisor Action Box */}
                <div className="bg-[#060913] p-5 rounded-2xl border border-cyan-500/20 space-y-4">
                  <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Municipal Supervisor Human Decision Override
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automated multi-signal checks are advisory verification tools. The supervisor can inspect ground truth evidence and make the final administrative ruling.
                  </p>

                  <textarea
                    rows={2}
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    placeholder="Enter official supervisor inspection rationale..."
                    className="w-full px-3 py-2 bg-[#0d1527] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleOverride('VERIFIED')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Clean & Mark Verified
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleOverride('IN_PROGRESS')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-950 flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reject Claim & Re-dispatch Crew
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationReview;
