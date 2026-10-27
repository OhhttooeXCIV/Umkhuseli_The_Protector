import React from "react";
import { Sliders, Info, ChevronRight, Zap, Droplets, Sun } from "lucide-react";
import { MunicipalityTariff } from "../../services/tariffs/municipalTariffEngine";

interface ApplianceBenchmarkTableProps {
  selectedMuni: MunicipalityTariff;
  onOpenAuditTab: (tab: "water" | "energy" | "solar") => void;
}

export const ApplianceBenchmarkTable: React.FC<ApplianceBenchmarkTableProps> = ({
  selectedMuni,
  onOpenAuditTab,
}) => {
  const appliances = [
    { name: "Electric Geyser (Standard element)", watts: 3000, hours: 3.5 },
    { name: "Swimming Pool Pump (0.75kW)", watts: 750, hours: 5.0 },
    { name: "Inverter Air Conditioner", watts: 1600, hours: 4.0 },
    { name: "Stove Large Hotplate", watts: 2000, hours: 1.5 },
    { name: "Rapid Boil Electric Kettle", watts: 2200, hours: 0.5 },
    { name: "Frost-Free Refrigerator / Freezer", watts: 220, hours: 10.0 },
    { name: "Wi-Fi Router + TV Standby Load", watts: 65, hours: 24.0 },
  ];

  return (
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
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
              Geyser Thermostat Reset
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Electric geysers draw <strong>39%</strong> of your total electricity bill. Lowering
              thermostat from 70°C to 55°C saves approx <strong>R220 / month</strong> without
              losing shower warmth.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuditTab("energy")}
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
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
              Stage 1 Restrictions Active
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Hosepipe watering is prohibited between <strong>06:00 and 18:00</strong>. A single
              dripping tap loses <strong>900 litres</strong> per month, pushing your tariff into
              punitive Block 3.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuditTab("water")}
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
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
              Solar PV Payback (4.1 Yrs)
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              At a R2,500 monthly municipal spend, a 5kW hybrid inverter with 5.12kWh lithium storage
              offsets <strong>~80%</strong> of grid reliance with full loadshedding immunity.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuditTab("solar")}
            className="mt-3 text-[11px] font-bold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 flex items-center gap-1 group cursor-pointer"
          >
            <span>Model Solar Payback</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Benchmark Matrix Table */}
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
              {appliances.map((row) => {
                const mKwh = ((row.watts * row.hours) / 1000) * 30.4;
                const mCost = mKwh * selectedMuni.ratePerKwh;
                return (
                  <tr
                    key={row.name}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {row.watts}W
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {row.hours}h / day
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {mKwh.toFixed(1)} kWh
                    </td>
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
          <span>
            Calculations automatically incorporate {selectedMuni.name.split(" (")[0]} 2026/27 NERSA
            tariff including 15% VAT.
          </span>
        </p>
      </div>
    </div>
  );
};
