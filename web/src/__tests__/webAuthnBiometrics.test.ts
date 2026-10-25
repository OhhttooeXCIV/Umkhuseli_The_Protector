import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  hasBiometricEnrollment,
  enrollBiometricCredential,
  authenticateWithBiometrics,
  disableBiometrics,
} from "../services/webAuthnBiometrics";

describe("WebAuthn Biometrics Engine (Face ID / Touch ID)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("checks WebAuthn API availability", () => {
    (window as any).PublicKeyCredential = {};
    (navigator as any).credentials = {};
    expect(isWebAuthnSupported()).toBe(true);
  });

  it("checks platform authenticator capability", async () => {
    (window as any).PublicKeyCredential = {
      isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
    };
    (navigator as any).credentials = {};

    const available = await isPlatformAuthenticatorAvailable();
    expect(available).toBe(true);
  });

  it("enrolls Face ID credential and persists credential reference", async () => {
    const rawIdBytes = new Uint8Array([1, 2, 3, 4, 5]);
    const mockCred = {
      id: "mock_faceid_credential_id",
      rawId: rawIdBytes.buffer,
      type: "public-key",
    };

    (window as any).PublicKeyCredential = {
      isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
    };
    (navigator as any).credentials = {
      create: vi.fn().mockResolvedValue(mockCred),
    };

    const result = await enrollBiometricCredential("survivor_user", "Safe Haven Vault");
    expect(result.success).toBe(true);
    expect(hasBiometricEnrollment()).toBe(true);
  });

  it("authenticates using Face ID assertion", async () => {
    // First setup enrollment
    const rawIdBytes = new Uint8Array([10, 20, 30, 40]);
    let binary = "";
    for (let i = 0; i < rawIdBytes.byteLength; i++) {
      binary += String.fromCharCode(rawIdBytes[i]);
    }
    const credIdBase64 = btoa(binary);
    localStorage.setItem("umkhuseli_faceid_cred_id", credIdBase64);
    localStorage.setItem("umkhuseli_faceid_enabled", "true");

    (window as any).PublicKeyCredential = {};
    (navigator as any).credentials = {
      get: vi.fn().mockResolvedValue({ id: "mock_faceid_assertion" }),
    };

    const authResult = await authenticateWithBiometrics();
    expect(authResult.success).toBe(true);
  });

  it("fails gracefully when biometrics are not enrolled", async () => {
    (window as any).PublicKeyCredential = {};
    (navigator as any).credentials = {};

    const authResult = await authenticateWithBiometrics();
    expect(authResult.success).toBe(false);
    expect(authResult.error).toContain("No biometric credentials enrolled");
  });

  it("disables enrolled biometrics and cleans storage", () => {
    localStorage.setItem("umkhuseli_faceid_cred_id", "test");
    localStorage.setItem("umkhuseli_faceid_enabled", "true");

    disableBiometrics();
    expect(hasBiometricEnrollment()).toBe(false);
  });
});
