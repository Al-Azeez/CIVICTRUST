import React, { useState } from 'react';
import { Users, X, CheckCircle2, ShieldCheck, MapPin, Clock, Send, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const WORKER_TEAMS = [
  { name: 'Sanitation Rapid Response Unit Alpha', lead: 'Ramesh Kumar', phone: '+91 98765 11001', category: 'Garbage Dump' },
  { name: 'Street Sweeping & Debris Squad Beta', lead: 'Suresh Rao', phone: '+91 98765 11002', category: 'Uncleaned Sweeping' },
  { name: 'Heavy Debris & Construction Clearing Unit', lead: 'Mahesh Singh', phone: '+91 98765 11003', category: 'Construction Debris' },
  { name: 'Storm Drain & Sewerage Flying Squad', lead: 'Vikram Patel', phone: '+91 98765 11004', category: 'Blocked Drains' },
  { name: 'Road Infrastructure & Asphalt Patch Crew', lead: 'Imran Khan', phone: '+91 98765 11005', category: 'Potholes' },
  { name: 'Public Sanitation & Facilities Maintenance', lead: 'Anil Sharma', phone: '+91 98765 11006', category: 'Non-functional Public Toilets' },
];

const AssignWorkerModal = ({ complaint, isOpen, onClose, onSuccess }) => {
  const [selectedTeam, setSelectedTeam] = useState(WORKER_TEAMS[0]);
  const [customWorkerName, setCustomWorkerName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !complaint) return null;

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setCustomWorkerName(team.lead);
    setCustomPhone(team.phone);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const workerName = customWorkerName || selectedTeam.lead;
    const workerPhone = customPhone || selectedTeam.phone;
    const workerTeam = selectedTeam.name;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/complaints/${complaint._id || complaint.complaintId}/assign`, {
        workerName,
        workerPhone,
        workerTeam,
        assignmentNotes: notes || `Dispatched for immediate on-site resolution in ${complaint.ward}.`,
      });

      addToast(res.data.message || `Dispatched to ${workerName}`, 'success');
      if (onSuccess) onSuccess(res.data.complaint);
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to assign worker', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0d1527] border border-cyan-500/30 p-6 shadow-2xl text-slate-100 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-['Outfit'] text-white">
              Assign Municipal Field Unit
            </h3>
            <p className="text-xs text-slate-400">
              Dispatch rapid response sanitation & engineering teams to ticket <strong className="text-cyan-400">{complaint.complaintId}</strong>
            </p>
          </div>
        </div>

        {/* Complaint Snapshot */}
        <div className="p-3.5 bg-[#060913] rounded-2xl border border-white/5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">{complaint.category}</span>
            <span className="text-cyan-400 font-mono text-[11px]">{complaint.slaHours}h SLA Target</span>
          </div>
          <div className="text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{complaint.address || complaint.ward}</span>
          </div>
        </div>

        {/* Team Selection */}
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Field Operations Team:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WORKER_TEAMS.map((team) => {
                const isSelected = selectedTeam.name === team.name;
                return (
                  <button
                    key={team.name}
                    type="button"
                    onClick={() => handleTeamSelect(team)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs space-y-1 ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md'
                        : 'bg-[#060913]/60 border-white/5 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-white truncate">{team.name}</div>
                    <div className="text-[11px] text-cyan-400">Lead: {team.lead}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{team.phone}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Officer / Lead:
              </label>
              <input
                type="text"
                required
                value={customWorkerName || selectedTeam.lead}
                onChange={(e) => setCustomWorkerName(e.target.value)}
                className="w-full px-3 py-2 bg-[#060913] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Direct Contact Phone:
              </label>
              <input
                type="text"
                required
                value={customPhone || selectedTeam.phone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#060913] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dispatch Instructions / Field Priority Notes:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Priority dispatch: Clear commercial waste bins and sanitize walkway."
              className="w-full px-3 py-2 bg-[#060913] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 flex items-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Dispatching...' : 'Dispatch Unit & Set In Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignWorkerModal;
