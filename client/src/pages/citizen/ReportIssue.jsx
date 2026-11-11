import React, { useState, useEffect } from 'react';
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
  Layers,
  ExternalLink,
  Globe,
  Compass,
  ShieldCheck,
  EyeOff,
  Building2,
  Video,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import GoogleLocationMap from '../../components/GoogleLocationMap';
import LiveCameraModal from '../../components/LiveCameraModal';
import { reverseGeocodeCoordinates } from '../../utils/locationHelper';

const CATEGORIES = [
  { name: 'Garbage Dump', slaHours: 12, desc: 'Overflowing bins, solid waste dumps, biohazard litter', icon: '🗑️' },
  { name: 'Uncleaned Sweeping', slaHours: 24, desc: 'Accumulated road sweeping residue, dry leaves, curb dust', icon: '🧹' },
  { name: 'Construction Debris', slaHours: 72, desc: 'Building rubble, brick mounds, sidewalk blockage', icon: '🧱' },
  { name: 'Blocked Drains', slaHours: 24, desc: 'Stormwater drain blockage, overflowing sewage runoff', icon: '🚰' },
  { name: 'Potholes', slaHours: 48, desc: 'Hazardous asphalt crater, road depression, fissure', icon: '🕳️' },
  { name: 'Non-functional Public Toilets', slaHours: 24, desc: 'Damaged fittings, water stoppage, unhygienic state', icon: '🚻' },
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

const SAMPLE_EVIDENCE_PHOTOS = {
  'Garbage Dump': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231e293b'/%3E%3Cpath d='M0,280 Q150,220 300,280 T600,260 L600,400 L0,400 Z' fill='%230f172a'/%3E%3Ccircle cx='180' cy='290' r='45' fill='%23b45309'/%3E%3Crect x='240' y='260' width='80' height='60' rx='10' fill='%2315803d'/%3E%3Cpolygon points='340,320 390,250 440,320' fill='%230369a1'/%3E%3Ccircle cx='430' cy='280' r='30' fill='%23dc2626'/%3E%3Crect x='100' y='310' width='50' height='40' fill='%23eab308'/%3E%3Ctext x='300' y='50' font-family='sans-serif' font-size='20' font-weight='bold' fill='%2338bdf8' text-anchor='middle'%3E⚠️ CIVICTRUST EVIDENCE: OVERFLOWING SOLID WASTE%3C/text%3E%3Ctext x='300' y='80' font-family='sans-serif' font-size='13' fill='%23fef08a' text-anchor='middle'%3E[Original Citizen Report Photographic Evidence]%3C/text%3E%3C/svg%3E",
  'Potholes': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231e293b'/%3E%3Cellipse cx='300' cy='250' rx='130' ry='70' fill='%230f172a'/%3E%3Cellipse cx='290' cy='255' rx='90' ry='40' fill='%23020617' stroke='%2338bdf8' stroke-width='3'/%3E%3Ctext x='300' y='50' font-family='sans-serif' font-size='20' font-weight='bold' fill='%2338bdf8' text-anchor='middle'%3E⚠️ ROAD HAZARD: POTHOLE CRATER%3C/text%3E%3Ctext x='300' y='80' font-family='sans-serif' font-size='13' fill='%23fef08a' text-anchor='middle'%3E[Mandated 48h SLA Target]%3C/text%3E%3C/svg%3E",
  'Construction Debris': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231e293b'/%3E%3Cpolygon points='150,330 250,220 380,330' fill='%23475569'/%3E%3Cpolygon points='320,340 420,240 520,340' fill='%2364748b'/%3E%3Ctext x='300' y='50' font-family='sans-serif' font-size='20' font-weight='bold' fill='%2338bdf8' text-anchor='middle'%3E⚠️ CONSTRUCTION DEBRIS EVIDENCE%3C/text%3E%3Ctext x='300' y='80' font-family='sans-serif' font-size='13' fill='%23fef08a' text-anchor='middle'%3E[Public Footpath Blockage - 72h SLA Target]%3C/text%3E%3C/svg%3E",
  'OSINT Demo: Shop Signboard (Green Park)': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%230f172a'/%3E%3Crect x='0' y='220' width='600' height='180' fill='%231e293b'/%3E%3Crect x='40' y='40' width='520' height='70' rx='6' fill='%230284c7' stroke='%2338bdf8' stroke-width='2'/%3E%3Ctext x='300' y='72' font-family='sans-serif' font-size='18' font-weight='900' fill='%23ffffff' text-anchor='middle'%3EGUPTA ELECTRICALS &amp; SANITARY%3C/text%3E%3Ctext x='300' y='96' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23fef08a' text-anchor='middle'%3EGREEN PARK MAIN MARKET • WARD 4 • NEAR COMMUNITY CENTER GATE 3 • PIN 110016%3C/text%3E%3Ccircle cx='180' cy='290' r='45' fill='%23b45309'/%3E%3Crect x='240' y='250' width='80' height='70' rx='8' fill='%2315803d'/%3E%3Ctext x='280' y='290' font-family='sans-serif' font-size='20' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E♻️%3C/text%3E%3Ccircle cx='430' cy='280' r='30' fill='%23dc2626'/%3E%3Crect x='100' y='310' width='60' height='40' fill='%23eab308'/%3E%3Ctext x='300' y='385' font-family='monospace' font-size='11' font-weight='bold' fill='%2338bdf8' text-anchor='middle'%3E[EVIDENCE PHOTO WITH SHOP SIGNBOARD • NO GPS]%3C/text%3E%3C/svg%3E",
  'OSINT Demo: Metro Pillar & Heritage Arch (Civil Lines)': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23090e1d'/%3E%3Crect x='0' y='260' width='600' height='140' fill='%231e293b'/%3E%3Crect x='80' y='80' width='60' height='240' fill='%2364748b' stroke='%2394a3b8' stroke-width='2'/%3E%3Ctext x='110' y='200' font-family='monospace' font-size='14' font-weight='bold' fill='%2338bdf8' transform='rotate(-90 110,200)' text-anchor='middle'%3EDMRC PILLAR 42B%3C/text%3E%3Cpath d='M250,260 Q350,110 450,260' fill='none' stroke='%23f59e0b' stroke-width='12'/%3E%3Ctext x='350' y='140' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23fef08a' text-anchor='middle'%3ECIVIL LINES HERITAGE MEMORIAL%3C/text%3E%3Ctext x='300' y='50' font-family='sans-serif' font-size='16' font-weight='bold' fill='%23a855f7' text-anchor='middle'%3E🏛️ LANDMARK EVIDENCE • CIVIL LINES WARD 2%3C/text%3E%3C/svg%3E",
  'OSINT Demo: Pothole Crater (Uncertain)': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23111827'/%3E%3Cellipse cx='300' cy='200' rx='180' ry='100' fill='%23030712' stroke='%23ef4444' stroke-width='3' stroke-dasharray='6,4'/%3E%3Ctext x='300' y='60' font-family='sans-serif' font-size='16' font-weight='bold' fill='%23ef4444' text-anchor='middle'%3E⚠️ CLOSE-UP CRATER • NO TEXT OR LANDMARKS%3C/text%3E%3Ctext x='300' y='90' font-family='sans-serif' font-size='12' fill='%239ca3af' text-anchor='middle'%3E[Requires Admin Human Review / OSINT Followup]%3C/text%3E%3C/svg%3E",
};

const ReportIssue = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(user?.ward || 'Detecting Municipal Ward / Zone...');
  const [address, setAddress] = useState('Acquiring exact incident location...');
  const [detectedLandmark, setDetectedLandmark] = useState('');
  const [photo, setPhoto] = useState(SAMPLE_EVIDENCE_PHOTOS['Garbage Dump']);
  const [position, setPosition] = useState([28.6259, 77.2240]);
  const [includeGps, setIncludeGps] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const selectedCatObj = CATEGORIES.find((c) => c.name === category) || CATEGORIES[0];
  const deadlineEstimate = new Date(Date.now() + selectedCatObj.slaHours * 3600 * 1000);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (SAMPLE_EVIDENCE_PHOTOS[newCat]) {
      setPhoto(SAMPLE_EVIDENCE_PHOTOS[newCat]);
    }
  };

  const resolveAddressFromCoords = async (lat, lon) => {
    try {
      const geoResult = await reverseGeocodeCoordinates(lat, lon);
      if (geoResult && geoResult.formattedAddress) {
        setAddress(geoResult.formattedAddress);
        if (geoResult.landmark) {
          setDetectedLandmark(geoResult.landmark);
        } else {
          setDetectedLandmark('');
        }
        if (geoResult.suggestedWard) {
          setWard(geoResult.suggestedWard);
        }
      }
    } catch (e) {
      console.warn('Geocoding fallback', e);
    }
  };

  const handlePositionChange = (newPos) => {
    setPosition(newPos);
    resolveAddressFromCoords(newPos[0], newPos[1]);
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setPosition([28.6259, 77.2240]);
      resolveAddressFromCoords(28.6259, 77.2240);
      addToast('Municipal calibrated coordinates assigned (Ward 4 - Green Park)', 'success');
      setIsLocating(false);
    }, 400);
  };

  useEffect(() => {
    resolveAddressFromCoords(28.6259, 77.2240);
  }, []);

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
      addToast('Photographic evidence is required for verification', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        category,
        description,
        beforePhoto: photo,
        latitude: includeGps ? position[0] : null,
        longitude: includeGps ? position[1] : null,
        ward: includeGps ? ward : 'Location Not Available',
        address: includeGps ? address : 'Location Not Available',
      });

      setSubmissionResult(res.data);
      if (!includeGps) {
        addToast(`Grievance ${res.data.complaint.complaintId} submitted without GPS! Queued for Admin OSINT verification.`, 'success');
      } else {
        addToast(`Grievance ${res.data.complaint.complaintId} submitted! ${selectedCatObj.slaHours}h SLA timer active.`, 'success');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit grievance', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Citizen Grievance Submission Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
            Report a Municipal Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Provide photo evidence and verified coordinates. The system automatically calculates SLA deadlines and initiates 4-signal Master Incident deduplication.
          </p>
        </div>

        {/* Master Incident Matching Outcome Banner if Submitted */}
        {submissionResult ? (
          <div className="p-7 rounded-[26px] bg-[#0d1527] border border-cyan-500/40 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit']">
                  {submissionResult.matchReport?.type === 'DUPLICATE_LINKED'
                    ? 'Existing Incident Found — Linked to Master Incident'
                    : submissionResult.matchReport?.type === 'RECURRING_HOTSPOT'
                    ? 'Recurring Hotspot Incident Detected'
                    : 'New Master Incident Created'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complaint <strong className="text-white">{submissionResult.complaint.complaintId}</strong> registered under Master Ticket{' '}
                  <strong className="text-cyan-400 font-mono">{submissionResult.complaint.masterIncidentId}</strong>
                </p>
              </div>
            </div>

            {/* 4 Signals Diagnostic Card */}
            {submissionResult.matchReport?.signals && (
              <div className="bg-[#060913]/90 p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  4-Signal Verification Engine Result:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#0d1527] border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Time Proximity</span>
                    <div className="font-bold text-cyan-400 mt-1 font-mono">
                      ✓ {submissionResult.matchReport.signals.timeDeltaHours}h delta
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d1527] border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Location Proximity</span>
                    <div className="font-bold text-cyan-400 mt-1 font-mono">
                      ✓ {submissionResult.matchReport.signals.distanceMeters}m distance
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d1527] border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Category Match</span>
                    <div className="font-bold text-cyan-400 mt-1 font-mono">
                      ✓ Exact Match
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d1527] border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Image Match</span>
                    <div className="font-bold text-cyan-400 mt-1 font-mono">
                      ✓ {submissionResult.matchReport.signals.imageSimilarity}% Match
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Core Rule: <em>"Remove duplicate incidents, NOT duplicate citizens' evidence."</em> Your photographic proof is securely preserved under <strong>{submissionResult.complaint.masterIncidentId}</strong>.
                </p>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/citizen/complaints/${submissionResult.complaint._id || submissionResult.complaint.complaintId}`)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                Track Grievance Timeline →
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/osint')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-violet-950 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-violet-200" />
                <span>Open Admin OSINT Verification Tool →</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Category Selection */}
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white font-['Outfit']">
                  1. Select Civic Grievance Category
                </label>
                <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
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
                          ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.02]'
                          : 'bg-[#060913]/70 border-white/5 hover:border-slate-700 hover:bg-[#060913]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{cat.icon}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {cat.slaHours}h SLA
                        </span>
                      </div>
                      <div>
                        <div className={`font-bold text-sm font-['Outfit'] ${isSelected ? 'text-white' : 'text-slate-200'}`}>
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
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>2. Upload / Capture Photographic Evidence</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Open Live Camera</span>
                  </button>
                  <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                    Mandatory verification proof
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl border-2 border-dashed border-slate-700 bg-[#060913]/70 p-4 text-center">
                {photo ? (
                  <div className="space-y-4">
                    <div className="relative inline-block w-full max-h-72 overflow-hidden rounded-xl border border-white/10 group">
                      <img
                        src={photo}
                        alt="Civic Issue Evidence"
                        className="w-full max-h-72 object-cover rounded-xl mx-auto"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Evidence Photo Ready
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Retake with Live Camera</span>
                        </button>

                        <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose File from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-semibold">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setPhoto(SAMPLE_EVIDENCE_PHOTOS['Garbage Dump'])}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5"
                        >
                          🗑️ Garbage
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhoto(SAMPLE_EVIDENCE_PHOTOS['Potholes'])}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5"
                        >
                          🕳️ Pothole
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhoto(SAMPLE_EVIDENCE_PHOTOS['OSINT Demo: Shop Signboard (Green Park)'])}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20"
                        >
                          🏪 Signboard
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 px-4 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Capture or Upload Evidence Photo</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Take a real-time live snapshot or select an image file from your device
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Open Live Camera & Take Snapshot</span>
                      </button>

                      <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-colors flex items-center gap-2 border border-slate-700">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Upload File from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Location Details & GPS Option */}
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-5 shadow-xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>3. Location & GPS Coordinates (Optional)</span>
                </label>

                {/* GPS vs No-GPS Toggle */}
                <div className="flex items-center bg-[#060913] p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIncludeGps(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      includeGps
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Include GPS Location</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeGps(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !includeGps
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Report Without GPS (OSINT)</span>
                  </button>
                </div>
              </div>

              {includeGps ? (
                /* Mode A: GPS Enabled */
                <div className="space-y-4 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      GPS coordinates are captured directly from device sensors.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                        {isLocating ? 'Calibrating...' : 'Calibrate Municipal GPS'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          Municipal Ward / Locality:
                        </label>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Auto-detected
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        list="wards-list"
                        placeholder="e.g. Ward 4 - Green Park"
                        className="w-full px-3.5 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                      <datalist id="wards-list">
                        {ward && !WARDS.includes(ward) && <option value={ward} />}
                        {WARDS.map((w) => (
                          <option key={w} value={w} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          Exact Street / Landmark Address:
                        </label>
                        {detectedLandmark && (
                          <span className="text-[10px] text-cyan-400 truncate max-w-[200px]" title={detectedLandmark}>
                            📍 {detectedLandmark}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Near Community Center, Main Road"
                        className="w-full px-3.5 py-2.5 bg-[#060913] border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Interactive Google Location Map */}
                  <GoogleLocationMap
                    latitude={position[0]}
                    longitude={position[1]}
                    accuracy={6}
                    address={address}
                    title="Grievance Ground Incident Location"
                    height="260px"
                    interactive={true}
                    onPositionChange={handlePositionChange}
                    primaryLabel="Grievance Site Location"
                  />
                </div>
              ) : (
                /* Mode B: Report Without GPS (OSINT Verification) */
                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#090e1d] to-[#060913] border border-violet-500/30 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-['Outfit']">
                          Location Not Available — Privacy Preserved
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          OSINT Verification Queued
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No GPS coordinates, network triangulation, or citizen location data is collected. Your report is marked as <strong className="text-white">“Location Not Available”</strong>.
                      </p>
                    </div>
                  </div>

                  {/* 3 Analysis Steps overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#0d1527] border border-white/5 space-y-1">
                      <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 1. OCR Text Clues
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Extracts shop boards, street signs, and ward codes from image.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0d1527] border border-white/5 space-y-1">
                      <div className="font-bold text-violet-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-violet-400" /> 2. Landmark AI
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Detects municipal bins, arches, metro pillars, and dividers.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0d1527] border border-white/5 space-y-1">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" /> 3. Scene Similarity
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Compares visual features against municipal ward archives.
                      </div>
                    </div>
                  </div>

                  {/* Dedicated OSINT Photo Upload & Presets Area */}
                  <div className="p-4 rounded-xl bg-[#060913]/90 border border-slate-700/70 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-violet-400" />
                        <span>Evidence Photo for OSINT Analysis:</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Live Camera</span>
                        </button>
                        <label className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-white/10">
                          <Upload className="w-3.5 h-3.5 text-violet-300" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Quick Demo Photo Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 block font-semibold">
                        Or select sample OSINT test photo:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto(SAMPLE_EVIDENCE_PHOTOS['OSINT Demo: Shop Signboard (Green Park)']);
                            addToast('Loaded evidence photo with shop signboard (Ward 4)', 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0d1527] hover:bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <span>🏪 Shop Signboard (Ward 4)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto(SAMPLE_EVIDENCE_PHOTOS['OSINT Demo: Metro Pillar & Heritage Arch (Civil Lines)']);
                            addToast('Loaded evidence photo with metro pillar & heritage arch (Ward 2)', 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0d1527] hover:bg-violet-950/80 border border-violet-500/30 text-violet-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <span>🏛️ Metro Pillar & Arch (Ward 2)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto(SAMPLE_EVIDENCE_PHOTOS['OSINT Demo: Pothole Crater (Uncertain)']);
                            addToast('Loaded uncertain crater photo (No signboards)', 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0d1527] hover:bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <span>🕳️ Crater (Uncertain Clues)</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Photo Status Card */}
                    {photo && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d1527] border border-violet-500/20">
                        <img
                          src={photo}
                          alt="OSINT Preview"
                          className="w-16 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              Evidence Photo Ready for OSINT
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                              No GPS Metadata
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            Ready for Admin 4-Module Analysis (OCR + Landmark + Scene Similarity)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10 text-[11px] text-slate-400">
                    <span>💡 Tip: Ensure visible shop boards, road signs, or distinctive civic structures for 80%+ accuracy.</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Description */}
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-3 shadow-xl backdrop-blur-md">
              <label className="text-sm font-bold text-white font-['Outfit'] block">
                4. Grievance Description & Context
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the severity, duration, and specific location markers..."
                className="w-full px-4 py-3 bg-[#060913] border border-slate-700 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* SLA Rule Summary & Submit CTA */}
            <div className="bg-gradient-to-r from-[#0d1527] to-[#0c1a36] border border-cyan-500/30 rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="text-xs text-cyan-400 font-extrabold uppercase tracking-wider">
                  Mandatory SLA Target Assigned
                </div>
                <div className="text-sm text-slate-200">
                  Category <strong>{category}</strong> triggers a strict{' '}
                  <strong className="text-white">{selectedCatObj.slaHours}-Hour SLA Clock</strong>.
                </div>
                <div className="text-xs text-slate-400">
                  Target Resolution Deadline: {deadlineEstimate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {deadlineEstimate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 shrink-0 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Evaluating 4 Signals...' : 'Submit & Start SLA Clock'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Live Camera Snapshot Modal */}
      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(snap) => {
          setPhoto(snap);
          addToast('Live camera snapshot captured successfully', 'success');
        }}
      />
    </div>
  );
};

export default ReportIssue;
