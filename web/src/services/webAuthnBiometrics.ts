/**
 * Umkhuseli: The Protector (Sankofa Safe)
 * WebAuthn Biometrics Engine (Apple Face ID / Touch ID)
 *
 * Provides Apple Secure Enclave hardware-backed biometric authentication
 * for iOS Safari and Standalone WebKit PWAs via the W3C Web Authentication API.
 * Maps directly to Face ID on iPhone X/11/12/13/14/15/16 and Touch ID on iPhone SE / iPad.
 */

const CREDENTIAL_STORAGE_KEY = "umkhuseli_faceid_cred_id";
const BIOMETRIC_ENABLED_KEY = "umkhuseli_faceid_enabled";

/**
 * Checks if the browser supports the W3C Web Authentication API
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials !== "undefined"
  );
}

/**
 * Checks if a platform authenticator (e.g. Apple Face ID, Touch ID, Windows Hello) is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Checks if the user has already enrolled Face ID / Touch ID on this device
 */
export function hasBiometricEnrollment(): boolean {
  if (typeof localStorage === "undefined") return false;
  return Boolean(
    localStorage.getItem(CREDENTIAL_STORAGE_KEY) &&
      localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true"
  );
}

/**
 * Enrolls device Face ID / Touch ID by creating a platform credential in the Secure Enclave
 */
export async function enrollBiometricCredential(
  userId: string = "sankofa_safe_survivor",
  displayName: string = "Umkhuseli Safe Haven"
): Promise<{ success: boolean; error?: string }> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: "WebAuthn not supported on this device" };
  }

  try {
    const challenge = new Uint8Array(32);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(challenge);
    }

    const userIdBytes = new TextEncoder().encode(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "Umkhuseli Safe Haven",
        id: window.location.hostname || "localhost",
      },
      user: {
        id: userIdBytes,
        name: userId,
        displayName: displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },  // ES256 (NIST P-256) - Apple Secure Enclave default
        { alg: -257, type: "public-key" } // RS256 fallback
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Enforces built-in Apple Face ID / Touch ID
        userVerification: "required",        // Requires biometric or device passcode
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: "Enrollment returned null credential" };
    }

    // Convert credential ID to base64 for persistent local device storage
    const rawIdBuffer = new Uint8Array(credential.rawId);
    let binary = "";
    for (let i = 0; i < rawIdBuffer.byteLength; i++) {
      binary += String.fromCharCode(rawIdBuffer[i]);
    }
    const credIdBase64 = btoa(binary);

    localStorage.setItem(CREDENTIAL_STORAGE_KEY, credIdBase64);
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Challenges the user via Apple Face ID or Touch ID to authenticate access
 */
export async function authenticateWithBiometrics(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: "WebAuthn is not supported" };
  }

  const storedCredId = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
  if (!storedCredId) {
    return { success: false, error: "No biometric credentials enrolled on this device" };
  }

  try {
    // Decode stored credential ID
    const binary = atob(storedCredId);
    const credIdBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      credIdBytes[i] = binary.charCodeAt(i);
    }

    const challenge = new Uint8Array(32);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(challenge);
    }

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      rpId: window.location.hostname || "localhost",
      allowCredentials: [
        {
          id: credIdBytes,
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "required", // Triggers Face ID prompt
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;

    if (assertion && assertion.id) {
      return { success: true };
    }

    return { success: false, error: "Biometric assertion failed" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Clears enrolled biometrics from this device
 */
export function disableBiometrics(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
}
