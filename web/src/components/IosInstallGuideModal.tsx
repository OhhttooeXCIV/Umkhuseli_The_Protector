import React, { useState, useEffect } from "react";
import { Share, PlusSquare, X, Zap } from "lucide-react";
import { isIosWebKit, isStandalonePwa } from "../services/iosStealthManager";

const DISMISSED_STORAGE_KEY = "umkhuseli_ios_install_dismissed";

export const IosInstallGuideModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if on iOS Safari, not already installed as standalone, and not dismissed recently
    if (typeof window === "undefined") return;

    const isIos = isIosWebKit();
    const isStandalone = isStandalonePwa();
    const isDismissed = localStorage.getItem(DISMISSED_STORAGE_KEY) === "true";

    if (isIos && !isStandalone && !isDismissed) {
      // Delay display slightly so initial facade renders first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DISMISSED_STORAGE_KEY, "true");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Utility Portal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl text-slate-200 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/80 border border-sky-500/40 rounded-xl text-sky-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Install Prepaid Meter Tool
              </h3>
              <p className="text-xs text-slate-400">
                Fast offline access without browser address bars
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Close installation guide"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 mb-5 text-xs text-slate-300">
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="p-2 bg-sky-900/40 text-sky-400 rounded-lg shrink-0">
              <Share className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-slate-200">Step 1:</span> Tap the{" "}
              <strong className="text-sky-300">Share button</strong> (square with arrow up) at the bottom of your Safari screen.
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="p-2 bg-sky-900/40 text-sky-400 rounded-lg shrink-0">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-slate-200">Step 2:</span> Scroll down and tap{" "}
              <strong className="text-sky-300">"Add to Home Screen"</strong>.
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="p-2 bg-emerald-900/40 text-emerald-400 rounded-lg shrink-0 font-bold text-xs flex items-center justify-center w-8 h-8">
              3
            </div>
            <div>
              <span className="font-medium text-slate-200">Step 3:</span> Tap{" "}
              <strong className="text-emerald-300">"Add"</strong> in the top right corner. The calculator icon will appear on your Home Screen.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Got it / Continue in Safari
          </button>
        </div>
      </div>
    </div>
  );
};
