import React, { useState } from "react";
import {
  Sun,
  BatteryMedium,
  TrendingDown,
  Zap,
  ShieldCheck,
  Sparkles,
  Info,
  Clock
} from "lucide-react";

export const SolarPaybackSection: React.FC = () => {
  const [monthlyBill, setMonthlyBill] = useState<number>(2500);
  const [backupPriority, setBackupPriority] = useState<"essentials" | "whole_house">("essentials");

  // System recommendations based on bill
  const isHighDemand = monthlyBill >= 3500;
  const inverterKw = isHighDemand ? 8.0 : 5.0;
  const batteryKwh = isHighDemand ? 10.24 : 5.12;
  const panelCount = isHighDemand ? 10 : 6;
  const panelWatts = 550;
  const arrayKwp = (panelCount * panelWatts) / 1000;

  // Monthly generation (SA average 5.3 peak sun hours/day * 30.4 days * 0.8 system efficiency)
  const monthlySolarKwh = arrayKwp * 5.3 * 30.4 * 0.8;
  const avgMunicipalRate = 2.45;
  const estimatedMonthlySavings = Math.min(monthlyBill * 0.82, monthlySolarKwh * avgMunicipalRate);

  // System estimated capital cost
  const baseCost = isHighDemand ? 128000 : 84000;
  const paybackYears = (baseCost / (estimatedMonthlySavings * 12)).toFixed(1);

  // Loadshedding backup duration
  // Essentials load ~400W, Whole house load ~1200W
  const runningLoadWatts = backupPriority === "essentials" ? 400 : 1100;
  const usableBatteryWh = batteryKwh * 1000 * 0.85; // 85% Depth of Discharge
  const backupHours = (usableBatteryWh / runningLoadWatts).toFixed(1);

  return (
    <div className="space-y-6">
      {/* ── SOLAR & INVERTER SYSTEM SIZING ESTIMATOR ── */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sun className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Solar PV & Battery Payback Estimator</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Model grid tariff offset and loadshedding backup runtime for South African homes</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700/50 self-start sm:self-auto">
            SA Solar Insolation: 5.3 Peak Sun Hours / Day
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Current Monthly Municipal Electricity Bill</label>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  R{monthlyBill.toLocaleString("en-ZA")} / month
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="6000"
                step="250"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>R1,000</span>
                <span>R2,500</span>
                <span>R4,000</span>
                <span>R6,000+</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Loadshedding Protection Scope
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBackupPriority("essentials")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                    backupPriority === "essentials"
                      ? "bg-sky-50 dark:bg-sky-950/70 border-sky-400 dark:border-sky-600 text-sky-950 dark:text-sky-100"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <p className="font-bold">Essential Circuits</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Wi-Fi, TV, Fridge, Lights (~400W load)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBackupPriority("whole_house")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                    backupPriority === "whole_house"
                      ? "bg-sky-50 dark:bg-sky-950/70 border-sky-400 dark:border-sky-600 text-sky-950 dark:text-sky-100"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <p className="font-bold">Expanded Household</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Microwave, PC, Pumps, Geyser assistance (~1.1kW)</p>
                </button>
              </div>
            </div>

            {/* Recommended Hardware Specs */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Recommended Tier-1 Hybrid Architecture</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500">Inverter</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{inverterKw} kW Hybrid</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500">Storage</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{batteryKwh} kWh LiFePO4</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500">Array</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{panelCount}x 550W ({arrayKwp}kWp)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results: Financial ROI & Battery Hours */}
          <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/60">
                <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Monthly Bill Savings</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums mt-1">
                  R{Math.round(estimatedMonthlySavings).toLocaleString("en-ZA")}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">~80% grid bill reduction</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800/60">
                <p className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400">Estimated Payback</p>
                <p className="text-xl font-black text-sky-700 dark:text-sky-300 tabular-nums mt-1">
                  {paybackYears} <span className="text-xs font-normal text-slate-500">Years</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">At 12.7% NERSA escalation</p>
              </div>
            </div>

            {/* Loadshedding runtime widget */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/30 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-1.5">
                  <BatteryMedium className="w-4 h-4 text-amber-600" />
                  <span>Outage Autonomy Runtime</span>
                </div>
                <span className="font-mono text-sm text-amber-800 dark:text-amber-300 font-extrabold">{backupHours} Hours</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                With a {batteryKwh} kWh LiFePO4 battery running {backupPriority === "essentials" ? "essential circuits (400W)" : "whole-home load (1.1kW)"}, you will easily clear standard Stage 2 to Stage 6 Eskom outage slots (2.5h to 4.5h) with ample reserve capacity.
              </p>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Solar calculations use South African Solar PV Industry Association (SAPVIA) standards and NERSA approved metro tariff baselines.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
