import React from "react";
import { Sparkles, X } from "lucide-react";

interface UatSimulatedCallModalProps {
  isOpen: boolean;
  serviceName: string;
  number: string;
  actualService: string;
  onClose: () => void;
}

export const UatSimulatedCallModal: React.FC<UatSimulatedCallModalProps> = ({
  isOpen,
  serviceName,
  number,
  actualService,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-950 border-2 border-amber-500/60 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-xs text-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>UAT Simulation: Emergency Call</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <p className="text-[11px] text-slate-300 leading-relaxed">
            You dialed masked service <strong className="text-white">{serviceName}</strong> (
            <span className="font-mono font-bold text-amber-300">{number}</span>).
          </p>
          <div className="p-2 bg-amber-950/40 rounded border border-amber-700/50 text-amber-200 text-[11px]">
            <strong>🛡️ Masked Route:</strong> In operational mode, this dials{" "}
            <strong className="text-white">{actualService}</strong>.
          </div>
          <p className="text-[11px] text-slate-300">
            Because <strong>UAT Mode</strong> is enabled, live emergency authorities are safely
            suppressed. A simulated alert packet has been routed to your{" "}
            <strong>5 ICE Guardians</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition-colors text-xs cursor-pointer active:scale-95"
          >
            Acknowledge UAT Test
          </button>
        </div>
      </div>
    </div>
  );
};
