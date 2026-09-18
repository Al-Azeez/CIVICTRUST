import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';

const DisclaimerBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900/90 border-b border-amber-500/30 text-slate-300 px-4 py-2 text-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-300">CivicTrust Prototype Notice:</strong> Independent civic verification system (PS-D04). Uses synthetic demo data. Automated image verification is advisory and flags suspicious resolutions for human review without automated penalties.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 shrink-0 p-1"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
