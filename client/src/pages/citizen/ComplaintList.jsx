import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import SLACountdown from '../../components/SLACountdown';
import VerificationBadge from '../../components/VerificationBadge';
import {
  Search,
  Filter,
  ClipboardList,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
  Camera,
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

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [ward, setWard] = useState('All Wards');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = '/complaints?';
      if (category !== 'All Categories') url += `&category=${encodeURIComponent(category)}`;
      if (ward !== 'All Wards') url += `&ward=${encodeURIComponent(ward)}`;
      if (statusFilter !== 'ALL') url += `&status=${encodeURIComponent(statusFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setComplaints(res.data.complaints || []);
    } catch (e) {
      console.warn('Error fetching complaint list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, ward, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Civic Grievance Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track SLA countdowns, resolution claims, and verification audits
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[22px] p-5 space-y-4 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, keyword, address..."
              className="w-full pl-10 pr-3 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </form>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="px-3 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          {/* Search Button */}
          <button
            onClick={fetchComplaints}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            Apply Filters
          </button>
        </div>

        {/* Status Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Status:</span>
          {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'SUSPICIOUS', 'REOPENED', 'VERIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-950'
                  : 'bg-[#060913] border border-white/10 text-slate-400 hover:text-slate-200'
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
                : st === 'IN_PROGRESS'
                ? '🛠️ In Progress'
                : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading grievance records...
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0d1527] border border-white/10 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-base text-slate-300 font-bold">No complaints match your filter criteria.</p>
          <button
            onClick={() => {
              setCategory('All Categories');
              setWard('All Wards');
              setStatusFilter('ALL');
              setSearch('');
            }}
            className="text-xs text-cyan-400 hover:underline font-bold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c._id || c.complaintId}
              className="p-5 rounded-[22px] bg-[#0d1527]/85 border border-white/10 hover:border-cyan-500/30 flex flex-col justify-between shadow-xl space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                    {c.complaintId}
                  </span>
                  <VerificationBadge
                    status={c.status}
                    verificationStatus={c.verificationStatus}
                    confidence={c.verificationConfidence}
                    size="small"
                  />
                </div>

                {c.beforePhoto && (
                  <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#060913] h-32">
                    <img
                      src={c.beforePhoto}
                      alt="Grievance Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base font-['Outfit']">
                    {c.category}
                  </h3>
                  <div className="text-xs text-slate-300 font-medium flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{c.address || c.ward}</span>
                    </div>
                    {c.latitude && c.longitude && (
                      <span className="text-[10px] text-cyan-400 font-mono shrink-0">
                        GIS Pinned
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {c.description}
                </p>

                {c.status === 'SUSPICIOUS' && (
                  <div className="text-[11px] text-rose-300 bg-rose-950/50 p-2.5 rounded-xl border border-rose-900/40">
                    <strong>⚠️ AI Finding:</strong> {c.verificationReason || 'Residual debris present.'}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                <SLACountdown
                  submittedAt={c.submittedAt}
                  slaDeadline={c.slaDeadline}
                  category={c.category}
                  slaHours={c.slaHours}
                  status={c.status}
                  resolvedAt={c.resolvedAt}
                />

                <Link
                  to={`/citizen/complaints/${c._id || c.complaintId}`}
                  className="block text-center py-2.5 px-3 rounded-xl bg-[#060913] border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
                >
                  Inspect Evidence & Timeline →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
