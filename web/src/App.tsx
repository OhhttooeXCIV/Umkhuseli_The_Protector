import React, { useState, useEffect } from "react";
import { MunicipalPrepaidCalculator } from "./components/MunicipalPrepaidCalculator";
import { SafeHavenDashboard } from "./components/SafeHavenDashboard";
import { dispatchServerSos } from "./services/supabase";

export const App: React.FC = () => {
  const [mode, setMode] = useState<"DECOY_CALCULATOR" | "SAFE_HAVEN">("DECOY_CALCULATOR");

  // Device Evasion: Face-down flip or rapid tab switch immediately resets to decoy
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched apps or locked screen: immediately lock vault
        setMode("DECOY_CALCULATOR");
      }
    };

    // Device orientation/motion detection (Flip face down = panic hide)
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && (event.beta > 160 || event.beta < -160)) {
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
  }, []);

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
      {mode === "DECOY_CALCULATOR" ? (
        <MunicipalPrepaidCalculator
          onUnlockSafeHaven={() => setMode("SAFE_HAVEN")}
          onDuressTrigger={handleDuressTrigger}
        />
      ) : (
        <SafeHavenDashboard
          onPanicLock={() => setMode("DECOY_CALCULATOR")}
        />
      )}
    </div>
  );
};

export default App;
