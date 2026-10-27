import React, { useState } from "react";
import { Phone, Delete, X, ShieldAlert } from "lucide-react";

interface AndroidDialerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSafeHaven: () => void;
  onDuressTrigger: () => void;
}

interface DialKey {
  digit: string;
  sub: string;
}

const DIAL_KEYS: DialKey[] = [
  { digit: "1", sub: "" },
  { digit: "2", sub: "ABC" },
  { digit: "3", sub: "DEF" },
  { digit: "4", sub: "GHI" },
  { digit: "5", sub: "JKL" },
  { digit: "6", sub: "MNO" },
  { digit: "7", sub: "PQRS" },
  { digit: "8", sub: "TUV" },
  { digit: "9", sub: "WXYZ" },
  { digit: "*", sub: "" },
  { digit: "0", sub: "+" },
  { digit: "#", sub: "" },
];

export const AndroidDialerModal: React.FC<AndroidDialerModalProps> = ({
  isOpen,
  onClose,
  onUnlockSafeHaven,
  onDuressTrigger,
}) => {
  const [digits, setDigits] = useState("");
  const [mmiNotice, setMmiNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    const next = digits + char;
    setDigits(next);

    // Instant unlock check for *#8426#
    if (next === "*#8426#" || next === "8426") {
      setDigits("");
      onClose();
      onUnlockSafeHaven();
      return;
    }

    // Instant duress check for *#9999#
    if (next === "*#9999#" || next === "9999") {
      setDigits("");
      onDuressTrigger();
      setMmiNotice("MMI code started\n\nCall forwarding unconditional:\nVoice service disabled.\nData roaming active (Vodacom/MTN ZA).");
      return;
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    const clean = digits.trim();
    if (clean === "*#8426#" || clean === "8426") {
      setDigits("");
      onClose();
      onUnlockSafeHaven();
      return;
    }

    if (clean === "*#9999#" || clean === "9999") {
      setDigits("");
      onDuressTrigger();
      setMmiNotice("MMI code started\n\nCall forwarding unconditional:\nVoice service disabled.\n(Vodacom / MTN South Africa)");
      return;
    }

    if (clean.length > 0) {
      // Normal phone call trigger
      window.location.href = `tel:${clean}`;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Phone Dialer"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 sm:rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-200">Phone Dialer</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dialer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MMI Notice Carrier Decoy Dialogue */}
        {mmiNotice ? (
          <div className="my-8 p-6 bg-slate-800/90 rounded-2xl border border-slate-700 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="font-mono text-sm text-slate-200 whitespace-pre-line">
              {mmiNotice}
            </div>
            <button
              onClick={() => {
                setMmiNotice(null);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition"
            >
              OK
            </button>
          </div>
        ) : (
          <>
            {/* Display Field */}
            <div className="min-h-[70px] flex items-center justify-between px-3 my-2">
              <div
                data-testid="dialer-digits-display"
                className="text-3xl font-mono tracking-widest text-white truncate max-w-[85%]"
              >
                {digits || <span className="text-slate-600 text-xl font-sans">Enter number</span>}
              </div>
              {digits.length > 0 && (
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="p-2 text-slate-400 hover:text-slate-200 active:scale-90 transition"
                  aria-label="Delete last digit"
                >
                  <Delete className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 my-3">
              {DIAL_KEYS.map((k) => (
                <button
                  key={k.digit}
                  type="button"
                  onClick={() => handleKeyPress(k.digit)}
                  className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600/90 text-white flex flex-col items-center justify-center transition-all border border-slate-700/50 shadow-sm active:scale-95"
                  aria-label={`Dial ${k.digit}`}
                >
                  <span className="text-2xl font-light font-sans">{k.digit}</span>
                  {k.sub && (
                    <span className="text-[10px] tracking-wider text-slate-400 font-mono">
                      {k.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Call Action Bar */}
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={handleCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform"
                aria-label="Call dialed number"
              >
                <Phone className="w-7 h-7 fill-current" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
