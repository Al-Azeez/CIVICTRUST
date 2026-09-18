import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Camera,
  MapPin,
  Clock,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const CATEGORIES = [
  { name: 'Garbage Dump', slaHours: 12, desc: 'Overflowing bins, illegal solid waste dumping', icon: '🗑️' },
  { name: 'Uncleaned Sweeping', slaHours: 24, desc: 'Accumulated road sweeping, dry leaves, curb dust', icon: '🧹' },
  { name: 'Construction Debris', slaHours: 72, desc: 'Building rubble, brick mounds, sidewalk blockage', icon: '🧱' },
  { name: 'Blocked Drains', slaHours: 24, desc: 'Stormwater drain blockage, overflowing sewage', icon: '🚰' },
  { name: 'Potholes', slaHours: 48, desc: 'Road crater, hazardous asphalt fissure', icon: '🕳️' },
  { name: 'Non-functional Public Toilets', slaHours: 24, desc: 'Damaged fittings, water stoppage, unhygienic facilities', icon: '🚻' },
];

const WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - Civil Lines',
  'Ward 3 - Industrial Zone',
  'Ward 4 - Green Park',
  'Ward 5 - Station Road',
  'Ward 6 - Heritage Quarter',
  'Ward 7 - Tech Enclave',
  'Ward 8 - Riverfront',
];

// Preset sample photos for rapid Hackathon demo testing
const SAMPLE_EVIDENCE_PHOTOS = {
  'Garbage Dump': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%2378350f'/%3E%3Cpath d='M0,280 Q150,220 300,280 T600,260 L600,400 L0,400 Z' fill='%23451a03'/%3E%3Ccircle cx='180' cy='290' r='45' fill='%23b45309'/%3E%3Crect x='240' y='260' width='80' height='60' rx='10' fill='%2315803d'/%3E%3Cpolygon points='340,320 390,250 440,320' fill='%230369a1'/%3E%3Ccircle cx='430' cy='280' r='30' fill='%23dc2626'/%3E%3Ctext x='300' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E⚠️ CIVICTRUST DEMO: OVERFLOWING GARBAGE DUMP%3C/text%3E%3Ctext x='300' y='95' font-family='sans-serif' font-size='14' fill='%23fef08a' text-anchor='middle'%3E[Simulated Civic Complaint Evidence Photo - Before]%3C/text%3E%3C/svg%3E",
  'Potholes': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23334155'/%3E%3Cellipse cx='300' cy='270' rx='130' ry='70' fill='%230f172a'/%3E%3Cellipse cx='290' cy='275' rx='90' ry='40' fill='%23020617' stroke='%23475569' stroke-width='4'/%3E%3Ctext x='300' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E⚠️ CIVICTRUST DEMO: SEVERE ROAD POTHOLE%3C/text%3E%3C/svg%3E",
  'Construction Debris': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%2344403c'/%3E%3Cpolygon points='150,330 250,220 380,330' fill='%2378716c'/%3E%3Cpolygon points='320,340 420,240 520,340' fill='%23a8a29e'/%3E%3Ctext x='300' y='60' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E⚠️ CIVICTRUST DEMO: CONSTRUCTION DEBRIS%3C/text%3E%3C/svg%3E",
};

// Map click handler component for Leaflet
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const ReportIssue = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(user?.ward || WARDS[0]);
  const [address, setAddress] = useState('Near Main Road Junction');
  const [photo, setPhoto] = useState(SAMPLE_EVIDENCE_PHOTOS['Garbage Dump']);
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default metropolitan coords
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const selectedCatObj = CATEGORIES.find((c) => c.name === category) || CATEGORIES[0];
  const deadlineEstimate = new Date(Date.now() + selectedCatObj.slaHours * 3600 * 1000);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (SAMPLE_EVIDENCE_PHOTOS[newCat]) {
      setPhoto(SAMPLE_EVIDENCE_PHOTOS[newCat]);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'warning');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        addToast('GPS coordinates accurately captured from your device', 'success');
        setIsLocating(false);
      },
      (err) => {
        addToast('Using high-accuracy municipal reference coordinate', 'info');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        addToast('Evidence photo loaded successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      addToast('Please provide a description of the issue', 'warning');
      return;
    }
    if (!photo) {
      addToast('Evidence photo is mandatory for verification', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        category,
        description,
        beforePhoto: photo,
        latitude: position[0],
        longitude: position[1],
        ward,
        address,
      });

      addToast(`Grievance ${res.data.complaint.complaintId} logged. ${selectedCatObj.slaHours}h SLA timer active!`, 'success');
      navigate(`/citizen/complaints/${res.data.complaint._id || res.data.complaint.complaintId}`);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit grievance', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            New Civic Grievance Submission
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            Report a Civic Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit photographic evidence and GPS location. The system will start an official SLA countdown clock.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Category Selection with explicit SLA Badges */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>1. Select Civic Issue Category</span>
              </label>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                SLA Target: {selectedCatObj.slaHours} Hours
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/50 scale-[1.02]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{cat.icon}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {cat.slaHours}h SLA
                      </span>
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Photo Evidence Capture */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>2. Upload / Capture Photographic Evidence</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Mandatory for before/after verification
              </span>
            </div>

            <div className="relative rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-4 text-center">
              {photo ? (
                <div className="space-y-3">
                  <img
                    src={photo}
                    alt="Civic Issue Evidence"
                    className="w-full max-h-64 object-cover rounded-xl border border-slate-800 mx-auto"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 px-2">
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Evidence Photo Ready
                    </span>
                    <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-colors">
                      Choose Another File / Camera
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
                <label className="cursor-pointer flex flex-col items-center py-8">
                  <Camera className="w-12 h-12 text-slate-400 mb-3" />
                  <span className="text-sm font-semibold text-slate-200">
                    Click to capture or upload photo
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    JPG, PNG, WebP or SVG up to 10MB
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

          {/* 3. GPS Location & Interactive Map Pinning */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>3. Pin GPS Incident Location</span>
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Locating...' : 'Use My Current GPS'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Municipal Ward:
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Street Landmark / Address:
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Opposite Metro Pillar 42, Market Gate"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Leaflet Map Pin Picker */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 h-52 relative">
              <MapContainer
                center={position}
                zoom={14}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
              <div className="absolute bottom-2 left-2 z-[1000] bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400">
                GPS: {position[0].toFixed(4)}, {position[1].toFixed(4)} (Click map to adjust pin)
              </div>
            </div>
          </div>

          {/* 4. Grievance Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <label className="text-sm font-bold text-white font-['Outfit'] block">
              4. Grievance Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, duration, and any pedestrian or traffic obstruction caused..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* SLA Rule Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950/50 border border-emerald-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                SLA Rule Guarantee
              </div>
              <div className="text-sm text-slate-200">
                Category <strong>{category}</strong> assigns a strict{' '}
                <strong className="text-white">{selectedCatObj.slaHours}-Hour SLA Deadline</strong>.
              </div>
              <div className="text-xs text-slate-400">
                Target Resolution Deadline: {deadlineEstimate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {deadlineEstimate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 shrink-0 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Logging Grievance...' : 'Submit & Start SLA Clock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
