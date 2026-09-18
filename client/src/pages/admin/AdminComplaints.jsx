import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import SLACountdown from '../../components/SLACountdown';
import VerificationBadge from '../../components/VerificationBadge';
import ResolutionModal from '../../components/ResolutionModal';
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Garbage Dump',
  'Uncleaned Sweeping',
  'Construction Debris',
  'Blocked Drains',
  'Potholes',
  'Non-functional Public Toilets',
];

const WARDS = [
  'All Wards',
  'Ward 1 - Central Market',
  'Ward 2 - Civil Lines',
  'Ward 3 - Industrial Zone',
  'Ward 4 - Green Park',
  'Ward 5 - Station Road',
  'Ward 6 - Heritage Quarter',
  'Ward 7 - Tech Enclave',
  'Ward 8 - Riverfront',
];

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [ward, setWard] = useState('All Wards');
  const [status, setStatus] = useState('ALL');
  const [slaStatus, setSlaStatus] = useState('ALL');
  const [resolutionTarget, setResolutionTarget] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = '/complaints?';
      if (category !== 'All Categories') url += `&category=${encodeURIComponent(category)}`;
      if (ward !== 'All Wards') url += `&ward=${encodeURIComponent(ward)}`;
      if (status !== 'ALL') url += `&status=${encodeURIComponent(status)}`;
      if (slaStatus !== 'ALL') url += `&slaStatus=${encodeURIComponent(slaStatus)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setComplaints(res.data.complaints);
    } catch (error) {
      console.warn('Error fetching admin complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, ward, status, slaStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Municipal Grievance Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive grievance records with resolution claim and photo verification tools
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Total Records: <strong className="text-emerald-400">{complaints.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, address, notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </form>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Ward */}
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          {/* SLA Filter */}
          <select
            value={slaStatus}
            onChange={(e) => setSlaStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All SLA States</option>
            <option value="WITHIN_SLA">Within SLA</option>
            <option value="SLA_AT_RISK">SLA At Risk (&lt;25% left)</option>
            <option value="SLA_BREACHED">SLA Breached (Overdue)</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500 font-medium mr-1">Status:</span>
          {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'SUSPICIOUS', 'REOPENED', 'VERIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                status === st
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'SUSPICIOUS'
                ? '⚠️ Suspicious'
                : st === 'REOPENED'
                ? '🔄 Reopened'
                : st === 'VERIFIED'
                ? '✅ Verified'
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-4 py-3.5">ID & Category</th>
                <th className="px-4 py-3.5">Location & Ward</th>
                <th className="px-4 py-3.5">SLA Target & Clock</th>
                <th className="px-4 py-3.5">Verification Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No complaints match criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id || c.complaintId} className="hover:bg-slate-800/40 transition-colors">
                    {/* ID & Category */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-white text-xs">
                        {c.complaintId}
                      </div>
                      <div className="text-slate-300 font-semibold mt-0.5">
                        {c.category}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                        {c.description}
                      </div>
                    </td>

                    {/* Location & Ward */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{c.ward}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.address || 'Civic Point'}
                      </div>
                    </td>

                    {/* SLA Status & Clock */}
                    <td className="px-4 py-3.5">
                      <div className="text-[11px] text-slate-400 mb-1">
                        Target: <span className="text-white font-bold">{c.slaHours}h</span>
                      </div>
                      <SLACountdown
                        submittedAt={c.submittedAt}
                        slaDeadline={c.slaDeadline}
                        category={c.category}
                        slaHours={c.slaHours}
                        status={c.status}
                        resolvedAt={c.resolvedAt}
                        compact={true}
                      />
                    </td>

                    {/* Verification Status Badge */}
                    <td className="px-4 py-3.5">
                      <VerificationBadge
                        status={c.status}
                        verificationStatus={c.verificationStatus}
                        confidence={c.verificationConfidence}
                        size="small"
                      />
                      {c.verificationReason && (
                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px] mt-1 italic">
                          {c.verificationReason}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setResolutionTarget(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                          title="Claim resolution & run vision verification"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                        <Link
                          to={`/citizen/complaints/${c._id || c.complaintId}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1 transition-colors"
                          title="Inspect evidence details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Claim Modal */}
      <ResolutionModal
        complaint={resolutionTarget}
        isOpen={!!resolutionTarget}
        onClose={() => setResolutionTarget(null)}
        onSuccess={() => fetchComplaints()}
      />
    </div>
  );
};

export default AdminComplaints;
