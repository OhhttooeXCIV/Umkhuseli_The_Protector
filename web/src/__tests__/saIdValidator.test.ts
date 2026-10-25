import { describe, it, expect } from 'vitest';
import {
  validateSouthAfricanId,
  computeSaLuhnChecksum,
  isLeapYear,
  getDaysInMonth,
} from '../services/saIdValidator';

describe('South African 13-Digit ID Validation Service', () => {
  const refDate2026 = new Date('2026-10-25T12:00:00Z');

  describe('isLeapYear & getDaysInMonth helper functions', () => {
    it('identifies century and regular leap years accurately', () => {
      expect(isLeapYear(2000)).toBe(true); // Divisible by 400
      expect(isLeapYear(2004)).toBe(true); // Divisible by 4
      expect(isLeapYear(1900)).toBe(false); // Divisible by 100 but not 400
      expect(isLeapYear(1997)).toBe(false); // Non-leap year
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2026)).toBe(false);
    });

    it('returns exact days in month, including February leap logic', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
      expect(getDaysInMonth(2025, 2)).toBe(28);
      expect(getDaysInMonth(2026, 4)).toBe(30);
      expect(getDaysInMonth(2026, 1)).toBe(31);
      expect(getDaysInMonth(2026, 13)).toBe(0);
    });
  });

  describe('computeSaLuhnChecksum', () => {
    it('computes exact DHA Luhn check digits for valid ID prefixes', () => {
      expect(computeSaLuhnChecksum('850118024508')).toBe(5);
      expect(computeSaLuhnChecksum('900625582908')).toBe(5);
      expect(computeSaLuhnChecksum('040229012318')).toBe(9);
      expect(computeSaLuhnChecksum('000229512308')).toBe(3);
    });

    it('throws error when input has fewer than 12 digits', () => {
      expect(() => computeSaLuhnChecksum('850118')).toThrow();
    });
  });

  describe('Valid ID Parsing, Demographics & Age Extraction', () => {
    it('validates a female citizen born in 1985', () => {
      const result = validateSouthAfricanId('8501180245085', {
        referenceDate: refDate2026,
      });

      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Female');
      expect(result.citizenship).toBe('Citizen');
      expect(result.dateOfBirth).toEqual(new Date(Date.UTC(1985, 0, 18)));
      expect(result.age).toBe(41);
      expect(result.errorCode).toBeUndefined();
    });

    it('validates a male citizen born in 1990', () => {
      const result = validateSouthAfricanId('9006255829085', {
        referenceDate: refDate2026,
      });

      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Male');
      expect(result.citizenship).toBe('Citizen');
      expect(result.dateOfBirth).toEqual(new Date(Date.UTC(1990, 5, 25)));
      expect(result.age).toBe(36);
    });

    it('validates a female permanent resident born on leap day 2004', () => {
      const result = validateSouthAfricanId('0402290123189', {
        referenceDate: refDate2026,
      });

      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Female');
      expect(result.citizenship).toBe('Permanent Resident');
      expect(result.dateOfBirth).toEqual(new Date(Date.UTC(2004, 1, 29)));
      expect(result.age).toBe(22);
    });

    it('validates a male citizen born on century leap day 2000', () => {
      const result = validateSouthAfricanId('0002295123083', {
        referenceDate: refDate2026,
      });

      expect(result.isValid).toBe(true);
      expect(result.gender).toBe('Male');
      expect(result.citizenship).toBe('Citizen');
      expect(result.dateOfBirth).toEqual(new Date(Date.UTC(2000, 1, 29)));
      expect(result.age).toBe(26);
    });
  });

  describe('Strict Error Handling & Rejection', () => {
    it('rejects IDs with invalid checksum (tampered or mistyped digits)', () => {
      // 8501180245085 is valid; change checksum to 6
      const result = validateSouthAfricanId('8501180245086');
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_CHECKSUM');
    });

    it('rejects IDs with invalid length', () => {
      expect(validateSouthAfricanId('850118024508').errorCode).toBe('INVALID_LENGTH');
      expect(validateSouthAfricanId('85011802450855').errorCode).toBe('INVALID_LENGTH');
    });

    it('rejects non-numeric characters', () => {
      const result = validateSouthAfricanId('850118024508A');
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_CHARACTERS');
    });

    it('rejects Feb 29 on non-leap years (e.g. 1997)', () => {
      // 9702295123089 has valid Luhn checksum for the digits, but 1997 is not a leap year
      const result = validateSouthAfricanId('9702295123089', {
        referenceDate: refDate2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_DATE');
    });

    it('rejects invalid months (e.g. month 13 or 00)', () => {
      // Month 13
      const check = computeSaLuhnChecksum('901325582908');
      const result = validateSouthAfricanId(`901325582908${check}`, {
        referenceDate: refDate2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_DATE');
    });

    it('rejects invalid days (e.g. April 31)', () => {
      // April has 30 days
      const check = computeSaLuhnChecksum('900431582908');
      const result = validateSouthAfricanId(`900431582908${check}`, {
        referenceDate: refDate2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_DATE');
    });

    it('rejects invalid citizenship codes (other than 0 or 1)', () => {
      // Citizenship code 2
      const check = computeSaLuhnChecksum('900625582928');
      const result = validateSouthAfricanId(`900625582928${check}`, {
        referenceDate: refDate2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_CITIZENSHIP');
    });

    it('rejects future dates of birth', () => {
      // Born in December 2026 when refDate is Jan 2026
      const check = computeSaLuhnChecksum('261201582908');
      const result = validateSouthAfricanId(`261201582908${check}`, {
        referenceDate: new Date('2026-01-01T00:00:00Z'),
      });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_DATE');
    });
  });
});
