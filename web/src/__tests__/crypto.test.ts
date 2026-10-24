import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, calculateSha256 } from '../services/crypto';

describe('WebCrypto AES-256-GCM & SHA-256 Service', () => {
  describe('calculateSha256', () => {
    it('produces correct standard 64-char lowercase hex hash for empty string', async () => {
      const hash = await calculateSha256('');
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces correct standard hash for known test vector "test"', async () => {
      const hash = await calculateSha256('test');
      expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    });

    it('produces deterministic hashes for incident records and payloads', async () => {
      const payload = JSON.stringify({
        incidentType: 'Physical',
        location: 'Soweto, Johannesburg',
        timestamp: 1729771200000
      });
      const hash1 = await calculateSha256(payload);
      const hash2 = await calculateSha256(payload);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('encryptData and decryptData (Roundtrip & Android Compatibility)', () => {
    it('returns empty string when given empty input', async () => {
      const enc = await encryptData('');
      expect(enc).toBe('');

      const dec = await decryptData('');
      expect(dec).toBe('');
    });

    it('encrypts data with "ENC:" prefix and valid base64 payload', async () => {
      const plain = 'Confidential safety incident narrative';
      const encrypted = await encryptData(plain);

      expect(encrypted.startsWith('ENC:')).toBe(true);
      const base64Part = encrypted.replace('ENC:', '');
      expect(() => atob(base64Part)).not.toThrow();

      // Check wire length: 12 bytes IV + length(plain) + 16 bytes GCM AuthTag
      const binary = atob(base64Part);
      expect(binary.length).toBe(12 + plain.length + 16);
    });

    it('successfully roundtrips plain text through encryption and decryption', async () => {
      const original = 'Perpetrator vehicle: White Toyota Quantum Reg: CA 842-192';
      const encrypted = await encryptData(original);
      const decrypted = await decryptData(encrypted);

      expect(decrypted).toBe(original);
    });

    it('successfully encrypts and decrypts multiline text and complex JSON payloads', async () => {
      const jsonPayload = JSON.stringify({
        victimId: 'victim-04812',
        notes: 'Emergency medical assistance required.\nHead injury, bruised arm.\nAttending TCC: Chris Hani Baragwanath.',
        lat: -26.2612,
        lng: 27.9421,
        witnessCount: 2
      });

      const encrypted = await encryptData(jsonPayload);
      const decrypted = await decryptData(encrypted);

      expect(decrypted).toBe(jsonPayload);
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(jsonPayload));
    });

    it('handles South African multilingual Unicode characters (isiZulu, Afrikaans, Sesotho)', async () => {
      const saText = 'Ukuphepha kwabantu besifazane: Umkhuseli ulapha ukukusiza. Noodgeval waarskuwing!';
      const encrypted = await encryptData(saText);
      const decrypted = await decryptData(encrypted);

      expect(decrypted).toBe(saText);
    });

    it('passes unencrypted text through untouched when it lacks "ENC:" prefix', async () => {
      const plain = 'Standard unencrypted text';
      const result = await decryptData(plain);
      expect(result).toBe(plain);
    });

    it('handles corrupted or tampered ciphertext gracefully without crashing', async () => {
      const original = 'Secret vault note';
      const encrypted = await encryptData(original);

      // Corrupt the base64 ciphertext
      const base64 = encrypted.replace('ENC:', '');
      const corruptedBase64 = base64.substring(0, base64.length - 4) + 'AAAA';
      const corrupted = 'ENC:' + corruptedBase64;

      // Should catch decryption error and return input gracefully
      const result = await decryptData(corrupted);
      expect(result).toBe(corrupted);
    });

    it('handles malformed base64 strings gracefully without throwing unhandled exceptions', async () => {
      const malformed = 'ENC:not-valid-base-64-!!!@#$%^&*()';
      const result = await decryptData(malformed);
      expect(result).toBe(malformed);
    });

    it('handles truncated payload where decoded bytes are 12 bytes or less', async () => {
      // 12 bytes base64 encoded
      const shortBinary = '123456789012'; // exactly 12 bytes
      const shortEnc = 'ENC:' + btoa(shortBinary);

      const result = await decryptData(shortEnc);
      expect(result).toBe(shortEnc);
    });

    it('matches Android KeyStore binary format layout: [12-byte IV][Ciphertext + 16-byte GCM Tag]', async () => {
      const testText = 'Android-Vault-Interoperability-Check';
      const encrypted = await encryptData(testText);
      const rawBase64 = encrypted.replace('ENC:', '');
      const binary = atob(rawBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // 12 bytes IV
      const iv = bytes.slice(0, 12);
      expect(iv.length).toBe(12);

      // Ciphertext + Auth tag (AES-GCM adds 16-byte tag)
      const cipherAndTag = bytes.slice(12);
      expect(cipherAndTag.length).toBe(testText.length + 16);
    });
  });
});
