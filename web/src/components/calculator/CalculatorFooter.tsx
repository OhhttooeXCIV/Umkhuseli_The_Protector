import React from "react";
import { Shield } from "lucide-react";
import { UtilityTab } from "../MunicipalPrepaidCalculator";

interface CalculatorFooterProps {
  onSelectTab: (tab: UtilityTab) => void;
  onOpenPortalModal: () => void;
  onOpenBriefing?: () => void;
}

export const CalculatorFooter: React.FC<CalculatorFooterProps> = ({
  onSelectTab,
  onOpenPortalModal,
  onOpenBriefing,
}) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-medium text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" aria-hidden="true" />
          <span>PowerCalc SA · NERSA-approved municipal utility services · 2026/27</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
          <button
            type="button"
            onClick={() => onSelectTab("electricity")}
            className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Electricity
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onSelectTab("water")}
            className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Water Conservation
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onSelectTab("energy")}
            className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Energy Audit
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onSelectTab("solar")}
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
            onClick={onOpenPortalModal}
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
  );
};
