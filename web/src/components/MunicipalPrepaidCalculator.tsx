import React, { useState, useRef } from "react";
import { Shield, Zap, Receipt, CheckCircle, Info, AlertOctagon, AlertTriangle, X, Download, Smartphone, Monitor, BookOpen, ShieldCheck, ExternalLink } from "lucide-react";

interface MunicipalityTariff {
  name: string;
  ratePerKwh: number;
}

const MUNICIPALITIES: MunicipalityTariff[] = [
  { name: "City of Ekurhuleni (Boksburg / East Rand)", ratePerKwh: 2.42 },
  { name: "City Power (Johannesburg)", ratePerKwh: 2.45 },
  { name: "City of Cape Town", ratePerKwh: 2.38 },
  { name: "eThekwini Electricity (Durban)", ratePerKwh: 2.40 },
  { name: "City of Tshwane (Pretoria)", ratePerKwh: 2.50 },
  { name: "Eskom Direct Residential", ratePerKwh: 2.22 },
  { name: "Mangaung Metro (Bloemfontein)", ratePerKwh: 2.48 }
];

interface Props {
  onUnlockSafeHaven: () => void;
  onDuressTrigger: () => void;
}

export interface DecoyResult {
  unitsKwh: number;
  vat: number;
  net: number;
  token: string;
  isDuress?: boolean;
  errorCode?: string;
}

