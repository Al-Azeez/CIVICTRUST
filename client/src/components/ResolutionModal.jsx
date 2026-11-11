import React, { useState } from 'react';
import { Sparkles, X, AlertTriangle, ShieldCheck, MapPin, Clock, Camera, CheckCircle2, Sliders } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import GeoTaggedCameraCapture from './GeoTaggedCameraCapture';

const DEMO_CLEAN_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='320' fill='%23060913'/%3E%3Crect x='0' y='180' width='600' height='140' fill='%230f172a'/%3E%3Cline x1='0' y1='250' x2='600' y2='250' stroke='%2338bdf8' stroke-dasharray='30 20' stroke-width='4'/%3E%3Crect x='480' y='150' width='60' height='80' rx='12' fill='%2306b6d4'/%3E%3Ctext x='510' y='198' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E♻️%3C/text%3E%3Ctext x='300' y='45' font-family='sans-serif' font-size='16' font-weight='bold' fill='%2306b6d4' text-anchor='middle'%3E🛡️ VERIFIED CIVIC RESOLUTION EVIDENCE%3C/text%3E%3Crect x='0' y='320' width='600' height='80' fill='%23020617' opacity='0.96'/%3E%3Cline x1='0' y1='320' x2='600' y2='320' stroke='%2306b6d4' stroke-width='2'/%3E%3Ctext x='15' y='340' font-family='monospace' font-size='11' font-weight='bold' fill='%2306b6d4'%3EGEO-TAGGED RESOLUTION EVIDENCE%3C/text%3E%3Ctext x='15' y='358' font-family='monospace' font-size='10' fill='%23e2e8f0'%3ELat: 28.6259° N | Long: 77.2240° E%3C/text%3E%3Ctext x='15' y='374' font-family='monospace' font-size='10' fill='%2394a3b8'%3EDate: Live Timestamp | Accuracy: ±5m | Altitude: 215m%3C/text%3E%3Ctext x='15' y='390' font-family='monospace' font-size='10' fill='%23a78bfa'%3EField Unit: Azeez (Municipal Officer)%3C/text%3E%3C/svg%3E";

