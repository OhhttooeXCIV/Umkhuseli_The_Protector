import React from "react";
import { AlertOctagon, X } from "lucide-react";

export interface StsError30TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  meterNumber: string;
  municipalityName: string;
  ticketRef?: string;
}

export const StsError30Terminal: React.FC<StsError30TerminalProps> = ({
  isOpen,
  onClose,
  meterNumber,
  municipalityName,
  ticketRef = "ESK-ZA-8841-KRN2",
}) => {
  if (!isOpen) return null;

  const diagnosticRows: [string, string][] = [
    ["METER NO", meterNumber || "04182948192"],
    ["AUTHORITY", municipalityName.toUpperCase()],
    ["STATUS", "TRANSACTION HALTED (0x8830)"],
    ["FAULT CODE", "TID_ROLLOVER_KRN2_EXPIRED"],
    ["FAULT", "Meter Key Revision Expired. Meter rejected key rollover window."],
    ["HELPDESK", "Eskom 08600 37566 / City Power 0860 562 874"],
    ["REF TICKET", ticketRef],
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sts-diag-title"
    >
      <div className="bg-slate-950 border-2 border-rose-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl font-mono text-xs text-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
          <div
            className="flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wider"
            id="sts-diag-title"
          >
            <AlertOctagon className="w-5 h-5 animate-pulse" aria-hidden="true" />
            <span>STS DIAGNOSTIC — ERROR 30: KRN2 ROLLOVER TERMINAL</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close STS diagnostic modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 bg-black p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
          {diagnosticRows.map(([k, v]) => (
            <div key={k}>
              <span className="text-slate-400">{k}: </span>
              <span
                className={
                  k === "STATUS"
                    ? "text-rose-400 font-bold"
                    : k === "HELPDESK"
                    ? "text-sky-300 font-bold"
                    : "text-slate-100"
                }
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-300 text-center font-sans">
          Official STS Association diagnostic standard IEC 62055-41. Do not re-enter invalid voucher — may cause meter lockout.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-95"
        >
          Acknowledge & Close Diagnostic
        </button>
      </div>
    </div>
  );
};
