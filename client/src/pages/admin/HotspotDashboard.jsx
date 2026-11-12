import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import HotspotMap from '../../components/HotspotMap';
import { Flame, ShieldAlert, AlertTriangle, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';

const HotspotDashboard = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const res = await api.get('/analytics/hotspots');
        setPoints(res.data.points || []);
      } catch (e) {
        console.warn('Error fetching hotspot data');
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  const suspiciousCount = points.filter((p) => p.status === 'SUSPICIOUS' || p.status === 'REOPENED').length;
  const breachedCount = points.filter((p) => p.slaState === 'SLA_BREACHED').length;
  const verifiedCount = points.filter((p) => p.status === 'VERIFIED' || p.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          Geospatial Grievance & Resolution Density Map
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
          Civic Hotspots & Resolution Cluster Map
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Geographic cluster visualization identifying municipal zones with high concentrations of complaints and repeated suspicious closures.
        </p>
      </div>

      {/* Quick Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-white/10 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Mapped Incidents</div>
          <div className="text-3xl font-black font-mono text-white mt-1">
            {points.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active coordinate pins</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-rose-500/20 shadow-lg">
          <div className="text-xs text-rose-400 font-semibold uppercase">Suspicious / Reopened</div>
          <div className="text-3xl font-black font-mono text-rose-300 mt-1">
            {suspiciousCount}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">High audit priority</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-amber-500/20 shadow-lg">
          <div className="text-xs text-amber-400 font-semibold uppercase">SLA Breached</div>
          <div className="text-3xl font-black font-mono text-amber-300 mt-1">
            {breachedCount}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Overdue resolution target</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1527]/85 border border-emerald-500/20 shadow-lg">
          <div className="text-xs text-emerald-400 font-semibold uppercase">Verified Clean</div>
          <div className="text-3xl font-black font-mono text-emerald-300 mt-1">
            {verifiedCount}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Cleared & verified</div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="bg-[#0d1527] border border-cyan-500/20 rounded-[28px] p-6 shadow-2xl space-y-4 backdrop-blur-md">
        {loading ? (
          <div className="h-[550px] flex items-center justify-center text-slate-400 text-sm">
            Loading interactive geospatial maps...
          </div>
        ) : (
          <HotspotMap points={points} height="560px" />
        )}
      </div>
    </div>
  );
};

export default HotspotDashboard;
