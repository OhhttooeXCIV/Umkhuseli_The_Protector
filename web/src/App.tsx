import React, { useState, useEffect, useRef } from "react";
import { MunicipalPrepaidCalculator } from "./components/MunicipalPrepaidCalculator";
import { DailyDevotionalFacade } from "./components/DailyDevotionalFacade";
import { SafeHavenDashboard } from "./components/SafeHavenDashboard";
import { GuardianTrackerView } from "./components/GuardianTrackerView";
import { IosInstallGuideModal } from "./components/IosInstallGuideModal";
import { dispatchServerSos } from "./services/supabase";
import {
  getActiveDisguise,
  DISGUISE_EVENT_NAME,
  DisguiseType,
} from "./services/disguiseManager";
import {
  attachIosStealthSentinel,
  triggerTactileHapticPulse,
} from "./services/iosStealthManager";
import { requestPersistentStorage } from "./services/storagePersistence";

export const App: React.FC = () => {
  const [mode, setMode] = useState<"DECOY_CALCULATOR" | "SAFE_HAVEN" | "GUARDIAN_TRACKER">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("track") || params.get("token")) {
        return "GUARDIAN_TRACKER";
      }
    }
    return "DECOY_CALCULATOR";
  });

  const [activeDisguise, setActiveDisguiseState] = useState<DisguiseType>(getActiveDisguise);
  const [activeBeaconToken, setActiveBeaconToken] = useState<string>("beacon_72h_active");
  const [vaultSessionKey, setVaultSessionKey] = useState<number>(0);

  // Root Double-Tap Timing Reference
  const lastRootTapRef = useRef<number>(0);

  // Request persistent storage to protect against Safari 7-day storage eviction
  useEffect(() => {
    requestPersistentStorage().catch(() => {});
  }, []);

  // Subscribe to disguise facade changes
  useEffect(() => {
    const handleDisguiseChange = (e: Event) => {
      const customEvent = e as CustomEvent<DisguiseType>;
      setActiveDisguiseState(customEvent.detail || getActiveDisguise());
    };
    window.addEventListener(DISGUISE_EVENT_NAME, handleDisguiseChange);
    return () => {
      window.removeEventListener(DISGUISE_EVENT_NAME, handleDisguiseChange);
    };
  }, []);

  /**
   * Feature 5: 0ms Panic Camouflage Engine
   * Synchronously scrubs in-memory sensitive state, blurs DOM focus,
   * purges clipboard traces, and restores the innocent configured facade.
   */
  const trigger0msPanicCamouflage = () => {
    // 1. Instant facade restoration (0ms without transition delays)
    setMode("DECOY_CALCULATOR");

    // 2. Memory Scrub: Increment key to force total teardown & zeroing of SafeHaven state
    setVaultSessionKey((prev) => prev + 1);

    // 3. Clear active element focus to close on-screen mobile keyboard & unselect text
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 4. Scrub clipboard of temporary legal drafts or incident tokens
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText("").catch(() => {});
    }

    // 5. Silent tactile confirmation pulse (25ms) directly to user's palm (with iOS audio haptic fallback)
    triggerTactileHapticPulse(25);
  };

  /**
   * Root Double-Tap Gesture Handler:
   * Rapid double-tap anywhere on background container triggers 0ms panic exit.
   */
  const handleRootClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "SAFE_HAVEN") return;

    // Do not trigger on interactive form controls (inputs, buttons, select, links)
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select, button, a")) {
      return;
    }

    const now = Date.now();
    if (now - lastRootTapRef.current < 350) {
      lastRootTapRef.current = 0;
      trigger0msPanicCamouflage();
    } else {
      lastRootTapRef.current = now;
    }
  };

  // Hardware Sensors, Proximity & Evasion Listeners
  useEffect(() => {
    if (mode !== "SAFE_HAVEN") return;

    // Visibility Evasion: screen lock or app switcher trigger
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trigger0msPanicCamouflage();
      }
    };

    // Flip-to-hide: device turned face down (DeviceOrientation API)
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && (event.beta > 150 || event.beta < -150)) {
        trigger0msPanicCamouflage();
      }
    };

    // Hardware Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        trigger0msPanicCamouflage();
      }
    };

    // Device Proximity Sensor (phone placed against body or turned facedown on surface)
    const handleProximity = (event: any) => {
      if (event.near === true || event.value === 0) {
        trigger0msPanicCamouflage();
      }
    };

    // Attach iOS Safari Stealth Sentinel (App Switcher evasion, pagehide, shake gesture)
    const cleanupIosStealth = attachIosStealthSentinel({
      onPanicExit: trigger0msPanicCamouflage,
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("userproximity" as any, handleProximity);
    window.addEventListener("deviceproximity" as any, handleProximity);

    return () => {
      cleanupIosStealth();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("userproximity" as any, handleProximity);
      window.removeEventListener("deviceproximity" as any, handleProximity);
    };
  }, [mode]);

  const handleDuressTrigger = async () => {
    // Silent emergency dispatch triggered by Duress PIN 9999
    try {
      await dispatchServerSos({
        isDuress: true,
        areaName: activeDisguise === "DAILY_DEVOTIONAL"
          ? "Duress Beacon (Devotional Portal)"
          : "Duress Beacon (Prepaid Portal)",
        batteryPercentage: 90,
        deviceModel: "Covert Web Client"
      });
    } catch (e) {
      console.warn("Duress dispatch executed silently.");
    }
  };

  return (
    <div
      data-testid="root-panic-container"
      onClick={handleRootClick}
      className="w-full min-h-screen bg-slate-950"
    >
      {mode === "DECOY_CALCULATOR" && (
        <>
          {activeDisguise === "DAILY_DEVOTIONAL" ? (
            <DailyDevotionalFacade
              onUnlockSafeHaven={() => setMode("SAFE_HAVEN")}
              onDuressTrigger={handleDuressTrigger}
            />
          ) : (
            <MunicipalPrepaidCalculator
              onUnlockSafeHaven={() => setMode("SAFE_HAVEN")}
              onDuressTrigger={handleDuressTrigger}
            />
          )}
          <IosInstallGuideModal />
        </>
      )}
      {mode === "SAFE_HAVEN" && (
        <SafeHavenDashboard
          key={vaultSessionKey}
          onPanicLock={trigger0msPanicCamouflage}
          onOpenGuardianTracker={() => setMode("GUARDIAN_TRACKER")}
        />
      )}
      {mode === "GUARDIAN_TRACKER" && (
        <GuardianTrackerView
          beaconToken={activeBeaconToken}
          onExit={() => setMode("DECOY_CALCULATOR")}
        />
      )}
    </div>
  );
};

export default App;
