import React from "react";
import {
  Shield,
  Zap,
  BatteryMedium,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  LifeBuoy,
  Droplet,
  Sliders,
} from "lucide-react";
import { LoadsheddingInfo } from "../../services/loadsheddingService";
import { DeviceTelemetry } from "../../services/deviceTelemetry";
import { ThemeMode } from "../../services/themeManager";
import { UtilityTab } from "../MunicipalPrepaidCalculator";

interface CalculatorHeroHeaderProps {
  currentTime: Date;
  loadshedding: LoadsheddingInfo;
  telemetry: DeviceTelemetry;
  theme: ThemeMode;
  activeTab: UtilityTab;
  onToggleTheme: () => void;
  onCrestClick: () => void;
  onOpenBriefing?: () => void;
  onSelectTab: (tab: UtilityTab) => void;
}

export const CalculatorHeroHeader: React.FC<CalculatorHeroHeaderProps> = ({
  currentTime,
  loadshedding,
  telemetry,
  theme,
  activeTab,
  onToggleTheme,
  onCrestClick,
  onOpenBriefing,
  onSelectTab,
}) => {
  return (
    <>
      {/* ── TOP STATUS BAR ── */}
      <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-medium text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-3">
          <span className="font-mono tracking-wider text-slate-800 dark:text-slate-200">
            {currentTime.toLocaleDateString("en-ZA", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
            {" · "}
            {currentTime.toLocaleTimeString("en-ZA", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600" aria-hidden="true">
            |
          </span>
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
          <span className="inline-flex items-center gap-1 bg-sky-100 dark:bg-sky-950/90 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px]">
            STS-6 Ready
          </span>

          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
            {telemetry.isCharging ? (
              <Zap
                className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse"
                aria-hidden="true"
              />
            ) : (
              <BatteryMedium
                className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300"
                aria-hidden="true"
              />
            )}
            <span>
              {telemetry.batteryLevel !== null ? `${telemetry.batteryLevel}%` : "NERSA 2026/27"}
            </span>
          </span>

          <span className="flex items-center gap-1 font-semibold">
            {telemetry.isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" aria-hidden="true" />
            )}
            <span
              className={
                telemetry.isOnline
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-rose-800 dark:text-rose-300"
              }
            >
              {telemetry.connectionType}
            </span>
          </span>
        </div>
      </div>

      {/* ── HERO HEADER ── */}
      <header className="bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-[#05080f] border-b border-slate-200 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand + Secret Tap Zone */}
          <button
            type="button"
            onClick={onCrestClick}
            className="flex items-center gap-3.5 group focus:outline-none text-left cursor-pointer"
          >
            <div className="relative flex-shrink-0" title="Municipal Verification Shield">
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

          {/* Quick Controls */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-700" aria-hidden="true" />
              )}
            </button>

            {onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/80 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-700/60 text-xs font-bold transition-colors cursor-pointer"
                title="View Emergency Distress Codes & Safety Briefing"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <span>Distress Codes</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/70 border border-amber-400 dark:border-amber-600/50 text-amber-950 dark:text-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-600 dark:fill-amber-400" aria-hidden="true" />
              <span className="hidden xs:inline">
                {loadshedding.stage > 0 ? `Stage ${loadshedding.stage}` : "Stage 0 (Normal)"}
              </span>
              <span className="xs:hidden">S{loadshedding.stage}</span>
            </div>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="overflow-hidden border-t border-slate-200 dark:border-slate-800/60 bg-slate-100/90 dark:bg-slate-950/80">
          <div className="flex gap-8 animate-[marquee_28s_linear_infinite] whitespace-nowrap py-1.5 px-4 text-[11px] font-medium text-slate-800 dark:text-slate-200 font-mono">
            {[
              "STS IEC 62055-41 COMPLIANT VENDING SYSTEM",
              "NERSA APPROVED RATES 2026/27",
              "ESKOM DIRECT RESIDENTIAL: R2.22/kWh",
              "CITY POWER BLOCK 1: R1.85/kWh · BLOCK 2: R2.45/kWh",
              "VAT INCLUSIVE PRICING AT 15%",
              "ZERO-RATED USSD: *120*321# FOR BALANCE QUERIES",
              loadshedding.stage > 0
                ? `ESKOM LOADSHEDDING STAGE ${loadshedding.stage} IN EFFECT`
                : "ESKOM GRID STABLE · LOADSHEDDING SUSPENDED",
              "STS IEC 62055-41 COMPLIANT VENDING SYSTEM",
              "NERSA APPROVED RATES 2026/27",
            ].map((t, i) => (
              <span key={i} className="flex items-center gap-6">
                <span>{t}</span>
                <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">
                  ◆
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                { id: "electricity", label: "Electricity Vending & STS", icon: Zap },
                { id: "water", label: "Water Conservation & Tariffs", icon: Droplet },
                { id: "energy", label: "Energy & Geyser Audit", icon: Sliders },
                { id: "solar", label: "Solar PV & Loadshedding ROI", icon: Sun },
                { id: "sts_guide", label: "STS Meter Diagnostics & TID", icon: Shield },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectTab(id as UtilityTab)}
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
    </>
  );
};
