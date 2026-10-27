import { useState, useEffect } from "react";
import {
  getInitialTheme,
  ThemeMode,
  THEME_CHANGE_EVENT,
} from "../../services/themeManager";
import {
  fetchLiveLoadshedding,
  LoadsheddingInfo,
} from "../../services/loadsheddingService";
import {
  getDeviceTelemetry,
  DeviceTelemetry,
} from "../../services/deviceTelemetry";
import {
  getUatProfile,
  UatProfile,
} from "../../services/uatProfileService";

export function useCalculatorEnvironment() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [uatProfile, setUatProfileState] = useState<UatProfile>(getUatProfile);

  const [loadshedding, setLoadshedding] = useState<LoadsheddingInfo>({
    stage: 0,
    statusText: "Grid Normal · Loadshedding Suspended",
    source: "loadshedding.eskom.co.za",
    officialUrl: "https://loadshedding.eskom.co.za/",
    area: "National Grid / Metro Supply",
    nextSlot: "No Outages Scheduled",
    duration: "0h 00min",
    isOutageActive: false,
    timestamp: new Date().toISOString(),
  });

  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    connectionType: "Connected",
    batteryLevel: null,
    isCharging: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") setShowBackToTop(window.scrollY > 280);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleTheme = (e: Event) => {
      const ce = e as CustomEvent<ThemeMode>;
      if (ce.detail) setTheme(ce.detail);
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleTheme);

    const updateTelemetry = () => {
      getDeviceTelemetry().then(setTelemetry).catch(() => {});
    };
    updateTelemetry();

    fetchLiveLoadshedding().then(setLoadshedding).catch(() => {});
    const loadsheddingInterval = setInterval(() => {
      fetchLiveLoadshedding().then(setLoadshedding).catch(() => {});
    }, 60_000);

    const tick = setInterval(() => setCurrentTime(new Date()), 30_000);
    window.addEventListener("online", updateTelemetry);
    window.addEventListener("offline", updateTelemetry);

    const handleUatUpdate = () => setUatProfileState(getUatProfile());
    window.addEventListener("pcalc_uat_profile_updated", handleUatUpdate);
    window.addEventListener("umkhuseli_uat_profile_updated", handleUatUpdate);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleTheme);
      window.removeEventListener("pcalc_uat_profile_updated", handleUatUpdate);
      window.removeEventListener("umkhuseli_uat_profile_updated", handleUatUpdate);
      clearInterval(tick);
      clearInterval(loadsheddingInterval);
      window.removeEventListener("online", updateTelemetry);
      window.removeEventListener("offline", updateTelemetry);
    };
  }, []);

  return {
    currentTime,
    theme,
    showBackToTop,
    scrollToTop,
    loadshedding,
    telemetry,
    uatProfile,
  };
}
