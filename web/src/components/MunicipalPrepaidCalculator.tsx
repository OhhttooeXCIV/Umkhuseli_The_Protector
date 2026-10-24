import React, { useState, useRef, useEffect } from "react";
import { Shield, Zap, Receipt, CheckCircle, Info, Lock } from "lucide-react";

interface MunicipalityTariff {
  name: string;
  ratePerKwh: number;
}

const MUNICIPALITIES: MunicipalityTariff[] = [
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

export const MunicipalPrepaidCalculator: React.FC<Props> = ({
  onUnlockSafeHaven,
  onDuressTrigger
}) => {
  const [selectedMuni, setSelectedMuni] = useState(MUNICIPALITIES[0]);
  const [meterNumber, setMeterNumber] = useState("04182948192");
  const [amount, setAmount] = useState("200");
  const [result, setResult] = useState<{
    unitsKwh: number;
    vat: number;
    net: number;
    token: string;
  } | null>(null);

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
    if (cleanAmount === "9999" || cleanMeter.endsWith("9999")) {
      onDuressTrigger();
      const val = 200;
      setResult({
        unitsKwh: val / selectedMuni.ratePerKwh,
        vat: (val * 0.15) / 1.15,
        net: val - (val * 0.15) / 1.15,
        token: "4819 0281 9481 0294 8812"
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
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Municipality / Supply Authority
              </label>
              <select
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
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Prepaid Meter Number (11 Digits)
              </label>
              <input
                type="text"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                placeholder="e.g. 04182948192"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Purchase Amount (ZAR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sky-400 font-bold text-sm">
                  R
                </span>
                <input
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
