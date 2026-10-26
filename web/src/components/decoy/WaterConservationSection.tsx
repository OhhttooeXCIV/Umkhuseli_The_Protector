import React, { useState } from "react";
import {
  Droplet,
  Droplets,
  Waves,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  Calendar,
  Sparkles,
  Shield,
  HelpCircle
} from "lucide-react";

interface WaterTier {
  range: string;
  ratePerKl: number;
  description: string;
}

const WATER_TIERS: WaterTier[] = [
  { range: "0 – 6 kL", ratePerKl: 0.0, description: "Lifeline Free Basic Water allocation (Indigent / Registered residential)" },
  { range: "6 – 10 kL", ratePerKl: 26.85, description: "Standard basic consumption tariff (Block 1)" },
  { range: "10 – 15 kL", ratePerKl: 34.40, description: "Moderate domestic household consumption (Block 2)" },
  { range: "15 – 20 kL", ratePerKl: 47.90, description: "Higher usage threshold - conservation encouraged" },
  { range: "20 – 30 kL", ratePerKl: 67.30, description: "Excess consumption tier (High demand surcharge)" },
  { range: "> 30 kL", ratePerKl: 91.50, description: "Punitive drought / heavy usage tariff block" },
];

export const WaterConservationSection: React.FC = () => {
  // Household water calculator state
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [showerMinutes, setShowerMinutes] = useState<number>(6);
  const [hasEcoShowerhead, setHasEcoShowerhead] = useState<boolean>(false);
  const [toiletType, setToiletType] = useState<"standard" | "dual">("standard");
  const [gardenMinutesPerWeek, setGardenMinutesPerWeek] = useState<number>(30);
  const [showLeakModal, setShowLeakModal] = useState<boolean>(false);

  // Math calculations
  // Standard shower: 12 L/min, Eco: 6.5 L/min
  const showerLitersPerMin = hasEcoShowerhead ? 6.5 : 12.0;
  const dailyShowerLiters = householdSize * showerMinutes * showerLitersPerMin;

  // Toilet: Standard 9L flush, Dual-flush ~4.5L avg flush (assume 4 flushes/person/day)
  const flushLiters = toiletType === "standard" ? 9 : 4.5;
  const dailyToiletLiters = householdSize * 4 * flushLiters;

  // Domestic cooking, dishes & basic hygiene: ~25L/person/day
  const dailyBasicHygieneLiters = householdSize * 25;

  // Garden: standard hose ~25 L/min
  const weeklyGardenLiters = gardenMinutesPerWeek * 25;
  const dailyGardenLiters = weeklyGardenLiters / 7;

  const totalDailyLiters = dailyShowerLiters + dailyToiletLiters + dailyBasicHygieneLiters + dailyGardenLiters;
  const totalMonthlyKl = (totalDailyLiters * 30.4) / 1000;

  // Calculate tiered water bill
  const calculateTieredCost = (kl: number) => {
    let remaining = kl;
    let cost = 0;

    // 0-6 kl
    const t1 = Math.min(remaining, 6);
    cost += t1 * 0.0; // Free basic
    remaining = Math.max(0, remaining - 6);

    // 6-10 kl
    if (remaining > 0) {
      const t2 = Math.min(remaining, 4);
      cost += t2 * 26.85;
      remaining = Math.max(0, remaining - 4);
    }

    // 10-15 kl
    if (remaining > 0) {
      const t3 = Math.min(remaining, 5);
      cost += t3 * 34.40;
      remaining = Math.max(0, remaining - 5);
    }

    // 15-20 kl
    if (remaining > 0) {
      const t4 = Math.min(remaining, 5);
      cost += t4 * 47.90;
      remaining = Math.max(0, remaining - 5);
    }

    // 20-30 kl
    if (remaining > 0) {
      const t5 = Math.min(remaining, 10);
      cost += t5 * 67.30;
      remaining = Math.max(0, remaining - 10);
    }

    // >30 kl
    if (remaining > 0) {
      cost += remaining * 91.50;
    }

    return cost * 1.15; // with 15% VAT
  };

  const currentMonthlyCost = calculateTieredCost(totalMonthlyKl);

  // Potential savings if user switched to Eco showerhead and 4 min showers
  const optimizedDailyShower = householdSize * 4 * 6.5;
  const optimizedDailyToilet = householdSize * 4 * 4.5;
  const optimizedDailyTotal = optimizedDailyShower + optimizedDailyToilet + dailyBasicHygieneLiters + (dailyGardenLiters * 0.5);
  const optimizedMonthlyKl = (optimizedDailyTotal * 30.4) / 1000;
  const optimizedMonthlyCost = calculateTieredCost(optimizedMonthlyKl);
  const monthlySavings = Math.max(0, currentMonthlyCost - optimizedMonthlyCost);

  return (
    <div className="space-y-6">
      {/* ── TOP NOTIFICATION: Municipal Water Restriction Status ── */}
      <div className="bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 dark:from-sky-950/40 dark:via-cyan-950/30 dark:to-blue-950/40 border border-sky-300 dark:border-sky-800/60 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400 dark:border-sky-600/50 flex items-center justify-center flex-shrink-0 text-sky-600 dark:text-sky-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-sky-700 dark:text-sky-400">
                  Department of Water & Sanitation (DWS) Notice
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                  Stage 1 Restrictions
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Integrated Vaal & Western Cape Dam Basin Advisory
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                National average dam levels: <span className="font-semibold text-slate-900 dark:text-slate-100">79.4%</span>.
                Municipal bylaws prohibit watering residential gardens with hosepipes between{" "}
                <span className="font-semibold text-amber-800 dark:text-amber-300">06:00 and 18:00</span> from 1 September to 31 March.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLeakModal(true)}
            className="sm:self-center px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 text-xs font-bold hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>15-Min Leak Test Guide</span>
          </button>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN WATER INTERFACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CALCULATOR: Household Water Audit */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700/60 flex items-center justify-center text-sky-700 dark:text-sky-400">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Household Water Audit & Bill Estimator</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Estimate monthly consumption based on South African domestic metrics</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-300 dark:border-sky-700/50">
              1 kL = 1,000 Litres
            </span>
          </div>

          <div className="space-y-4">
            {/* Household Occupants Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Household Occupants</label>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  {householdSize} People
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={householdSize}
                onChange={(e) => setHouseholdSize(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Shower Duration */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Daily Shower Duration per Person</label>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  {showerMinutes} Minutes
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                value={showerMinutes}
                onChange={(e) => setShowerMinutes(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Aerator & Toilet Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setHasEcoShowerhead(!hasEcoShowerhead)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  hasEcoShowerhead
                    ? "bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-700 text-sky-900 dark:text-sky-200"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Low-Flow Showerheads</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {hasEcoShowerhead ? "Installed (6.5 L/min)" : "Standard (12 L/min)"}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  hasEcoShowerhead ? "bg-sky-600 border-sky-600 text-white" : "border-slate-400"
                }`}>
                  {hasEcoShowerhead && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setToiletType(toiletType === "standard" ? "dual" : "standard")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  toiletType === "dual"
                    ? "bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-700 text-sky-900 dark:text-sky-200"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Dual-Flush Cistern</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {toiletType === "dual" ? "Eco Dual (4.5 L/flush)" : "Standard Single (9 L/flush)"}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  toiletType === "dual" ? "bg-sky-600 border-sky-600 text-white" : "border-slate-400"
                }`}>
                  {toiletType === "dual" && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            {/* Garden Irrigation */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Garden Hose / Sprinkler (Minutes per Week)</label>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  {gardenMinutesPerWeek} Min / week
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="10"
                value={gardenMinutesPerWeek}
                onChange={(e) => setGardenMinutesPerWeek(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Result Summary Pill Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Daily Demand</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                {Math.round(totalDailyLiters)} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">Litres</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400">Monthly Volume</p>
              <p className="text-base sm:text-lg font-black text-sky-700 dark:text-sky-300 tabular-nums mt-0.5">
                {totalMonthlyKl.toFixed(1)} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">kL</span>
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Estimated Cost</p>
              <p className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                R{Math.round(currentMonthlyCost)}
                <span className="text-[10px] font-normal text-slate-600 dark:text-slate-400 ml-1">/mo</span>
              </p>
            </div>
          </div>

          {monthlySavings > 25 && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-xs text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>
                By installing low-flow aerators and shortening showers by 2 minutes, you can save approx{" "}
                <strong className="font-bold underline">R{Math.round(monthlySavings)} / month</strong> on your municipal water account.
              </span>
            </div>
          )}
        </div>

        {/* RIGHT / REFERENCE: Municipal Stepped Tariff Blocks */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <Droplet className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Municipal Incline Water Tariffs (2026/27)</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              South African metro municipalities utilize stepped tariffs: the more water you consume each month, the higher the rate per kilolitre.
            </p>

            <div className="space-y-2">
              {WATER_TIERS.map((tier) => (
                <div
                  key={tier.range}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <span className="font-bold text-slate-900 dark:text-white block">{tier.range}</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight block">{tier.description}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {tier.ratePerKl === 0 ? "FREE" : `R${tier.ratePerKl.toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">/ kL</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span>Standard metro rates (Johannesburg Water / Cape Town Water). All prices include 15% VAT.</span>
            </p>
          </div>

          {/* Quick Tip Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-300 dark:border-amber-800/40 rounded-2xl p-4 text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Did You Know? A Dripping Tap Waste Matrix</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              A tap leaking at just <strong>1 drip per second</strong> loses over <strong>30 litres per day</strong> (approx 900 litres a month). A steady pencil-thin stream wastes over <strong>1,800 litres every 48 hours</strong>, quickly pushing your account into punitive Block 4 tariffs!
            </p>
          </div>
        </div>
      </div>

      {/* ── LEAK DETECTION MODAL ── */}
      {showLeakModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl text-xs text-slate-800 dark:text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-sky-800 dark:text-sky-300">
                <Droplet className="w-4 h-4 text-sky-600" />
                <span>The 15-Minute Municipal Water Meter Leak Test</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLeakModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 leading-relaxed">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/50 rounded-xl border border-sky-200 dark:border-sky-800">
                <p className="font-bold text-sky-900 dark:text-sky-200 text-xs mb-1">Step 1: Complete Household Tap Shutdown</p>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Ensure all indoor taps, washing machines, dishwashers, and automatic garden irrigation valves are completely switched off.
                </p>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/50 rounded-xl border border-sky-200 dark:border-sky-800">
                <p className="font-bold text-sky-900 dark:text-sky-200 text-xs mb-1">Step 2: Inspect the Boundary Meter Dial</p>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Open your municipal meter box on the property boundary. Locate the small star/gear dial or red rotating needle. If this gear continues to rotate even slowly while all taps are off, you have an underground or internal leak.
                </p>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/50 rounded-xl border border-sky-200 dark:border-sky-800">
                <p className="font-bold text-sky-900 dark:text-sky-200 text-xs mb-1">Step 3: The Toilet Cistern Dye Test</p>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Place 3 drops of food coloring into the toilet cistern. Do not flush. Wait 15 minutes. If colored water appears in the toilet bowl, your cistern rubber flapper valve is leaking, wasting up to 200 litres a day silently.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLeakModal(false)}
              className="w-full bg-sky-700 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-xs"
            >
              Close Leak Test Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
