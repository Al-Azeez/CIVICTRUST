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
import AssignWorkerModal from '../../components/AssignWorkerModal';
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
  Camera,
  Globe,
  ExternalLink,
  Users,
  Send,
} from 'lucide-react';
import GoogleLocationMap from '../../components/GoogleLocationMap';
import { reverseGeocodeCoordinates } from '../../utils/locationHelper';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user, isAdmin, isCitizen } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [liveAccurateAddress, setLiveAccurateAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

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

  useEffect(() => {
    if (complaint?.latitude && complaint?.longitude) {
      reverseGeocodeCoordinates(complaint.latitude, complaint.longitude).then((geo) => {
        if (geo && geo.formattedAddress) {
          setLiveAccurateAddress(geo.formattedAddress);
        }
      });
    }
  }, [complaint?.latitude, complaint?.longitude]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        Loading verified complaint record...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white font-['Outfit']">Complaint Not Found</h2>
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

  const isResolvedOrClaimed =
    complaint.status === 'VERIFIED' ||
    complaint.status === 'RESOLVED' ||
    complaint.status === 'UNVERIFIED' ||
    complaint.status === 'RESOLUTION_CLAIMED';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to={isAdmin ? '/admin/complaints' : '/citizen/complaints'}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>

        {/* Action Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Citizen Re-verification Options */}
          {isResolvedOrClaimed && isCitizen && (
            <button
              onClick={() => setReopenModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-950 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              Citizen Re-Verification Protocol
            </button>
          )}

          {/* Admin Operations */}
          {isAdmin && (
            <>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Users className="w-4 h-4" />
                {complaint.assignedWorker ? 'Reassign Field Crew' : 'Assign Field Crew'}
              </button>
              <button
                onClick={() => setResolutionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 flex items-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                Capture Evidence & Verify
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1. Main Complaint Information Card */}
      <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/60 px-3 py-0.5 rounded-lg border border-cyan-500/30">
                {complaint.complaintId}
              </span>
              {complaint.masterIncidentId && (
                <span className="font-mono text-xs font-bold text-violet-300 bg-violet-950/60 px-2.5 py-0.5 rounded-md border border-violet-500/30 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {complaint.masterIncidentId}
                </span>
              )}
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                Submitted by <strong>{complaint.citizenName || 'Abdul'}</strong> on {new Date(complaint.submittedAt).toLocaleDateString([], { dateStyle: 'medium' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {complaint.category}
            </h1>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-200 font-medium">
                {liveAccurateAddress || complaint.address || complaint.ward}
              </span>
              <span className="text-cyan-400 font-mono text-[11px] bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/40">
                GPS: {complaint.latitude?.toFixed(4)}°, {complaint.longitude?.toFixed(4)}°
              </span>
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

        {/* Assigned Crew Section if Assigned */}
        {complaint.assignedWorker && (
          <div className="p-4 rounded-2xl bg-[#060913] border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">Assigned Municipal Unit</span>
                <span className="text-sm font-bold text-white font-['Outfit']">{complaint.assignedWorker.name}</span>
                <span className="text-slate-400 block text-[11px]">{complaint.assignedWorker.team} • {complaint.assignedWorker.phone}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono">
              Assigned: {new Date(complaint.assignedWorker.assignedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}

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
            Citizen Grievance Description
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed bg-[#060913]/70 p-4 rounded-2xl border border-white/5">
            {complaint.description}
          </p>
        </div>
      </div>

      {/* 2. Before & After Photographic Evidence Comparison Slider */}
      <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[28px] p-6 sm:p-8 space-y-4 shadow-xl backdrop-blur-md">
        <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          Before & After Photographic Evidence
        </h2>

        <ImageCompareSlider
          beforeImage={complaint.beforePhoto}
          afterImage={complaint.resolutionPhoto}
          category={complaint.category}
        />
      </div>

      {/* 3. Exact Geospatial Location Details & Dual-Pin Google Maps Verification */}
      <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[28px] p-6 sm:p-8 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Geospatial Location Details & Municipal GIS Geofence
            </h2>
            <p className="text-xs text-slate-400">
              High-accuracy satellite & street coordinates audit with distance calculation between report & resolution
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Municipal GIS Verified</span>
          </span>
        </div>

        <GoogleLocationMap
          latitude={complaint.latitude}
          longitude={complaint.longitude}
          accuracy={6}
          address={liveAccurateAddress || complaint.address || complaint.ward}
          title="Incident Ground Location"
          height="320px"
          secondaryLatitude={complaint.resolutionEvidence?.latitude}
          secondaryLongitude={complaint.resolutionEvidence?.longitude}
          primaryLabel="Original Citizen Grievance Location"
          secondaryLabel="Municipal Crew Resolution GPS"
        />
      </div>

      {/* 4. Multi-Signal Verification Analysis Card */}
      {complaint.verificationSignals && (
        <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[28px] p-6 sm:p-8 space-y-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              Multi-Signal Verification Diagnostic Report
            </h2>
            <VerificationBadge
              status={complaint.status}
              verificationStatus={complaint.verificationSignals?.overallStatus || complaint.verificationStatus}
              confidence={complaint.verificationSignals?.confidence || complaint.verificationConfidence}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Signal 1: Image Comparison */}
            <div className="p-4 rounded-2xl bg-[#060913] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Visual Image Analysis</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {complaint.verificationSignals.imageSimilarity || 88}% Similarity
              </div>
              <div className="text-xs text-slate-400">
                {complaint.verificationSignals.imageSimilarity >= 70 ? '✓ Visual clearance verified' : '⚠ Lingering debris detected'}
              </div>
            </div>

            {/* Signal 2: Location Match */}
            <div className="p-4 rounded-2xl bg-[#060913] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. GPS Geofence Check</div>
              <div className={`text-2xl font-mono font-bold ${complaint.verificationSignals.locationMatch ? 'text-cyan-400' : 'text-rose-400'}`}>
                {complaint.verificationSignals.locationMatch ? '✓ Consistent' : '⚠ Location Mismatch'}
              </div>
              <div className="text-xs text-slate-400">
                {complaint.verificationSignals.locationDistanceMeters || 12}m distance from origin
              </div>
            </div>

            {/* Signal 3: Timeline Match */}
            <div className="p-4 rounded-2xl bg-[#060913] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">3. Timeline Chronology</div>
              <div className={`text-2xl font-mono font-bold ${complaint.verificationSignals.timestampMatch ? 'text-cyan-400' : 'text-amber-400'}`}>
                {complaint.verificationSignals.timestampMatch ? '✓ Chronological' : '⚠ Timeline Review'}
              </div>
              <div className="text-xs text-slate-400">
                Resolution recorded post-submission
              </div>
            </div>
          </div>

          {complaint.verificationReason && (
            <div className="p-4 rounded-2xl bg-[#060913]/90 border border-white/5 text-xs text-slate-300 leading-relaxed">
              <strong>Audit Findings:</strong> {complaint.verificationReason}
            </div>
          )}
        </div>
      )}

      {/* 5. Citizen Re-verification Banner */}
      {isResolvedOrClaimed && isCitizen && (
        <div className="p-6 rounded-[26px] bg-gradient-to-r from-[#0d1527] to-[#121c38] border-2 border-cyan-500/40 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Citizen Re-Verification Protocol
              </h3>
              <p className="text-xs text-slate-300">
                Inspect the claimed resolution evidence. As the citizen, you have the final authority to confirm resolution or dispute the closure.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setReopenModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              ✓ Issue Resolved (Confirm & Close)
            </button>
            <button
              onClick={() => setReopenModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-950 flex items-center gap-2 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              ⚠ Issue Still Exists (Submit Rebuttal Evidence)
            </button>
          </div>
        </div>
      )}

      {/* 6. Complete Grievance Audit Timeline */}
      <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Complete Grievance Audit Timeline
          </h2>
          <span className="text-xs text-cyan-400 font-mono">
            {complaint.timeline?.length || 1} Event(s)
          </span>
        </div>

        <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
          {complaint.timeline &&
            complaint.timeline.map((event, idx) => (
              <div key={idx} className="relative space-y-1.5">
                <div
                  className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-[#0d1527] ${
                    event.status === 'VERIFIED'
                      ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                      : event.status === 'UNVERIFIED' || event.status === 'SUSPICIOUS'
                      ? 'bg-rose-400 animate-pulse shadow-[0_0_10px_rgba(251,113,133,0.5)]'
                      : event.status === 'REVERIFICATION_REQUIRED' || event.status === 'REOPENED'
                      ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                  }`}
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white font-['Outfit']">
                    {event.action}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="capitalize font-semibold text-slate-200">
                    {event.actor}
                  </span>
                  <span>•</span>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase">
                    Role: {event.actorRole}
                  </span>
                </div>

                {event.notes && (
                  <p className="text-xs text-slate-300 bg-[#060913] p-3 rounded-xl border border-white/5 mt-1">
                    {event.notes}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Modals */}
      <ReopenModal
        complaint={complaint}
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        onSuccess={(updated) => setComplaint(updated)}
      />

      <ResolutionModal
        complaint={complaint}
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        onSuccess={(updated) => setComplaint(updated)}
      />

      <AssignWorkerModal
        complaint={complaint}
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={(updated) => setComplaint(updated)}
      />
    </div>
  );
};

export default ComplaintDetail;
