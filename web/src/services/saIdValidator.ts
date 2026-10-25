/**
 * South African 13-Digit National ID Validation & Decoding Service
 *
 * Implements strict Department of Home Affairs (DHA) standards:
 * Format: {YYMMDD}{SSSS}{C}{A}{Z}
 * - YYMMDD: Date of birth (with realistic century boundary & leap year logic)
 * - SSSS: Gender sequence (0000-4999 Female, 5000-9999 Male)
 * - C: Citizenship (0 = SA Citizen, 1 = Permanent Resident)
 * - A: Historical status digit (usually 8 or 9)
 * - Z: Strict Luhn Mod 10 checksum digit
 */

export type SaGender = 'Female' | 'Male';
export type SaCitizenship = 'Citizen' | 'Permanent Resident';

export type SaIdErrorCode =
  | 'INVALID_LENGTH'
  | 'INVALID_CHARACTERS'
  | 'INVALID_DATE'
  | 'INVALID_CITIZENSHIP'
  | 'INVALID_CHECKSUM';

export interface SaIdValidationResult {
  isValid: boolean;
  dateOfBirth?: Date;
  gender?: SaGender;
  citizenship?: SaCitizenship;
  age?: number;
  errorCode?: SaIdErrorCode;
  errorMessage?: string;
}

export interface SaIdValidationOptions {
  referenceDate?: Date;
}

/**
 * Checks whether a given year is a leap year according to Gregorian rules.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Gets the maximum number of days in a given month of a specific year.
 */
export function getDaysInMonth(year: number, month: number): number {
  switch (month) {
    case 1: // January
    case 3: // March
    case 5: // May
    case 7: // July
    case 8: // August
    case 10: // October
    case 12: // December
      return 31;
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      return 30;
    case 2: // February
      return isLeapYear(year) ? 29 : 28;
    default:
      return 0;
  }
}

/**
 * Computes the expected South African Luhn Mod 10 checksum digit for a 12 or 13-digit string.
 */
export function computeSaLuhnChecksum(first12Digits: string): number {
  if (first12Digits.length < 12) {
    throw new Error('Expected at least 12 digits to compute checksum');
  }

  // 1. Sum odd-indexed digits (1st, 3rd, 5th, 7th, 9th, 11th - index 0, 2, 4, 6, 8, 10)
  let sumOdd = 0;
  for (let i = 0; i < 11; i += 2) {
    sumOdd += parseInt(first12Digits.charAt(i), 10);
  }

  // 2. Concatenate even-indexed digits (2nd, 4th, 6th, 8th, 10th, 12th - index 1, 3, 5, 7, 9, 11)
  let evenStr = '';
  for (let i = 1; i < 12; i += 2) {
    evenStr += first12Digits.charAt(i);
  }

  // 3. Multiply even number by 2 and sum its digits
  const multiplied = parseInt(evenStr, 10) * 2;
  const multipliedStr = multiplied.toString();
  let sumEvenMultiplied = 0;
  for (let i = 0; i < multipliedStr.length; i++) {
    sumEvenMultiplied += parseInt(multipliedStr.charAt(i), 10);
  }

  // 4. Add the two sums
  const total = sumOdd + sumEvenMultiplied;

  // 5. Luhn check digit is (10 - (total % 10)) % 10
  return (10 - (total % 10)) % 10;
}

/**
 * Validates and decodes a South African 13-digit identity number.
 */
export function validateSouthAfricanId(
  idNumber: string,
  options?: SaIdValidationOptions
): SaIdValidationResult {
  if (typeof idNumber !== 'string') {
    return {
      isValid: false,
      errorCode: 'INVALID_CHARACTERS',
      errorMessage: 'ID number must be a string of digits',
    };
  }

  const sanitized = idNumber.trim();

  // 1. Length validation
  if (sanitized.length !== 13) {
    return {
      isValid: false,
      errorCode: 'INVALID_LENGTH',
      errorMessage: 'South African ID must be exactly 13 digits',
    };
  }

  // 2. Character validation (digits only)
  if (!/^\d{13}$/.test(sanitized)) {
    return {
      isValid: false,
      errorCode: 'INVALID_CHARACTERS',
      errorMessage: 'South African ID must contain numeric digits only',
    };
  }

  // 3. Strict Luhn Mod 10 Checksum verification
  const expectedChecksum = computeSaLuhnChecksum(sanitized.slice(0, 12));
  const actualChecksum = parseInt(sanitized.charAt(12), 10);

  if (actualChecksum !== expectedChecksum) {
    return {
      isValid: false,
      errorCode: 'INVALID_CHECKSUM',
      errorMessage: `Luhn checksum failed (expected ${expectedChecksum}, got ${actualChecksum})`,
    };
  }

  // 4. Date of Birth & Century Boundary resolution
  const refDate = options?.referenceDate || new Date();
  const currentYear = refDate.getFullYear();
  const currentYear2Digits = currentYear % 100;

  const yy = parseInt(sanitized.slice(0, 2), 10);
  const mm = parseInt(sanitized.slice(2, 4), 10);
  const dd = parseInt(sanitized.slice(4, 6), 10);

  // Determine century: if yy <= currentYear2Digits, assume 2000s; else 1900s
  const fullYear = yy <= currentYear2Digits ? 2000 + yy : 1900 + yy;

  if (mm < 1 || mm > 12) {
    return {
      isValid: false,
      errorCode: 'INVALID_DATE',
      errorMessage: `Invalid month: ${mm}`,
    };
  }

  const maxDays = getDaysInMonth(fullYear, mm);
  if (dd < 1 || dd > maxDays) {
    return {
      isValid: false,
      errorCode: 'INVALID_DATE',
      errorMessage: `Invalid day ${dd} for month ${mm} in year ${fullYear}`,
    };
  }

  const dob = new Date(Date.UTC(fullYear, mm - 1, dd));

  // Date of birth cannot be in the future
  if (dob.getTime() > refDate.getTime()) {
    return {
      isValid: false,
      errorCode: 'INVALID_DATE',
      errorMessage: 'Date of birth cannot be in the future',
    };
  }

  // Age calculation
  let age = refDate.getFullYear() - fullYear;
  const monthDiff = refDate.getMonth() - (mm - 1);
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < dd)) {
    age--;
  }

  // 5. Gender classification (SSSS: 0000-4999 Female, 5000-9999 Male)
  const genderCode = parseInt(sanitized.slice(6, 10), 10);
  const gender: SaGender = genderCode < 5000 ? 'Female' : 'Male';

  // 6. Citizenship classification (C: 0 = SA Citizen, 1 = Permanent Resident)
  const citizenshipCode = sanitized.charAt(10);
  let citizenship: SaCitizenship;
  if (citizenshipCode === '0') {
    citizenship = 'Citizen';
  } else if (citizenshipCode === '1') {
    citizenship = 'Permanent Resident';
  } else {
    return {
      isValid: false,
      errorCode: 'INVALID_CITIZENSHIP',
      errorMessage: `Invalid citizenship code ${citizenshipCode} (must be 0 or 1)`,
    };
  }

  return {
    isValid: true,
    dateOfBirth: dob,
    gender,
    citizenship,
    age,
  };
}
