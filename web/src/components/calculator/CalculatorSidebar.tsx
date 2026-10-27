import React from "react";
import {
  Info,
  Zap,
  Clock,
  Droplets,
  Shield,
  ShieldCheck,
  Download,
  ChevronRight,
} from "lucide-react";
import { MunicipalityTariff, MUNICIPAL_TARIFFS } from "../../services/tariffs/municipalTariffEngine";
import { LoadsheddingInfo } from "../../services/loadsheddingService";
import { UatProfile } from "../../services/uatProfileService";
import { UtilityTab } from "../MunicipalPrepaidCalculator";

interface CalculatorSidebarProps {
  selectedMuni: MunicipalityTariff;
  loadshedding: LoadsheddingInfo;
  uatProfile: UatProfile;
  onOpenPortalModal: () => void;
  onOpenTab: (tab: UtilityTab) => void;
  onDirectoryClick: (
    e: React.MouseEvent,
    maskedName: string,
    num: string,
    realService: string
  ) => void;
}

export const CalculatorSidebar: React.FC<CalculatorSidebarProps> = ({
  selectedMuni,
  loadshedding,
  uatProfile,
  onOpenPortalModal,
  onOpenTab,
  onDirectoryClick,
}) => {
  return (
    <aside className="space-y-4">
      {/* SA Rate Reference card */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
        <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60 px-4 py-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            2026/27 NERSA Tariff Guide
          </span>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            Rates approved by the National Energy Regulator of South Africa (NERSA) and effective
            from <span className="font-bold text-slate-900 dark:text-slate-100">1 July 2026</span>.
            All prices inclusive of 15% VAT.
          </p>
          <div className="space-y-2">
            {MUNICIPAL_TARIFFS.slice(0, 5).map((m) => (
              <div key={m.name} className="flex justify-between text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 truncate pr-2 font-medium">
                  {m.name.split(" (")[0]}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex-shrink-0">
                  R{m.ratePerKwh.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2">
            Block 1 lifeline tariff applies to first 350 kWh consumed per month. Incline block
            pricing encourages conservation.
          </p>
        </div>
      </div>

      {/* Factual Eskom Loadshedding Status card */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-amber-300 dark:border-amber-800/40 overflow-hidden shadow-sm">
        <div className="bg-amber-100 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-800/40 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap
              className="w-4 h-4 text-amber-700 dark:text-amber-400 fill-amber-600 dark:fill-amber-400"
              aria-hidden="true"
            />
            <span className="font-bold text-sm text-amber-950 dark:text-white">
              Loadshedding Status
            </span>
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
                color:
                  loadshedding.stage > 0
                    ? "text-amber-900 dark:text-amber-300"
                    : "text-emerald-800 dark:text-emerald-300",
              },
              {
                label: "Duration",
                val: loadshedding.duration,
                color: "text-slate-800 dark:text-slate-200",
              },
              {
                label: "Stage",
                val: loadshedding.stage > 0 ? `Stage ${loadshedding.stage}` : "Stage 0",
                color:
                  loadshedding.stage > 0
                    ? "text-amber-900 dark:text-amber-300"
                    : "text-emerald-800 dark:text-emerald-300",
              },
              {
                label: "Status",
                val: loadshedding.stage > 0 ? "In Effect" : "Grid Stable",
                color:
                  loadshedding.stage > 0
                    ? "text-rose-800 dark:text-rose-300"
                    : "text-emerald-800 dark:text-emerald-300",
              },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-slate-100 dark:bg-slate-800/70 rounded-xl p-2.5">
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  {label}
                </p>
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
            Hosepipe garden watering prohibited between <strong>06:00 and 18:00</strong>. Automatic
            sprinklers suspended.
          </p>
          <button
            type="button"
            onClick={() => onOpenTab("water")}
            className="text-sky-700 dark:text-sky-400 hover:underline font-bold text-[11px] flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>Household Water Audit & Tariffs →</span>
          </button>
        </div>
      </div>

      {/* Masked Emergency Contacts Directory */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
        <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Municipal Dispatch Directory
            </span>
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
                onClick={(e) => onDirectoryClick(e, maskedName, num, realService)}
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
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              STS Meter Verification
            </span>
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
            onClick={() => onOpenTab("sts_guide")}
            className="text-sky-700 dark:text-sky-400 hover:underline font-bold text-[11px] flex items-center gap-1 pt-1.5 cursor-pointer"
          >
            <span>Full Meter Diagnostics Directory →</span>
          </button>
        </div>
      </div>

      {/* Download / portal entry */}
      <button
        type="button"
        onClick={onOpenPortalModal}
        className="w-full bg-gradient-to-r from-sky-50 to-slate-100 dark:from-sky-950/60 dark:to-slate-900/90 border border-sky-300 dark:border-sky-700/50 rounded-2xl p-4 text-left hover:border-sky-500 dark:hover:border-sky-500/70 transition-colors group shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-sm text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
            <span>Consumer Portal & Downloads</span>
          </span>
          <ChevronRight
            className="w-4 h-4 text-sky-700 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </div>
        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
          Android APK · iOS Safari PWA · Desktop app · Access cheatsheet
        </p>
      </button>
    </aside>
  );
};
