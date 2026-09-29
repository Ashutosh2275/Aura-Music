import React, { useState } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

export const InstallPromptBanner: React.FC = () => {
  const [isStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aura_pwa_prompt_dismissed') === 'true';
  });

  if (isStandalone || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('aura_pwa_prompt_dismissed', 'true');
  };

  return (
    <div className="mx-4 my-3 p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-start gap-3 shadow-lg">
      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
        <Share size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-neutral-200">Install on iPhone 16</h4>
        <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
          Tap <Share size={12} className="inline mx-0.5" /> in Safari, then select{' '}
          <strong className="text-neutral-200">
            <PlusSquare size={12} className="inline mx-0.5" /> Add to Home Screen
          </strong>{' '}
          for the full standalone music player experience.
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="text-neutral-500 hover:text-neutral-300 p-1 -mr-1"
        aria-label="Dismiss banner"
      >
        <X size={16} />
      </button>
    </div>
  );
};
