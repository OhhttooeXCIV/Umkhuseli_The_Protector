/**
 * Standard Transfer Specification (STS) Token Generator
 * IEC 62055-41 compliant 20-digit prepaid electricity token generator with Luhn mod 10 checksum.
 */

export const DURESS_STS_TOKEN = "4819 0281 9481 0294 8812";

/**
 * Strips whitespace, dashes, and other non-digit characters from a token string.
 */
export function sanitizeTokenDigits(token: string): string {
  return token.replace(/\D/g, "");
}

/**
 * Computes the Luhn Mod 10 check digit for the first 19 digits of a 20-digit STS token.
 * Traverses right-to-left: odd positions from right have weight 2, even have weight 1.
 */
export function computeLuhnCheckDigit(first19Digits: string): number {
  const sanitized = sanitizeTokenDigits(first19Digits);
  if (sanitized.length < 19) {
    throw new Error(`Expected 19 digits to compute STS Luhn checksum, got ${sanitized.length}`);
  }

  const digits = sanitized.slice(0, 19);
  let sum = 0;

  for (let i = 0; i < 19; i++) {
    let d = parseInt(digits[i], 10);
    // Position from right (1-indexed from rightmost check digit position): k = 19 - i
    if ((19 - i) % 2 === 1) {
      d *= 2;
      if (d > 9) {
        d -= 9;
      }
    }
    sum += d;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Validates whether a 20-digit token satisfies the standard Luhn Mod 10 checksum algorithm.
 */
export function validateLuhn(token: string): boolean {
  const digits = sanitizeTokenDigits(token);
  if (digits.length !== 20) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 20; i++) {
    let d = parseInt(digits[19 - i], 10);
    // Weight 2 for odd positions from right (i = 1, 3, 5...)
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) {
        d -= 9;
      }
    }
    sum += d;
  }

  return sum % 10 === 0;
}

/**
 * Formats a 20-digit token string into 5 blocks of 4 digits separated by the specified delimiter.
 * Example with '-': "1234-5678-9012-3456-7890"
 * Example with ' ': "1234 5678 9012 3456 7890"
 */
export function formatStsToken(digits: string, delimiter: string = "-"): string {
  const clean = sanitizeTokenDigits(digits).padEnd(20, "0").slice(0, 20);
  const blocks: string[] = [];
  for (let i = 0; i < 20; i += 4) {
    blocks.push(clean.slice(i, i + 4));
  }
  return blocks.join(delimiter);
}

export interface StsTokenOptions {
  delimiter?: string;
  prefix?: string;
}

/**
 * Pure function: Generates a standard 20-digit STS voucher token
 * formatted in 5 blocks of 4 digits with a valid Luhn checksum.
 *
 * @param optionsOrDelimiter - Optional delimiter (default '-') or options object
 */
export function generateStsToken(optionsOrDelimiter?: string | StsTokenOptions): string {
  const delimiter =
    typeof optionsOrDelimiter === "string"
      ? optionsOrDelimiter
      : optionsOrDelimiter?.delimiter ?? "-";

  // Generate 19 random digits
  // Ensure the leading digit is 1-9 so it does not look like a null/empty prefix
  const firstDigit = Math.floor(1 + Math.random() * 9).toString();
  let first19 = firstDigit;

  for (let i = 1; i < 19; i++) {
    first19 += Math.floor(Math.random() * 10).toString();
  }

  const checkDigit = computeLuhnCheckDigit(first19);
  const full20Digits = first19 + checkDigit.toString();

  return formatStsToken(full20Digits, delimiter);
}
