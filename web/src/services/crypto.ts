/**
 * Web Crypto API AES-256-GCM Client-Side Zero-Knowledge Encryption
 * Hardened with PBKDF2 Key Derivation (100,000 iterations, SHA-256).
 * Non-extractable AES-256-GCM keys derived from local entropy/salt and optional user PIN.
 *
 * Wire format matches Android VaultEncryptionHelper.kt:
 * Format: "ENC:" + Base64( [12 bytes IV] + [Ciphertext + 16 bytes AuthTag] )
 *
 * CRITICAL LIFE-SAFETY REQUIREMENTS:
 * 1. Zero static hardcoded seeds in code.
 * 2. In encryptData(): failure throws or returns empty string—NEVER return plaintext.
 * 3. In decryptData(): authenticated GCM tag verification, gracefully handled.
 * 4. calculateSha256(): deterministic statutory hashes for ECTA Section 15 evidence integrity.
 */

// De-identified innocuous facade storage keys for entropy & salt
const ENTROPY_STORAGE_KEY = "pcalc_sys_entropy";
const DEVICE_SEED_STORAGE_KEY = "pcalc_dev_seed";

// In-memory key & salt cache to accelerate frequent operations while allowing 0ms wipe
let cachedSalt: Uint8Array | null = null;
let cachedKeyMap = new Map<string, CryptoKey>();

/**
 * Synchronously purges all in-memory derived cryptographic keys.
 * Invoked during 0ms panic camouflage exits.
 */
export function clearCryptoKeyCache(): void {
  cachedKeyMap.clear();
  cachedSalt = null;
}

/**
 * Retrieves or generates a device-unique cryptographically secure 16-byte salt.
 * Persisted in obfuscated facade storage.
 */
export function getOrCreateDeviceSalt(): Uint8Array {
  if (cachedSalt && cachedSalt.length === 16) {
    return cachedSalt;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(ENTROPY_STORAGE_KEY);
      if (stored) {
        const binary = atob(stored);
        const salt = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          salt[i] = binary.charCodeAt(i);
        }
        if (salt.length === 16) {
          cachedSalt = salt;
          return salt;
        }
      }
    } catch {
      // storage access restricted or invalid base64
    }
  }

  // Generate 16 bytes of cryptographically secure random entropy
  const salt = crypto.getRandomValues(new Uint8Array(16));
  cachedSalt = salt;

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      let binary = "";
      for (let i = 0; i < salt.length; i++) {
        binary += String.fromCharCode(salt[i]);
      }
      window.localStorage.setItem(ENTROPY_STORAGE_KEY, btoa(binary));
    } catch {
      // fallback if storage disabled
    }
  }

  return salt;
}

/**
 * Retrieves or generates a device-unique root random seed string.
 * Persisted in obfuscated facade storage.
 */
function getOrCreateDeviceSeed(): string {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(DEVICE_SEED_STORAGE_KEY);
      if (stored && stored.length >= 16) {
        return stored;
      }
    } catch {
      // storage access restricted
    }
  }

  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (let i = 0; i < randomBytes.length; i++) {
    binary += String.fromCharCode(randomBytes[i]);
  }
  const seed = btoa(binary);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(DEVICE_SEED_STORAGE_KEY, seed);
    } catch {
      // fallback
    }
  }

  return seed;
}

/**
 * Derives a non-extractable 256-bit AES-GCM CryptoKey using PBKDF2
 * with 100,000 iterations and SHA-256 hashing.
 */
export async function deriveKey(pin?: string): Promise<CryptoKey> {
  const cacheKey = pin ? `pin:${pin.trim()}` : "__device_root__";
  const existingKey = cachedKeyMap.get(cacheKey);
  if (existingKey) {
    return existingKey;
  }

  const salt = getOrCreateDeviceSalt();
  const secretMaterial = pin && pin.trim().length > 0
    ? `vault_pin:${pin.trim()}`
    : `vault_dev:${getOrCreateDeviceSeed()}`;

  const enc = new TextEncoder();
  const rawSecret = enc.encode(secretMaterial);

  // 1. Import raw secret as PBKDF2 base key material
  const baseKey = await crypto.subtle.importKey(
    "raw",
    rawSecret,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // 2. Derive non-extractable AES-256-GCM key (100,000 iterations)
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false, // Non-extractable: protects key from memory scraping
    ["encrypt", "decrypt"]
  );

  cachedKeyMap.set(cacheKey, derivedKey);
  return derivedKey;
}

/**
 * Encrypts arbitrary plaintext using AES-256-GCM with a fresh 12-byte IV.
 * CRITICAL SAFETY: If encryption fails, throws an Error. Plaintext is NEVER returned.
 */
export async function encryptData(plainText: string, pin?: string): Promise<string> {
  if (!plainText) return "";
  try {
    const key = await deriveKey(pin);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuffer), iv.length);

    let binary = "";
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return "ENC:" + btoa(binary);
  } catch (error) {
    console.error("Encryption error:", error);
    // LIFE-SAFETY: Zero-plaintext fallback enforced
    throw new Error("Encryption failed: zero-plaintext fallback enforced.");
  }
}

/**
 * Decrypts an "ENC:" prefixed AES-256-GCM ciphertext payload.
 * Authenticated tag verification is performed automatically by AES-GCM.
 * Handles corrupted or tampered inputs gracefully, returning input or throwing on strict mode.
 */
export async function decryptData(
  encryptedText: string,
  pin?: string,
  options?: { throwOnAuthFailure?: boolean }
): Promise<string> {
  if (!encryptedText || !encryptedText.startsWith("ENC:")) {
    return encryptedText;
  }
  try {
    const rawBase64 = encryptedText.replace("ENC:", "");
    let binary = "";
    try {
      binary = atob(rawBase64);
    } catch (e) {
      if (options?.throwOnAuthFailure) {
        throw new Error("Decryption failed: malformed base64 payload.");
      }
      return encryptedText;
    }

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length <= 12) {
      if (options?.throwOnAuthFailure) {
        throw new Error("Decryption failed: payload length less than 12-byte IV.");
      }
      return encryptedText;
    }

    const iv = bytes.slice(0, 12);
    const cipherText = bytes.slice(12);

    const key = await deriveKey(pin);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      cipherText
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    if (options?.throwOnAuthFailure) {
      throw error instanceof Error ? error : new Error("Decryption authenticated tag verification failed.");
    }
    console.error("Decryption error:", error);
    return encryptedText;
  }
}

/**
 * Strict decryption variant that throws an Error on invalid/tampered ciphertext.
 */
export async function decryptDataStrict(encryptedText: string, pin?: string): Promise<string> {
  return decryptData(encryptedText, pin, { throwOnAuthFailure: true });
}

/**
 * Computes deterministic SHA-256 hex checksum for South African Electronic
 * Communications and Transactions Act (ECTA Section 15) legal chain-of-custody.
 */
export async function calculateSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
