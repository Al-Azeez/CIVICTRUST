import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import GoogleLocationMap from '../../components/GoogleLocationMap';
import {
  Scan,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  FileText,
  Building2,
  Image as ImageIcon,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Radio,
  SlidersHorizontal,
  Layers,
  Search,
  Eye,
  RefreshCw,
  Info,
  Map,
  Check,
  X,
  Compass,
  Upload,
  Video,
} from 'lucide-react';
import LiveCameraModal from '../../components/LiveCameraModal';

const OsintVerification = () => {
  const { addToast } = useToast();

  const [reports, setReports] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [demoScenarios, setDemoScenarios] = useState([]);
  const [activeScenarioKey, setActiveScenarioKey] = useState('verified_green_park');
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeModuleTab, setActiveModuleTab] = useState('all'); // 'all' | 'ocr' | 'landmarks' | 'scene' | 'exif'
  const [analysis, setAnalysis] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Fetch OSINT reports & demo scenarios
  const fetchOsintData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/osint/reports');
      const queue = res.data.reportsWithoutGps || [];
      setReports(queue);
      setDemoScenarios(res.data.demoScenarios || []);

      if (queue.length > 0 && !selectedComplaint) {
        setSelectedComplaint(queue[0]);
      }
    } catch (e) {
      console.warn('Error fetching OSINT reports', e);
      addToast('Failed to load OSINT reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOsintData();
  }, []);

  // Run OSINT scan when complaint or scenario changes
  const runScan = async (complaintToScan, scenarioKey, customPhoto, customFileName) => {
    setIsScanning(true);
    setScanProgress(15);
    setVerificationSuccess(false);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 250);

    try {
      const targetId = complaintToScan ? (complaintToScan._id || complaintToScan.complaintId) : 'demo';
      const res = await api.post(`/osint/analyze/${targetId}`, {
        scenarioKey: scenarioKey || activeScenarioKey,
        photo: customPhoto || (scenarioKey === 'custom' ? complaintToScan?.beforePhoto : null),
        fileName: customFileName || 'Evidence Image',
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      setTimeout(() => {
        setAnalysis(res.data.analysis);
        setIsScanning(false);
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      setIsScanning(false);
      addToast('OSINT scan analysis failed', 'error');
    }
  };

  // Handle custom photo upload on the fly
  const handleCustomPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result;
        const customComplaint = {
          _id: 'custom_' + Date.now(),
          complaintId: 'CT-LIVE-' + Math.floor(1000 + Math.random() * 9000),
          category: 'Garbage Dump',
          description: `Custom image "${file.name}" uploaded by Supervisor Azeez for real-time OSINT geolocation estimation.`,
          beforePhoto: photoData,
          latitude: null,
          longitude: null,
          ward: 'Location Not Available',
          address: 'Location Not Available',
          locationStatus: 'LOCATION_NOT_AVAILABLE',
          isLocationEstimated: false,
        };
        setSelectedComplaint(customComplaint);
        setActiveScenarioKey('custom');
        runScan(customComplaint, 'custom', photoData, file.name);
        addToast(`Uploaded "${file.name}"! Running multi-signal OSINT scan...`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger initial scan when selectedComplaint is set
  useEffect(() => {
    if (selectedComplaint && activeScenarioKey !== 'custom') {
      runScan(selectedComplaint, activeScenarioKey);
    }
  }, [selectedComplaint, activeScenarioKey]);

  // Handle Judge Demo Scenario Selection
  const handleSelectScenario = (key) => {
    setActiveScenarioKey(key);
    // Find matching pre-seeded complaint if available
    if (key === 'verified_green_park') {
      const match = reports.find((r) => r.complaintId === 'CT-2026-0901');
      if (match) setSelectedComplaint(match);
    } else if (key === 'conflicting_signals') {
      const match = reports.find((r) => r.complaintId === 'CT-2026-0902');
      if (match) setSelectedComplaint(match);
    } else if (key === 'uncertain_insufficient') {
      const match = reports.find((r) => r.complaintId === 'CT-2026-0903');
      if (match) setSelectedComplaint(match);
    }
  };

  // Handle Admin Decision: Confirm OSINT Estimated Location
  const handleConfirmLocation = async () => {
    if (!selectedComplaint || !analysis || !analysis.finalResult) return;

    const final = analysis.finalResult;
    if (!final.estimatedCoordinates || !final.estimatedCoordinates.latitude) {
      addToast('Cannot confirm coordinates: Location is Uncertain or Insufficient Evidence.', 'warning');
      return;
    }

    setIsVerifying(true);
    try {
      const targetId = selectedComplaint._id || selectedComplaint.complaintId;
      const res = await api.post(`/osint/verify/${targetId}`, {
        estimatedLocation: final.estimatedLocation,
        latitude: final.estimatedCoordinates.latitude,
        longitude: final.estimatedCoordinates.longitude,
        ward: selectedComplaint.ward === 'Location Not Available' ? 'Ward 4 - Green Park' : selectedComplaint.ward,
        verificationStatus: final.verificationStatus,
        notes: `Supervisor Azeez confirmed OSINT estimated coordinates (${final.estimatedCoordinates.latitude}, ${final.estimatedCoordinates.longitude}). Confidence score: ${final.confidenceScore}%.`,
      });

      addToast(`OSINT location assigned to ${selectedComplaint.complaintId}! Status: ${final.verificationStatus}`, 'success');
      setVerificationSuccess(true);
      fetchOsintData();
    } catch (e) {
      addToast('Error saving verified OSINT location', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* 1. HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Open-Source Intelligence (OSINT) Verification Hub</span> • <span>Supervisor Azeez</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
            Visual Geolocation & OSINT Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            Analyze citizen reports submitted without GPS sensors. The 4-module engine correlates OCR text, landmark recognition, scene visual features, and EXIF metadata to estimate incident location without compromising citizen privacy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all"
          >
            <Video className="w-4 h-4" />
            <span>Open Live Camera</span>
          </button>
          <label className="px-4 py-2.5 rounded-xl bg-[#0d1527] hover:bg-slate-800 border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center gap-2 cursor-pointer transition-all shadow-md hover:border-cyan-400">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Photo for OSINT</span>
            <input type="file" accept="image/*" onChange={handleCustomPhotoUpload} className="hidden" />
          </label>
          <button
            onClick={() => runScan(selectedComplaint, activeScenarioKey)}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-violet-950 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Running 4-Module Scan...' : 'Run OSINT Deep Scan'}</span>
          </button>
        </div>
      </div>

      {/* 2. DEMO SCENARIO & LIVE UPLOAD SELECTOR */}
      <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[22px] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>OSINT Scenarios & Live Photo Upload:</span>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">
            4-Signal Multi-Module Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {demoScenarios.map((scenario) => {
            const isSelected = activeScenarioKey === scenario.key;
            return (
              <button
                key={scenario.key}
                type="button"
                onClick={() => handleSelectScenario(scenario.key)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.01]'
                    : 'bg-[#060913]/80 border-white/5 hover:border-slate-700 hover:bg-[#060913]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold font-['Outfit'] ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {scenario.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                      scenario.expectedStatus === 'Verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : scenario.expectedStatus === 'Human Review Required'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {scenario.expectedStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {scenario.description}
                </p>
                <div className="mt-2 text-[10px] text-cyan-400 font-mono">
                  Target Confidence: ~{scenario.expectedConfidence}%
                </div>
              </button>
            );
          })}

          {/* 4th Card: Live Custom Photo Upload */}
          <label
            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              activeScenarioKey === 'custom'
                ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                : 'bg-[#060913]/80 border-dashed border-cyan-500/40 hover:border-cyan-400 hover:bg-[#090e1c]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-300 font-['Outfit'] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Upload Custom Photo
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                Live File
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
              Browse any local image from your device to run real-time OCR, landmark, and scene extraction.
            </p>
            <div className="mt-2 text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-1">
              <span>Choose Image File →</span>
            </div>
            <input type="file" accept="image/*" onChange={handleCustomPhotoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* 3. MAIN WORKBENCH: Two Columns (Left: Report & Scan, Right: 4 Analysis Modules & Final Result) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (4 Cols): Report Details, Evidence Image, & Queue */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Incident Card */}
          <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-5 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {selectedComplaint?.complaintId || 'CT-2026-0901'}
              </span>
              <div className="flex items-center gap-1.5">
                <label className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 cursor-pointer hover:bg-cyan-500/20 transition-colors flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Change</span>
                  <input type="file" accept="image/*" onChange={handleCustomPhotoUpload} className="hidden" />
                </label>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Location Not Available
                </span>
              </div>
            </div>

            {/* Evidence Photo Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 group bg-slate-950">
              <img
                src={selectedComplaint?.beforePhoto || analysis?.sceneSimilarity?.referenceImage}
                alt="Citizen Evidence"
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Scanning Overlay Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-bold text-white font-mono">
                    OSINT SCANNING: {scanProgress}%
                  </span>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-cyan-300 mt-1">
                    Correlating 4 Signals...
                  </span>
                </div>
              )}

              <div className="absolute bottom-2 left-2 right-2 bg-[#060913]/90 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Category: {selectedComplaint?.category || 'Garbage Dump'}</span>
                <span className="text-cyan-400 font-mono">No GPS Tag</span>
              </div>
            </div>

            {/* Description & Citizen Notice */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Citizen Report Context:</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#060913] p-3 rounded-xl border border-white/5">
                "{selectedComplaint?.description || 'Overflowing garbage on sidewalk. No GPS sensors enabled.'}"
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Citizen Tracking: Citizen identity & location protected.</span>
              </div>
            </div>
          </div>

          {/* Queue of Reports Without GPS */}
          <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-5 shadow-xl space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Reports Awaiting OSINT ({reports.length})
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">No-GPS Queue</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {reports.map((r) => {
                const isSelected = selectedComplaint?.complaintId === r.complaintId;
                return (
                  <button
                    key={r.complaintId}
                    onClick={() => setSelectedComplaint(r)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-white'
                        : 'bg-[#060913]/70 border-white/5 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs font-mono">{r.complaintId}</div>
                      <div className="text-[11px] text-slate-400">{r.category}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Pending
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 Cols): 4 Analysis Modules & Final OSINT Result */}
        <div className="lg:col-span-8 space-y-6">
          {/* Module Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-[#0d1527] p-1.5 rounded-2xl border border-cyan-500/20 overflow-x-auto">
            <button
              onClick={() => setActiveModuleTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModuleTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All 4 Modules</span>
            </button>
            <button
              onClick={() => setActiveModuleTab('ocr')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModuleTab === 'ocr'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. OCR Text</span>
            </button>
            <button
              onClick={() => setActiveModuleTab('landmarks')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModuleTab === 'landmarks'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Landmarks</span>
            </button>
            <button
              onClick={() => setActiveModuleTab('scene')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModuleTab === 'scene'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>3. Scene Similarity</span>
            </button>
            <button
              onClick={() => setActiveModuleTab('exif')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeModuleTab === 'exif'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>4. Image Metadata (EXIF)</span>
            </button>
          </div>

          {/* Module 1: OCR / Text Extraction */}
          {(activeModuleTab === 'all' || activeModuleTab === 'ocr') && (
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Module 1: OCR / Text Extraction</span>
                </h3>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {analysis?.ocr?.detectedClues?.length || 0} Location Clues Detected
                </span>
              </div>

              {/* Raw Extracted Text */}
              <div className="p-3.5 rounded-xl bg-[#060913] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Raw Detected Text Stream:
                </span>
                <div className="font-mono text-xs text-cyan-200 tracking-wide break-words">
                  {analysis?.ocr?.rawText || 'No text detected in image pass.'}
                </div>
              </div>

              {/* Detected Location Clues Table */}
              {analysis?.ocr?.detectedClues && analysis.ocr.detectedClues.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Classified Location Clues:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {analysis.ocr.detectedClues.map((clue, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#060913]/90 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">{clue.text}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                            {clue.confidence}% Conf.
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-violet-400 font-medium">{clue.type}</span>
                          <span className="text-slate-500">{clue.relevance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/60 text-slate-400 text-xs text-center border border-dashed border-slate-800">
                  No legible signs, shop boards, or street markers identified in photographic evidence.
                </div>
              )}
            </div>
          )}

          {/* Module 2: Landmark / Object Recognition */}
          {(activeModuleTab === 'all' || activeModuleTab === 'landmarks') && (
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-violet-400" />
                  <span>Module 2: Landmark & Object Recognition</span>
                </h3>
                <span className="text-xs font-mono text-violet-300 bg-violet-950/80 px-2.5 py-1 rounded-lg border border-violet-500/30">
                  Landmark Match: {analysis?.landmarks?.confidence || 0}%
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#060913] border border-white/5 text-xs text-slate-300 font-medium">
                  <strong className="text-white">Landmark Synthesis:</strong> {analysis?.landmarks?.landmarkMatch || 'Analyzing civic assets and infrastructure...'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(analysis?.landmarks?.detectedObjects || []).map((obj, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#060913]/90 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-['Outfit']">{obj.name}</span>
                        <span className="text-[10px] font-bold text-violet-400 font-mono">{obj.confidence}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${obj.confidence}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {obj.clue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 3: Scene Similarity */}
          {(activeModuleTab === 'all' || activeModuleTab === 'scene') && (
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Module 3: Scene Similarity vs Municipal Archive</span>
                </h3>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                  Top Match: {analysis?.sceneSimilarity?.matchPercentage || 0}%
                </span>
              </div>

              {/* Visual Features Chips */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300">Extracted Visual Features:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis?.sceneSimilarity?.visualFeatures || []).map((feat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Comparison: Citizen Evidence vs Matched Municipal Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Citizen Photographic Evidence:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-white/10 h-40 bg-slate-950">
                    <img
                      src={selectedComplaint?.beforePhoto || analysis?.sceneSimilarity?.referenceImage}
                      alt="Citizen Proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Municipal Reference Match ({analysis?.sceneSimilarity?.matchPercentage}%):
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-emerald-500/40 h-40 bg-slate-950 relative">
                    <img
                      src={analysis?.sceneSimilarity?.referenceImage}
                      alt="Municipal Reference"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-[#060913]/90 p-1.5 rounded-lg text-[10px] text-emerald-300 font-mono truncate">
                      {analysis?.sceneSimilarity?.referenceLocation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Matches Breakdown */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-300">Comparative Ward Candidates:</span>
                <div className="space-y-1.5">
                  {(analysis?.sceneSimilarity?.matches || []).map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#060913] border border-white/5 text-xs">
                      <span className="text-slate-200 font-medium">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">{m.location}</span>
                        <span className={`font-mono font-bold ${m.similarity > 70 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {m.similarity}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 4: Image Metadata (EXIF) */}
          {(activeModuleTab === 'all' || activeModuleTab === 'exif') && (
            <div className="bg-[#0d1527]/90 border border-cyan-500/20 rounded-[24px] p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Module 4: Image Metadata (EXIF)</span>
                </h3>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-500/40">
                  {analysis?.metadata?.gpsStatus || 'GPS Not Available'}
                </span>
              </div>

              {/* Strict Zero Fabrication GPS Alert */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-[#060913] border border-rose-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">
                    Zero-Fabrication Policy: Raw GPS Coordinates Absent in EXIF
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The citizen's camera did not record GPS metadata (or location permissions were denied on the capture device). In compliance with GovTech standards, coordinates are <strong className="text-rose-300">never fabricated or invented</strong> in this module.
                  </p>
                </div>
              </div>

              {/* Optical & Device Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#060913] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Device / Camera:</span>
                  <div className="font-bold text-white mt-0.5">
                    {analysis?.metadata?.make} {analysis?.metadata?.model}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#060913] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Capture Timestamp:</span>
                  <div className="font-bold text-cyan-300 mt-0.5 font-mono text-[11px]">
                    {analysis?.metadata?.dateTime}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#060913] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Resolution:</span>
                  <div className="font-bold text-slate-200 mt-0.5 font-mono">
                    {analysis?.metadata?.dimensions}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#060913] border border-white/5">
                  <span className="text-[10px] text-slate-400 block">EXIF GPS Tag:</span>
                  <div className="font-bold text-rose-400 mt-0.5 font-mono text-[11px]">
                    NULL / ABSENT
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. FINAL OSINT RESULT PANEL */}
          <div className="bg-gradient-to-b from-[#0d1527] to-[#090e1c] border-2 border-cyan-500/40 rounded-[28px] p-7 space-y-6 shadow-[0_0_35px_rgba(6,182,212,0.2)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Multi-Signal Synthesis Outcome</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                  Final OSINT Geolocation Result
                </h2>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${
                    analysis?.finalResult?.verificationStatus === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950'
                      : analysis?.finalResult?.verificationStatus === 'Human Review Required'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {analysis?.finalResult?.verificationStatus === 'Verified' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {analysis?.finalResult?.verificationStatus === 'Human Review Required' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  {analysis?.finalResult?.verificationStatus === 'Uncertain' && <HelpCircle className="w-4 h-4 text-slate-400" />}
                  <span>Status: {analysis?.finalResult?.verificationStatus || 'Analyzing...'}</span>
                </span>
              </div>
            </div>

            {/* Estimated Location & Confidence Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 p-4 rounded-2xl bg-[#060913] border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Estimated Location (OSINT Verified):
                </span>
                <div className="text-base font-bold text-white font-['Outfit']">
                  {analysis?.finalResult?.estimatedLocation || 'Location Inconclusive'}
                </div>
                <span className="text-[11px] text-slate-400 block pt-0.5">
                  Label: <strong className="text-cyan-300">"OSINT Estimated Location"</strong> (Coordinates not derived from device GPS)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#060913] border border-cyan-500/30 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Confidence Level:
                </span>
                <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
                  {analysis?.finalResult?.confidenceScore}%
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Rating: <strong className="text-white">{analysis?.finalResult?.confidenceLevel}</strong>
                </div>
              </div>
            </div>

            {/* Correlated Evidence Clues Found */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Evidence & Clues Found Across 4 Signals:
              </span>
              <div className="space-y-1.5">
                {(analysis?.finalResult?.evidenceClues || []).map((clue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-[#060913]/70 p-2.5 rounded-xl border border-white/5">
                    <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{clue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Map Preview with OSINT Estimated Pin & Radius */}
            {analysis?.finalResult?.estimatedCoordinates?.latitude ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-cyan-400" />
                    <span>Geospatial Map Preview (Estimated Geofence ±{analysis.finalResult.estimatedCoordinates.radiusMeters}m):</span>
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {analysis.finalResult.estimatedCoordinates.latitude.toFixed(4)}° N, {analysis.finalResult.estimatedCoordinates.longitude.toFixed(4)}° E
                  </span>
                </div>

                <GoogleLocationMap
                  latitude={analysis.finalResult.estimatedCoordinates.latitude}
                  longitude={analysis.finalResult.estimatedCoordinates.longitude}
                  accuracy={analysis.finalResult.estimatedCoordinates.radiusMeters || 120}
                  address={analysis.finalResult.estimatedLocation}
                  title="OSINT Estimated Site Location"
                  height="260px"
                  interactive={false}
                  primaryLabel="OSINT Estimated Pin"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#060913] border border-dashed border-slate-800 text-center space-y-2 text-slate-400 text-xs">
                <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="font-bold text-slate-300">No Definite Coordinates Assigned</div>
                <p className="max-w-md mx-auto text-[11px]">
                  Signals are either uncertain or conflicting. System strictly withholds coordinate pinning to prevent misallocating municipal field workers.
                </p>
              </div>
            )}

            {/* Admin Decision Actions */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                {verificationSuccess ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Location Successfully Committed to Complaint Record!
                  </span>
                ) : (
                  <span>Ready for Administrator Decision Audit</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isVerifying || !analysis?.finalResult?.estimatedCoordinates?.latitude}
                  onClick={handleConfirmLocation}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isVerifying ? 'Saving Verification...' : 'Accept & Set OSINT Location'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Camera Modal for Admin OSINT */}
      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        title="Admin Live Optical Stream & Snapshot"
        onCapture={(snapshot) => {
          const customComplaint = {
            _id: 'camera_' + Date.now(),
            complaintId: 'CT-CAM-' + Math.floor(1000 + Math.random() * 9000),
            category: 'Live Camera Capture',
            description: 'Real-time live optical snapshot captured via Supervisor Azeez device camera.',
            beforePhoto: snapshot,
            latitude: null,
            longitude: null,
            ward: 'Location Not Available',
            address: 'Location Not Available',
            submittedAt: new Date().toISOString(),
            status: 'Pending Verification',
            locationStatus: 'LOCATION_NOT_AVAILABLE',
            isLocationEstimated: false,
          };
          setSelectedComplaint(customComplaint);
          setActiveScenarioKey('custom');
          addToast('Live camera snapshot acquired! Running real-time 4-module OSINT scan...', 'success');
          runScan(customComplaint, 'custom', snapshot, 'Live Camera Snapshot');
        }}
      />
    </div>
  );
};

export default OsintVerification;
