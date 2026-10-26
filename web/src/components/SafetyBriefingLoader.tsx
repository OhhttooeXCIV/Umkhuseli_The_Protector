import React, { useState, useEffect } from "react";
import {
  Hexagon,
  Shield,
  Zap,
  AlertOctagon,
  Lock,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
} from "lucide-react";

export interface InstructionSlide {
  badge: string;
  badgeColor: string;
  title: string;
  instruction: string;
  distressCode: string;
  codeAction: string;
  inputLocation: string;
  icon: "shield" | "zap" | "duress" | "vault" | "phone";
}

export const SAFETY_BRIEFING_SLIDES: InstructionSlide[] = [
  {
    badge: "STEP 1 · AUTHENTIC MUNICIPAL DECOY",
    badgeColor: "text-sky-400 border-sky-500/40 bg-sky-950/60",
    title: "Legitimate Municipal Utility Camouflage",
    instruction: "PowerCalc SA is engineered as a fully functional South African municipal utility portal. It features real stepped residential tariffs for City of Joburg, Cape Town, Tshwane, and eThekwini, Eskom loadshedding schedules, water conservation tiers, appliance wattage benchmarks, and official STS meter rollover (KRN2) diagnostics. Any partner or bystander inspecting your device sees a 100% useful, realistic municipal engineering tool.",
    distressCode: "NORMAL USE",
    codeAction: "Calculate Eskom & Metro tariffs, water consumption, solar payback, or STS token generation",
    inputLocation: "Main utility calculator & sub-nav tabs on landing screen",
    icon: "zap",
  },
  {
    badge: "STEP 2 · PORTAL LAYOUT & TOOLS",
    badgeColor: "text-blue-400 border-blue-500/40 bg-blue-950/60",
    title: "Prepaid Electricity & Utility Layout",
    instruction: "Explore the top navigation tabs: Electricity (stepped Incline Block Tariffs), Water (conservation tiers 0-30+ kL), Energy (CSIR appliance cost audits), Solar (PV payback & battery autonomy), and STS Meter Guide (IEC 62055-41 Error 30 diagnostics). This functional depth guarantees zero suspicion during unexpected searches.",
    distressCode: "TABS & TOOLS",
    codeAction: "Real municipal engineering audits & loadshedding grid metrics",
    inputLocation: "Utility navigation bar across the top of the portal",
    icon: "zap",
  },
  {
    badge: "STEP 3 · SAFE HAVEN ACCESS",
    badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/60",
    title: "Access the Encrypted Evidence Vault",
    instruction: "Unlocks the biometric evidence diary, Section 4(2) safe address protection order generator, and offline 9-province Thuthuzela Care Centre directory.",
    distressCode: "PIN 1234 or 8426",
    codeAction: "Unlocks the covert Safe Haven with zero visible transitions",
    inputLocation: "Type 1234 or 8426 into 'Purchase Amount (ZAR)', or triple-tap the top Shield Crest",
    icon: "vault",
  },
  {
    badge: "STEP 4 · FIRST-TIME SAFETY SETUP",
    badgeColor: "text-indigo-400 border-indigo-500/40 bg-indigo-950/60",
    title: "Survivor Profile, ICE Guardians & Permissions",
    instruction: "On your first Safe Haven visit, complete your legal particulars (name, SA ID, safe service address) and register your 5 emergency ICE guardians. Enable Geolocation, Camera/Mic, and Storage permissions so high-precision live GPS coordinates and local AES-256-GCM vault persistence operate seamlessly during emergencies.",
    distressCode: "FIRST-TIME SETUP",
    codeAction: "Configure emergency particulars, ICE portals (WhatsApp/SMS/Socials) & device permissions",
    inputLocation: "Safety Plan & Profile tab in Safe Haven",
    icon: "shield",
  },
  {
    badge: "STEP 5 · SILENT DURESS BROADCAST",
    badgeColor: "text-rose-400 border-rose-500/40 bg-rose-950/60",
    title: "Emergency Beacon Under Duress (PIN 9999)",
    instruction: "If forced to open the app under duress: entering PIN 9999 silently transmits high-precision live GPS coordinates and battery telemetry to all saved ICE contacts across WhatsApp (72h live links), SMS, Email, and Social Media (Instagram, Facebook, TikTok), while immediately popping up an authentic 'Error 30: KRN2 Rollover' meter diagnostic terminal.",
    distressCode: "PIN 9999",
    codeAction: "Silently transmits SOS across WhatsApp, SMS, Email, IG, FB, TK + renders STS Error 30 terminal",
    inputLocation: "Type 9999 into 'Purchase Amount (ZAR)' or meter ending in 9999",
    icon: "duress",
  },
  {
    badge: "STEP 6 · GUARDIAN ACKNOWLEDGMENT",
    badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/60",
    title: "Covert Visual Confirmation via Light Mode Flip",
    instruction: "When your designated guardian opens their live tracking link and taps 'Acknowledge Distress: I Am Responding', a covert cross-device trigger immediately flips your Safe Haven UI from dark mode to light mode and emits a tactile haptic pulse—providing silent proof that help is on the way without making a sound.",
    distressCode: "BIDIRECTIONAL SIGNAL",
    codeAction: "Flips Safe Haven theme from Dark to Light mode upon guardian acknowledgment",
    inputLocation: "Automatic background synchronization (BroadcastChannel / LocalStorage / Cloud)",
    icon: "shield",
  },
  {
    badge: "STEP 7 · 0ms PANIC ESCAPE",
    badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/60",
    title: "Instant 0ms Camouflage Wipe & Memory Scrub",
    instruction: "If an adversary enters the room: immediately purges decrypted memory from RAM, clears clipboard traces, and returns to the innocent electricity calculator. Multi-sensor evasion triggers on app switching or phone placed face down.",
    distressCode: "DOUBLE-TAP / ESC",
    codeAction: "0-millisecond memory scrub with zero recents or task-switcher footprints",
    inputLocation: "Rapid double-tap anywhere on screen, press Escape key, or browser Back",
    icon: "shield",
  },
  {
    badge: "STEP 8 · ZERO-AIRTIME LIFELINES",
    badgeColor: "text-teal-400 border-teal-500/40 bg-teal-950/60",
    title: "South African Emergency Lifelines (*120*7867#)",
    instruction: "All lifelines function offline and during Stage 6 loadshedding without consuming mobile data or cellular airtime bundles.",
    distressCode: "*120*7867# & 0800 428 428",
    codeAction: "Free USSD callback request (*120*7867#) & 24/7 GBV Command Centre toll-free voice call",
    inputLocation: "Dial direct on any SA mobile network (Vodacom, MTN, Telkom, Cell C)",
    icon: "phone",
  },
];

