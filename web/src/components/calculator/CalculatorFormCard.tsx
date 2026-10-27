import React from "react";
import { Receipt, ChevronRight, Info, Zap } from "lucide-react";
import {
  MunicipalityTariff,
  MUNICIPAL_TARIFFS,
} from "../../services/tariffs/municipalTariffEngine";

interface CalculatorFormCardProps {
  selectedMuni: MunicipalityTariff;
  meterNumber: string;
  amount: string;
  onSelectMuni: (muni: MunicipalityTariff) => void;
  onChangeMeterNumber: (meter: string) => void;
  onChangeAmount: (amt: string) => void;
  onSelectPreset: (preset: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CalculatorFormCard: React.FC<CalculatorFormCardProps> = ({
  selectedMuni,
  meterNumber,
  amount,
  onSelectMuni,
  onChangeMeterNumber,
  onChangeAmount,
  onSelectPreset,
  onSubmit,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-xl dark:shadow-2xl overflow-hidden">
      <div className="bg-slate-100 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700/70 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Receipt className="w-5 h-5 text-sky-700 dark:text-sky-400" aria-hidden="true" />
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            Purchase Electricity Units
          </span>
        </div>
        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
          Secure Vending
        </span>
      </div>

      <form onSubmit={onSubmit} className="p-5 space-y-5">
        {/* Municipality selector */}
        <div>
          <label
            htmlFor="muniSelect"
            className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Municipality / Supply Authority
          </label>
          <div className="relative">
            <select
              id="muniSelect"
              value={selectedMuni.name}
              onChange={(e) => {
                const m = MUNICIPAL_TARIFFS.find((x) => x.name === e.target.value);
                if (m) onSelectMuni(m);
              }}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 pr-8 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors font-medium"
            >
              {MUNICIPAL_TARIFFS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronRight
              className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-600 dark:text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 inline-block text-slate-600 dark:text-slate-400" aria-hidden="true" />
            <span>
              Tariff: Block 1 (0–350 kWh) R{selectedMuni.block1.toFixed(2)}/kWh · Block 2 R
              {selectedMuni.block2.toFixed(2)}/kWh incl. VAT
            </span>
          </p>
        </div>

        {/* Meter number input */}
        <div>
          <label
            htmlFor="meterNumberInput"
            className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Prepaid Meter Number (11 digits)
          </label>
          <input
            id="meterNumberInput"
            type="text"
            inputMode="numeric"
            value={meterNumber}
            onChange={(e) => onChangeMeterNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400"
            placeholder="04182948192"
            maxLength={11}
          />
        </div>

        {/* Purchase amount */}
        <div>
          <label
            htmlFor="amountInput"
            className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Purchase Amount (ZAR)
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-800 dark:text-sky-300 font-bold text-sm select-none"
              aria-hidden="true"
            >
              R
            </span>
            <input
              id="amountInput"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => onChangeAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400"
              placeholder="200"
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-6 gap-2 mt-2.5">
            {["50", "100", "150", "200", "350", "500"].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => onSelectPreset(preset)}
                className={`py-2 min-h-[36px] text-xs font-bold rounded-lg border transition-all cursor-pointer ${
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

        {/* Calculate button */}
        <button
          type="submit"
          className="w-full bg-sky-700 hover:bg-sky-600 active:bg-sky-800 transition-all text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-sky-700/20 text-sm cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" aria-hidden="true" />
          <span>Calculate Units & Generate Token</span>
        </button>
      </form>
    </div>
  );
};