const ResolutionModal = ({ complaint, isOpen, onClose, onSuccess }) => {
  const [capturedEvidence, setCapturedEvidence] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('Municipal rapid response team completed site remediation and waste clearance.');
  const [simulationMode, setSimulationMode] = useState('AUTO'); // 'AUTO' | 'FORCE_VERIFIED' | 'FORCE_SUSPICIOUS' | 'LOCATION_MISMATCH'
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { addToast } = useToast();

  if (!isOpen || !complaint) return null;

  const handleResolveAndVerify = async (e) => {
    e.preventDefault();
    if (!capturedEvidence?.photo) {
      addToast('Please capture or upload geo-tagged resolution photo evidence first.', 'warning');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.post(`/complaints/${complaint._id || complaint.complaintId}/resolve`, {
        resolutionPhoto: capturedEvidence.photo,
        resolutionLatitude: capturedEvidence.latitude,
        resolutionLongitude: capturedEvidence.longitude,
        resolutionTimestamp: capturedEvidence.timestamp,
        resolutionAddress: capturedEvidence.address,
        resolutionNotes,
        simulationMode,
      });

      setVerificationResult(res.data.verification);
      addToast(res.data.message, res.data.verification.overallStatus === 'VERIFIED' ? 'success' : 'warning');

      if (onSuccess) {
        onSuccess(res.data.complaint);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error executing resolution verification', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/20 p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-slate-100 max-h-[92vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Section Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-['Outfit'] text-white">
              Field Resolution & Geo-Tag Verification
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Incident <strong className="text-cyan-400 font-mono">{complaint.complaintId}</strong> • {complaint.category} • Ward {complaint.ward}
            </p>
          </div>
        </div>

        {/* Original Complaint Information Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs">
          <div className="space-y-1.5">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Original Incident Coordinates</div>
            <div className="text-slate-300 font-mono flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{complaint.latitude?.toFixed(5)}° N, {complaint.longitude?.toFixed(5)}° E</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">{complaint.address || complaint.ward}</div>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={complaint.beforePhoto}
              alt="Original Citizen Report"
              className="w-20 h-16 object-cover rounded-xl border border-slate-800 shrink-0"
            />
            <div className="text-[11px] text-slate-400">
              <span className="font-bold text-slate-200">Citizen Evidence Note:</span>
              <p className="line-clamp-2 mt-0.5 text-slate-300">{complaint.description}</p>
            </div>
          </div>
        </div>

        {/* Verification Result Card if Verification Executed */}
        {verificationResult ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div
              className={`p-6 rounded-2xl border ${
                verificationResult.overallStatus === 'VERIFIED'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                  : 'bg-rose-950/70 border-rose-500/40 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  {verificationResult.overallStatus === 'VERIFIED' ? (
                    <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0 animate-pulse" />
                  )}
                  <div>
                    <span className="text-lg font-bold font-['Outfit'] block">
                      {verificationResult.overallStatus === 'VERIFIED'
                        ? 'AUTHENTICATED RESOLUTION'
                        : `SUSPICIOUS RESOLUTION: ${verificationResult.overallStatus}`}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Multi-Signal Algorithmic Verification Audit
                    </span>
                  </div>
                </div>
                <span className="font-mono text-sm px-3 py-1 rounded-xl bg-black/50 border border-white/10 font-bold">
                  {verificationResult.confidence}% Score
                </span>
              </div>

              {/* 3 Verification Signals Breakdown */}
              <div className="grid grid-cols-3 gap-3 my-4 p-3.5 bg-black/50 rounded-xl text-xs border border-white/5">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Visual Delta</div>
                  <div className="font-bold font-mono text-sm mt-0.5">
                    {verificationResult.signals?.imageComparison?.similarityPercent}% ({verificationResult.signals?.imageComparison?.passed ? 'Passed' : 'Flagged'})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">GPS Proximity</div>
                  <div className="font-bold font-mono text-sm mt-0.5">
                    {verificationResult.signals?.locationMatch?.distanceMeters}m ({verificationResult.signals?.locationMatch?.passed ? 'Matched' : 'Displaced'})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Chronology</div>
                  <div className="font-bold font-mono text-sm mt-0.5">
                    {verificationResult.signals?.timestampMatch?.passed ? 'Consistent' : 'Discrepancy'}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed font-medium bg-black/30 p-3 rounded-xl">
                <strong className="text-white">Audit Assessment:</strong> {verificationResult.reason}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Close & View Updated Record
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResolveAndVerify} className="space-y-5">
            {/* Simulation Preset Selector for Hackathon Demo */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-violet-400" />
                  Hackathon Multi-Signal Test Scenarios:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Mode: {simulationMode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSimulationMode('FORCE_VERIFIED');
                    setCapturedEvidence({
                      photo: DEMO_CLEAN_PHOTO,
                      latitude: complaint.latitude,
                      longitude: complaint.longitude,
                      timestamp: new Date(),
                      address: complaint.address,
                      capturedBy: 'Azeez (Municipal Officer)',
                    });
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    simulationMode === 'FORCE_VERIFIED'
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">✓ Clean Clearance</div>
                  <div className="text-[10px] opacity-75">All 3 Signals Pass</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('FORCE_SUSPICIOUS')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    simulationMode === 'FORCE_SUSPICIOUS'
                      ? 'bg-rose-950/80 border-rose-500/50 text-rose-200 font-bold shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">⚠ Residue Present</div>
                  <div className="text-[10px] opacity-75">Vision Check Flags</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('LOCATION_MISMATCH')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    simulationMode === 'LOCATION_MISMATCH'
                      ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">📍 GPS Mismatch</div>
                  <div className="text-[10px] opacity-75">&gt;150m Distance Off</div>
                </button>
              </div>
            </div>

            {/* Geo-Tagged Camera Evidence Capture Component */}
            <GeoTaggedCameraCapture
              complaint={complaint}
              defaultPhoto={capturedEvidence?.photo || DEMO_CLEAN_PHOTO}
              onPhotoCaptured={(data) => setCapturedEvidence(data)}
            />

            {/* Resolution Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Remediation Notes / Field Remarks:
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Cleared 2 metric tons of waste, sanitized perimeter and restored clear passage."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Verification Signals Preview */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Active Multi-Signal Verification Checklist:
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Vision Delta</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Haversine GPS Dist</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SLA Chronology</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                {isVerifying ? 'Executing Multi-Signal Audit...' : 'Submit Resolution Evidence'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResolutionModal;