const DISMISS_STORAGE_KEY = "pcalc_briefing_seen";
const LEGACY_DISMISS_STORAGE_KEY = "umkhuseli_safety_briefing_seen";

interface Props {
  onComplete: () => void;
  forceShow?: boolean;
}

export const SafetyBriefingLoader: React.FC<Props> = ({ onComplete, forceShow = false }) => {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev === SAFETY_BRIEFING_SLIDES.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleDismiss = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      try {
        localStorage.setItem(DISMISS_STORAGE_KEY, "true");
        localStorage.removeItem(LEGACY_DISMISS_STORAGE_KEY);
      } catch {
        /* localStorage fallback */
      }
    }
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    if (index < SAFETY_BRIEFING_SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const currentSlide = SAFETY_BRIEFING_SLIDES[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Umkhuseli Safety Briefing and Distress Code Guide"
      className={`fixed inset-0 z-[2000] bg-[#030712]/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 transition-all duration-500 ease-in-out select-none overflow-y-auto ${
        isFading ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-xl flex items-center justify-between text-xs text-slate-400 pt-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            Umkhuseli: Safety Briefing & Distress Codes
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors"
        >
          <span>Skip Briefing</span>
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Center Interactive Anchor & Content */}
      <div className="w-full max-w-xl my-auto py-6 flex flex-col items-center text-center space-y-5">
        {/* Visual Anchor: Rotating Hexagon with Glowing Symbol */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-sky-500/15 blur-2xl rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Hexagon className="w-20 h-20 text-sky-500/60 animate-[spin_18s_linear_infinite]" />
          </div>
          <div className="relative z-10 w-12 h-12 rounded-full bg-slate-900 border border-sky-400/50 flex items-center justify-center shadow-lg shadow-sky-500/20">
            {currentSlide.icon === "zap" && <Zap className="w-6 h-6 text-amber-400 fill-amber-400/40" />}
            {currentSlide.icon === "vault" && <Lock className="w-6 h-6 text-emerald-400" />}
            {currentSlide.icon === "duress" && <AlertOctagon className="w-6 h-6 text-rose-400 animate-pulse" />}
            {currentSlide.icon === "shield" && <Shield className="w-6 h-6 text-sky-400" />}
            {currentSlide.icon === "phone" && <PhoneCall className="w-6 h-6 text-teal-400" />}
          </div>
        </div>

        {/* Badge & Title */}
        <div className="space-y-2">
          <span
            className={`inline-block px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase transition-colors ${currentSlide.badgeColor}`}
          >
            {currentSlide.badge}
          </span>
          <h2
            key={currentSlide.title}
            className="text-xl sm:text-2xl font-black text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {currentSlide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {currentSlide.instruction}
          </p>
        </div>

        {/* Highlighted Distress Code & Input Location Card */}
        <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-left shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Distress Code / Action
              </span>
              <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                {currentSlide.distressCode}
              </span>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Trigger Outcome
              </span>
              <span className="text-xs font-semibold text-sky-300">
                {currentSlide.codeAction}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
              Where to Enter / How to Trigger
            </span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <span className="text-slate-500">▶</span>
              <span>{currentSlide.inputLocation}</span>
            </div>
          </div>
        </div>

        {/* Slide Indicators & Manual Step Controls (WCAG 2.5.8 Compliant Touch Targets >= 32px) */}
        <div className="flex items-center justify-between w-full pt-1">
          <button
            type="button"
            onClick={handlePrev}
            disabled={index === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
            title="Previous instruction"
            aria-label="Previous instruction"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Dots with 32x32px Accessible Touch Targets */}
          <div className="flex items-center gap-1">
            {SAFETY_BRIEFING_SLIDES.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(true);
                  setIndex(i);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
                aria-label={`Go to instruction ${i + 1}`}
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-sky-400" : "w-2 bg-slate-600 hover:bg-slate-400"
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title={index === SAFETY_BRIEFING_SLIDES.length - 1 ? "Enter Portal" : "Next instruction"}
            aria-label={index === SAFETY_BRIEFING_SLIDES.length - 1 ? "Enter Portal" : "Next instruction"}
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="relative w-48 h-1 mx-auto overflow-hidden bg-slate-800 rounded-full">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 via-teal-400 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${((index + 1) / SAFETY_BRIEFING_SLIDES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
          />
          <span className="text-[11px]">Don't show automatically on next visit</span>
        </label>

        <button
          type="button"
          onClick={handleDismiss}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Enter Municipal Utility Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Screen reader compliance */}
      <span className="sr-only">
        Umkhuseli covert safety portal is loaded. Use PIN 9999 for duress alarm or 1234 for safe haven.
      </span>
    </div>
  );
};

export default SafetyBriefingLoader;
