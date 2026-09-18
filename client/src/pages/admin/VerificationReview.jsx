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
  ShieldAlert,
} from 'lucide-react';

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
      const suspiciousOrReopened = res.data.complaints.filter(
        (c) => c.status === 'SUSPICIOUS' || c.status === 'REOPENED' || c.verificationStatus === 'SUSPICIOUS'
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
      const res = await api.post(`/complaints/${selectedComplaint._id || selectedComplaint.complaintId}/admin-override`, {
        targetStatus,
        overrideNotes: overrideNotes || `Supervisor manual override: Set to ${targetStatus}`,
      });

      addToast(res.data.message, 'success');
      setOverrideNotes('');
      // Refresh
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          Supervisor Verification & Dispute Audit Queue
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-1">
          Review Suspicious & Disputed Closures
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Independent verification review center. Review AI-flagged false closures and citizen reopen appeals.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading audit queue...
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">
            Queue is Clear! No Suspicious Closures Pending Review
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All claimed municipal resolutions have either passed automated verification or have been resolved by human reviewers.
          </p>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Browse All Complaints →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Complaint Select List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Audit Pending Cases ({complaints.length})
            </div>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected = selectedComplaint && (selectedComplaint._id === c._id || selectedComplaint.complaintId === c.complaintId);
                return (
                  <button
                    key={c._id || c.complaintId}
                    type="button"
                    onClick={() => setSelectedComplaint(c)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2 ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500/60 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
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
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {selectedComplaint.complaintId}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-300 font-bold">{selectedComplaint.category}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      📍 {selectedComplaint.address || selectedComplaint.ward} ({selectedComplaint.ward})
                    </div>
                  </div>

                  <Link
                    to={`/citizen/complaints/${selectedComplaint._id || selectedComplaint.complaintId}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Audit Record
                  </Link>
                </div>

                {/* AI Verification Finding Callout */}
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                      Automated Vision Flag: {selectedComplaint.verificationStatus}
                    </span>
                    <span className="font-mono font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded">
                      {selectedComplaint.verificationConfidence || 78}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong>Reasoning:</strong> {selectedComplaint.verificationReason || 'Residual debris and visual inconsistencies detected in target coordinates.'}
                  </p>
                  {selectedComplaint.reopenReason && (
                    <p className="text-xs text-amber-200 pt-1 border-t border-rose-900/40">
                      <strong>Citizen Rebuttal Dispute:</strong> "{selectedComplaint.reopenReason}"
                    </p>
                  )}
                </div>

                {/* Before / After Photo Comparison */}
                <ImageCompareSlider
                  beforeImage={selectedComplaint.beforePhoto}
                  afterImage={selectedComplaint.resolutionPhoto}
                  category={selectedComplaint.category}
                />

                {/* Supervisor Action Box */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Municipal Supervisor Human Decision Override
                  </h3>
                  <p className="text-xs text-slate-400">
                    In accordance with PS-D04 rules: automated flags are advisory. The supervisor can inspect ground truth and override the status.
                  </p>

                  <textarea
                    rows={2}
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    placeholder="Enter official supervisor inspection notes / rationale..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleOverride('VERIFIED')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Clean & Mark Verified
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleOverride('IN_PROGRESS')}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-950 flex items-center gap-1.5 transition-all"
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
