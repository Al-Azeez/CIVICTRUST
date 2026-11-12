import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Video, VideoOff, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

const LiveCameraModal = ({ isOpen, onClose, onCapture, title = 'Live Evidence Camera Capture' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Start video stream
  const startCamera = async (mode) => {
    setIsLoading(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported on this browser/device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : err.message || 'Unable to access live camera sensor.'
      );
      setIsLoading(false);
    }
  };

  // Stop video stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Flip camera between front and rear
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Take snapshot from active video stream
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
  };

  // Simulated fallback snapshot if hardware camera unavailable
  const generateSimulatedSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 480);

    // Ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 280, 640, 200);

    // Simulated Municipal Scene
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(40, 40, 560, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE SNAPSHOT • CIVICTRUST CAMERA', 320, 75);
    ctx.font = '14px Outfit, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(`TIMESTAMP: ${new Date().toISOString()} | SENSOR CALIBRATED`, 320, 105);

    // Objects
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(240, 240, 160, 140, [12]);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(460, 310, 40, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
  };

  // Confirm snapshot and pass back to parent
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0d1527] border border-cyan-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#060913]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">{title}</h3>
              <p className="text-[11px] text-slate-400">Real-time device optical sensor stream</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Viewport */}
        <div className="relative flex-1 bg-black min-h-[320px] max-h-[460px] flex items-center justify-center overflow-hidden">
          {/* Shutter flash effect */}
          {shutterFlash && (
            <div className="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150" />
          )}

          {capturedPhoto ? (
            /* Snapshot Preview */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhoto}
                alt="Live Snapshot Preview"
                className="w-full h-full max-h-[420px] object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Snapshot Captured
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Access Error / Fallback */
            <div className="p-8 text-center space-y-4 max-w-md">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Live Camera Sensor Inactive</h4>
                <p className="text-xs text-slate-400">{cameraError}</p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                </button>
                <button
                  type="button"
                  onClick={generateSimulatedSnapshot}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Capture Simulated Live Frame
                </button>
              </div>
            </div>
          ) : (
            /* Active Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[440px] object-cover"
              />

              {/* Viewfinder Overlays & Crosshairs */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10 flex items-center justify-center">
                  <div className="w-12 h-12 border border-cyan-400/40 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
                  </div>
                </div>
                <div className="border-b border-white/10" />
                <div className="border-r border-white/10" />
                <div className="border-r border-white/10" />
                <div />
              </div>

              {/* Status Indicator */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 text-[11px] font-bold font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE SENSOR ACTIVE</span>
              </div>

              {/* Flip camera button */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 backdrop-blur-md hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Switch Camera (Front/Back)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Flip</span>
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-[#060913] border-t border-white/10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Cancel
          </button>

          {capturedPhoto ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCapturedPhoto(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all"
              >
                <Check className="w-4 h-4" /> Use This Snapshot
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={generateSimulatedSnapshot}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Demo Snapshot
              </button>
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={Boolean(cameraError)}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-cyan-950 transition-all scale-100 hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" /> Take Live Snapshot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveCameraModal;
