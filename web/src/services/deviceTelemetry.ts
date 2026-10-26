/**
 * Device Telemetry Service
 *
 * Reads hardware device status (Battery level, charging state, network connection type,
 * online/offline connectivity) directly from browser and OS APIs.
 */

export interface DeviceTelemetry {
  isOnline: boolean;
  connectionType: string;
  batteryLevel: number | null;
  isCharging: boolean;
}

export async function getDeviceTelemetry(): Promise<DeviceTelemetry> {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // Network connection type
  let connectionType = isOnline ? "Connected" : "Offline";
  if (typeof navigator !== "undefined") {
    const navAny = navigator as any;
    const conn = navAny.connection || navAny.mozConnection || navAny.webkitConnection;
    if (conn) {
      if (conn.effectiveType) {
        connectionType = `${conn.effectiveType.toUpperCase()} · Connected`;
      } else if (conn.type) {
        connectionType = `${conn.type.toUpperCase()} · Connected`;
      }
    }
  }

  // Battery Status API
  let batteryLevel: number | null = null;
  let isCharging = false;
  if (typeof navigator !== "undefined" && typeof (navigator as any).getBattery === "function") {
    try {
      const battery = await (navigator as any).getBattery();
      if (battery && typeof battery.level === "number") {
        batteryLevel = Math.round(battery.level * 100);
        isCharging = Boolean(battery.charging);
      }
    } catch {
      /* Battery API restricted or rejected */
    }
  }

  return {
    isOnline,
    connectionType,
    batteryLevel,
    isCharging,
  };
}
