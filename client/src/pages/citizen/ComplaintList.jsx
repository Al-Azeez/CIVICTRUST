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
      setComplaints(res.data.complaints);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Civic Grievance Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track SLA countdowns, resolution claims, and verification audits
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, keyword, address..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </form>

          {/* Category Filter */}
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

          {/* Ward Filter */}
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

          {/* Search Button for manual trigger */}
          <button
            onClick={fetchComplaints}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Apply Filters
          </button>
        </div>

        {/* Status Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500 font-medium mr-1">Status:</span>
          {['ALL', 'SUBMITTED', 'SUSPICIOUS', 'REOPENED', 'VERIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === st
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
                : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Loading grievance records...
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-base text-slate-300 font-medium">No complaints match your filter criteria.</p>
          <button
            onClick={() => {
              setCategory('All Categories');
              setWard('All Wards');
              setStatusFilter('ALL');
              setSearch('');
            }}
            className="text-xs text-emerald-400 hover:underline font-semibold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c._id || c.complaintId}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {c.complaintId}
                  </span>
                  <VerificationBadge
                    status={c.status}
                    verificationStatus={c.verificationStatus}
                    confidence={c.verificationConfidence}
                    size="small"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base font-['Outfit']">
                    {c.category}
                  </h3>
                  <div className="text-xs text-emerald-400/90 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{c.ward}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {c.description}
                </p>

                {c.status === 'SUSPICIOUS' && (
                  <div className="text-[11px] text-rose-300 bg-rose-950/50 p-2 rounded-lg border border-rose-900/40">
                    <strong>⚠️ AI Advisory:</strong> {c.verificationReason || 'Residual debris present.'}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800/80">
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
                  className="block text-center py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors"
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
