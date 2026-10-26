import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  Zap,
  Receipt,
  CheckCircle,
  Info,
  AlertOctagon,
  AlertTriangle,
  X,
  Download,
  Smartphone,
  Monitor,
  BookOpen,
  ShieldCheck,
  Wifi,
  WifiOff,
  ChevronRight,
  BatteryMedium,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Sun,
  Moon,
  LifeBuoy,
} from "lucide-react";
import {
  getInitialTheme,
  toggleTheme,
  ThemeMode,
  THEME_CHANGE_EVENT,
} from "../services/themeManager";

interface MunicipalityTariff {
  name: string;
  ratePerKwh: number;
  block1: number; // 0-350 kWh lifeline rate
  block2: number; // 350+ kWh standard rate
  province: string;
}

const MUNICIPALITIES: MunicipalityTariff[] = [
  { name: "City Power (Johannesburg)", ratePerKwh: 2.45, block1: 1.85, block2: 2.45, province: "Gauteng" },
  { name: "City of Ekurhuleni (Boksburg / East Rand)", ratePerKwh: 2.42, block1: 1.82, block2: 2.42, province: "Gauteng" },
  { name: "City of Tshwane (Pretoria)", ratePerKwh: 2.50, block1: 1.90, block2: 2.50, province: "Gauteng" },
  { name: "City of Cape Town", ratePerKwh: 2.38, block1: 1.79, block2: 2.38, province: "Western Cape" },
  { name: "eThekwini Electricity (Durban)", ratePerKwh: 2.40, block1: 1.81, block2: 2.40, province: "KwaZulu-Natal" },
  { name: "Mangaung Metro (Bloemfontein)", ratePerKwh: 2.48, block1: 1.88, block2: 2.48, province: "Free State" },
  { name: "Buffalo City Metro (East London)", ratePerKwh: 2.35, block1: 1.77, block2: 2.35, province: "Eastern Cape" },
  { name: "Nelson Mandela Bay (Port Elizabeth)", ratePerKwh: 2.37, block1: 1.78, block2: 2.37, province: "Eastern Cape" },
  { name: "Eskom Direct Residential", ratePerKwh: 2.22, block1: 1.67, block2: 2.22, province: "National" },
];

const LOADSHEDDING_STATUS = { stage: 2, area: "your area", nextSlot: "18:00 – 20:30" };

