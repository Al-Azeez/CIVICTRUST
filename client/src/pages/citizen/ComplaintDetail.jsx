import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SLACountdown from '../../components/SLACountdown';
import VerificationBadge from '../../components/VerificationBadge';
import ImageCompareSlider from '../../components/ImageCompareSlider';
import ReopenModal from '../../components/ReopenModal';
import ResolutionModal from '../../components/ResolutionModal';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
  User,
  Shield,
  Layers,
} from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user, isAdmin, isCitizen } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
    } catch (error) {
      addToast('Error loading complaint details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        Loading complaint record...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Complaint Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested complaint ID does not exist in the municipal record.
        </p>
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>
      </div>
    );
  }

  const isSuspicious = complaint.status === 'SUSPICIOUS' || complaint.verificationStatus === 'SUSPICIOUS';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to={isAdmin ? '/admin/complaints' : '/citizen/complaints'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2">
          {/* If Suspicious, Citizen can Re-verify & Reopen */}
          {isSuspicious && (
            <button
              onClick={() => setReopenModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-950 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              Re-verify & Reopen Complaint
            </button>
          )}

          {/* Admin can Claim Resolution or Re-verify */}
          {isAdmin && (
            <button
              onClick={() => setResolutionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Upload After Photo & Verify
            </button>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                {complaint.complaintId}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                Logged {new Date(complaint.submittedAt).toLocaleDateString([], { dateStyle: 'medium' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              {complaint.category}
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{complaint.address || complaint.ward} ({complaint.ward})</span>
            </div>
          </div>

          <div className="shrink-0">
            <VerificationBadge
              status={complaint.status}
              verificationStatus={complaint.verificationStatus}
              confidence={complaint.verificationConfidence}
            />
          </div>
        </div>

        {/* Live SLA Countdown Module */}
        <SLACountdown
          submittedAt={complaint.submittedAt}
          slaDeadline={complaint.slaDeadline}
          category={complaint.category}
          slaHours={complaint.slaHours}
          status={complaint.status}
          resolvedAt={complaint.resolvedAt}
        />

        {/* Grievance Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Reported Citizen Grievance Description
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            {complaint.description}
          </p>
        </div>
      </div>

      {/* SUSPICIOUS / UNVERIFIED CALLOUT BANNER (Problem Statement Step #6 & #7) */}
      {isSuspicious && (
        <div className="p-6 rounded-3xl bg-rose-950/50 border-2 border-rose-500/50 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0 animate-pulse" />
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                ⚠️ Resolution Unverified / Suspicious ({complaint.verificationConfidence}% AI Confidence)
              </h2>
              <p className="text-xs text-rose-200">
                "The resolution could not be confidently verified." The automated vision comparison detected residual obstruction or conflicting visual patterns.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-rose-900/50 space-y-2">
            <div className="text-xs font-bold text-rose-300">
              Automated Reasoning Output:
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {complaint.verificationReason || 'The reported issue still appears visible in the after image. Human review recommended.'}
            </p>
            <div className="text-[11px] text-slate-400 pt-1 italic">
              Prototype Notice: Automated verification may produce false positives/negatives. Citizen re-verification is enabled.
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setReopenModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-950 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Submit Rebuttal & Reopen Complaint
            </button>
          </div>
        </div>
      )}

      {/* Reopened Case Banner if Citizen Reopened */}
      {complaint.status === 'REOPENED' && (
        <div className="p-6 rounded-3xl bg-amber-950/40 border-2 border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Grievance Reopened by Citizen
              </h2>
              <p className="text-xs text-amber-200">
                Citizen disputed the contractor resolution and submitted rebuttal ground evidence.
              </p>
            </div>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-amber-900/50 text-xs text-slate-200">
            <strong>Citizen Dispute Reason:</strong> "{complaint.reopenReason}"
          </div>
        </div>
      )}

      {/* Visual Resolution Evidence Comparison Slider */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Before & After Photographic Evidence
        </h2>

        <ImageCompareSlider
          beforeImage={complaint.beforePhoto}
          afterImage={complaint.resolutionPhoto}
          category={complaint.category}
        />
      </div>

      {/* Audit Timeline History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Complete Grievance Audit Timeline
          </h2>
          <span className="text-xs text-slate-400">
            {complaint.timeline?.length || 1} Chronological Event(s)
          </span>
        </div>

        <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
          {complaint.timeline && complaint.timeline.map((event, idx) => (
            <div key={idx} className="relative space-y-1.5">
              {/* Dot */}
              <div
                className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  event.status === 'VERIFIED'
                    ? 'bg-emerald-500'
                    : event.status === 'SUSPICIOUS'
                    ? 'bg-rose-500 animate-pulse'
                    : event.status === 'REOPENED'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-white font-['Outfit']">
                  {event.action}
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(event.timestamp).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="capitalize font-semibold text-slate-300">
                  {event.actor}
                </span>
                <span>•</span>
                <span className="text-[11px] text-slate-500 uppercase">
                  Role: {event.actorRole}
                </span>
              </div>

              {event.notes && (
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-1">
                  {event.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reopen Modal */}
      <ReopenModal
        complaint={complaint}
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        onSuccess={(updated) => setComplaint(updated)}
      />

      {/* Resolution Claim Modal */}
      <ResolutionModal
        complaint={complaint}
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        onSuccess={(updated) => setComplaint(updated)}
      />
    </div>
  );
};

export default ComplaintDetail;
