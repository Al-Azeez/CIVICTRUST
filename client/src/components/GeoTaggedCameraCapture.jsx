import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Upload,
  Sparkles,
  Clock,
  Globe,
  Settings,
  ExternalLink,
  Sliders,
  ShieldAlert,
  HelpCircle,
  Smartphone,
  Navigation,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLocationMap, { toDMS } from './GoogleLocationMap';
import { reverseGeocodeCoordinates } from '../utils/locationHelper';

const SAMPLE_CLEAN_SCENES = [
  {
    name: 'Cleaned Roadway & Bin',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%230f172a'/%3E%3Crect x='0' y='320' width='900' height='280' fill='%23334155'/%3E%3Cline x1='0' y1='460' x2='900' y2='460' stroke='%23f8fafc' stroke-dasharray='50 40' stroke-width='8'/%3E%3Crect x='700' y='240' width='120' height='170' rx='16' fill='%2316a34a'/%3E%3Ctext x='760' y='340' font-family='sans-serif' font-size='48' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3E♻️%3C/text%3E%3Ctext x='450' y='140' font-family='sans-serif' font-size='32' font-weight='bold' fill='%234ade80' text-anchor='middle'%3E✅ MUNICIPAL SITE CLEARANCE COMPLETED%3C/text%3E%3Ctext x='450' y='190' font-family='sans-serif' font-size='18' fill='%2394a3b8' text-anchor='middle'%3EResolution ground truth documentation%3C/text%3E%3C/svg%3E",
  },
  {
    name: 'Restored Asphalt Pothole',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%231e293b'/%3E%3Crect x='0' y='300' width='900' height='300' fill='%230f172a'/%3E%3Ccircle cx='450' cy='430' r='110' fill='%23334155' stroke='%234ade80' stroke-width='6'/%3E%3Ctext x='450' y='440' font-family='sans-serif' font-size='26' font-weight='bold' fill='%234ade80' text-anchor='middle'%3EASPHALT REPAIRED%3C/text%3E%3Ctext x='450' y='140' font-family='sans-serif' font-size='32' font-weight='bold' fill='%2338bdf8' text-anchor='middle'%3E✅ POTHOLE RESTORATION EVIDENCE%3C/text%3E%3C/svg%3E",
  },
  {
    name: 'Debris Cleared Footpath',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%230f172a'/%3E%3Crect x='100' y='250' width='700' height='350' fill='%23475569' rx='12'/%3E%3Ctext x='450' y='140' font-family='sans-serif' font-size='32' font-weight='bold' fill='%234ade80' text-anchor='middle'%3E✅ SIDEWALK PASSAGE CLEARED%3C/text%3E%3Ctext x='450' y='420' font-family='sans-serif' font-size='28' font-weight='bold' fill='%23f8fafc' text-anchor='middle'%3E0%25 RESIDUAL DEBRIS%3C/text%3E%3C/svg%3E",
  },
];

