/**
 * Umkhuseli: The Protector (Sankofa Safe)
 * iOS Stealth & Safari Evasion Manager
 *
 * Implements iOS WebKit-specific security defenses:
 * 1. App Switcher Privacy Masking: Synchronously scrubs the DOM and resets to Decoy
 *    on `visibilitychange` or `pagehide` before iOS captures the multitasking preview thumbnail.
 * 2. iOS Haptic Fallback: Web Audio API tactile 35Hz vibration synthesis for palm haptics.
 * 3. Emergency Pocket Shake Detection: DeviceMotionEvent accelerator trigger for blind panic exits.
 * 4. Safe standalone iOS detection.
 */

export interface IosStealthOptions {
  onPanicExit: () => void;
  shakeThreshold?: number; // Acceleration in m/s^2 (default 24)
}

/**
 * Detects if the current user agent is iOS WebKit (iPhone, iPad, iPod)
 */
export function isIosWebKit(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects if running as an installed standalone iOS Home Screen PWA
 */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  return Boolean(
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches)
  );
}

/**
 * iOS Tactile Palm Haptic Pulse
 * Calls navigator.vibrate if available; otherwise falls back to a 35Hz low-frequency
 * Web Audio pulse to produce a physical speaker micro-rumble on iOS hardware.
 */
export function triggerTactileHapticPulse(durationMs: number = 30): void {
  if (typeof window === "undefined") return;

  // 1. Standard Web Vibration API
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate([durationMs]);
      return;
    } catch {
      // Continue to iOS fallback
    }
  }

  // 2. iOS Web Audio API tactile micro-pulse (35 Hz sub-frequency rumble)
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(35, ctx.currentTime); // 35 Hz tactile pulse

      // Smooth envelope to avoid audible click
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {
          // Ignored
        }
      }, durationMs + 50);
    }
  } catch {
    // Silent fail if audio blocked by autoplay restrictions
  }
}

/**
 * Attaches iOS Stealth Sentinel listeners.
 * Returns an unbind / cleanup function.
 */
export function attachIosStealthSentinel(options: IosStealthOptions): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const { onPanicExit, shakeThreshold = 24 } = options;

  // 1. App Switcher / Multitasking Evasion:
  // When user swipes up to access iOS App Switcher or locks phone,
  // visibilityState switches to 'hidden'. We trigger 0ms panic immediately
  // before the system snapshot is rendered.
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      onPanicExit();
    }
  };

  const handlePageHide = () => {
    onPanicExit();
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", handlePageHide);

  // 2. iOS Shake-to-Panic Gesture Detection
  let lastX = 0;
  let lastY = 0;
  let lastZ = 0;
  let lastShakeTime = 0;

  const handleDeviceMotion = (e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity || e.acceleration;
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

    const deltaX = Math.abs(acc.x - lastX);
    const deltaY = Math.abs(acc.y - lastY);
    const deltaZ = Math.abs(acc.z - lastZ);

    const now = Date.now();
    if (deltaX + deltaY + deltaZ > shakeThreshold && now - lastShakeTime > 1000) {
      lastShakeTime = now;
      triggerTactileHapticPulse(40);
      onPanicExit();
    }

    lastX = acc.x;
    lastY = acc.y;
    lastZ = acc.z;
  };

  // Check if iOS DeviceMotionEvent requires permission
  const DeviceMotionEventWithPermission = DeviceMotionEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };

  let motionBound = false;
  if (typeof window.DeviceMotionEvent !== "undefined") {
    if (typeof DeviceMotionEventWithPermission.requestPermission !== "function") {
      window.addEventListener("devicemotion", handleDeviceMotion);
      motionBound = true;
    }
  }

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", handlePageHide);
    if (motionBound) {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    }
  };
}
