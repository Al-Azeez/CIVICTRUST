import React, { useState } from 'react';
import { ShieldCheck, X, Sparkles } from 'lucide-react';

const DisclaimerBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-pink-50/90 border-b border-pink-200 text-pink-950 px-4 py-2 text-xs backdrop-blur-md relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-pink-100 border border-pink-300 flex items-center justify-center text-[#e040a0] shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <p className="text-[11px] sm:text-xs text-pink-900 truncate sm:whitespace-normal">
            <strong className="text-[#be185d] font-bold">Digital Public Infrastructure Architecture:</strong> Autonomous 3-Signal verification (GPS Haversine, Delta Computer Vision, & SLA Timestamping). Advisory algorithmic verification with human supervisor override.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-pink-400 hover:text-pink-700 shrink-0 p-1 rounded-md hover:bg-pink-100/80 transition-colors"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