interface Props {
  onUnlockSafeHaven: () => void;
  onDuressTrigger: () => void;
  onOpenBriefing?: () => void;
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
  onDuressTrigger,
  onOpenBriefing,
}) => {
  const [selectedMuni, setSelectedMuni] = useState(MUNICIPALITIES[0]);
  const [meterNumber, setMeterNumber] = useState("04182948192");
  const [amount, setAmount] = useState("200");
  const [result, setResult] = useState<DecoyResult | null>(null);
  const [showStsErrorModal, setShowStsErrorModal] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tokenCopied, setTokenCopied] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  // Covert 3-tap gesture tracking on the shield crest
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  // Sync theme changes & live network/clock updates
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    const tick = setInterval(() => setCurrentTime(new Date()), 30_000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      clearInterval(tick);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token.replace(/\s/g, ""));
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silent fail */
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = amount.trim();
    const cleanMeter = meterNumber.trim();

    // Secret Safe Haven unlock PINs
    if (cleanAmount === "8426" || cleanAmount === "1234" || cleanMeter.endsWith("8426")) {
      onUnlockSafeHaven();
      return;
    }

    // Duress PIN — silent SOS beacon + realistic decoy STS recharge token
    if (cleanAmount === "9999" || cleanMeter.endsWith("9999") || cleanAmount === "30") {
      onDuressTrigger();
      const num = 200;
      const vat = (num * 0.15) / 1.15;
      const net = num - vat;
      const units = net / selectedMuni.ratePerKwh;
      setResult({
        unitsKwh: units,
        vat,
        net,
        token: "4819 0281 9481 0294 8812",
        isDuress: true,
        errorCode: "STS-ERR-30",
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
      setResult({ unitsKwh: units, vat, net, token: randToken });
    }
  };

  const handleReset = () => {
    setResult(null);
    setAmount("200");
    setTokenCopied(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#05080f] dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* ── TOP STATUS BAR ─────────────────────────────────────────────── */}
      <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/60 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-mono tracking-wider">
            {currentTime.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
            {" · "}
            {currentTime.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden sm:flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
            Stage {LOADSHEDDING_STATUS.stage} Active · Next: {LOADSHEDDING_STATUS.nextSlot}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* STS-6 badge */}
          <span className="inline-flex items-center gap-1 bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800/60 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px]">
            STS-6 Ready
          </span>

          <span className="flex items-center gap-1">
            <BatteryMedium className="w-3 h-3 text-slate-500" />
            <span>NERSA 2026/27</span>
          </span>

          <span className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <WifiOff className="w-3 h-3 text-rose-600 dark:text-rose-500" />
            )}
            <span className={isOnline ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}>
              {isOnline ? "Connected" : "Offline"}
            </span>
          </span>
        </div>
      </div>

      {/* ── HERO HEADER ────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-[#05080f] border-b border-slate-200 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand + Secret Tap Zone */}
          <button
            type="button"
            onClick={handleCrestClick}
            className="flex items-center gap-3.5 group focus:outline-none text-left"
            aria-label="Municipal utility portal home"
          >
            {/* Animated shield crest with title for test query */}
            <div
              className="relative flex-shrink-0"
              title="Municipal Verification Shield"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-700/10 border-2 border-sky-500/60 flex items-center justify-center shadow-lg shadow-sky-500/10 group-active:scale-95 transition-transform">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-sky-600 dark:text-sky-400" />
              </div>
              <span
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 animate-pulse"
                title={`Stage ${LOADSHEDDING_STATUS.stage} loadshedding active`}
              />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-sky-600 dark:text-sky-400">
                PowerCalc SA · Municipal Utility Services
              </p>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Prepaid Electricity Portal
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                Authorized vending partner for Eskom, City Power & all metro municipalities
              </p>
            </div>
          </button>

          {/* Quick Controls: Light/Dark Mode + Distress Briefing + Loadshedding */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Distress Briefing Trigger Button */}
            {onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/50 text-xs font-bold transition-colors"
                title="View Emergency Distress Codes & Safety Briefing"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Distress Codes</span>
              </button>
            )}

            {/* Loadshedding badge */}
            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-600/40 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-full text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span className="hidden xs:inline">Stage {LOADSHEDDING_STATUS.stage}</span>
              <span className="xs:hidden">S{LOADSHEDDING_STATUS.stage}</span>
            </div>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="overflow-hidden border-t border-slate-200 dark:border-slate-800/50 bg-slate-100/70 dark:bg-slate-950/60">
          <div className="flex gap-8 animate-[marquee_28s_linear_infinite] whitespace-nowrap py-1.5 px-4 text-[10px] text-slate-600 dark:text-slate-500 font-mono">
            {[
              "STS IEC 62055-41 COMPLIANT VENDING SYSTEM",
              "NERSA APPROVED RATES 2026/27",
              "ESKOM DIRECT RESIDENTIAL: R2.22/kWh",
              "CITY POWER BLOCK 1: R1.85/kWh · BLOCK 2: R2.45/kWh",
              "VAT INCLUSIVE PRICING AT 15%",
              "ZERO-RATED USSD: *120*321# FOR BALANCE QUERIES",
              "LOADSHEDDING STAGE 2 IN EFFECT",
            ]
              .concat([
                "STS IEC 62055-41 COMPLIANT VENDING SYSTEM",
                "NERSA APPROVED RATES 2026/27",
              ])
              .map((t, i) => (
                <span key={i} className="flex items-center gap-6">
                  <span>{t}</span>
                  <span className="text-slate-400 dark:text-slate-700">◆</span>
                </span>
              ))}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* LEFT / PRIMARY: Calculator Card */}
        <div className="space-y-4">
          {/* Stage alert */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/40 rounded-2xl px-4 py-3 text-xs text-amber-900 dark:text-amber-300">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 fill-amber-500" />
            <div>
              <span className="font-bold text-amber-800 dark:text-amber-400">Stage {LOADSHEDDING_STATUS.stage} Loadshedding Active.</span>
              {" "}Next scheduled outage in {LOADSHEDDING_STATUS.area}: <span className="font-mono font-bold">{LOADSHEDDING_STATUS.nextSlot}</span>.{" "}
              <a
                href="https://eskomsepush.gumroad.com/l/eskomsepush"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 dark:text-amber-400 underline decoration-amber-500 hover:text-amber-900 dark:hover:text-amber-200"
              >
                Check full schedule →
              </a>
            </div>
          </div>

          {/* Calculator form */}
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xl dark:shadow-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-slate-100/80 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700/60 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">Purchase Electricity Units</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/40 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                Secure Vending
              </span>
            </div>

            <form onSubmit={handleCalculate} className="p-5 space-y-5">
              {/* Municipality select */}
              <div>
                <label htmlFor="muniSelect" className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                  Municipality / Supply Authority
                </label>
                <div className="relative">
                  <select
                    id="muniSelect"
                    value={selectedMuni.name}
                    onChange={(e) => {
                      const m = MUNICIPALITIES.find((x) => x.name === e.target.value);
                      if (m) setSelectedMuni(m);
                    }}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 pr-8 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors"
                  >
                    {MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 inline-block text-slate-400" />
                  Tariff: Block 1 (0–350 kWh) R{selectedMuni.block1.toFixed(2)}/kWh · Block 2 R{selectedMuni.block2.toFixed(2)}/kWh incl. VAT
                </p>
              </div>

              {/* Meter number */}
              <div>
                <label htmlFor="meterNumberInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                  Prepaid Meter Number (11 digits)
                </label>
                <input
                  id="meterNumberInput"
                  type="text"
                  inputMode="numeric"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors placeholder:text-slate-400"
                  placeholder="04182948192"
                  maxLength={11}
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amountInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                  Purchase Amount (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600 dark:text-sky-400 font-bold text-sm select-none">R</span>
                  <input
                    id="amountInput"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors placeholder:text-slate-400"
                    placeholder="200"
                  />
                </div>

                {/* Quick presets */}
                <div className="grid grid-cols-6 gap-2 mt-2.5">
                  {["50", "100", "150", "200", "350", "500"].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => { setAmount(preset); setResult(null); }}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        amount === preset
                          ? "bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-500/20"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      R{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 active:scale-[0.98] transition-all text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-sky-600/20 text-sm cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Calculate Units & Generate Token</span>
              </button>
            </form>
          </div>

          {/* ── RESULTS CARD ─────────────────────────────────────────── */}
          {result && (
            <div className={`rounded-2xl border shadow-xl dark:shadow-2xl overflow-hidden transition-all ${
              result.isDuress
                ? "border-rose-400 dark:border-rose-700/50 bg-rose-50/50 dark:bg-rose-950/20"
                : "border-sky-300 dark:border-sky-600/40 bg-white dark:bg-slate-900/80"
            }`}>
              {/* Result header */}
              <div className={`px-5 py-3.5 flex items-center justify-between border-b ${
                result.isDuress
                  ? "bg-rose-100 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50"
                  : "bg-slate-100/90 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700/60"
              }`}>
                <div className="flex items-center gap-2">
                  {result.isDuress ? (
                    <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    result.isDuress ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {result.isDuress ? "STS Error — Transaction Halted" : "Token Generated Successfully"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Clear and recalculate"
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* kWh figure (Always visible so duress looks 100% authentic) */}
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-sky-600 dark:text-sky-500 mb-1">
                    ESTIMATED UNITS
                  </p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                    {result.unitsKwh.toFixed(1)}
                    <span className="text-xl font-bold text-slate-500 dark:text-slate-400 ml-2">kWh</span>
                  </p>
                </div>

                {/* Breakdown */}
                <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl divide-y divide-slate-200 dark:divide-slate-700/50 text-xs overflow-hidden">
                  {[
                    ["Tariff Rate", `R${selectedMuni.ratePerKwh.toFixed(2)} / kWh`],
                    ["VAT (15% included)", `R${result.vat.toFixed(2)}`],
                    ["Net Electricity Value", `R${result.net.toFixed(2)}`],
                    ["Purchase Amount", `R${amount}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center px-3 py-2">
                      <span className="text-slate-600 dark:text-slate-400">{label}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{val}</span>
                    </div>
                  ))}
                </div>

                {/* STS Token (Heading directly followed by token value for test sibling check) */}
                <div className="bg-slate-900 dark:bg-slate-950 rounded-xl border border-sky-400/30 dark:border-sky-500/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-sky-400 dark:text-sky-500 block">
                        SAMPLE STS RECHARGE TOKEN
                      </span>
                      <p className="font-mono text-xl font-black text-amber-400 tracking-[0.25em] leading-none mt-1">
                        {result.token}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyToken(result.token)}
                      className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1 text-[10px] font-bold"
                      title="Copy token"
                    >
                      {tokenCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  {result.isDuress && (
                    <p className="mt-2 text-[10px] text-rose-400 font-mono text-center">
                      {result.errorCode} · Meter TID rollover required
                    </p>
                  )}
                </div>

                {/* Duress secondary warning */}
                {result.isDuress && (
                  <div className="bg-rose-100 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-700/40 rounded-xl p-3.5 text-xs text-rose-900 dark:text-rose-200">
                    <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 mb-1.5">
                      <AlertOctagon className="w-4 h-4 flex-shrink-0 animate-pulse" />
                      <span>STS System Notice: Meter KRN2 Rollover Required</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mb-2.5">
                      Gateway response code{" "}
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-300">0x8830 (Error 30)</span>. Token generated
                      under Key Revision 1. If your wall meter rejects this token with{" "}
                      <span className="font-mono text-rose-600 dark:text-rose-300">"REJECT"</span> or{" "}
                      <span className="font-mono text-rose-600 dark:text-rose-300">"Error 30"</span>, meter vending is
                      suspended for TID Rollover. Ref:{" "}
                      <span className="font-mono text-slate-800 dark:text-slate-200">ESK-2026-8819</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowStsErrorModal(true)}
                      className="w-full bg-rose-200 hover:bg-rose-300 dark:bg-rose-900/60 dark:hover:bg-rose-900 border border-rose-400 dark:border-rose-600/50 text-rose-900 dark:text-rose-200 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
                      <span>View STS Diagnostic Terminal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Info panels */}
        <aside className="space-y-4">
          {/* SA Rate Reference card */}
          <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50 px-4 py-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">2026/27 NERSA Tariff Guide</span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Rates approved by the National Energy Regulator of South Africa (NERSA) and effective from{" "}
                <span className="font-bold text-slate-800 dark:text-slate-300">1 July 2026</span>. All prices inclusive of 15% VAT.
              </p>
              <div className="space-y-2">
                {MUNICIPALITIES.slice(0, 5).map((m) => (
                  <div key={m.name} className="flex justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400 truncate pr-2">{m.name.split(" (")[0]}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200 flex-shrink-0">R{m.ratePerKwh.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2">
                Block 1 lifeline tariff applies to first 350 kWh consumed per month.
                Incline block pricing encourages conservation.
              </p>
            </div>
          </div>

          {/* Loadshedding schedule card */}
          <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-amber-200 dark:border-amber-800/30 overflow-hidden shadow-sm">
            <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/30 px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
                <span className="font-bold text-sm text-amber-900 dark:text-white">Loadshedding Status</span>
              </div>
              <span className="text-[10px] text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/40 rounded-full px-2 py-0.5 font-bold">
                Stage {LOADSHEDDING_STATUS.stage}
              </span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Next outage", val: LOADSHEDDING_STATUS.nextSlot, color: "text-amber-700 dark:text-amber-400" },
                  { label: "Duration", val: "2h 30min", color: "text-slate-700 dark:text-slate-300" },
                  { label: "Stage", val: `Stage ${LOADSHEDDING_STATUS.stage}`, color: "text-amber-700 dark:text-amber-400" },
                  { label: "Status", val: "In Effect", color: "text-rose-600 dark:text-rose-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
                    <p className={`font-bold ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Schedule updated from Eskom SePush API. Offsets may vary by area.
              </p>
            </div>
          </div>

          {/* Emergency contacts card */}
          <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50 px-4 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">SA Emergency Contacts</span>
            </div>
            <div className="p-4 space-y-2 text-xs">
              {[
                { name: "Eskom Faults", num: "08600 37566", color: "text-amber-600 dark:text-amber-400" },
                { name: "City Power (JHB)", num: "0860 562 874", color: "text-amber-600 dark:text-amber-400" },
                { name: "SAPS Emergency", num: "10111", color: "text-rose-600 dark:text-rose-400" },
                { name: "GBV Command Centre", num: "0800 428 428", color: "text-emerald-600 dark:text-emerald-400" },
                { name: "Ambulance / Paramedic", num: "10177", color: "text-rose-600 dark:text-rose-400" },
              ].map(({ name, num, color }) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">{name}</span>
                  <a href={`tel:${num.replace(/\s/g, "")}`} className={`font-mono font-bold ${color} hover:underline`}>
                    {num}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Download / portal entry */}
          <button
            type="button"
            onClick={() => setShowPortalModal(true)}
            className="w-full bg-gradient-to-r from-sky-50 to-slate-100 dark:from-sky-900/50 dark:to-slate-900/80 border border-sky-200 dark:border-sky-700/40 rounded-2xl p-4 text-left hover:border-sky-400 dark:hover:border-sky-600/60 transition-colors group shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                Consumer Portal & Downloads
              </span>
              <ChevronRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Android APK · iOS Safari PWA · Desktop app · Access cheatsheet
            </p>
          </button>
        </aside>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/60 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-slate-600">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-400 dark:text-slate-700" />
            <span>PowerCalc SA · NERSA-approved municipal electricity vending · 2026/27</span>
          </div>
          <div className="flex items-center gap-4">
            <span>IEC 62055-41 STS Compliant</span>
            <span>·</span>
            {onOpenBriefing && (
              <>
                <button
                  type="button"
                  onClick={onOpenBriefing}
                  className="text-sky-600 dark:text-sky-500 hover:underline"
                >
                  Distress Numbers Guide
                </button>
                <span>·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowPortalModal(true)}
              className="text-sky-600 dark:text-sky-700 hover:text-sky-800 dark:hover:text-sky-500 underline decoration-sky-300 dark:decoration-sky-900 transition-colors"
            >
              Consumer Portal
            </button>
            <span>·</span>
            <a
              href="https://www.google.co.za"
              className="text-slate-500 hover:text-rose-600 transition-colors"
              title="Quick exit"
            >
              ⚡ Exit
            </a>
          </div>
        </div>
      </footer>

      {/* ── STS ERROR MODAL ────────────────────────────────────────────── */}
      {showStsErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-rose-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl font-mono text-xs text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wider">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
                <span>STS DIAGNOSTIC — ERROR 30</span>
              </div>
              <button onClick={() => setShowStsErrorModal(false)} className="text-slate-500 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 bg-black p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
              {[
                ["METER NO", meterNumber],
                ["AUTHORITY", selectedMuni.name.toUpperCase()],
                ["STATUS", "TRANSACTION HALTED (0x8830)"],
                ["FAULT CODE", "TID_ROLLOVER_KRN2_EXPIRED"],
                ["FAULT", "Meter Key Revision Expired. Meter rejected key rollover window."],
                ["HELPDESK", "Eskom 08600 37566 / City Power 0860 562 874"],
                ["REF TICKET", "ESK-ZA-8841-KRN2"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-slate-600">{k}: </span>
                  <span className={k === "STATUS" ? "text-rose-400 font-bold" : k === "HELPDESK" ? "text-sky-400" : "text-slate-200"}>{v}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 text-center font-sans">
              Official STS Association diagnostic standard IEC 62055-41. Do not re-enter invalid voucher — may cause meter lockout.
            </p>
            <button
              onClick={() => setShowStsErrorModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Acknowledge & Close Diagnostic
            </button>
          </div>
        </div>
      )}

      {/* ── CONSUMER PORTAL MODAL ──────────────────────────────────────── */}
      {showPortalModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white">Consumer Portal & Mobile Downloads</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.google.co.za"
                  className="text-[10px] bg-rose-950 hover:bg-rose-900 border border-rose-700/50 text-rose-400 px-2.5 py-1 rounded-lg font-bold transition-colors"
                  title="Immediately leave this site"
                >
                  ⚡ Quick Exit
                </a>
                <button onClick={() => setShowPortalModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Android APK */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Android Smartphone — Direct APK</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Installs as <strong className="text-white">PowerCalc SA</strong> — no Play Store record. Leaves your phone clean and unsuspicious.
                </p>
                <a
                  href="/downloads/Umkhuseli_Safe_latest.apk"
                  download="PowerCalc_SA_latest.apk"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-600/20"
                >
                  <Download className="w-4 h-4" />
                  Download Android APK (PowerCalc SA v2.4.0)
                </a>
              </div>

              {/* iOS PWA */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Apple iPhone / iPad — Safari PWA</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  No App Store download or purchase history. In Safari tap the{" "}
                  <strong className="text-white">Share</strong> button ➔{" "}
                  <strong className="text-white">"Add to Home Screen"</strong>. Runs fullscreen with Face ID.
                </p>
              </div>

              {/* Desktop */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop / Laptop — Browser App</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Works in Chrome, Edge, or Firefox. Click the <strong className="text-white">Install</strong> icon in the address bar for a standalone desktop app with no browser chrome.
                </p>
              </div>

              {/* Cheatsheet */}
              <div className="bg-slate-950 rounded-xl border border-sky-900/40 p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Quick Access & Secret Triggers</span>
                </div>
                <ul className="text-slate-300 space-y-2 pl-1">
                  {[
                    ["Safe Haven Access", "Triple-tap the shield crest, or enter PIN 1234 / 8426 as purchase amount"],
                    ["Duress Alarm (9999)", "Shows fake STS error receipt while silently sending an emergency beacon to your guardians"],
                    ["Instant Panic Exit", "Double-tap background or press Escape / phone Back button — 0ms memory scrub"],
                    ["Form 2 Court Pack", "Compiles sworn affidavit formatted for SA Magistrates Court under ECTA Section 15"],
                    ["Quick Exit", "Tap ⚡ Quick Exit to leave this site instantly and open Google"],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex gap-2">
                      <span className="text-sky-500 font-bold flex-shrink-0 mt-0.5">›</span>
                      <span><strong className="text-white">{title}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS-only marquee keyframe */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
