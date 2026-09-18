import React, { useState } from 'react';
import { RotateCcw, Upload, Camera, AlertTriangle, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// Preset rebuttal photo for quick hackathon testing
const SAMPLE_REBUTTAL_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%237f1d1d'/%3E%3Ccircle cx='200' cy='280' r='45' fill='%23b45309'/%3E%3Crect x='270' y='260' width='80' height='60' rx='5' fill='%2315803d'/%3E%3Ccircle cx='400' cy='290' r='35' fill='%23eab308'/%3E%3Ctext x='300' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E🔄 RE-VERIFICATION EVIDENCE (CITIZEN REBUTTAL)%3C/text%3E%3Ctext x='300' y='95' font-family='sans-serif' font-size='14' fill='%23fef08a' text-anchor='middle'%3E[Fresh Geo-tagged Rebuttal Photo Taken Today]%3C/text%3E%3C/svg%3E";

const ReopenModal = ({ complaint, isOpen, onClose, onSuccess }) => {
  const [reopenReason, setReopenReason] = useState('');
  const [reopenPhoto, setReopenPhoto] = useState(SAMPLE_REBUTTAL_PHOTO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      addToast('Please provide an explanation for reopening.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/complaints/${complaint._id || complaint.complaintId}/reverify`, {
        reopenReason,
        reopenPhoto,
      });

      addToast('Complaint reopened and escalated back to municipal department.', 'success');
      if (onSuccess) onSuccess(res.data.complaint);
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error reopening complaint', 'error');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl shadow-amber-950/30 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-['Outfit'] text-white">
              Citizen Re-Verification & Reopen
            </h3>
            <p className="text-xs text-amber-300 font-medium">
              The resolution could not be confidently verified.
            </p>
          </div>
        </div>

        {/* Advisory Warning */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 mb-5 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            You are disputing the claimed resolution for{' '}
            <strong className="text-white">{complaint.complaintId}</strong> ({complaint.category}). Provide current ground evidence photo and reason.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fresh Rebuttal Evidence Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Fresh Ground Photo Evidence:
            </label>
            <div className="relative rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 p-3 text-center hover:border-amber-500/50 transition-colors">
              {reopenPhoto ? (
                <div className="space-y-2">
                  <img
                    src={reopenPhoto}
                    alt="Rebuttal Evidence"
                    className="w-full h-36 object-cover rounded-lg border border-slate-800"
                  />
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Evidence Photo Loaded
                    </span>
                    <label className="text-[11px] text-amber-400 hover:underline cursor-pointer">
                      Change Photo
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
                    Click to upload ground rebuttal photo
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

          {/* Explanation / Reopen Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Citizen Explanation / Dispute Details:
            </label>
            <textarea
              required
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g., Visited the spot today at 10 AM. The garbage pile is still uncleared, only a small portion was shifted."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-950 flex items-center gap-2 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              {isSubmitting ? 'Reopening...' : 'Reopen Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReopenModal;
