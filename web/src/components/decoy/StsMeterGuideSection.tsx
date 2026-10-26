import React, { useState } from "react";
import {
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  PhoneCall,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";

interface StsError {
  code: string;
  name: string;
  cause: string;
  resolution: string;
  severity: "high" | "medium" | "info";
}

const STS_ERRORS: StsError[] = [
  {
    code: "Error 30 (STS-ERR-30)",
    name: "Key Revision Number (KRN) Expiry",
    cause: "Meter requires mandatory TID Rollover from KRN1 to KRN2 to accept post-2024 vending tokens.",
    resolution: "Obtain the two 20-digit Key Change Tokens (KCT 1 and KCT 2) from your municipal vending agent, enter both sequentially, then reload voucher.",
    severity: "high"
  },
  {
    code: "Error 01",
    name: "UIU Communication / Low Cell",
    cause: "Wireless or wired communication failure between wall meter and indoor keypad, or depleted AA batteries.",
    resolution: "Replace indoor keypad batteries or ensure wireless keypad is plugged into mains wall socket within 15 meters of meter box.",
    severity: "medium"
  },
  {
    code: "Error 02 / Tamper",
    name: "Anti-Tamper Lockout Activated",
    cause: "Physical enclosure switch triggered, terminal cover unsealed, or neutral earthing anomaly detected.",
    resolution: "Contact municipal technical dispatch for an authorized technician to inspect, reseal, and provide a 20-digit Tamper Clear Token.",
    severity: "high"
  },
  {
    code: "Error 03",
    name: "Encryption Key Expired",
    cause: "Municipal vending system updated vending keys or Tariff Index does not match meter database.",
    resolution: "Request municipality to generate an engineering KCT reset for your 11-digit meter number.",
    severity: "medium"
  },
  {
    code: "Error 04",
    name: "Credit Register Overflow",
    cause: "Attempting to vend units when current meter credit plus purchased kWh exceeds 9,999.9 kWh.",
    resolution: "Consume existing units until meter credit drops below 9,000 kWh, then re-enter token.",
    severity: "info"
  },
  {
    code: "Error 05",
    name: "Token Already Used / Duplicate",
    cause: "The 20-digit STS token has previously been entered and registered in the meter EEPROM memory.",
    resolution: "Check meter unit display; units were already credited. Purchase a fresh voucher if top-up is needed.",
    severity: "info"
  },
  {
    code: "Reject / E-07",
    name: "Meter Serial Mismatch / Checksum Error",
    cause: "The voucher was generated for a different 11-digit meter number or digits were mistyped.",
    resolution: "Verify the 11-digit meter number printed on the receipt matches the barcode on your physical meter casing.",
    severity: "medium"
  },
];

export const StsMeterGuideSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredErrors = STS_ERRORS.filter(
    (e) =>
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.cause.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── TOP BANNER: TID ROLLOVER ADVISORY ── */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-blue-50 dark:from-sky-950/40 dark:via-slate-900 dark:to-blue-950/40 border border-sky-300 dark:border-sky-800/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400 dark:border-sky-600/50 flex items-center justify-center flex-shrink-0 text-sky-600 dark:text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-sky-700 dark:text-sky-400">
                Standard Transfer Specification (STS IEC 62055-41)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                KRN2 Verified
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              National Prepaid Meter TID Rollover Verification
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              All South African municipal prepaid electricity and water meters must be migrated from <strong>Key Revision Number 1 (KRN1)</strong> to <strong>Key Revision Number 2 (KRN2)</strong>. Meters still operating on KRN1 will reject recharge vouchers with <span className="font-mono font-bold text-rose-700 dark:text-rose-400">"REJECT"</span> or <span className="font-mono font-bold text-amber-700 dark:text-amber-400">"Error 30"</span>.
            </p>
          </div>
        </div>

        {/* Quick check guide */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          {[
            { make: "Conlog Meters", code: "#005#", desc: "Displays KRN 1 or KRN 2" },
            { make: "Landis + Gyr", code: "i005", desc: "Shows active key version" },
            { make: "Hexing Prepaid", code: "814", desc: "Displays rollover status" },
            { make: "Cashpower", code: "005", desc: "Status register code" },
          ].map((item) => (
            <div key={item.make} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] block">{item.make}</span>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-sm block mt-0.5">{item.code}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ERROR CODE DIRECTORY ── */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">STS Meter Diagnostic & Error Code Lookup</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Search error codes displayed on your indoor keypad unit (UIU)</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search error code or problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredErrors.map((err) => (
            <div
              key={err.code}
              className={`p-3.5 rounded-xl border text-xs transition-all ${
                err.severity === "high"
                  ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                  : err.severity === "medium"
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-xs ${
                    err.severity === "high"
                      ? "text-rose-700 dark:text-rose-400"
                      : err.severity === "medium"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-sky-700 dark:text-sky-400"
                  }`}>
                    {err.code}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{err.name}</span>
                </div>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border self-start sm:self-auto ${
                  err.severity === "high"
                    ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                    : err.severity === "medium"
                    ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                    : "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}>
                  {err.severity === "high" ? "Critical Lockout" : err.severity === "medium" ? "Attention" : "Informational"}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-1 leading-relaxed">
                <strong>Probable Cause:</strong> {err.cause}
              </p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Standard Resolution:</strong> {err.resolution}
              </p>
            </div>
          ))}

          {filteredErrors.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-6">
              No matching STS error codes found. Check your meter display or call municipal dispatch.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
