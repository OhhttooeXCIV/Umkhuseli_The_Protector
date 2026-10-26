import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Clock, ShieldCheck, HeartPulse, FileText } from "lucide-react";

export const First72HoursGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>The First 72 Hours Guide</span>
              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                CRITICAL PROTOCOL
              </span>
            </h3>
            <p className="text-xs text-amber-400/90 font-medium mt-0.5">
              Critical medical & forensic evidence steps
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-1 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Do not bathe or change clothes yet</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Crucial DNA and physical evidence is preserved on your skin and garments for the forensic medical exam. Place unwashed garments in a clean paper bag (not plastic).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                <span>HIV PEP Prophylaxis within 72 hours</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Post-Exposure Prophylaxis (PEP) medication prevents HIV transmission if started within 72 hours at any Thuthuzela Care Centre or public hospital emergency room.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>Emergency Contraception within 120 hours</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Oral emergency contraception (the morning-after pill) is provided free of charge at all safe havens to prevent unintended pregnancy.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask for the J88 Medical Examination Form</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ensure the medical practitioner completes and signs the official SAPS J88 form. This medical documentation is the cornerstone of criminal prosecution in South African courts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
