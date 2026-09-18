import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Camera,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Flame,
  UserCheck,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import SLACountdown from '../components/SLACountdown';
import VerificationBadge from '../components/VerificationBadge';

const Home = () => {
  const [kpis, setKpis] = useState(null);
  const [featuredComplaints, setFeaturedComplaints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, compRes] = await Promise.all([
          api.get('/analytics/kpis'),
          api.get('/complaints?limit=3'),
        ]);
        setKpis(kpiRes.data.kpis);
        setFeaturedComplaints(compRes.data.complaints);
      } catch (e) {
        console.warn('Could not fetch home stats');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Hackathon PS-D04: "Resolved, Allegedly"
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-['Outfit'] leading-tight">
            Resolved should mean <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">resolved.</span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            Don't just report that a civic problem was resolved — <strong>verify that it actually was.</strong> CivicTrust enforces strict municipal SLAs, runs automated before/after photo verification, and empowers citizens to re-verify suspicious resolutions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/citizen/report"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              Report a Civic Issue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 transition-all"
            >
              Municipal Reviewer Portal
            </Link>
          </div>
        </div>

        {/* Live Ticker KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {kpis?.totalComplaints || '8+'}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Total Civic Grievances</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-2xl font-bold font-mono text-rose-400">
              {kpis?.suspiciousClosures || '2'}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Flagged Suspicious</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-2xl font-bold font-mono text-amber-400">
              {kpis?.reopenedComplaints || '1'}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Citizen Reopened</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-2xl font-bold font-mono text-teal-400">
              {kpis?.slaAdherenceRate ? `${kpis.slaAdherenceRate}%` : '88%'}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">SLA Adherence Rate</div>
          </div>
        </div>
      </section>

      {/* Explicit PS-D04 SLA Standards */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Mandated SLA Clock Architecture
          </h2>
          <p className="text-sm text-slate-400">
            Strict resolution timelines explicitly mandated under problem statement PS-D04.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/20 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              12 Hours SLA
            </div>
            <h3 className="text-xl font-bold text-white font-['Outfit'] mb-2">
              Garbage Dumps
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immediate dispatch for solid waste overflow. Countdown timer initiates instantly upon photo + GPS logging.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-teal-500/20 shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
              24 Hours SLA
            </div>
            <h3 className="text-xl font-bold text-white font-['Outfit'] mb-2">
              Uncleaned Sweeping
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Street sweeping residue, dry leaves, and curb dust cleared within a strict 24-hour window.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/20 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              72 Hours SLA
            </div>
            <h3 className="text-xl font-bold text-white font-['Outfit'] mb-2">
              Construction Debris
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Heavy building rubble, masonry, and walkway obstructions cleared using municipal hydraulic loaders.
            </p>
          </div>
        </div>
      </section>

      {/* The 5-Step Resolution Verification Workflow */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            End-to-End Civic Integrity Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            How CivicTrust Solves "Alleged" Resolutions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="font-bold text-white text-base">Citizen Reports</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizen captures real photo + GPS coordinates + description. SLA clock starts ticking immediately.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="font-bold text-white text-base">Resolution Claim</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Municipal contractor claims issue is fixed and uploads mandatory after-photo evidence.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-bold text-white text-base">Photo Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated vision service compares before vs after photos. If debris is still visible, flags as <strong>⚠️ Suspicious</strong>.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h4 className="font-bold text-white text-base">Re-verify & Reopen</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizen inspects evidence, uploads fresh rebuttal photo, and reopens the complaint with one click.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Live Complaints Feed */}
      {featuredComplaints.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white font-['Outfit']">
                Active Grievance Stream
              </h2>
              <p className="text-xs text-slate-400">
                Live verification and SLA states across city wards
              </p>
            </div>
            <Link
              to="/citizen/complaints"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All Complaints →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredComplaints.map((c) => (
              <div
                key={c._id || c.complaintId}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
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

                  <h3 className="font-bold text-white text-base font-['Outfit']">
                    {c.category}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="text-[11px] text-slate-500">
                    📍 {c.ward}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <SLACountdown
                    submittedAt={c.submittedAt}
                    slaDeadline={c.slaDeadline}
                    category={c.category}
                    slaHours={c.slaHours}
                    status={c.status}
                    resolvedAt={c.resolvedAt}
                    compact={true}
                  />

                  <Link
                    to={`/citizen/complaints/${c._id || c.complaintId}`}
                    className="block text-center py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Inspect Evidence Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
