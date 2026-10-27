import React from "react";
import {
  AlertOctagon,
  CheckCircle,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { MunicipalityTariff } from "../../services/tariffs/municipalTariffEngine";
import { DecoyResult } from "../MunicipalPrepaidCalculator";

interface CalculatorResultCardProps {
  result: DecoyResult;
  selectedMuni: MunicipalityTariff;
  amount: string;
  tokenCopied: boolean;
  onCopyToken: (token: string) => void;
  onReset: () => void;
  onOpenStsDiagnostic: () => void;
}

export const CalculatorResultCard: React.FC<CalculatorResultCardProps> = ({
  result,
  selectedMuni,
  amount,
  tokenCopied,
  onCopyToken,
  onReset,
  onOpenStsDiagnostic,
}) => {
  return (
    <div
      className={`rounded-2xl border shadow-xl dark:shadow-2xl overflow-hidden transition-all ${
        result.isDuress
          ? "border-rose-400 dark:border-rose-700/60 bg-rose-50/70 dark:bg-rose-950/30"
          : "border-sky-300 dark:border-sky-600/50 bg-white dark:bg-slate-900/90"
      }`}
    >
      <div
        className={`px-5 py-3.5 flex items-center justify-between border-b ${
          result.isDuress
            ? "bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60"
            : "bg-slate-100 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700/70"
        }`}
      >
        <div className="flex items-center gap-2">
          {result.isDuress ? (
            <AlertOctagon className="w-4 h-4 text-rose-700 dark:text-rose-400" aria-hidden="true" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          )}
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              result.isDuress ? "text-rose-900 dark:text-rose-300" : "text-emerald-900 dark:text-emerald-300"
            }`}
          >
            {result.isDuress
              ? "STS Diagnostic Notice — Key Rollover Required"
              : "Token Generated Successfully"}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          title="Clear and recalculate"
          aria-label="Clear and recalculate"
          className="p-2 min-w-[36px] min-h-[36px] text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-widest text-sky-800 dark:text-sky-400 mb-1">
            ESTIMATED UNITS
          </p>
          <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
            {result.unitsKwh.toFixed(1)}
            <span className="text-xl font-bold text-slate-600 dark:text-slate-400 ml-2">kWh</span>
          </p>
        </div>

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

        {/* STS Token Box */}
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
              onClick={() => onCopyToken(result.token)}
              className="text-slate-300 hover:text-sky-300 transition-colors flex items-center gap-1 text-[11px] font-bold p-1 rounded cursor-pointer"
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

        {result.isDuress && (
          <div className="bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/50 rounded-xl p-3.5 text-xs text-rose-950 dark:text-rose-200">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-1.5">
              <AlertOctagon className="w-4 h-4 flex-shrink-0 animate-pulse" aria-hidden="true" />
              <span>STS System Notice: Meter KRN2 Rollover Required</span>
            </div>
            <p className="text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed mb-2.5">
              Gateway response code{" "}
              <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                0x8830 (Error 30)
              </span>
              . Token generated under Key Revision 1. If your wall meter rejects this token with{" "}
              <span className="font-mono text-rose-800 dark:text-rose-300">"REJECT"</span> or{" "}
              <span className="font-mono text-rose-800 dark:text-rose-300">"Error 30"</span>, meter
              vending is suspended for TID Rollover. Ref:{" "}
              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                ESK-2026-8819
              </span>
              .
            </p>
            <button
              type="button"
              onClick={onOpenStsDiagnostic}
              className="w-full bg-rose-200 hover:bg-rose-300 dark:bg-rose-900/70 dark:hover:bg-rose-900 border border-rose-400 dark:border-rose-600/60 text-rose-950 dark:text-rose-100 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" aria-hidden="true" />
              <span>View STS Diagnostic Terminal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
