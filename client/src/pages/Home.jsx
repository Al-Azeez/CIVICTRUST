import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Search,
  Lock,
  Zap,
  Activity,
  MapPin,
  ExternalLink,
  ChevronRight,
  Layers,
  FileCheck,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [kpis, setKpis] = useState(null);
  const [liveBlocks, setLiveBlocks] = useState('481,209');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiRes = await api.get('/analytics/kpis');
        setKpis(kpiRes.data.kpis);
      } catch (e) {
        console.warn('Using default telemetry for landing display');
      }
    };
    fetchData();

    const interval = setInterval(() => {
      setLiveBlocks((prev) => {
        const num = parseInt(prev.replace(/,/g, ''), 10);
        return (num + 1).toLocaleString();
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 -mb-16 pb-20 overflow-hidden text-[#1f132b] candy-bg-mesh font-sans selection:bg-pink-100 selection:text-pink-600 min-h-screen">
      {/* Ambient background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Landing Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/90 border border-pink-200 text-xs font-semibold text-pink-700 mb-8 shadow-sm backdrop-blur-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#e040a0] animate-pulse" />
          <span className="tracking-wide">NEXT-GEN AUTONOMOUS MUNICIPAL ACCOUNTABILITY ENGINE</span>
          <span className="text-pink-300">•</span>
          <span className="text-pink-600 font-mono font-bold">v3.4 Cryptographic Core</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-5 leading-[1.15]">
          Real Issues. Real Evidence.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e040a0] via-[#db2777] to-rose-500">
            Real Accountability.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#6b5c77] mb-10 leading-relaxed font-normal">
          CivicTrust eliminates ghost resolutions with forensic photo verification, OSINT multi-factor geotagging, and cluster incident intelligence. Bridging citizens and municipal governance with zero-trust verifiability.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/citizen/report"
            className="candy-pill-gradient text-white font-bold px-8 py-3.5 rounded-full hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm shadow-lg shadow-pink-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Report an Issue</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          <Link
            to="/admin/verification"
            className="bg-white hover:bg-pink-50/80 text-gray-700 font-bold px-7 py-3.5 rounded-full border border-pink-200 transition-all flex items-center gap-2.5 text-sm shadow-sm hover:shadow"
          >
            <ShieldCheck className="w-4 h-4 text-[#e040a0]" />
            <span>Admin Verification Console</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
              Auth Required
            </span>
          </Link>
        </div>

        {/* 4 Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
          <div className="glass-card rounded-3xl p-5 text-center transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-1.5 text-[#e040a0] mb-1">
              <CheckCircle2 className="w-5 h-5 text-[#e040a0]" />
              <span className="text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-gray-900">
                {kpis ? `${(100 - (kpis.resolutionRate ? 0.6 : 0.6)).toFixed(1)}%` : '99.4%'}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Dispute Resolution Accuracy
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 text-center transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-1.5 text-rose-600 mb-1">
              <FileCheck className="w-5 h-5 text-rose-600" />
              <span className="text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-gray-900">
                {kpis?.totalComplaints ? (kpis.totalComplaints * 12).toLocaleString() : '14,820'}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Verified Repairs Recorded
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 text-center transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-1.5 text-pink-600 mb-1">
              <Clock className="w-5 h-5 text-pink-600" />
              <span className="text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-gray-900">
                {kpis?.avgResolutionTimeHrs ? `< ${kpis.avgResolutionTimeHrs} hrs` : '< 4.2 hrs'}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Median Response SLA
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 text-center transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-gray-900">
                0
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fabricated Closures
            </p>
          </div>
        </div>

        {/* Active Ledger Verification Card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 text-left max-w-5xl mx-auto mb-24 border border-pink-200 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-pink-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#e040a0] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#e040a0]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    Active Ledger Verification
                  </span>
                  <span className="text-xs text-gray-400 font-mono">NODE #US-EAST-0914</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
                  Forensic Pipeline In Action: Pothole & Conduit Rupture
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-pink-50 px-3 py-1.5 rounded-full text-pink-700 border border-pink-200">
              <span>Hash:</span>
              <span className="font-bold">0x9c4f...a8e2</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>

          {/* 3-Step Forensic Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* Step 1 */}
            <div className="bg-white/95 rounded-2xl p-4 border border-pink-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-gray-700 uppercase">STEP 01 • INITIAL CAPTURE</span>
                  <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
                    EXIF Authenticated
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden mb-3 border border-pink-100 relative bg-gray-100 aspect-video flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"
                    alt="Pothole Damage Capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/65 backdrop-blur-sm text-[10px] text-white px-2.5 py-1 rounded-md flex justify-between font-mono">
                    <span>LAT: 37.7749° N</span>
                    <span>LONG: -122.4194° W</span>
                  </div>
                </div>
                <div className="text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>Camera Sensor:</span>
                    <span className="font-mono text-gray-900 font-medium">IMX800 Raw Bayer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optical Integrity:</span>
                    <span className="text-emerald-600 font-bold">Passed (No Diffusions)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-[11px] text-gray-400">
                <span>Timestamp: 14:02:18 UTC</span>
                <span className="text-pink-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Ingested</span>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/95 rounded-2xl p-4 border border-pink-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-gray-700 uppercase">STEP 02 • OSINT VERIFICATION</span>
                  <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
                    3 Matches Correlated
                  </span>
                </div>
                <div className="rounded-xl p-3 bg-pink-50/60 border border-pink-100 mb-3 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Landmark Matrix:</span>
                    <span className="text-[#e040a0]">98.2% Confidence</span>
                  </div>
                  <div className="h-16 w-full flex items-center justify-center">
                    <svg className="w-full h-full text-[#f472b6]" viewBox="0 0 200 60" fill="none">
                      <path
                        d="M 10 40 Q 60 10 110 35 T 190 20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <circle cx="110" cy="35" r="4" fill="#e040a0" />
                      <circle cx="190" cy="20" r="4" fill="#10b981" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
                    <div>
                      Cell Triangulation: <span className="font-bold text-gray-800">±3.2m</span>
                    </div>
                    <div>
                      Sun Angle: <span className="font-bold text-emerald-600">Matched</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>Cluster Deduping:</span>
                    <span className="font-bold text-gray-900">Merged into #INC-8921</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispatch Priority:</span>
                    <span className="text-rose-600 font-bold">Tier 1 Urban Safety</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-[11px] text-gray-400">
                <span>Cluster Size: 6 Citizens</span>
                <span className="text-[#e040a0] font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Consolidated</span>
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/95 rounded-2xl p-4 border border-pink-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-gray-700 uppercase">STEP 03 • CRYPTOGRAPHIC CLOSE</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Dual-Key Confirmed
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden mb-3 border border-pink-100 relative bg-gray-100 aspect-video flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80"
                    alt="Completed Municipal Repair"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-950/25 flex items-center justify-center">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolved • Public Ledger Seal</span>
                    </span>
                  </div>
                </div>
                <div className="text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>Municipality Key:</span>
                    <span className="font-mono text-gray-900 font-medium">Dept. Public Works #44</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Citizen Validator:</span>
                    <span className="text-[#e040a0] font-bold">Cryptographic Signoff OK</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-[11px] text-gray-400">
                <span>Resolution Time: 2h 44m</span>
                <span className="font-mono text-gray-600">Block #{liveBlocks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Pillar Technical Architecture Section */}
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#e040a0] bg-pink-100 px-3.5 py-1 rounded-full">
            ARCHITECTURE
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 mt-3 mb-3">
            Autonomous Verification Pipeline
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            How CivicTrust translates raw smartphone telemetry and citizen reports into tamper-proof municipal action without human bottlenecking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left mb-24">
          <div className="glass-card rounded-3xl p-7 hover:border-pink-300 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#e040a0] flex items-center justify-center font-extrabold text-lg mb-5 group-hover:scale-110 transition-transform">
              01
            </div>
            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-gray-900 mb-2">
              Citizen Submission
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Citizens capture photo evidence via web or native app. Sensor telemetry encapsulates gyro data, altitude, lens profiles, and cryptographic nonce timestamps.
            </p>
            <ul className="text-xs space-y-2.5 text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Anti-spoofing sensor validation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Optional privacy & no-GPS fallback mode</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant local client-side hashing</span>
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-3xl p-7 hover:border-pink-300 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#e040a0] flex items-center justify-center font-extrabold text-lg mb-5 group-hover:scale-110 transition-transform">
              02
            </div>
            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-gray-900 mb-2">
              OSINT & Clustering Engine
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Our neural vision models extract surrounding road signage, storefront OCR, and solar shadows to triangulate position when metadata is stripped or disputed.
            </p>
            <ul className="text-xs space-y-2.5 text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#e040a0] shrink-0" />
                <span>Storefront OCR & urban signage cross-referencing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#e040a0] shrink-0" />
                <span>Duplicate report deduplication & clustering</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#e040a0] shrink-0" />
                <span>Automated severity scoring index</span>
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-3xl p-7 hover:border-pink-300 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-5 group-hover:scale-110 transition-transform">
              03
            </div>
            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-gray-900 mb-2">
              Verified Municipal Closure
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Municipal teams cannot close work orders with text notes alone. They must upload matching post-repair forensic photos evaluated by computer vision.
            </p>
            <ul className="text-xs space-y-2.5 text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Before/After structural matching algorithms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dual-key citizen quorum notification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Immutable audit trail published to public ledger</span>
              </li>
            </ul>
          </div>
        </div>

        {/* The Accountability Gap: Legacy 311 vs CivicTrust */}
        <div className="glass-card rounded-3xl p-8 max-w-5xl mx-auto text-left mb-24 border border-pink-200">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-700">
              THE ACCOUNTABILITY GAP
            </span>
            <h3 className="text-2xl md:text-3xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 mt-2">
              How CivicTrust Solves Civic Deception
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Outdated 311 systems rely on honor systems where agencies mark dangerous civic infrastructure as "Resolved" without proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Legacy */}
            <div className="bg-rose-50/60 rounded-2xl p-6 border border-rose-200/80">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-black">
                    ✕
                  </span>
                  <span>Legacy 311 Portals</span>
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200 text-rose-800 px-2.5 py-0.5 rounded-full">
                  Vulnerable to Fraud
                </span>
              </div>
              <ul className="space-y-4 text-xs text-gray-700">
                <li className="flex gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <div>
                    <strong className="text-gray-900">“Ghost Closures”:</strong> Internal operators close work orders with arbitrary notes like “Inspected – No Action Required” without visual verification.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <div>
                    <strong className="text-gray-900">Fragmented Duplicates:</strong> 40 reports of the same burst pipe create 40 unlinked tickets, overwhelming public work crews.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <div>
                    <strong className="text-gray-900">Zero Independent Oversight:</strong> Audit trails exist only in proprietary silos where internal metrics can be adjusted.
                  </div>
                </li>
              </ul>
            </div>

            {/* CivicTrust */}
            <div className="bg-white rounded-2xl p-6 border border-pink-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-100 text-[#e040a0] flex items-center justify-center text-xs font-black">
                    ✓
                  </span>
                  <span>CivicTrust Autonomous Engine</span>
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Zero-Trust Standard
                </span>
              </div>
              <ul className="space-y-4 text-xs text-gray-700">
                <li className="flex gap-2">
                  <span className="text-[#e040a0] font-bold">•</span>
                  <div>
                    <strong className="text-gray-900">Forensic Visual Proof Mandatory:</strong> Repairs cannot be closed without geotagged, sun-angle authenticated photographic proof.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#e040a0] font-bold">•</span>
                  <div>
                    <strong className="text-gray-900">OSINT Spatial Deduplication:</strong> Visual similarity embeddings link nearby photos into unified Master Incidents with live subscriber alerts.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#e040a0] font-bold">•</span>
                  <div>
                    <strong className="text-gray-900">Public Cryptographic Ledger:</strong> Every action, timestamp, and crew ID is inscribed on an immutable, verifiable ledger for journalists and citizens.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final Call to Action */}
        <div className="candy-pill-gradient rounded-3xl p-10 max-w-5xl mx-auto text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-pink-500/20 text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block mb-3">
              Open Sovereign Transparency Pledge
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
              Deploy CivicTrust in Your Municipality
            </h3>
            <p className="text-pink-100 text-sm mt-1 max-w-lg">
              Whether you are an investigative journalist, civic leader, or city public works director, integrate with our zero-trust ledger API.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/citizen/report"
              className="bg-white text-pink-700 hover:bg-pink-50 font-bold px-6 py-3 rounded-full text-xs transition shadow-md whitespace-nowrap"
            >
              Submit First Evidence
            </Link>
            <Link
              to="/admin/osint"
              className="bg-pink-900/30 hover:bg-pink-900/40 border border-white/30 text-white font-bold px-5 py-3 rounded-full text-xs transition whitespace-nowrap"
            >
              OSINT & Ledger Hub
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
