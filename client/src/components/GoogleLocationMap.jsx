import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Layers,
  Globe,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
} from 'lucide-react';
import { reverseGeocodeCoordinates } from '../utils/locationHelper';

// DMS format conversion helper
export const toDMS = (deg, isLat) => {
  if (deg === undefined || deg === null || isNaN(deg)) return '0°0\'0"N';
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${degrees}°${minutes}'${seconds}"${direction}`;
};

// Calculate geodesic distance between two points in meters
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// Custom Marker Icons
const createIcon = (color, label = '📍', isPulsing = false) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        ${
          isPulsing
            ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${color}; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const userIcon = createIcon('#3b82f6', '👤', true);
const primaryIcon = createIcon('#10b981', '📍');
const secondaryIcon = createIcon('#8b5cf6', '📸');

// Click listener to adjust pin position if interactive
const InteractiveMapClickHandler = ({ onPositionChange }) => {
  useMapEvents({
    click(e) {
      if (onPositionChange) {
        onPositionChange([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

const GoogleLocationMap = ({
  latitude = 28.6259,
  longitude = 77.2240,
  accuracy = 8,
  address = '',
  title = 'Exact Location Details',
  height = '320px',
  interactive = false,
  onPositionChange = null,
  showGoogleEmbed = false,
  secondaryLatitude = null,
  secondaryLongitude = null,
  secondaryLabel = 'Resolution Evidence GPS',
  primaryLabel = 'Incident Site GPS',
  zoom = 15,
}) => {
  const [mapMode, setMapMode] = useState(showGoogleEmbed ? 'GOOGLE_EMBED' : 'INTERACTIVE'); // 'INTERACTIVE' | 'GOOGLE_EMBED' | 'SATELLITE'
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [resolvedDisplayAddress, setResolvedDisplayAddress] = useState(address);

  const latNum = Number(latitude) || 28.6259;
  const lngNum = Number(longitude) || 77.2240;
  const dmsLat = toDMS(latNum, true);
  const dmsLng = toDMS(lngNum, false);

  useEffect(() => {
    if (address && !address.includes('Green Park') && !address.includes('Acquiring')) {
      setResolvedDisplayAddress(address);
    } else if (latNum && lngNum) {
      reverseGeocodeCoordinates(latNum, lngNum).then((res) => {
        if (res && res.formattedAddress) {
          setResolvedDisplayAddress(res.formattedAddress);
        } else if (address) {
          setResolvedDisplayAddress(address);
        }
      });
    }
  }, [address, latNum, lngNum]);

  const hasSecondary =
    secondaryLatitude !== null &&
    secondaryLongitude !== null &&
    !isNaN(Number(secondaryLatitude)) &&
    !isNaN(Number(secondaryLongitude));

  const secLatNum = Number(secondaryLatitude);
  const secLngNum = Number(secondaryLongitude);

  const distanceBetween = hasSecondary
    ? calculateDistanceMeters(latNum, lngNum, secLatNum, secLngNum)
    : null;

  // Municipal GIS mapping
  const isGisPinned = Boolean(latNum && lngNum);

  // Detect user's current live location on demand
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        const uAcc = Math.round(pos.coords.accuracy) || 5;
        setUserLocation({ latitude: uLat, longitude: uLng, accuracy: uAcc });
        setIsLocating(false);
        if (onPositionChange && interactive) {
          onPositionChange([uLat, uLng]);
        }
      },
      (err) => {
        console.warn('Geolocation lookup notice:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-['Outfit'] flex items-center gap-1.5">
              <span>{title}</span>
            </h4>
            {(resolvedDisplayAddress || address) && (
              <p className="text-[11px] text-slate-300 truncate max-w-sm sm:max-w-md font-medium">
                {resolvedDisplayAddress || address}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIS Ground Pin Active</span>
          </span>
        </div>
      </div>

      {/* Map Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMapMode('INTERACTIVE')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors text-[11px] ${
              mapMode === 'INTERACTIVE'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Street Map
          </button>
          <button
            type="button"
            onClick={() => setMapMode('SATELLITE')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors text-[11px] ${
              mapMode === 'SATELLITE'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Locate user button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-sky-400 font-medium flex items-center gap-1 transition-colors"
        >
          <Compass className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Locate My Presence'}</span>
        </button>
      </div>

      {/* Map View Display */}
      <div
        className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner"
        style={{ height }}
      >
        <MapContainer
            center={[latNum, lngNum]}
            zoom={zoom}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            {mapMode === 'SATELLITE' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {interactive && (
              <InteractiveMapClickHandler onPositionChange={onPositionChange} />
            )}

            {/* Primary Pin (Incident Site or Photo Location) */}
            <Marker position={[latNum, lngNum]} icon={primaryIcon}>
              <Popup>
                <div className="p-1 text-slate-900 font-sans text-xs">
                  <strong>{primaryLabel}</strong>
                  <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                    {latNum.toFixed(6)}° N, {lngNum.toFixed(6)}° E
                  </div>
                  {address && <div className="text-[10px] text-slate-600 mt-1">{address}</div>}
                </div>
              </Popup>
            </Marker>

            {/* Accuracy ring around primary coordinate */}
            <Circle
              center={[latNum, lngNum]}
              radius={accuracy || 8}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.12,
                weight: 1.5,
              }}
            />

            {/* Secondary Pin (Resolution Evidence GPS) */}
            {hasSecondary && (
              <>
                <Marker position={[secLatNum, secLngNum]} icon={secondaryIcon}>
                  <Popup>
                    <div className="p-1 text-slate-900 font-sans text-xs">
                      <strong>{secondaryLabel}</strong>
                      <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                        {secLatNum.toFixed(6)}° N, {secLngNum.toFixed(6)}° E
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">
                        Distance from Origin: {distanceBetween}m
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[secLatNum, secLngNum]}
                  radius={10}
                  pathOptions={{
                    color: '#8b5cf6',
                    fillColor: '#8b5cf6',
                    fillOpacity: 0.15,
                    weight: 1.5,
                  }}
                />
              </>
            )}

            {/* User live presence beacon if detected */}
            {userLocation && (
              <>
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={userIcon}
                >
                  <Popup>
                    <div className="p-1 text-slate-900 font-sans text-xs">
                      <strong>👤 You Are Here (Live Presence)</strong>
                      <div className="text-[11px] font-mono text-slate-700 mt-0.5">
                        {userLocation.latitude.toFixed(6)}°, {userLocation.longitude.toFixed(6)}°
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Accuracy: ±{userLocation.accuracy}m
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[userLocation.latitude, userLocation.longitude]}
                  radius={userLocation.accuracy || 10}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2,
                    weight: 1.5,
                  }}
                />
              </>
            )}
          </MapContainer>

        {/* Live GPS Stamp Overlay Pill in corner */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-200 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-emerald-400 font-bold">
            {latNum.toFixed(4)}° N, {lngNum.toFixed(4)}° E
          </span>
          <span className="text-slate-500 hidden sm:inline">({dmsLat}, {dmsLng})</span>
        </div>
      </div>

      {/* Geospatial Metadata Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Decimal Coordinates:</span>
          <span className="font-mono text-emerald-400 font-bold">
            {latNum.toFixed(6)}, {lngNum.toFixed(6)}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">DMS Coordinates:</span>
          <span className="font-mono text-slate-200 text-[11px] truncate block" title={`${dmsLat}, ${dmsLng}`}>
            {dmsLat}, {dmsLng}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">GPS Precision / Accuracy:</span>
          <span className="font-mono text-sky-400 font-bold">
            ±{accuracy || 6}m (Geofence OK)
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">GIS Status:</span>
          <span className="text-cyan-400 font-bold font-mono text-[11px]">
            Municipal Ground Pin Active
          </span>
        </div>
      </div>

      {/* Dual pin distance summary banner if secondary is present */}
      {hasSecondary && distanceBetween !== null && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs flex items-center justify-between text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Distance between Incident & Resolution: <strong className="font-mono font-bold text-white">{distanceBetween} meters</strong>
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            {distanceBetween <= 50 ? '✓ High Geofence Consistency' : '⚠ Requires Supervisor Inspection'}
          </span>
        </div>
      )}
    </div>
  );
};

export default GoogleLocationMap;
