import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  MapPin,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const WardAnalytics = () => {
  const [charts, setCharts] = useState(null);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chartRes, wardRes] = await Promise.all([
          api.get('/analytics/charts'),
          api.get('/analytics/wards'),
        ]);
        setCharts(chartRes.data);
        setWards(wardRes.data.wards);
      } catch (e) {
        console.warn('Error fetching analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        Loading civic analytics & metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <BarChart3 className="w-3.5 h-3.5" />
          Comprehensive Performance & Verification Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          SLA, Ward & Category Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          In-depth audit metrics on resolution integrity, category distribution, SLA adherence, and ward-by-ward performance.
        </p>
      </div>

      {/* 4 Interactive Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Complaints by Category */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Complaints by Category
            </h3>
            <span className="text-xs text-slate-400 font-mono">Volume</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.categoryData || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. SLA Adherence Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              SLA Adherence Ratio
            </h3>
            <span className="text-xs text-slate-400 font-mono">Status Distribution</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.slaData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.slaData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Verification Outcomes */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Resolution Verification Outcomes
            </h3>
            <span className="text-xs text-slate-400 font-mono">Verification Status</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.verificationData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.verificationData || []).map((entry, index) => (
                    <Cell key={`cell-ver-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Timeline Trends */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Complaints & Resolutions Over Time
            </h3>
            <span className="text-xs text-slate-400 font-mono">7-Day Trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.timelineData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
                <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSubmitted)" name="Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ward Analytics Scorecard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Ward Performance & Verification Scorecard
            </h2>
            <p className="text-xs text-slate-400">
              Ward-by-ward breakdown of grievance volume, SLA adherence, suspicious closures, and citizen reopens
            </p>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {wards.length} Municipal Wards Monitored
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Ward Name</th>
                <th className="px-4 py-3.5 text-center">Complaints</th>
                <th className="px-4 py-3.5 text-center">SLA Adherence</th>
                <th className="px-4 py-3.5 text-center">SLA Breaches</th>
                <th className="px-4 py-3.5 text-center">Suspicious Closures</th>
                <th className="px-4 py-3.5 text-center">Reopened</th>
                <th className="px-4 py-3.5 text-right">Hotspot Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {wards.map((w, idx) => (
                <tr key={w.ward} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm font-['Outfit']">
                      {w.ward}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-200">
                    {w.totalComplaints}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                        w.slaAdherenceRate >= 80
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : w.slaAdherenceRate >= 60
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      {w.slaAdherenceRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-amber-400 font-semibold">
                    {w.slaBreaches}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-rose-400 font-bold">
                    {w.suspiciousClosures > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300">
                        {w.suspiciousClosures} ⚠️
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-orange-400 font-semibold">
                    {w.reopenedComplaints > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-orange-950/80 border border-orange-800 text-orange-300">
                        {w.reopenedComplaints} 🔄
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                    {w.hotspotScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-500 italic text-center pt-2">
          ⚠️ <strong>Prototype / Synthetic Data:</strong> Values generated for hackathon benchmarking purposes. Not an official municipal ranking.
        </div>
      </div>
    </div>
  );
};

export default WardAnalytics;