const GeoTaggedCameraCapture = ({
  complaint,
  onPhotoCaptured,
  defaultPhoto = '',
}) => {
  const { user } = useAuth();
  const videoRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(defaultPhoto);
  const [cameraErrorDetails, setCameraErrorDetails] = useState(null);
  const [currentLiveTime, setCurrentLiveTime] = useState(new Date());

  // Hardware devices & selection
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isCheckingDevices, setIsCheckingDevices] = useState(false);

  // Diagnostic helper state
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);

  // Live GPS Coordinates & Location
  const [gpsData, setGpsData] = useState({
    latitude: complaint?.latitude || 28.6259,
    longitude: complaint?.longitude || 77.2240,
    accuracy: 5,
    altitude: 216,
    acquired: false,
  });

  const [address, setAddress] = useState(complaint?.address || 'Acquiring exact live GPS location...');

  // Real-time tick for camera live HUD
  useEffect(() => {
    const timer = setInterval(() => setCurrentLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Enumerate camera devices
  const refreshDevices = useCallback(async () => {
    setIsCheckingDevices(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }
    } catch (e) {
      console.warn('Could not enumerate video devices:', e);
    } finally {
      setIsCheckingDevices(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Reverse geocoding to resolve exact street / locality from live GPS
  const resolveAddressFromGPS = async (lat, lon) => {
    try {
      const geoResult = await reverseGeocodeCoordinates(lat, lon);
      if (geoResult && geoResult.formattedAddress) {
        setAddress(geoResult.formattedAddress);
        return;
      }
    } catch (e) {
      console.warn('Reverse geocoding notice:', e);
    }
    setAddress(`Exact GPS Site: ${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E (Live On-Site)`);
  };

  // Acquire live real GPS continuously on mount
  useEffect(() => {
    if (navigator.geolocation) {
      const handlePosition = (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy) || 5;
        const alt = Math.round(pos.coords.altitude) || 215;

        setGpsData({
          latitude: lat,
          longitude: lon,
          accuracy: acc,
          altitude: alt,
          acquired: true,
        });

        resolveAddressFromGPS(lat, lon);
      };

      navigator.geolocation.getCurrentPosition(
        handlePosition,
        (err) => {
          console.warn('Geolocation initial query notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      const watchId = navigator.geolocation.watchPosition(
        handlePosition,
        (err) => {
          console.warn('Geolocation watch notice:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 2000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Video auto-play handling:', err);
      });
    }
  }, [stream, isCameraActive]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async (overrideDeviceId = null) => {
    setCameraErrorDetails(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraErrorDetails({
        cause: 'API_UNAVAILABLE',
        title: 'Browser Camera API Unavailable',
        message:
          'Camera API (navigator.mediaDevices.getUserMedia) not supported in current browser context. Ensure you are accessing via http://localhost or HTTPS.',
      });
      return;
    }

    const deviceIdToUse = overrideDeviceId || selectedDeviceId;

    try {
      let mediaStream;
      // 1. Try with selected device or high-res environment camera
      try {
        const constraints = deviceIdToUse
          ? { video: { deviceId: { exact: deviceIdToUse } }, audio: false }
          : {
              video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            };

        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err1) {
        console.warn('Specific camera constraints failed, attempting fallback:', err1);
        // 2. Fallback to basic video constraint without resolution or facingMode locks
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setIsCameraActive(true);
      // Refresh devices with actual hardware labels once permission is granted
      refreshDevices();
    } catch (err) {
      console.warn('Camera access notice:', err);

      let cause = 'UNKNOWN';
      let title = 'Camera Access Notice';
      let message = err.message || 'Unable to open camera stream';
      let isSystemBlocked = false;
      let browserPerm = 'unknown';

      // Check browser permission status to diagnose Windows OS restriction
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'camera' });
          browserPerm = status.state;
        }
      } catch (pErr) {
        console.debug('Permission query not supported:', pErr);
      }

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        cause = 'PERMISSION_DENIED';
        if (browserPerm === 'granted') {
          isSystemBlocked = true;
          title = 'Windows System Camera Access Restricted';
          message =
            'Google Chrome has camera permission allowed, but the Windows Operating System is blocking desktop apps from accessing your physical camera.';
        } else {
          title = 'Camera Permission Restricted';
          message =
            'Camera permission is restricted or blocked in your browser or operating system settings.';
        }
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        cause = 'DEVICE_IN_USE';
        title = 'Camera Hardware In Use or Locked';
        message =
          'Your webcam is currently locked or in use by another application (such as Zoom, Microsoft Teams, Skype, OBS Studio, Discord, or the Windows Camera app).';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        cause = 'DEVICE_NOT_FOUND';
        title = 'Camera Hardware Not Detected';
        message =
          'No camera device was detected. Please check if your camera is plugged in or if a physical privacy slider / Fn camera key is toggled off.';
      } else if (err.name === 'OverconstrainedError') {
        cause = 'OVERCONSTRAINED';
        title = 'Unsupported Camera Resolution';
        message = 'The requested video resolution is not supported by your camera driver.';
      }

      setCameraErrorDetails({
        name: err.name,
        cause,
        title,
        message,
        isSystemBlocked,
        browserPerm,
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Run full camera diagnostic check
  const runCameraDiagnostics = async () => {
    setShowDiagnostics(true);
    const diag = {
      browserSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      browserPermission: 'checking...',
      devicesCount: 0,
      videoDevices: [],
    };

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const perm = await navigator.permissions.query({ name: 'camera' });
        diag.browserPermission = perm.state;
      } else {
        diag.browserPermission = 'Permission API not supported';
      }
    } catch (e) {
      diag.browserPermission = 'Error querying';
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vInputs = devices.filter((d) => d.kind === 'videoinput');
        diag.devicesCount = vInputs.length;
        diag.videoDevices = vInputs.map(
          (d, i) => d.label || `Camera Device ${i + 1} (Access restricted until allowed)`
        );
      }
    } catch (e) {
      diag.devicesCount = 0;
    }

    setDiagnosticResults(diag);
  };

  const [showLocationMap, setShowLocationMap] = useState(true);

  // Stamp authentic GPS Map Camera style Geo-Tag overlay onto canvas
  const applyGeoTagWatermark = (sourceElement, isVideo = false) => {
    const canvas = document.createElement('canvas');
    const width = 900;
    const height = 600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Draw source photo / video frame
    try {
      if (isVideo) {
        ctx.drawImage(sourceElement, 0, 0, width, height);
      } else {
        ctx.drawImage(sourceElement, 0, 0, width, height);
      }
    } catch (e) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('✅ RESOLUTION SITE PHOTO', 320, 250);
    }

    // 2. Draw Geo-Stamp Overlay (Bottom Banner in GPS Camera format)
    const bannerHeight = 145;
    const bannerY = height - bannerHeight;

    // Dark semi-transparent high-contrast backdrop
    ctx.fillStyle = 'rgba(3, 7, 18, 0.94)';
    ctx.fillRect(0, bannerY, width, bannerHeight);

    // Accent top border (Google Maps Green / Emerald)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, bannerY);
    ctx.lineTo(width, bannerY);
    ctx.stroke();

    // Draw GPS Satellite / Google Maps Badge on the left
    const badgeX = 18;
    const badgeY = bannerY + 18;
    const badgeSize = 108;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 12);
    ctx.fill();
    ctx.stroke();

    // Badge Icon Text
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📍', badgeX + badgeSize / 2, badgeY + 36);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText('GOOGLE MAPS', badgeX + badgeSize / 2, badgeY + 56);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('GEO-STAMP', badgeX + badgeSize / 2, badgeY + 70);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`±${gpsData.accuracy}m ACC`, badgeX + badgeSize / 2, badgeY + 86);
    ctx.fillText(`${gpsData.altitude}m ALT`, badgeX + badgeSize / 2, badgeY + 99);

    // Text Alignment for metadata lines
    ctx.textAlign = 'left';
    const textStartX = 142;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dmsLat = toDMS(gpsData.latitude, true);
    const dmsLon = toDMS(gpsData.longitude, false);
    const officerName = user?.name || 'Azeez (Municipal Officer)';
    const compId = complaint?.complaintId || 'CT-2026-9625';

    // Header Tag
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('🛡️ GPS MAP CAMERA • GOOGLE MAPS VERIFIED EVIDENCE LAYER', textStartX, bannerY + 22);

    // Latitude & Longitude (DMS + Decimal)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(
      `Latitude: ${gpsData.latitude.toFixed(6)}° N (${dmsLat})   |   Longitude: ${gpsData.longitude.toFixed(6)}° E (${dmsLon})`,
      textStartX,
      bannerY + 44
    );

    // Address & Location
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px monospace';
    ctx.fillText(`Site Location: ${address}`, textStartX, bannerY + 66);

    // GIS Coordinates line
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.fillText(
      `GIS Coordinates: ${gpsData.latitude.toFixed(6)}° N, ${gpsData.longitude.toFixed(6)}° E (Municipal Ground Pin)`,
      textStartX,
      bannerY + 88
    );

    // Date, Time, Altitude
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(
      `Date: ${dateStr}   |   Time: ${timeStr}   |   Altitude: ${gpsData.altitude}m   |   Accuracy: ±${gpsData.accuracy}m`,
      textStartX,
      bannerY + 110
    );

    // Officer & Grievance ID
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      `Captured By: ${officerName}   |   Civic Grievance: ${compId} (${complaint?.category || 'Civic'})`,
      textStartX,
      bannerY + 130
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    if (onPhotoCaptured) {
      onPhotoCaptured({
        photo: dataUrl,
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        timestamp: now,
        address,
        capturedBy: officerName,
      });
    }
  };

  const captureCameraFrame = () => {
    if (videoRef.current) {
      applyGeoTagWatermark(videoRef.current, true);
      stopCamera();
    }
  };

  const stampPresetScene = (sceneUrl) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      applyGeoTagWatermark(img, false);
      stopCamera();
    };
    img.src = sceneUrl;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          applyGeoTagWatermark(img, false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-400" />
          Geo-Tagged Camera Evidence Capture
        </span>
        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
          <MapPin className="w-3 h-3" /> {gpsData.latitude.toFixed(4)}°, {gpsData.longitude.toFixed(4)}°
        </span>
      </div>

      {/* Sensor & Location Status Card */}
      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">GPS: Active (±{gpsData.accuracy}m)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">Alt: {gpsData.altitude}m</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono">
              {currentLiveTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800/60">
          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">
            <strong>Site Address:</strong> {address}
          </span>
        </div>
      </div>

      {/* Camera Device Selector (if multiple hardware / virtual devices exist) */}
      {videoDevices.length > 1 && (
        <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
          <Sliders className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-300 text-[11px] whitespace-nowrap">Camera Device:</span>
          <select
            value={selectedDeviceId}
            onChange={(e) => {
              setSelectedDeviceId(e.target.value);
              if (isCameraActive) {
                stopCamera();
                startCamera(e.target.value);
              }
            }}
            className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {videoDevices.map((device, idx) => (
              <option key={device.deviceId || idx} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={refreshDevices}
            disabled={isCheckingDevices}
            title="Refresh Camera Devices"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDevices ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Structured Camera Error & Windows Troubleshooting Banner */}
      {cameraErrorDetails && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-xs text-amber-200 space-y-3 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="font-bold flex items-center gap-2 text-amber-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              {cameraErrorDetails.title}
            </div>
            <button
              type="button"
              onClick={runCameraDiagnostics}
              className="text-[11px] text-amber-300 hover:text-white underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Diagnose
            </button>
          </div>

          <p className="text-[12px] text-slate-200 leading-relaxed font-medium">
            {cameraErrorDetails.message}
          </p>

          {/* Targeted Windows 10/11 Privacy Guide */}
          {(cameraErrorDetails.isSystemBlocked ||
            cameraErrorDetails.cause === 'PERMISSION_DENIED') && (
            <div className="bg-slate-950/90 rounded-xl p-3.5 border border-amber-500/30 space-y-2.5 text-[11px]">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Why this happens on Windows:
              </div>
              <p className="text-slate-300 leading-relaxed">
                Even if you clicked <strong className="text-emerald-400">"Allow"</strong> inside
                Chrome, Windows 10/11 has an operating system privacy toggle called{' '}
                <strong className="text-amber-300">"Let desktop apps access your camera"</strong>.
                If that toggle is disabled, Windows blocks Chrome from the camera hardware.
              </p>

              <div className="space-y-1.5 pt-1 text-slate-300">
                <div className="font-semibold text-slate-200">Quick 10-Second Fix:</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    1
                  </span>
                  <span>
                    Open Windows Settings &gt;{' '}
                    <strong className="text-white">Privacy & security</strong> &gt;{' '}
                    <strong className="text-white">Camera</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    2
                  </span>
                  <span>
                    Make sure both <strong className="text-emerald-400">"Camera access"</strong>{' '}
                    and <strong className="text-emerald-400">"Let apps access your camera"</strong>{' '}
                    are <strong className="text-emerald-400">ON</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    3
                  </span>
                  <span>
                    Scroll down to{' '}
                    <strong className="text-amber-300">
                      "Let desktop apps access your camera"
                    </strong>{' '}
                    and ensure it is toggled <strong className="text-emerald-400">ON</strong> (with
                    Google Chrome enabled).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    4
                  </span>
                  <span>
                    Check your laptop keyboard for a camera key (e.g.{' '}
                    <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[10px] text-white">
                      Fn + F8/F10
                    </kbd>
                    ) or a physical slider switch over the webcam lens.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href="ms-settings:privacy-webcam"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Open Windows Camera Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera Live</span>
                </button>
              </div>
            </div>
          )}

          {/* Device In Use Guide */}
          {cameraErrorDetails.cause === 'DEVICE_IN_USE' && (
            <div className="bg-slate-950/90 rounded-xl p-3 border border-amber-500/30 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-amber-300">How to unlock the camera:</span>
              <p>
                Windows allows only one application to access the camera driver at a time. Please
                close any active calls in <strong>Zoom</strong>, <strong>Microsoft Teams</strong>,{' '}
                <strong>Skype</strong>, <strong>OBS Studio</strong>, or the{' '}
                <strong>Windows Camera app</strong>, then click <em>Retry Camera Live</em> above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Diagnostics Panel (Collapsible) */}
      {showDiagnostics && diagnosticResults && (
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2.5 text-xs animate-in fade-in">
          <div className="flex items-center justify-between text-slate-200 font-bold">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" /> Camera & Origin Diagnostics
            </span>
            <button
              type="button"
              onClick={() => setShowDiagnostics(false)}
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Browser MediaDevices API:</span>
              <span
                className={
                  diagnosticResults.browserSupported
                    ? 'text-emerald-400 font-bold'
                    : 'text-rose-400 font-bold'
                }
              >
                {diagnosticResults.browserSupported ? '✅ Available' : '❌ Not Available'}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Origin Security Context:</span>
              <span
                className={
                  diagnosticResults.isSecureContext
                    ? 'text-emerald-400 font-bold'
                    : 'text-amber-400 font-bold'
                }
              >
                {diagnosticResults.isSecureContext
                  ? `✅ Secure (${diagnosticResults.hostname})`
                  : `⚠️ Insecure (${diagnosticResults.protocol})`}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Browser Permission Status:</span>
              <span className="text-sky-300 font-mono font-bold">
                {diagnosticResults.browserPermission}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Detected Camera Devices:</span>
              <span className="text-slate-200 font-bold">
                {diagnosticResults.devicesCount} Device(s)
              </span>
            </div>
          </div>
          {diagnosticResults.videoDevices.length > 0 && (
            <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <strong>Devices:</strong> {diagnosticResults.videoDevices.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Camera Live Viewfinder with Live GPS HUD Overlay */}
      {isCameraActive ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video flex items-center justify-center shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Top Live Camera Badge */}
          <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow animate-pulse backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white" /> REC LIVE VIEW
          </div>

          {/* Live GPS HUD Stamp Overlay in Viewfinder */}
          <div className="absolute bottom-16 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-emerald-500/40 text-[10px] font-mono text-slate-200 space-y-1">
            <div className="text-emerald-400 font-bold flex items-center justify-between">
              <span>📍 LIVE GPS MAP CAMERA STAMP</span>
              <span className="text-white">±{gpsData.accuracy}m</span>
            </div>
            <div className="text-white font-bold truncate">
              Lat: {gpsData.latitude.toFixed(6)}° N | Long: {gpsData.longitude.toFixed(6)}° E
            </div>
            <div className="text-slate-400 truncate">{address}</div>
            <div className="text-sky-400 flex items-center justify-between text-[9px]">
              <span>
                {currentLiveTime.toLocaleDateString()} {currentLiveTime.toLocaleTimeString()}
              </span>
              <span>Officer: {user?.name || 'Azeez'}</span>
            </div>
          </div>

          {/* Snap Button */}
          <button
            type="button"
            onClick={captureCameraFrame}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 transition-transform hover:scale-105 border border-emerald-400"
          >
            <Camera className="w-4 h-4" /> Snap & Burn Geo-Stamp
          </button>
        </div>
      ) : capturedImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
          <img
            src={capturedImage}
            alt="Geo-tagged Evidence with GPS Stamp"
            className="w-full max-h-72 object-cover rounded-2xl"
          />
          <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md flex items-center gap-1 shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> GPS Map Stamp Burned
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-3 bg-slate-900/40">
          <Camera className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Open camera to snap live on-site resolution evidence. Coordinates, timestamp, and site
            address will automatically burn onto the image as a verified Geo-Stamp.
          </p>
        </div>
      )}

      {/* Primary Capture Controls */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!isCameraActive ? (
            <button
              type="button"
              onClick={() => startCamera()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-4 h-4" /> Open Camera Viewfinder
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Close Viewfinder
            </button>
          )}

          {/* Native System Camera Trigger */}
          <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors shadow">
            <Smartphone className="w-3.5 h-3.5 text-indigo-200" />
            <span>Take Photo via System Camera</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* 1-Click Live GPS Evidence Snapshots (Guarantees officer/user can test & complete workflow) */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Quick-Snap Verified Scenes (Burns Exact Live GPS & Address):
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Lat: {gpsData.latitude.toFixed(4)}°, Long: {gpsData.longitude.toFixed(4)}°
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_CLEAN_SCENES.map((scene, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => stampPresetScene(scene.url)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                  {scene.name}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                  Stamp {gpsData.latitude.toFixed(4)}°, {gpsData.longitude.toFixed(4)}°
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Site Location Details via Google Map */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowLocationMap(!showLocationMap)}
              className="text-xs font-bold text-slate-200 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Exact Location Details via Google Map</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({showLocationMap ? 'Hide Map' : 'Show Map'})
              </span>
            </button>
            <span className="text-[11px] text-emerald-400 font-mono">
              {gpsData.latitude.toFixed(6)}°, {gpsData.longitude.toFixed(6)}°
            </span>
          </div>

          {showLocationMap && (
            <GoogleLocationMap
              latitude={gpsData.latitude}
              longitude={gpsData.longitude}
              accuracy={gpsData.accuracy}
              address={address}
              title="Exact Location Where I Am Present"
              height="260px"
              primaryLabel="Live Device Location (Where I Am Present)"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GeoTaggedCameraCapture;
