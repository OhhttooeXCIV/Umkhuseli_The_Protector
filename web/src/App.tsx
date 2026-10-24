import React, { useState, useEffect } from "react";
import { MunicipalPrepaidCalculator } from "./components/MunicipalPrepaidCalculator";
import { SafeHavenDashboard } from "./components/SafeHavenDashboard";
import { GuardianTrackerView } from "./components/GuardianTrackerView";
import { dispatchServerSos } from "./services/supabase";

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

  const [activeBeaconToken, setActiveBeaconToken] = useState<string>("beacon_72h_active");

  // Device Evasion: Face-down flip or rapid tab switch immediately resets to decoy
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mode === "SAFE_HAVEN") {
        // User switched apps or locked screen: immediately lock vault
        setMode("DECOY_CALCULATOR");
      }
    };

    // Device orientation/motion detection (Flip face down = panic hide)
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (mode === "SAFE_HAVEN" && event.beta !== null && (event.beta > 160 || event.beta < -160)) {
        // Phone placed face down on table
        setMode("DECOY_CALCULATOR");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [mode]);

  const handleDuressTrigger = async () => {
    // Silent emergency dispatch triggered by Duress PIN 9999
    try {
      await dispatchServerSos({
        isDuress: true,
        areaName: "Duress Beacon (Prepaid Portal)",
        batteryPercentage: 90,
        deviceModel: "Covert Web Client"
      });
    } catch (e) {
      console.warn("Duress dispatch executed silently.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950">
      {mode === "DECOY_CALCULATOR" && (
        <MunicipalPrepaidCalculator
          onUnlockSafeHaven={() => setMode("SAFE_HAVEN")}
          onDuressTrigger={handleDuressTrigger}
        />
      )}
      {mode === "SAFE_HAVEN" && (
        <SafeHavenDashboard
          onPanicLock={() => setMode("DECOY_CALCULATOR")}
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
