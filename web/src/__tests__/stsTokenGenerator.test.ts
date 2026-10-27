import { describe, it, expect } from "vitest";
import {
  generateStsToken,
  validateLuhn,
  computeLuhnCheckDigit,
  formatStsToken,
  sanitizeTokenDigits,
  DURESS_STS_TOKEN,
} from "../services/sts/stsTokenGenerator";

describe("STS Voucher Token Generator (IEC 62055-41 & Luhn Mod 10 Checksum)", () => {
  describe("generateStsToken", () => {
    it("generates a standard 20-digit token formatted in 5 blocks of 4 digits separated by hyphens by default", () => {
      const token = generateStsToken();

      // Format: XXXX-XXXX-XXXX-XXXX-XXXX
      expect(token).toMatch(/^\d{4}-\d{4}-\d{4}-\d{4}-\d{4}$/);
      expect(token).toHaveLength(24);

      const digitsOnly = sanitizeTokenDigits(token);
      expect(digitsOnly).toHaveLength(20);
    });

    it("supports configurable delimiter including spaces and raw formats", () => {
      const spaceToken = generateStsToken(" ");
      expect(spaceToken).toMatch(/^\d{4} \d{4} \d{4} \d{4} \d{4}$/);
      expect(spaceToken).toHaveLength(24);

      const rawToken = generateStsToken("");
      expect(rawToken).toMatch(/^\d{20}$/);
      expect(rawToken).toHaveLength(20);

      const optionsToken = generateStsToken({ delimiter: "." });
      expect(optionsToken).toMatch(/^\d{4}\.\d{4}\.\d{4}\.\d{4}\.\d{4}$/);
    });

    it("generates tokens that strictly satisfy the standard Luhn Mod 10 checksum algorithm", () => {
      // Test 50 randomly generated tokens to ensure 100% Luhn mathematical validity
      for (let i = 0; i < 50; i++) {
        const token = generateStsToken();
        expect(validateLuhn(token)).toBe(true);
      }
    });
  });

  describe("computeLuhnCheckDigit & validateLuhn", () => {
    it("computes exact Luhn Mod 10 check digit for known 19-digit prefixes", () => {
      // Known prefix: 1234567890123456789 -> check digit must be 4
      const prefix = "1234567890123456789";
      const checkDigit = computeLuhnCheckDigit(prefix);
      expect(checkDigit).toBe(4);

      const fullToken = prefix + checkDigit.toString();
      expect(validateLuhn(fullToken)).toBe(true);
    });

    it("detects single-digit tampering or transpositions as invalid", () => {
      const validToken = generateStsToken();
      expect(validateLuhn(validToken)).toBe(true);

      const digits = sanitizeTokenDigits(validToken).split("");

      // Alter the check digit (last digit)
      const lastDigit = parseInt(digits[19], 10);
      digits[19] = ((lastDigit + 1) % 10).toString();
      const tamperedCheckDigit = digits.join("");
      expect(validateLuhn(tamperedCheckDigit)).toBe(false);

      // Alter a leading digit
      const firstDigit = parseInt(digits[0], 10);
      digits[0] = ((firstDigit + 1) % 10).toString();
      const tamperedLeading = digits.join("");
      expect(validateLuhn(tamperedLeading)).toBe(false);
    });

    it("returns false for invalid token lengths or non-numeric input", () => {
      expect(validateLuhn("1234")).toBe(false);
      expect(validateLuhn("")).toBe(false);
      expect(validateLuhn("123456789012345678901")).toBe(false);
    });

    it("throws an error when computeLuhnCheckDigit is called with fewer than 19 digits", () => {
      expect(() => computeLuhnCheckDigit("123456")).toThrow(/Expected 19 digits/);
    });
  });

  describe("Sanitization & Formatting Utilities", () => {
    it("sanitizes token strings by stripping non-digit characters", () => {
      expect(sanitizeTokenDigits("1234-5678 9012.3456 abc 7890")).toBe("12345678901234567890");
      expect(sanitizeTokenDigits("   ")).toBe("");
    });

    it("formats 20 digits into 5 blocks of 4 digits", () => {
      const raw = "11112222333344445555";
      expect(formatStsToken(raw, "-")).toBe("1111-2222-3333-4444-5555");
      expect(formatStsToken(raw, " ")).toBe("1111 2222 3333 4444 5555");
      expect(formatStsToken(raw, "/")).toBe("1111/2222/3333/4444/5555");
    });
  });

  describe("Duress STS Voucher Token Constant", () => {
    it("exports authentic DURESS_STS_TOKEN for silent SOS decoy terminal", () => {
      expect(DURESS_STS_TOKEN).toBe("4819 0281 9481 0294 8812");
      expect(DURESS_STS_TOKEN).toMatch(/^\d{4} \d{4} \d{4} \d{4} \d{4}$/);
    });
  });
});
