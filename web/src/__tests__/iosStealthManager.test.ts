import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isIosWebKit,
  isStandalonePwa,
  triggerTactileHapticPulse,
  attachIosStealthSentinel,
} from "../services/iosStealthManager";

describe("iOS Stealth & Safari Evasion Manager", () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it("detects iPhone and iPad user agents accurately", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      configurable: true,
    });
    expect(isIosWebKit()).toBe(true);

    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
      configurable: true,
    });
    expect(isIosWebKit()).toBe(false);
  });

  it("detects standalone iOS PWA mode", () => {
    Object.defineProperty(window.navigator, "standalone", {
      value: true,
      configurable: true,
    });
    expect(isStandalonePwa()).toBe(true);

    Object.defineProperty(window.navigator, "standalone", {
      value: false,
      configurable: true,
    });
    expect(isStandalonePwa()).toBe(false);
  });

  it("triggers tactile pulse using navigator.vibrate when supported", () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateMock,
      configurable: true,
    });

    triggerTactileHapticPulse(30);
    expect(vibrateMock).toHaveBeenCalledWith([30]);
  });

  it("falls back to Web Audio tactile pulse when navigator.vibrate is missing", () => {
    Object.defineProperty(navigator, "vibrate", {
      value: undefined,
      configurable: true,
    });

    const mockStart = vi.fn();
    const mockStop = vi.fn();
    const mockConnect = vi.fn();
    const mockSetValueAtTime = vi.fn();
    const mockExponentialRamp = vi.fn();

    const mockAudioContext = vi.fn().mockImplementation(() => ({
      state: "running",
      currentTime: 0,
      createOscillator: () => ({
        type: "sine",
        frequency: { setValueAtTime: mockSetValueAtTime },
        connect: mockConnect,
        start: mockStart,
        stop: mockStop,
      }),
      createGain: () => ({
        gain: {
          setValueAtTime: mockSetValueAtTime,
          exponentialRampToValueAtTime: mockExponentialRamp,
        },
        connect: mockConnect,
      }),
      destination: {},
      close: vi.fn(),
    }));

    (window as any).AudioContext = mockAudioContext;

    expect(() => triggerTactileHapticPulse(35)).not.toThrow();
    expect(mockStart).toHaveBeenCalled();
  });

  it("triggers panic exit immediately on visibilitychange to 'hidden' (App Switcher Evasion)", () => {
    const onPanicExit = vi.fn();
    const cleanup = attachIosStealthSentinel({ onPanicExit });

    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });

    document.dispatchEvent(new Event("visibilitychange"));
    expect(onPanicExit).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("triggers panic exit on pagehide event", () => {
    const onPanicExit = vi.fn();
    const cleanup = attachIosStealthSentinel({ onPanicExit });

    window.dispatchEvent(new Event("pagehide"));
    expect(onPanicExit).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("triggers panic exit on high acceleration devicemotion shake gesture", () => {
    const onPanicExit = vi.fn();
    const cleanup = attachIosStealthSentinel({
      onPanicExit,
      shakeThreshold: 20,
    });

    const motionEvent = new Event("devicemotion") as any;
    motionEvent.accelerationIncludingGravity = { x: 15, y: 15, z: 15 };

    window.dispatchEvent(motionEvent);
    expect(onPanicExit).toHaveBeenCalled();

    cleanup();
  });
});
