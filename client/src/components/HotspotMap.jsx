import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Flame, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix standard Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored map markers
const createCustomIcon = (color, isPulse = false) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position: relative; width: 26px; height: 26px;">
        ${isPulse ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
          •
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

const redIcon = createCustomIcon('#ef4444', true);
const orangeIcon = createCustomIcon('#f97316');
const greenIcon = createCustomIcon('#10b981');
const blueIcon = createCustomIcon('#3b82f6');

const HotspotMap = ({ points = [], height = '500px', center = [28.6139, 77.2090], zoom = 12 }) => {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'SUSPICIOUS' | 'BREACHED' | 'VERIFIED'

  const filteredPoints = points.filter((p) => {
    if (filter === 'SUSPICIOUS') return p.status === 'SUSPICIOUS' || p.status === 'REOPENED';
    if (filter === 'BREACHED') return p.slaState === 'SLA_BREACHED';
    if (filter === 'VERIFIED') return p.status === 'VERIFIED' || p.status === 'RESOLVED';
    return true;
  });

  const suspiciousCount = points.filter((p) => p.status === 'SUSPICIOUS' || p.status === 'REOPENED').length;
  const breachedCount = points.filter((p) => p.slaState === 'SLA_BREACHED').length;

  return (
    <div className="space-y-3">
      {/* Top Controls & Disclaimer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Flame className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold text-white">Interactive Civic Hotspot Grid</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Showing <strong className="text-white">{filteredPoints.length}</strong> of {points.length} locations
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Points
          </button>
          <button
            onClick={() => setFilter('SUSPICIOUS')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              filter === 'SUSPICIOUS' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Suspicious ({suspiciousCount})
          </button>
          <button
            onClick={() => setFilter('BREACHED')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              filter === 'BREACHED' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            Breached ({breachedCount})
          </button>
          <button
            onClick={() => setFilter('VERIFIED')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              filter === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Verified
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950" style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredPoints.map((point) => {
            let icon = blueIcon;
            let circleColor = '#3b82f6';

            if (point.status === 'SUSPICIOUS' || point.status === 'REOPENED') {
              icon = redIcon;
              circleColor = '#ef4444';
            } else if (point.slaState === 'SLA_BREACHED') {
              icon = orangeIcon;
              circleColor = '#f97316';
            } else if (point.status === 'VERIFIED' || point.status === 'RESOLVED') {
              icon = greenIcon;
              circleColor = '#10b981';
            }

            return (
              <React.Fragment key={point.id}>
                {/* Cluster heat circle */}
                <Circle
                  center={[point.lat, point.lng]}
                  radius={point.radius ? point.radius * 30 : 500}
                  pathOptions={{
                    fillColor: circleColor,
                    fillOpacity: 0.2,
                    color: circleColor,
                    weight: 1.5,
                  }}
                />

                <Marker position={[point.lat, point.lng]} icon={icon}>
                  <Popup>
                    <div className="p-1 min-w-[220px] text-slate-900 font-sans">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {point.complaintId}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            point.status === 'SUSPICIOUS' || point.status === 'REOPENED'
                              ? 'bg-rose-100 text-rose-700'
                              : point.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {point.status}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-slate-900 mb-0.5">
                        {point.category}
                      </div>
                      <div className="text-xs text-slate-600 mb-2">
                        📍 {point.ward}
                      </div>

                      <p className="text-[11px] text-slate-700 leading-snug line-clamp-2 mb-2">
                        {point.description}
                      </p>

                      <Link
                        to={`/citizen/complaints/${point._id || point.complaintId}`}
                        className="block text-center text-xs font-semibold py-1 px-2 rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        Inspect Evidence & SLA →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md text-[11px] shadow-lg space-y-1.5">
          <div className="font-bold text-slate-300">Hotspot Legend:</div>
          <div className="flex items-center gap-2 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow" />
            <span>Suspicious / Reopened</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow" />
            <span>SLA Breached</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow" />
            <span>Verified Resolved</span>
          </div>
          <div className="flex items-center gap-2 text-sky-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow" />
            <span>Active / In Progress</span>
          </div>
        </div>
      </div>

      {/* Mandatory Problem Statement Rule Notice */}
      <div className="text-[11px] text-slate-400 italic text-center">
        ⚠️ <strong>Potential Hotspot — Based on Prototype/Sample Data.</strong> Not an official municipal or government ranking.
      </div>
    </div>
  );
};

export default HotspotMap;