export const MunicipalPrepaidCalculator: React.FC<Props> = ({
  onUnlockSafeHaven,
  onDuressTrigger
}) => {
  const [selectedMuni, setSelectedMuni] = useState(MUNICIPALITIES[0]);
  const [meterNumber, setMeterNumber] = useState("04182948192");
  const [amount, setAmount] = useState("200");
  const [result, setResult] = useState<DecoyResult | null>(null);
  const [showStsErrorModal, setShowStsErrorModal] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);

  // Covert 3-tap gesture tracking
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  const handleCrestClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 800) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapRef.current = now;

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      onUnlockSafeHaven();
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = amount.trim();
    const cleanMeter = meterNumber.trim();

    // Check for secret Safe Haven unlock PIN
    if (cleanAmount === "8426" || cleanMeter.endsWith("8426")) {
      onUnlockSafeHaven();
      return;
    }

    // Check for Duress PIN (displays fake token & triggers silent SOS)
    if (cleanAmount === "9999" || cleanMeter.endsWith("9999") || cleanAmount === "30") {
      onDuressTrigger();
      const val = 200;
      setResult({
        unitsKwh: val / selectedMuni.ratePerKwh,
        vat: (val * 0.15) / 1.15,
        net: val - (val * 0.15) / 1.15,
        token: "4819 0281 9481 0294 8812",
        isDuress: true,
        errorCode: "STS-ERR-30"
      });
      return;
    }

    const num = parseFloat(cleanAmount);
    if (!isNaN(num) && num > 0) {
      const vat = (num * 0.15) / 1.15;
      const net = num - vat;
      const units = net / selectedMuni.ratePerKwh;
      const randToken = Array.from({ length: 5 }, () =>
        Math.floor(1000 + Math.random() * 9000)
      ).join(" ");

      setResult({
        unitsKwh: units,
        vat,
        net,
        token: randToken
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 max-w-md mx-auto select-none">
      <div>
        {/* Header with Secret 3-Tap Trigger */}
        <header className="flex items-center justify-between py-4 border-b border-slate-800 mb-6">
          <div
            onClick={handleCrestClick}
            className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
            title="Municipal Verification Shield"
          >
            <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-sky-400 flex items-center justify-center shadow-lg shadow-sky-950">
              <Shield className="w-6 h-6 text-sky-400 group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                MUNICIPAL UTILITY
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                Prepaid Electricity Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 text-[11px] text-amber-400 font-medium">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>STS-6 Ready</span>
          </div>
        </header>

        {/* Calculation Card */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-5 border border-slate-700 shadow-xl mb-6">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label htmlFor="muniSelect" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Municipality / Supply Authority
              </label>
              <select
                id="muniSelect"
                value={selectedMuni.name}
                onChange={(e) => {
                  const m = MUNICIPALITIES.find((x) => x.name === e.target.value);
                  if (m) setSelectedMuni(m);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
              >
                {MUNICIPALITIES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="meterNumberInput" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Prepaid Meter Number (11 Digits)
              </label>
              <input
                id="meterNumberInput"
                type="text"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                placeholder="e.g. 04182948192"
              />
            </div>

            <div>
              <label htmlFor="amountInput" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Purchase Amount (ZAR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sky-400 font-bold text-sm">
                  R
                </span>
                <input
                  id="amountInput"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-sky-400"
                  placeholder="200"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {["50", "100", "200", "500"].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    amount === preset
                      ? "bg-sky-600 border-sky-400 text-white"
                      : "bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  R{preset}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-sky-500 hover:bg-sky-400 active:scale-[0.98] transition-all text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Receipt className="w-4 h-4" />
              <span>Calculate Units & Generate Token</span>
            </button>
          </form>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-sky-500/40 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
                ESTIMATED UNITS
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="text-3xl font-black text-white mb-3">
              {result.unitsKwh.toFixed(1)}{" "}
              <span className="text-lg font-bold text-slate-400">kWh</span>
            </div>

            <div className="border-t border-slate-700 pt-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Tariff Rate:</span>
                <span>R{selectedMuni.ratePerKwh.toFixed(2)} / kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VAT (15% Included):</span>
                <span>R{result.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Electricity:</span>
                <span>R{result.net.toFixed(2)}</span>
              </div>
            </div>

            {/* Simulated 20-Digit STS Token */}
            <div className="mt-4 bg-slate-950 rounded-xl p-3 border border-sky-500/30 text-center">
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest block mb-1">
                SAMPLE STS RECHARGE TOKEN
              </span>
              <div className="font-mono text-base font-bold text-amber-400 tracking-wider">
                {result.token}
              </div>
            </div>

            {/* Feature 2: Duress STS Reverse-Decoy Warning & Diagnostic Trigger */}
            {result.isDuress && (
              <div className="mt-3 bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 text-xs text-rose-200 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>STS System Notice: Meter KRN2 Rollover Required</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                  Warning: Gateway response code <span className="font-mono font-bold text-amber-300">0x8830 (Error 30)</span>. 
                  Token generated under Key Revision 1. If your wall meter rejects this token with <span className="font-mono text-rose-300">"REJECT"</span> or <span className="font-mono text-rose-300">"Error 30"</span>, 
                  meter vending is suspended for TID Rollover. Ref: <span className="font-mono text-slate-200">ESK-2026-8819</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setShowStsErrorModal(true)}
                  className="w-full bg-rose-900/60 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                  <span>View STS Diagnostic Terminal Screen</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feature 2: Authentic STS Meter Hardware Error Modal */}
        {showStsErrorModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-950 border-2 border-rose-600 rounded-2xl max-w-sm w-full p-5 shadow-2xl font-mono text-xs text-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm tracking-wider">
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                  <span>STS ERROR 30</span>
                </div>
                <button
                  onClick={() => setShowStsErrorModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
                <div>
                  <span className="text-slate-500">METER NO:</span>{" "}
                  <span className="text-amber-400 font-bold">{meterNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">AUTHORITY:</span>{" "}
                  <span className="text-white">{selectedMuni.name.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-500">STATUS:</span>{" "}
                  <span className="text-rose-400 font-bold">TRANSACTION HALTED (0x8830)</span>
                </div>
                <div>
                  <span className="text-slate-500">FAULT:</span>{" "}
                  <span className="text-slate-300">
                    Meter Key Revision Expired. Meter rejected key rollover window.
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">HELPDESK:</span>{" "}
                  <span className="text-sky-400">Eskom 08600 37566 / City Power 0860 562 874</span>
                </div>
                <div>
                  <span className="text-slate-500">REF TICKET:</span>{" "}
                  <span className="text-amber-300">ESK-ZA-8841-KRN2</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center font-sans">
                Official STS Association diagnostic standard IEC 62055-41. Do not re-enter invalid voucher to avoid meter lockout.
              </p>

              <button
                type="button"
                onClick={() => setShowStsErrorModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Acknowledge & Close Diagnostic
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camouflage Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        <span>NERSA Approved 2026/27 Municipal Electricity Rates.</span>
      </footer>
    </div>
  );
};
