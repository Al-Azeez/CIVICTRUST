import React, { useState } from 'react';
import { Split, Columns, Eye, Sparkles } from 'lucide-react';

const ImageCompareSlider = ({ beforeImage, afterImage, category }) => {
  const [mode, setMode] = useState('split'); // 'split' | 'side'
  const [sliderPos, setSliderPos] = useState(50);

  if (!afterImage) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video flex flex-col items-center justify-center p-6 text-center">
        {beforeImage ? (
          <img
            src={beforeImage}
            alt="Reported Issue"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="text-slate-500 text-sm">No photo available</div>
        )}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-xs font-semibold text-slate-200">
          📷 Reported Citizen Photo
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Control toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Visual Resolution Evidence Inspection</span>
        </div>
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMode('split')}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
              mode === 'split' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Slider
          </button>
          <button
            onClick={() => setMode('side')}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
              mode === 'side' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
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
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 select-none shadow-xl cursor-ew-resize bg-slate-950"
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
          <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md shadow">
            After (Resolution)
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
            <div className="absolute top-3 left-3 bg-rose-950/90 border border-rose-500/30 text-rose-200 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md shadow">
              Before (Reported)
            </div>
          </div>

          {/* Slider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-950 shadow-2xl flex items-center justify-center font-bold text-xs">
              ↔
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-rose-900/40 bg-slate-900 aspect-video shadow-lg">
            <img
              src={beforeImage}
              alt="Reported Issue Before"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-rose-950/90 text-rose-200 border border-rose-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md">
              🔴 Before: Reported Issue
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-emerald-900/40 bg-slate-900 aspect-video shadow-lg">
            <img
              src={afterImage}
              alt="Resolution Claimed After"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-emerald-950/90 text-emerald-200 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md">
              🟢 After: Claimed Resolution
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompareSlider;
