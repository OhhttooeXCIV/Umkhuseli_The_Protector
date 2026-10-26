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
  PhoneCall,
  Sparkles,
  Droplet,
  Droplets,
  Sliders,
  Waves,
  Activity,
  TrendingDown,
  Layers,
} from "lucide-react";
import {
  getInitialTheme,
  toggleTheme,
  ThemeMode,
  THEME_CHANGE_EVENT,
} from "../services/themeManager";
import {
  fetchLiveLoadshedding,
  LoadsheddingInfo,
} from "../services/loadsheddingService";
import {
  getDeviceTelemetry,
  DeviceTelemetry,
} from "../services/deviceTelemetry";
import {
  getUatProfile,
  UatProfile,
} from "../services/uatProfileService";
import { WaterConservationSection } from "./decoy/WaterConservationSection";
import { EnergySavingsAuditSection } from "./decoy/EnergySavingsAuditSection";
import { SolarPaybackSection } from "./decoy/SolarPaybackSection";
import { StsMeterGuideSection } from "./decoy/StsMeterGuideSection";

export type UtilityTab = "electricity" | "water" | "energy" | "solar" | "sts_guide";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tokenCopied, setTokenCopied] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activeTab, setActiveTab] = useState<UtilityTab>("electricity");

  // Live Eskom Loadshedding Status
  const [loadshedding, setLoadshedding] = useState<LoadsheddingInfo>({
    stage: 0,
    statusText: "Grid Normal · Loadshedding Suspended",
    source: "loadshedding.eskom.co.za",
    officialUrl: "https://loadshedding.eskom.co.za/",
    area: "National Grid / Metro Supply",
    nextSlot: "No Outages Scheduled",
    duration: "0h 00min",
    isOutageActive: false,
    timestamp: new Date().toISOString(),
  });

  // Real Hardware Device Telemetry
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    connectionType: "Connected",
    batteryLevel: null,
    isCharging: false,
  });

  // UAT Profile & Simulated Call Modal State
  const [uatProfile, setUatProfileState] = useState<UatProfile>(getUatProfile);
  const [simulatedCallModal, setSimulatedCallModal] = useState<{
    open: boolean;
    serviceName: string;
    number: string;
    actualService: string;
  }>({
    open: false,
    serviceName: "",
    number: "",
    actualService: "",
  });

  // Covert 3-tap gesture tracking on the shield crest
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  // Sync theme changes, live telemetry, and live Eskom loadshedding
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    // Refresh telemetry from actual hardware
    const updateTelemetry = () => {
      getDeviceTelemetry().then(setTelemetry).catch(() => {});
    };
    updateTelemetry();

    // Fetch factual live loadshedding from Eskom
    fetchLiveLoadshedding().then(setLoadshedding).catch(() => {});
    const loadsheddingInterval = setInterval(() => {
      fetchLiveLoadshedding().then(setLoadshedding).catch(() => {});
    }, 60_000);

    const tick = setInterval(() => setCurrentTime(new Date()), 30_000);
    window.addEventListener("online", updateTelemetry);
    window.addEventListener("offline", updateTelemetry);

    const handleUatUpdate = () => setUatProfileState(getUatProfile());
    window.addEventListener("pcalc_uat_profile_updated", handleUatUpdate);
    window.addEventListener("umkhuseli_uat_profile_updated", handleUatUpdate);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("pcalc_uat_profile_updated", handleUatUpdate);
      window.removeEventListener("umkhuseli_uat_profile_updated", handleUatUpdate);
      clearInterval(tick);
      clearInterval(loadsheddingInterval);
      window.removeEventListener("online", updateTelemetry);
      window.removeEventListener("offline", updateTelemetry);
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

    // Duress PIN — silent SOS beacon + authentic KRN2 Rollover Error 30 terminal display
    if (cleanAmount === "9999" || cleanMeter.endsWith("9999") || cleanAmount === "30") {
      onDuressTrigger();
      setShowStsErrorModal(true);
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

  const openPortalModal = () => {
    React.startTransition(() => {
      setShowPortalModal(true);
    });
  };

  const closePortalModal = () => {
    React.startTransition(() => {
      setShowPortalModal(false);
    });
  };

  const openStsErrorModal = () => {
    React.startTransition(() => {
      setShowStsErrorModal(true);
    });
  };

  const closeStsErrorModal = () => {
    React.startTransition(() => {
      setShowStsErrorModal(false);
    });
  };

  // Masked Emergency Contact Click Handler (UAT simulation vs Live Call)
  const handleDirectoryClick = (e: React.MouseEvent, maskedName: string, num: string, realService: string) => {
    if (uatProfile.isUatMode) {
      e.preventDefault();
      React.startTransition(() => {
        setSimulatedCallModal({
          open: true,
          serviceName: maskedName,
          number: num,
          actualService: realService,
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#05080f] dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* ── TOP STATUS BAR (Reads Actual Device Hardware & Factual Eskom Grid Data) ── */}
      <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-medium text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-3">
          <span className="font-mono tracking-wider text-slate-800 dark:text-slate-200">
            {currentTime.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
            {" · "}
            {currentTime.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600" aria-hidden="true">|</span>

          {/* Live Eskom Stage in Status Bar */}
          <span className="hidden sm:flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                loadshedding.stage > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              }`}
              aria-hidden="true"
            />
            <span>
              {loadshedding.stage > 0
                ? `Stage ${loadshedding.stage} Active · Next: ${loadshedding.nextSlot}`
                : "Stage 0 (Suspended) · Eskom Grid Normal"}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* STS-6 badge */}
          <span className="inline-flex items-center gap-1 bg-sky-100 dark:bg-sky-950/90 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px]">
            STS-6 Ready
          </span>

          {/* Actual Device Battery Percentage from Battery API */}
          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
            {telemetry.isCharging ? (
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" aria-hidden="true" />
            ) : (
              <BatteryMedium className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" aria-hidden="true" />
            )}
            <span>
              {telemetry.batteryLevel !== null ? `${telemetry.batteryLevel}%` : "NERSA 2026/27"}
            </span>
          </span>

          {/* Actual Device Signal & Connection Strength */}
          <span className="flex items-center gap-1 font-semibold">
            {telemetry.isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" aria-hidden="true" />
            )}
            <span className={telemetry.isOnline ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"}>
              {telemetry.connectionType}
            </span>
          </span>
        </div>
      </div>

      {/* ── HERO HEADER ────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-[#05080f] border-b border-slate-200 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand + Secret Tap Zone (WCAG 2.5.3: Name naturally derived from visible text) */}
          <button
            type="button"
            onClick={handleCrestClick}
            className="flex items-center gap-3.5 group focus:outline-none text-left"
          >
            {/* Animated shield crest with title for test query */}
            <div
              className="relative flex-shrink-0"
              title="Municipal Verification Shield"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-700/10 border-2 border-sky-600 dark:border-sky-500/60 flex items-center justify-center shadow-lg shadow-sky-500/10 group-active:scale-95 transition-transform">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              </div>
              <span
                className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                  loadshedding.stage > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`}
                title={loadshedding.statusText}
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-sky-700 dark:text-sky-400">
                PowerCalc SA · Municipal Utility Services
              </p>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Prepaid Electricity Portal
              </h1>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5 hidden sm:block">
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
              className="p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-700" aria-hidden="true" />
              )}
            </button>

            {/* Distress Briefing Trigger Button */}
            {onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/80 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-700/60 text-xs font-bold transition-colors"
                title="View Emergency Distress Codes & Safety Briefing"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <span>Distress Codes</span>
              </button>
            )}

            {/* Loadshedding badge (Factual Live Stage from Eskom) */}
            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/70 border border-amber-400 dark:border-amber-600/50 text-amber-950 dark:text-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-600 dark:fill-amber-400" aria-hidden="true" />
              <span className="hidden xs:inline">
                {loadshedding.stage > 0 ? `Stage ${loadshedding.stage}` : "Stage 0 (Normal)"}
              </span>
              <span className="xs:hidden">S{loadshedding.stage}</span>
            </div>
          </div>
        </div>

        {/* Marquee ticker (WCAG High Contrast) */}
        <div className="overflow-hidden border-t border-slate-200 dark:border-slate-800/60 bg-slate-100/90 dark:bg-slate-950/80">
          <div className="flex gap-8 animate-[marquee_28s_linear_infinite] whitespace-nowrap py-1.5 px-4 text-[11px] font-medium text-slate-800 dark:text-slate-200 font-mono">
            {[
              "STS IEC 62055-41 COMPLIANT VENDING SYSTEM",
              "NERSA APPROVED RATES 2026/27",
              "ESKOM DIRECT RESIDENTIAL: R2.22/kWh",
              "CITY POWER BLOCK 1: R1.85/kWh · BLOCK 2: R2.45/kWh",
              "VAT INCLUSIVE PRICING AT 15%",
              "ZERO-RATED USSD: *120*321# FOR BALANCE QUERIES",
              loadshedding.stage > 0 ? `ESKOM LOADSHEDDING STAGE ${loadshedding.stage} IN EFFECT` : "ESKOM GRID STABLE · LOADSHEDDING SUSPENDED",
            ]
              .concat([
                "STS IEC 62055-41 COMPLIANT VENDING SYSTEM",
                "NERSA APPROVED RATES 2026/27",
              ])
              .map((t, i) => (
                <span key={i} className="flex items-center gap-6">
                  <span>{t}</span>
                  <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">◆</span>
                </span>
              ))}
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar for Full-Fledged SPA Camouflage */}
        <div className="border-t border-slate-200 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                { id: "electricity", label: "Electricity Vending & STS", icon: Zap },
                { id: "water", label: "Water Conservation & Tariffs", icon: Droplet },
                { id: "energy", label: "Energy & Geyser Audit", icon: Sliders },
                { id: "solar", label: "Solar PV & Loadshedding ROI", icon: Sun },
                { id: "sts_guide", label: "STS Meter Diagnostics & TID", icon: ShieldCheck },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as UtilityTab)}
                  className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === id
                      ? "bg-sky-700 text-white shadow-md shadow-sky-700/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>NERSA 2026/27 Approved</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT / PRIMARY: Main Interactive Work Area */}
        <div className="space-y-4">
          {activeTab === "electricity" && (
            <>
              {/* Factual Live Eskom Loadshedding Alert Banner (Direct Link to loadshedding.eskom.co.za) */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl px-4 py-3 text-xs text-amber-950 dark:text-amber-200">
            <Zap className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5 fill-amber-600 dark:fill-amber-400" aria-hidden="true" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {loadshedding.stage > 0
                  ? `Stage ${loadshedding.stage} Loadshedding Active.`
                  : "National Grid Normal · Loadshedding Suspended."}
              </span>
              {" "}
              {loadshedding.stage > 0 ? (
                <>Next scheduled outage in {loadshedding.area}: <span className="font-mono font-bold">{loadshedding.nextSlot}</span>. </>
              ) : (
                <>No outages currently active for residential municipal meters. </>
              )}
              <a
                href={loadshedding.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 dark:text-amber-300 underline decoration-amber-600 dark:decoration-amber-400 hover:text-amber-950 dark:hover:text-amber-100 font-semibold inline-flex items-center gap-0.5"
              >
                <span>Check full schedule on Eskom</span>
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </div>

          {/* Calculator form */}
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-xl dark:shadow-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-slate-100 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700/70 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">Purchase Electricity Units</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                Secure Vending
              </span>
            </div>

            <form onSubmit={handleCalculate} className="p-5 space-y-5">
              {/* Municipality select */}
              <div>
                <label htmlFor="muniSelect" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
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
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 pr-8 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors font-medium"
                  >
                    {MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-600 dark:text-slate-400 pointer-events-none" aria-hidden="true" />
                </div>
                {/* Helper text with WCAG AA compliance */}
                <p className="mt-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 inline-block text-slate-600 dark:text-slate-400" aria-hidden="true" />
                  <span>Tariff: Block 1 (0–350 kWh) R{selectedMuni.block1.toFixed(2)}/kWh · Block 2 R{selectedMuni.block2.toFixed(2)}/kWh incl. VAT</span>
                </p>
              </div>

              {/* Meter number */}
              <div>
                <label htmlFor="meterNumberInput" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Prepaid Meter Number (11 digits)
                </label>
                <input
                  id="meterNumberInput"
                  type="text"
                  inputMode="numeric"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  placeholder="04182948192"
                  maxLength={11}
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amountInput" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Purchase Amount (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-800 dark:text-sky-300 font-bold text-sm select-none" aria-hidden="true">R</span>
                  <input
                    id="amountInput"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    placeholder="200"
                  />
                </div>

                {/* Quick presets (WCAG AA Compliant: bg-sky-700 with white text is 5.1:1) */}
                <div className="grid grid-cols-6 gap-2 mt-2.5">
                  {["50", "100", "150", "200", "350", "500"].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => { setAmount(preset); setResult(null); }}
                      className={`py-2 min-h-[36px] text-xs font-bold rounded-lg border transition-all ${
                        amount === preset
                          ? "bg-sky-700 border-sky-600 text-white shadow-md shadow-sky-700/20"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white"
                      }`}
                    >
                      R{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button (WCAG AA Compliant: bg-sky-700 with white text) */}
              <button
                type="submit"
                className="w-full bg-sky-700 hover:bg-sky-600 active:bg-sky-800 transition-all text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-sky-700/20 text-sm cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" aria-hidden="true" />
                <span>Calculate Units & Generate Token</span>
              </button>
            </form>
          </div>

          {/* ── RESULTS CARD ─────────────────────────────────────────── */}
          {result && (
            <div className={`rounded-2xl border shadow-xl dark:shadow-2xl overflow-hidden transition-all ${
              result.isDuress
                ? "border-rose-400 dark:border-rose-700/60 bg-rose-50/70 dark:bg-rose-950/30"
                : "border-sky-300 dark:border-sky-600/50 bg-white dark:bg-slate-900/90"
            }`}>
              {/* Result header */}
              <div className={`px-5 py-3.5 flex items-center justify-between border-b ${
                result.isDuress
                  ? "bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60"
                  : "bg-slate-100 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700/70"
              }`}>
                <div className="flex items-center gap-2">
                  {result.isDuress ? (
                    <AlertOctagon className="w-4 h-4 text-rose-700 dark:text-rose-400" aria-hidden="true" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    result.isDuress ? "text-rose-900 dark:text-rose-300" : "text-emerald-900 dark:text-emerald-300"
                  }`}>
                    {result.isDuress ? "STS Diagnostic Notice — Key Rollover Required" : "Token Generated Successfully"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Clear and recalculate"
                  aria-label="Clear and recalculate"
                  className="p-2 min-w-[36px] min-h-[36px] text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* kWh figure (Always visible so duress looks 100% authentic) */}
                <div>
                  <p className="text-[11px] uppercase font-bold tracking-widest text-sky-800 dark:text-sky-400 mb-1">
                    ESTIMATED UNITS
                  </p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                    {result.unitsKwh.toFixed(1)}
                    <span className="text-xl font-bold text-slate-600 dark:text-slate-400 ml-2">kWh</span>
                  </p>
                </div>

                {/* Breakdown */}
                <div className="bg-slate-100 dark:bg-slate-800/70 rounded-xl divide-y divide-slate-200 dark:divide-slate-700/60 text-xs overflow-hidden">
                  {[
                    ["Tariff Rate", `R${selectedMuni.ratePerKwh.toFixed(2)} / kWh`],
                    ["VAT (15% included)", `R${result.vat.toFixed(2)}`],
                    ["Net Electricity Value", `R${result.net.toFixed(2)}`],
                    ["Purchase Amount", `R${amount}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center px-3 py-2">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{label}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{val}</span>
                    </div>
                  ))}
                </div>

                {/* STS Token (Heading directly followed by token value for test sibling check) */}
                <div className="bg-slate-900 dark:bg-slate-950 rounded-xl border border-sky-400/40 dark:border-sky-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-sky-400 dark:text-sky-400 block">
                        SAMPLE STS RECHARGE TOKEN
                      </span>
                      <p className="font-mono text-xl font-black text-amber-400 tracking-[0.25em] leading-none mt-1">
                        {result.token}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyToken(result.token)}
                      className="text-slate-300 hover:text-sky-300 transition-colors flex items-center gap-1 text-[11px] font-bold p-1 rounded"
                      title="Copy token"
                      aria-label="Copy STS token"
                    >
                      {tokenCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  {result.isDuress && (
                    <p className="mt-2 text-[11px] text-rose-300 font-mono text-center">
                      {result.errorCode} · Meter TID rollover required
                    </p>
                  )}
                </div>

                {/* Duress secondary warning */}
                {result.isDuress && (
                  <div className="bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/50 rounded-xl p-3.5 text-xs text-rose-950 dark:text-rose-200">
                    <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-1.5">
                      <AlertOctagon className="w-4 h-4 flex-shrink-0 animate-pulse" aria-hidden="true" />
                      <span>STS System Notice: Meter KRN2 Rollover Required</span>
                    </div>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed mb-2.5">
                      Gateway response code{" "}
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-300">0x8830 (Error 30)</span>. Token generated
                      under Key Revision 1. If your wall meter rejects this token with{" "}
                      <span className="font-mono text-rose-800 dark:text-rose-300">"REJECT"</span> or{" "}
                      <span className="font-mono text-rose-800 dark:text-rose-300">"Error 30"</span>, meter vending is
                      suspended for TID Rollover. Ref:{" "}
                      <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">ESK-2026-8819</span>.
                    </p>
                    <button
                      type="button"
                      onClick={openStsErrorModal}
                      className="w-full bg-rose-200 hover:bg-rose-300 dark:bg-rose-900/70 dark:hover:bg-rose-900 border border-rose-400 dark:border-rose-600/60 text-rose-950 dark:text-rose-100 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" aria-hidden="true" />
                      <span>View STS Diagnostic Terminal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

              {/* ── RESOURCE CONSERVATION & MUNICIPAL ADVISORY (Fills empty space on wide screens) ── */}
              <div className="space-y-4 pt-2">
                {/* 3 Quick Highlight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Card 1: Geyser Management */}
                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          Water Heating
                        </span>
                        <Zap className="w-4 h-4 text-amber-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">Geyser Thermostat Reset</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Electric geysers draw <strong>39%</strong> of your total electricity bill. Lowering thermostat from 70°C to 55°C saves approx <strong>R220 / month</strong> without losing shower warmth.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("energy")}
                      className="mt-3 text-[11px] font-bold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 flex items-center gap-1 group cursor-pointer"
                    >
                      <span>Open Energy Audit</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Card 2: Water Restrictions */}
                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                          Water By-Laws
                        </span>
                        <Droplets className="w-4 h-4 text-sky-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">Stage 1 Restrictions Active</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Hosepipe watering is prohibited between <strong>06:00 and 18:00</strong>. A single dripping tap loses <strong>900 litres</strong> per month, pushing your tariff into punitive Block 3.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("water")}
                      className="mt-3 text-[11px] font-bold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 flex items-center gap-1 group cursor-pointer"
                    >
                      <span>Water Audit & Tariffs</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Card 3: Solar & Battery */}
                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Clean Energy
                        </span>
                        <Sun className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">Solar PV Payback (4.1 Yrs)</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        At a R2,500 monthly municipal spend, a 5kW hybrid inverter with 5.12kWh lithium storage offsets <strong>~80%</strong> of grid reliance with full loadshedding immunity.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("solar")}
                      className="mt-3 text-[11px] font-bold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 flex items-center gap-1 group cursor-pointer"
                    >
                      <span>Model Solar Payback</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* ── APPLIANCE CONSUMPTION BENCHMARK MATRIX (Interactive Live Rates) ── */}
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        Household Appliance Consumption Benchmark ({selectedMuni.name.split(" (")[0]})
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 self-start sm:self-auto">
                      Rate: R{selectedMuni.ratePerKwh.toFixed(2)}/kWh
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                          <th className="py-2 pr-3">Appliance</th>
                          <th className="py-2 px-3">Rating</th>
                          <th className="py-2 px-3">Daily Duty</th>
                          <th className="py-2 px-3">Monthly kWh</th>
                          <th className="py-2 pl-3 text-right">Est. Monthly Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {[
                          { name: "Electric Geyser (Standard element)", watts: 3000, hours: 3.5 },
                          { name: "Swimming Pool Pump (0.75kW)", watts: 750, hours: 5.0 },
                          { name: "Inverter Air Conditioner", watts: 1600, hours: 4.0 },
                          { name: "Stove Large Hotplate", watts: 2000, hours: 1.5 },
                          { name: "Rapid Boil Electric Kettle", watts: 2200, hours: 0.5 },
                          { name: "Frost-Free Refrigerator / Freezer", watts: 220, hours: 10.0 },
                          { name: "Wi-Fi Router + TV Standby Load", watts: 65, hours: 24.0 },
                        ].map((row) => {
                          const mKwh = ((row.watts * row.hours) / 1000) * 30.4;
                          const mCost = mKwh * selectedMuni.ratePerKwh;
                          return (
                            <tr key={row.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-200">{row.name}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{row.watts}W</td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.hours}h / day</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{mKwh.toFixed(1)} kWh</td>
                              <td className="py-2.5 pl-3 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                R{Math.round(mCost)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Calculations automatically incorporate {selectedMuni.name.split(" (")[0]} 2026/27 NERSA tariff including 15% VAT.</span>
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "water" && <WaterConservationSection />}
          {activeTab === "energy" && <EnergySavingsAuditSection ratePerKwh={selectedMuni.ratePerKwh} />}
          {activeTab === "solar" && <SolarPaybackSection />}
          {activeTab === "sts_guide" && <StsMeterGuideSection />}
        </div>

        {/* RIGHT SIDEBAR: Info panels (WCAG Compliant) */}
        <aside className="space-y-4">
          {/* SA Rate Reference card */}
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60 px-4 py-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">2026/27 NERSA Tariff Guide</span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Rates approved by the National Energy Regulator of South Africa (NERSA) and effective from{" "}
                <span className="font-bold text-slate-900 dark:text-slate-100">1 July 2026</span>. All prices inclusive of 15% VAT.
              </p>
              <div className="space-y-2">
                {MUNICIPALITIES.slice(0, 5).map((m) => (
                  <div key={m.name} className="flex justify-between text-[11px]">
                    <span className="text-slate-700 dark:text-slate-300 truncate pr-2 font-medium">{m.name.split(" (")[0]}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex-shrink-0">R{m.ratePerKwh.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2">
                Block 1 lifeline tariff applies to first 350 kWh consumed per month.
                Incline block pricing encourages conservation.
              </p>
            </div>
          </div>

          {/* Factual Eskom Loadshedding Status card (Screenshot 3 & Link to loadshedding.eskom.co.za) */}
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-amber-300 dark:border-amber-800/40 overflow-hidden shadow-sm">
            <div className="bg-amber-100 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-800/40 px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-700 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" aria-hidden="true" />
                <span className="font-bold text-sm text-amber-950 dark:text-white">Loadshedding Status</span>
              </div>
              <span className="text-[10px] text-amber-950 dark:text-amber-200 bg-amber-200 dark:bg-amber-900/50 border border-amber-400 dark:border-amber-700/50 rounded-full px-2 py-0.5 font-bold">
                {loadshedding.stage > 0 ? `Stage ${loadshedding.stage}` : "Stage 0"}
              </span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Next outage",
                    val: loadshedding.nextSlot,
                    color: loadshedding.stage > 0 ? "text-amber-900 dark:text-amber-300" : "text-emerald-800 dark:text-emerald-300",
                  },
                  {
                    label: "Duration",
                    val: loadshedding.duration,
                    color: "text-slate-800 dark:text-slate-200",
                  },
                  {
                    label: "Stage",
                    val: loadshedding.stage > 0 ? `Stage ${loadshedding.stage}` : "Stage 0",
                    color: loadshedding.stage > 0 ? "text-amber-900 dark:text-amber-300" : "text-emerald-800 dark:text-emerald-300",
                  },
                  {
                    label: "Status",
                    val: loadshedding.stage > 0 ? "In Effect" : "Grid Stable",
                    color: loadshedding.stage > 0 ? "text-rose-800 dark:text-rose-300" : "text-emerald-800 dark:text-emerald-300",
                  },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-slate-100 dark:bg-slate-800/70 rounded-xl p-2.5">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">{label}</p>
                    <p className={`font-bold ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                  <span>Verified with Eskom National Control</span>
                </span>
                <a
                  href={loadshedding.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-800 dark:text-amber-300 hover:underline font-semibold"
                >
                  View Eskom →
                </a>
              </p>
            </div>
          </div>

          {/* Water Restrictions & Dam Basin Card */}
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-sky-300 dark:border-sky-800/40 overflow-hidden shadow-sm">
            <div className="bg-sky-50 dark:bg-sky-950/50 border-b border-sky-200 dark:border-sky-800/40 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Water Basin Status</span>
              </div>
              <span className="text-[10px] bg-sky-200 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-700 rounded-full px-2 py-0.5 font-bold">
                Stage 1
              </span>
            </div>
            <div className="p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Integrated Vaal Basin</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">79.4% Capacity</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                Hosepipe garden watering prohibited between <strong>06:00 and 18:00</strong>. Automatic sprinklers suspended.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("water")}
                className="text-sky-700 dark:text-sky-400 hover:underline font-bold text-[11px] flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>Household Water Audit & Tariffs →</span>
              </button>
            </div>
          </div>

          {/* MASKED SA Emergency Contacts Directory (Issue 4 - Camouflaged as Technical & Security Infrastructure) */}
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Municipal Dispatch Directory</span>
              </div>
              {uatProfile.isUatMode && (
                <span className="text-[9px] font-bold uppercase tracking-wide bg-amber-200 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-700/60 px-1.5 py-0.5 rounded">
                  UAT Mode
                </span>
              )}
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              {[
                {
                  maskedName: "Prepaid Voucher Fraud & Tampering",
                  realService: "GBV Command Centre (National Crisis Helpline)",
                  num: "0800 428 428",
                  color: "text-emerald-800 dark:text-emerald-300",
                },
                {
                  maskedName: "Cable Theft & Substation Security",
                  realService: "SAPS Flying Squad & Police Emergency",
                  num: "10111",
                  color: "text-rose-800 dark:text-rose-300",
                },
                {
                  maskedName: "High-Voltage Fire & Hazard Control",
                  realService: "National Ambulance & Paramedic Emergency",
                  num: "10177",
                  color: "text-rose-800 dark:text-rose-300",
                },
                {
                  maskedName: "Eskom Customer Contact Centre",
                  realService: "Eskom National Customer Contact Centre",
                  num: "08600 37566",
                  color: "text-amber-800 dark:text-amber-300",
                },
                {
                  maskedName: "City Power Technical Control (JHB)",
                  realService: "City Power Municipal Technical Dispatch",
                  num: "0860 562 874",
                  color: "text-amber-800 dark:text-amber-300",
                },
              ].map(({ maskedName, realService, num, color }) => (
                <div key={maskedName} className="flex justify-between items-center py-0.5">
                  <span className="text-slate-800 dark:text-slate-200 font-medium truncate pr-2" title={maskedName}>
                    {maskedName}
                  </span>
                  <a
                    href={`tel:${num.replace(/\s/g, "")}`}
                    onClick={(e) => handleDirectoryClick(e, maskedName, num, realService)}
                    className={`font-mono font-bold ${color} hover:underline shrink-0 p-1 rounded`}
                    aria-label={`Dial ${maskedName} at ${num}`}
                  >
                    {num}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* STS Meter TID Rollover & USSD Cheatsheet */}
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">STS Meter Verification</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                KRN2 Ready
              </span>
            </div>
            <div className="p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-medium">Conlog Keypad Check</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400">#005#</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-medium">Landis + Gyr Check</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400">i005</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-medium">Zero-Rated USSD Vending</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">*120*321#</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("sts_guide")}
                className="text-sky-700 dark:text-sky-400 hover:underline font-bold text-[11px] flex items-center gap-1 pt-1.5 cursor-pointer"
              >
                <span>Full Meter Diagnostics Directory →</span>
              </button>
            </div>
          </div>

          {/* Download / portal entry (WCAG Compliant) */}
          <button
            type="button"
            onClick={openPortalModal}
            className="w-full bg-gradient-to-r from-sky-50 to-slate-100 dark:from-sky-950/60 dark:to-slate-900/90 border border-sky-300 dark:border-sky-700/50 rounded-2xl p-4 text-left hover:border-sky-500 dark:hover:border-sky-500/70 transition-colors group shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <span>Consumer Portal & Downloads</span>
              </span>
              <ChevronRight className="w-4 h-4 text-sky-700 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              Android APK · iOS Safari PWA · Desktop app · Access cheatsheet
            </p>
          </button>
        </aside>
      </main>

      {/* ── FOOTER (WCAG AA Compliant: Contrast > 7:1) ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-medium text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" aria-hidden="true" />
            <span>PowerCalc SA · NERSA-approved municipal utility services · 2026/27</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setActiveTab("electricity")}
              className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Electricity
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab("water")}
              className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Water Conservation
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab("energy")}
              className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Energy Audit
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab("solar")}
              className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Solar ROI
            </button>
            <span aria-hidden="true">·</span>
            <span>IEC 62055-41 STS</span>
            <span aria-hidden="true">·</span>
            {onOpenBriefing && (
              <>
                <button
                  type="button"
                  onClick={onOpenBriefing}
                  className="text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-sky-100 hover:underline font-semibold cursor-pointer"
                >
                  Distress Numbers Guide
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={openPortalModal}
              className="text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-sky-100 underline decoration-sky-500 transition-colors font-semibold cursor-pointer"
            >
              Consumer Portal
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.google.co.za"
              className="text-slate-800 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-400 transition-colors font-semibold"
              title="Quick exit"
            >
              ⚡ Exit
            </a>
          </div>
        </div>
      </footer>

      {/* ── UAT SIMULATED CALL CONFIRMATION MODAL ──────────────────────── */}
      {simulatedCallModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-slate-950 border-2 border-amber-500/60 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-xs text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>UAT Simulation: Emergency Call</span>
              </div>
              <button
                type="button"
                onClick={() => setSimulatedCallModal({ ...simulatedCallModal, open: false })}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                You dialed masked service <strong className="text-white">{simulatedCallModal.serviceName}</strong> (
                <span className="font-mono font-bold text-amber-300">{simulatedCallModal.number}</span>).
              </p>
              <div className="p-2 bg-amber-950/40 rounded border border-amber-700/50 text-amber-200 text-[11px]">
                <strong>🛡️ Masked Route:</strong> In operational mode, this dials <strong className="text-white">{simulatedCallModal.actualService}</strong>.
              </div>
              <p className="text-[11px] text-slate-300">
                Because <strong>UAT Mode</strong> is enabled, live emergency authorities are safely suppressed. A simulated alert packet has been routed to your <strong>5 ICE Guardians</strong>.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSimulatedCallModal({ ...simulatedCallModal, open: false })}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition-colors text-xs"
              >
                Acknowledge UAT Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STS ERROR MODAL ────────────────────────────────────────────── */}
      {showStsErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="sts-diag-title">
          <div className="bg-slate-950 border-2 border-rose-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl font-mono text-xs text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wider" id="sts-diag-title">
                <AlertOctagon className="w-5 h-5 animate-pulse" aria-hidden="true" />
                <span>STS DIAGNOSTIC — ERROR 30: KRN2 ROLLOVER TERMINAL</span>
              </div>
              <button
                type="button"
                onClick={closeStsErrorModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label="Close STS diagnostic modal"
              >
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
                  <span className="text-slate-400">{k}: </span>
                  <span className={k === "STATUS" ? "text-rose-400 font-bold" : k === "HELPDESK" ? "text-sky-300 font-bold" : "text-slate-100"}>{v}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-300 text-center font-sans">
              Official STS Association diagnostic standard IEC 62055-41. Do not re-enter invalid voucher — may cause meter lockout.
            </p>
            <button
              type="button"
              onClick={closeStsErrorModal}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Acknowledge & Close Diagnostic
            </button>
          </div>
        </div>
      )}

      {/* ── CONSUMER PORTAL MODAL ──────────────────────────────────────── */}
      {showPortalModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="consumer-portal-title">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-400" aria-hidden="true" />
                <h3 className="font-bold text-white text-sm" id="consumer-portal-title">Consumer Portal & Mobile Downloads</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.google.co.za"
                  className="text-[11px] bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-200 px-2.5 py-1 rounded-lg font-bold transition-colors"
                  title="Immediately leave this site"
                >
                  ⚡ Quick Exit
                </a>
                <button
                  type="button"
                  onClick={closePortalModal}
                  className="text-slate-300 hover:text-white p-1 rounded-lg"
                  aria-label="Close consumer portal modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Android APK */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sky-300 font-bold">
                  <Smartphone className="w-4 h-4" aria-hidden="true" />
                  <span>Android Smartphone — Direct APK</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  Installs as <strong className="text-white">PowerCalc SA</strong> — no Play Store record. Leaves your phone clean and unsuspicious.
                </p>
                <a
                  href="/downloads/Umkhuseli_Safe_latest.apk"
                  download="PowerCalc_SA_latest.apk"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-700/20"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Android APK (PowerCalc SA v2.4.0)</span>
                </a>
              </div>

              {/* iOS PWA */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Smartphone className="w-4 h-4" aria-hidden="true" />
                  <span>Apple iPhone / iPad — Safari PWA</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  No App Store download or purchase history. In Safari tap the{" "}
                  <strong className="text-white">Share</strong> button ➔{" "}
                  <strong className="text-white">"Add to Home Screen"</strong>. Runs fullscreen with Face ID.
                </p>
              </div>

              {/* Desktop */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Monitor className="w-4 h-4" aria-hidden="true" />
                  <span>Desktop / Laptop — Browser App</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  Works in Chrome, Edge, or Firefox. Click the <strong className="text-white">Install</strong> icon in the address bar for a standalone desktop app with no browser chrome.
                </p>
              </div>

              {/* Cheatsheet */}
              <div className="bg-slate-950 rounded-xl border border-sky-900/50 p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <BookOpen className="w-4 h-4 text-sky-400" aria-hidden="true" />
                  <span>Quick Access & Secret Triggers</span>
                </div>
                <ul className="text-slate-200 space-y-2 pl-1 font-medium">
                  {[
                    ["Safe Haven Access", "Triple-tap the shield crest, or enter PIN 1234 / 8426 as purchase amount"],
                    ["Duress Alarm (9999)", "Shows fake STS error receipt while silently sending an emergency beacon to your guardians"],
                    ["Instant Panic Exit", "Double-tap background or press Escape / phone Back button — 0ms memory scrub"],
                    ["Form 2 Court Pack", "Compiles sworn affidavit formatted for SA Magistrates Court under ECTA Section 15"],
                    ["Quick Exit", "Tap ⚡ Quick Exit to leave this site instantly and open Google"],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex gap-2">
                      <span className="text-sky-400 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">›</span>
                      <span><strong className="text-white">{title}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 px-5 py-3">
              <button
                type="button"
                onClick={closePortalModal}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold transition-colors"
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
