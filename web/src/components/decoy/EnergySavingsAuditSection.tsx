import React, { useState } from "react";
import {
  Zap,
  Sliders,
  TrendingDown,
  Info,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface ApplianceSpec {
  id: string;
  name: string;
  typicalWatts: number;
  defaultHours: number;
  category: string;
  tip: string;
}

const APPLIANCES: ApplianceSpec[] = [
  {
    id: "geyser",
    name: "Electric Geyser (3000W)",
    typicalWatts: 3000,
    defaultHours: 3.5,
    category: "Water Heating",
    tip: "Accounts for 39% of total household bill. Lower thermostat to 55°C & install a digital timer."
  },
  {
    id: "pool",
    name: "Swimming Pool Pump (0.75kW)",
    typicalWatts: 750,
    defaultHours: 6,
    category: "Motors",
    tip: "Reduce running time to 4-5 hours in summer and 3 hours in winter; keep filters backwashed."
  },
  {
    id: "aircon",
    name: "Inverter Air Conditioner / Heater",
    typicalWatts: 1600,
    defaultHours: 4,
    category: "Climate",
    tip: "Setting temperature to 22°C rather than 18°C in summer saves up to 15% compressor energy."
  },
  {
    id: "kettle",
    name: "Electric Rapid Kettle (2200W)",
    typicalWatts: 2200,
    defaultHours: 0.5,
    category: "Kitchen",
    tip: "Only boil the exact volume of water needed for your immediate cups of coffee or tea."
  },
  {
    id: "stove",
    name: "Stove Large Plate (2000W)",
    typicalWatts: 2000,
    defaultHours: 1.5,
    category: "Cooking",
    tip: "Use flat-bottomed pots that fully cover the plate; switch off 2 minutes early to use residual heat."
  },
  {
    id: "fridge",
    name: "Frost-Free Fridge / Freezer",
    typicalWatts: 220,
    defaultHours: 10, // compressor duty cycle ~40%
    category: "Refrigeration",
    tip: "Ensure 5cm air clearance behind coils and check door magnetic seals with paper dollar test."
  },
  {
    id: "standby",
    name: "Home Entertainment & Wi-Fi Standby",
    typicalWatts: 65,
    defaultHours: 24,
    category: "Phantom Power",
    tip: "TV decoders, Wi-Fi routers, game consoles and soundbars pull continuous 65W 24 hours a day."
  },
];

interface Props {
  ratePerKwh?: number;
}

export const EnergySavingsAuditSection: React.FC<Props> = ({ ratePerKwh = 2.45 }) => {
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>("geyser");
  const [activeHours, setActiveHours] = useState<number>(3.5);

  const selectedAppliance = APPLIANCES.find((a) => a.id === selectedApplianceId) || APPLIANCES[0];

  // Calculations
  const dailyKwh = (selectedAppliance.typicalWatts * activeHours) / 1000;
  const monthlyKwh = dailyKwh * 30.4;
  const dailyCost = dailyKwh * ratePerKwh;
  const monthlyCost = monthlyKwh * ratePerKwh;
  const annualCost = monthlyCost * 12;

  return (
    <div className="space-y-6">
      {/* ── BANNER: Household Energy Distribution Matrix ── */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">South African Household Energy Profile</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Where electricity is actually consumed in standard municipal households (Eskom / CSIR Data)</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700/50 self-start sm:self-auto">
            Tariff Basis: R{ratePerKwh.toFixed(2)} / kWh
          </span>
        </div>

        {/* Breakdown bar graph */}
        <div className="space-y-2.5">
          {[
            { label: "Water Heating (Electric Geyser)", pct: 39, color: "bg-amber-500", note: "Largest single load (~R800–R1,400/mo)" },
            { label: "Space Heating & Air Conditioning", pct: 16, color: "bg-sky-500", note: "Seasonal peak in June–August & Dec–Feb" },
            { label: "Cooking (Stove, Oven, Microwave)", pct: 12, color: "bg-orange-500", note: "High wattage resistive heating" },
            { label: "Refrigeration & Deep Freezers", pct: 11, color: "bg-cyan-500", note: "Runs 24/7 with cycling compressor" },
            { label: "Lighting (Interior & Exterior)", pct: 8, color: "bg-indigo-500", note: "LED replacement saves up to 80%" },
            { label: "Standby Phantom Power & Wi-Fi", pct: 8, color: "bg-rose-500", note: "Continuous vampire drain (~R120/mo)" },
            { label: "Swimming Pool Pump / Motors", pct: 6, color: "bg-emerald-500", note: "Heavy inductive motor load" },
          ].map((item) => (
            <div key={item.label} className="text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.pct}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── APPLIANCE COST SIMULATOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Individual Appliance Running Cost Calculator</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Select an appliance and adjust daily operational hours</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Select Household Appliance
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {APPLIANCES.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setSelectedApplianceId(app.id);
                      setActiveHours(app.defaultHours);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                      selectedApplianceId === app.id
                        ? "bg-sky-50 dark:bg-sky-950/70 border-sky-400 dark:border-sky-600 text-sky-950 dark:text-sky-100 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{app.name.split(" (")[0]}</span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 ml-1">{app.typicalWatts}W</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{app.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Daily Running Hours</label>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  {activeHours} Hours / Day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="24"
                step="0.5"
                value={activeHours}
                onChange={(e) => setActiveHours(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Practical Advice Banner */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Conservation Recommendation: </span>
                <span>{selectedAppliance.tip}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Cost Breakdown Box */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <Zap className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Projected Energy Expense</h4>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Daily Power</p>
                  <p className="font-mono font-black text-slate-900 dark:text-white text-base mt-0.5">
                    {dailyKwh.toFixed(2)} <span className="text-xs font-normal text-slate-500">kWh</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Daily Cost</p>
                  <p className="font-mono font-black text-slate-900 dark:text-white text-base mt-0.5">
                    R{dailyCost.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-sky-800 dark:text-sky-300">Monthly Power</p>
                  <p className="font-mono font-black text-sky-900 dark:text-white text-lg mt-0.5">
                    {monthlyKwh.toFixed(1)} <span className="text-xs font-normal text-slate-500">kWh</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-sky-800 dark:text-sky-300">Monthly Cost</p>
                  <p className="font-mono font-black text-sky-900 dark:text-sky-300 text-lg mt-0.5">
                    R{Math.round(monthlyCost)}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Annual Projection</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Based on 365 days run</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-emerald-900 dark:text-emerald-300 text-xl">
                    R{Math.round(annualCost).toLocaleString("en-ZA")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Golden Rules Quick Tips */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3 Verified High-Return Actions:</span>
            </div>
            <p>1. Geyser blanket + 2m pipe lagging pays for itself in under 70 days.</p>
            <p>2. Lowering geyser thermostat to 55°C saves ~R220 every single month.</p>
            <p>3. Switching to LED warm white bulbs reduces lighting bill by 82%.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
