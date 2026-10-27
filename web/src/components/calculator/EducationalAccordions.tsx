import React, { useState } from "react";
import {
  Sun,
  Droplet,
  ShieldCheck,
  Sliders,
  ChevronDown,
  Layers,
} from "lucide-react";
import { SolarPaybackSection } from "../decoy/SolarPaybackSection";
import { WaterConservationSection } from "../decoy/WaterConservationSection";
import { StsMeterGuideSection } from "../decoy/StsMeterGuideSection";
import { EnergySavingsAuditSection } from "../decoy/EnergySavingsAuditSection";

export type EducationalSectionId = "solar" | "water" | "sts_guide" | "energy";

interface EducationalAccordionsProps {
  ratePerKwh: number;
  initialOpenSection?: EducationalSectionId | null;
}

export const EducationalAccordions: React.FC<EducationalAccordionsProps> = ({
  ratePerKwh,
  initialOpenSection = null,
}) => {
  const [openSections, setOpenSections] = useState<Record<EducationalSectionId, boolean>>({
    solar: initialOpenSection === "solar",
    water: initialOpenSection === "water",
    sts_guide: initialOpenSection === "sts_guide",
    energy: initialOpenSection === "energy",
  });

  const toggleSection = (id: EducationalSectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sections: {
    id: EducationalSectionId;
    title: string;
    badge: string;
    summary: string;
    icon: React.ElementType;
    iconColor: string;
    badgeStyle: string;
    content: React.ReactNode;
  }[] = [
    {
      id: "solar",
      title: "Solar PV & Loadshedding ROI Calculator",
      badge: "Clean Energy",
      summary: "Model financial payback period, battery sizing, and grid-tied solar offsets.",
      icon: Sun,
      iconColor: "text-amber-500",
      badgeStyle: "bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700",
      content: <SolarPaybackSection />,
    },
    {
      id: "water",
      title: "Municipal Water Conservation & Tariffs",
      badge: "Water By-Laws",
      summary: "Understand tiered water tariffs, daily consumption limits, and drought restrictions.",
      icon: Droplet,
      iconColor: "text-sky-500",
      badgeStyle: "bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-300 border-sky-300 dark:border-sky-700",
      content: <WaterConservationSection />,
    },
    {
      id: "sts_guide",
      title: "STS Meter Diagnostics & Key Revision Rollover Guide",
      badge: "STS Standard",
      summary: "Keypad diagnostic test codes (#005#, i005), KRN2 rollover instructions, and tamper recovery.",
      icon: ShieldCheck,
      iconColor: "text-emerald-500",
      badgeStyle: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
      content: <StsMeterGuideSection />,
    },
    {
      id: "energy",
      title: "Household Energy Savings & Geyser Audit",
      badge: "Cost Reduction",
      summary: "Analyze high-draw appliances, geyser insulation savings, and smart timer schedules.",
      icon: Sliders,
      iconColor: "text-indigo-500",
      badgeStyle: "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
      content: <EnergySavingsAuditSection ratePerKwh={ratePerKwh} />,
    },
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Municipal Utility Knowledge Hub & Diagnostics
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          Expandable on demand
        </span>
      </div>

      <div className="space-y-3">
        {sections.map(({ id, title, badge, summary, icon: Icon, iconColor, badgeStyle, content }) => {
          const isOpen = !!openSections[id];
          return (
            <div
              key={id}
              className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
            >
              {/* Accordion header button */}
              <button
                type="button"
                onClick={() => toggleSection(id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${id}`}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3.5 pr-4">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {title}
                      </h4>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}
                      >
                        {badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {summary}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <span className="hidden sm:inline text-[11px]">
                    {isOpen ? "Collapse" : "Explore"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Accordion content */}
              {isOpen && (
                <div
                  id={`accordion-content-${id}`}
                  className="border-t border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-950/40 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
