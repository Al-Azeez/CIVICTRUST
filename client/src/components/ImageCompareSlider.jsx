import React, { useState } from 'react';
import { Split, Columns, Eye, Sparkles } from 'lucide-react';

const ImageCompareSlider = ({ beforeImage, afterImage, category }) => {
  const [mode, setMode] = useState('split'); // 'split' | 'side'
  const [sliderPos, setSliderPos] = useState(50);

  if (!afterImage) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 aspect-video flex flex-col items-center justify-center p-6 text-center">
        {beforeImage ? (
          <img
            src={beforeImage}
            alt="Reported Issue"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="text-slate-500 text-sm">No photo available</div>
        )}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-semibold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          📷 Reported Citizen Photographic Evidence
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Control toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Visual Ground-Truth Delta Inspection</span>
        </div>
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMode('split')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              mode === 'split' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Interactive Slider
          </button>
          <button
            onClick={() => setMode('side')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              mode === 'side' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side-by-Side
          </button>
        </div>
      </div>

      {mode === 'split' ? (
        /* Interactive Split Slider */
        <div
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-cyan-500/20 select-none shadow-2xl cursor-ew-resize bg-slate-950"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
            setSliderPos(Math.max(0, Math.min(100, pos)));
          }}
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            const pos = ((touch.clientX - rect.left) / rect.width) * 100;
            setSliderPos(Math.max(0, Math.min(100, pos)));
          }}
        >
          {/* Background: After Image */}
          <img
            src={afterImage}
            alt="Resolution Evidence"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            AFTER (Field Resolution)
          </div>

          {/* Foreground: Before Image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={beforeImage}
              alt="Reported Issue"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute top-3 left-3 bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              BEFORE (Citizen Report)
            </div>
          </div>

          {/* Slider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-950 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)] flex items-center justify-center font-bold text-xs">
              ↔
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-slate-950 aspect-video shadow-xl">
            <img
              src={beforeImage}
              alt="Reported Issue Before"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-rose-950/90 text-rose-200 border border-rose-500/40 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md shadow">
              🔴 Before: Citizen Grievance
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 aspect-video shadow-xl">
            <img
              src={afterImage}
              alt="Resolution Claimed After"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md shadow">
              🟢 After: Verified Field Resolution
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompareSlider;
