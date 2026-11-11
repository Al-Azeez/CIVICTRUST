import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Upload,
  Camera,
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { toDMS } from './GoogleLocationMap';

const SAMPLE_REBUTTAL_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%237f1d1d'/%3E%3Ccircle cx='200' cy='260' r='40' fill='%23b45309'/%3E%3Crect x='270' y='240' width='80' height='60' rx='5' fill='%2315803d'/%3E%3Ccircle cx='400' cy='270' r='30' fill='%23eab308'/%3E%3Ctext x='300' y='50' font-family='sans-serif' font-size='20' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E🔄 CITIZEN RE-VERIFICATION EVIDENCE%3C/text%3E%3Ctext x='300' y='80' font-family='sans-serif' font-size='13' fill='%23fef08a' text-anchor='middle'%3E[Fresh Rebuttal Ground Photo - Abdul]%3C/text%3E%3C/svg%3E";

const ReopenModal = ({ complaint, isOpen, onClose, onSuccess }) => {
  const [selectedAction, setSelectedAction] = useState('DISPUTE_STILL_EXISTS'); // 'CONFIRM_RESOLVED' | 'DISPUTE_STILL_EXISTS'
  const [reopenReason, setReopenReason] = useState('');
  const [reopenPhoto, setReopenPhoto] = useState(SAMPLE_REBUTTAL_PHOTO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citizenGps, setCitizenGps] = useState({
    latitude: complaint?.latitude || 28.6259,
    longitude: complaint?.longitude || 77.2240,
    accuracy: 6,
  });
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCitizenGps({
        latitude: complaint?.latitude || 28.6259,
        longitude: complaint?.longitude || 77.2240,
        accuracy: 5,
      });
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedAction === 'DISPUTE_STILL_EXISTS' && !reopenReason.trim()) {
      addToast('Please provide an explanation describing why the issue still exists.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/complaints/${complaint._id || complaint.complaintId}/reverify`, {
        action: selectedAction,
        reopenReason: selectedAction === 'CONFIRM_RESOLVED' ? 'Citizen confirmed issue resolved on site.' : reopenReason,
        reopenPhoto: selectedAction === 'CONFIRM_RESOLVED' ? '' : reopenPhoto,
      });

      addToast(res.data.message, selectedAction === 'CONFIRM_RESOLVED' ? 'success' : 'warning');
      if (onSuccess) onSuccess(res.data.complaint);
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error submitting citizen re-verification', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReopenPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-['Outfit'] text-white">
              Citizen Re-Verification Protocol
            </h3>
            <p className="text-xs text-slate-400">
              Complaint <strong className="text-emerald-400">{complaint.complaintId}</strong> • {complaint.category}
            </p>
          </div>
        </div>

        {/* 2 Clear Options Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">
            Select Your Ground Inspection Verdict:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedAction('CONFIRM_RESOLVED')}
              className={`p-3.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                selectedAction === 'CONFIRM_RESOLVED'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>✓ Issue Resolved</span>
              <span className="text-[10px] font-normal text-slate-400">Confirm site is clean</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAction('DISPUTE_STILL_EXISTS')}
              className={`p-3.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                selectedAction === 'DISPUTE_STILL_EXISTS'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>⚠ Issue Still Exists</span>
              <span className="text-[10px] font-normal text-slate-400">Reopen & provide photo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedAction === 'DISPUTE_STILL_EXISTS' ? (
            <>
              {/* Fresh Rebuttal Evidence Photo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Fresh Ground Evidence Photo:
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>GPS: {citizenGps.latitude.toFixed(4)}°, {citizenGps.longitude.toFixed(4)}°</span>
                  </span>
                </div>
                <div className="relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-3 text-center">
                  {reopenPhoto ? (
                    <div className="space-y-2">
                      <img
                        src={reopenPhoto}
                        alt="Rebuttal Evidence"
                        className="w-full h-32 object-cover rounded-lg border border-slate-800"
                      />
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Rebuttal Photo Loaded (±{citizenGps.accuracy}m GPS)
                        </span>
                        <label className="text-[11px] text-amber-400 hover:underline cursor-pointer">
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
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
                        Upload Ground Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Dispute Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dispute Explanation:
                </label>
                <textarea
                  required
                  rows={2}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Describe why the issue remains unresolved on the ground..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
              You are confirming that the reported civic grievance has been satisfactorily resolved. This will finalize the verification audit trail.
            </div>
          )}

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
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-lg flex items-center gap-2 transition-all ${
                selectedAction === 'CONFIRM_RESOLVED'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-orange-950'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              {isSubmitting
                ? 'Processing...'
                : selectedAction === 'CONFIRM_RESOLVED'
                ? 'Confirm & Close Grievance'
                : 'Submit Dispute & Reopen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReopenModal;
