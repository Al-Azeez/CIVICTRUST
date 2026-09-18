import React, { useState } from 'react';
import { CheckCircle2, Upload, Camera, Sparkles, X, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// Preset sample photos for rapid Hackathon demo testing
const DEMO_AFTER_PHOTOS = {
  clean: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%230f172a'/%3E%3Crect x='0' y='220' width='600' height='180' fill='%23334155'/%3E%3Cline x1='0' y1='310' x2='600' y2='310' stroke='%23f8fafc' stroke-dasharray='30 20' stroke-width='6'/%3E%3Crect x='480' y='180' width='60' height='90' rx='8' fill='%2316a34a'/%3E%3Ctext x='510' y='230' font-family='sans-serif' font-size='24' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E♻️%3C/text%3E%3Ctext x='300' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%234ade80' text-anchor='middle'%3E✅ CIVICTRUST DEMO: COMPLETELY CLEARED AREA%3C/text%3E%3Ctext x='300' y='95' font-family='sans-serif' font-size='14' fill='%23cbd5e1' text-anchor='middle'%3E[Verified Clean Ground - High AI Confidence 94%]%3C/text%3E%3C/svg%3E",
  suspicious: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23581c87'/%3E%3Crect x='0' y='240' width='600' height='160' fill='%233b0764'/%3E%3Ccircle cx='200' cy='280' r='40' fill='%23b45309'/%3E%3Crect x='250' y='270' width='70' height='50' fill='%2315803d'/%3E%3Ccircle cx='380' cy='300' r='35' fill='%23dc2626'/%3E%3Ctext x='300' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23f87171' text-anchor='middle'%3E⚠️ CIVICTRUST DEMO: SUSPICIOUS RESOLUTION%3C/text%3E%3Ctext x='300' y='95' font-family='sans-serif' font-size='14' fill='%23fef08a' text-anchor='middle'%3E[Debris Residuals Still Present - Automated Flag 78%]%3C/text%3E%3C/svg%3E",
};

const ResolutionModal = ({ complaint, isOpen, onClose, onSuccess }) => {
  const [resolutionPhoto, setResolutionPhoto] = useState(DEMO_AFTER_PHOTOS.suspicious);
  const [resolutionNotes, setResolutionNotes] = useState('Sanitation contractor completed site cleanup.');
  const [simulationMode, setSimulationMode] = useState('AUTO'); // 'AUTO' | 'FORCE_SUSPICIOUS' | 'FORCE_VERIFIED'
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { addToast } = useToast();

  if (!isOpen || !complaint) return null;

  const handleResolveAndVerify = async (e) => {
    e.preventDefault();
    if (!resolutionPhoto) {
      addToast('Please upload an after-resolution photo evidence', 'warning');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.post(`/complaints/${complaint._id || complaint.complaintId}/resolve`, {
        resolutionPhoto,
        resolutionNotes,
        simulationMode,
      });

      setVerificationResult(res.data.verification);
      addToast(res.data.message, res.data.verification.verificationStatus === 'VERIFIED' ? 'success' : 'warning');
      
      if (onSuccess) {
        onSuccess(res.data.complaint);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error executing resolution verification', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-['Outfit'] text-white">
              Claim Resolution & Trigger Verification
            </h3>
            <p className="text-xs text-slate-400">
              Complaint <strong className="text-emerald-400">{complaint.complaintId}</strong> • {complaint.category} ({complaint.ward})
            </p>
          </div>
        </div>

        {/* Verification Result Card if already run */}
        {verificationResult ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div
              className={`p-4 rounded-xl border ${
                verificationResult.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {verificationResult.verificationStatus === 'VERIFIED' ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 animate-pulse" />
                )}
                <span className="text-base font-bold font-['Outfit']">
                  {verificationResult.verificationStatus === 'VERIFIED'
                    ? '✅ RESOLUTION VERIFIED'
                    : '⚠️ RESOLUTION UNVERIFIED / SUSPICIOUS'}
                </span>
                <span className="ml-auto font-mono text-sm px-2.5 py-0.5 rounded-md bg-black/40 font-bold">
                  {verificationResult.confidence}% Confidence
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium mb-3">
                <strong>Reason:</strong> {verificationResult.reason}
              </p>
              <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
                <span>{verificationResult.disclaimer}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Close & View Updated State
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResolveAndVerify} className="space-y-4">
            {/* Quick Demo Preset Selection */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Hackathon Demo Simulation Mode:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSimulationMode('FORCE_SUSPICIOUS');
                    setResolutionPhoto(DEMO_AFTER_PHOTOS.suspicious);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    simulationMode === 'FORCE_SUSPICIOUS'
                      ? 'bg-rose-950/80 border-rose-500/50 text-rose-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚠️ Simulate Suspicious
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulationMode('FORCE_VERIFIED');
                    setResolutionPhoto(DEMO_AFTER_PHOTOS.clean);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    simulationMode === 'FORCE_VERIFIED'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✅ Simulate Clean
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('AUTO')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    simulationMode === 'AUTO'
                      ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🤖 Auto Vision AI
                </button>
              </div>
            </div>

            {/* After/Resolution Evidence Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                After / Resolution Photo Evidence:
              </label>
              <div className="relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 p-3 text-center hover:border-emerald-500/50 transition-colors">
                {resolutionPhoto ? (
                  <div className="space-y-2">
                    <img
                      src={resolutionPhoto}
                      alt="Claimed Resolution"
                      className="w-full h-36 object-cover rounded-lg border border-slate-800"
                    />
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Photo Attached
                      </span>
                      <label className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                        Upload Custom File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center py-4">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-300">
                      Upload After Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Resolution Notes / Contractor Remarks:
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Cleared 2 metric tons of waste via secondary truck."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                {isVerifying ? 'Analyzing Before/After Photos...' : 'Trigger Photo Verification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResolutionModal;
