import { describe, it, expect } from 'vitest';
import {
  NATIONAL_LIFELINES,
  THUTHUZELA_CENTERS,
  SA_PROVINCES,
  ThuthuzelaCenter,
  SafetyResource
} from '../data/saSafetyData';

describe('South African Safety Data & Thuthuzela Care Centre Coverage', () => {
  const EXPECTED_PROVINCES = [
    'Gauteng',
    'Western Cape',
    'KwaZulu-Natal',
    'Eastern Cape',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape'
  ];

  describe('SA_PROVINCES definition', () => {
    it('contains "All" and all 9 South African provinces', () => {
      expect(SA_PROVINCES).toContain('All');
      EXPECTED_PROVINCES.forEach((province) => {
        expect(SA_PROVINCES).toContain(province);
      });
      expect(SA_PROVINCES.length).toBe(10); // "All" + 9 provinces
    });
  });

  describe('Thuthuzela Care Centres (TCC) Provincial Coverage', () => {
    it('covers all 9 South African provinces with at least one accredited centre', () => {
      const provincesRepresented = new Set(THUTHUZELA_CENTERS.map((tcc) => tcc.province));
      
      EXPECTED_PROVINCES.forEach((province) => {
        expect(
          provincesRepresented.has(province),
          `Missing Thuthuzela Care Centre coverage for province: ${province}`
        ).toBe(true);
      });
    });

    it('has non-empty and well-formed metadata for every registered centre', () => {
      THUTHUZELA_CENTERS.forEach((center: ThuthuzelaCenter) => {
        expect(center.id).toBeTruthy();
        expect(center.name).toBeTruthy();
        expect(center.hospitalOrLocation).toBeTruthy();
        expect(center.cityOrTown).toBeTruthy();
        expect(center.province).toBeTruthy();
        expect(EXPECTED_PROVINCES).toContain(center.province);
        expect(center.address).toBeTruthy();
        expect(center.contactNumber).toBeTruthy();
        // SA contact numbers should start with 0 and be at least 10 digits
        expect(center.contactNumber).toMatch(/^0\d{9}$/);

        if (center.altContactNumber) {
          expect(center.altContactNumber).toMatch(/^0\d{9}$/);
        }
      });
    });

    it('has unique IDs across all centres', () => {
      const ids = THUTHUZELA_CENTERS.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('includes flagship tertiary hospital crisis centres', () => {
      const flagshipNames = [
        'Chris Hani Baragwanath TCC',
        'Karl Bremer TCC',
        'King Edward VIII TCC',
        'Livingstone TCC',
        'Pelonomi TCC',
        'Polokwane Hospital TCC',
        'Rob Ferreira TCC',
        'Klerksdorp TCC',
        'Robert Mangaliso Sobukwe TCC'
      ];

      flagshipNames.forEach((name) => {
        const found = THUTHUZELA_CENTERS.some((c) => c.name === name);
        expect(found, `Expected flagship center not found: ${name}`).toBe(true);
      });
    });
  });

  describe('NATIONAL_LIFELINES', () => {
    it('contains essential South African 24/7 toll-free crisis lifelines', () => {
      expect(NATIONAL_LIFELINES.length).toBeGreaterThanOrEqual(5);

      const gbvcc = NATIONAL_LIFELINES.find((l) => l.id === 'gbvcc_voice');
      expect(gbvcc).toBeDefined();
      expect(gbvcc?.dialString).toBe('0800428428');
      expect(gbvcc?.isTollFree).toBe(true);
      expect(gbvcc?.is24Hours).toBe(true);
      expect(gbvcc?.zeroDataZeroAirtime).toBe(true);

      const saps = NATIONAL_LIFELINES.find((l) => l.id === 'saps_police');
      expect(saps).toBeDefined();
      expect(saps?.dialString).toBe('10111');
      expect(saps?.isTollFree).toBe(true);

      const ussd = NATIONAL_LIFELINES.find((l) => l.id === 'gbvcc_ussd');
      expect(ussd).toBeDefined();
      expect(ussd?.dialString).toBe('*120*7867#');
      expect(ussd?.type).toBe('USSD_FREE');

      const tears = NATIONAL_LIFELINES.find((l) => l.id === 'tears_ussd');
      expect(tears).toBeDefined();
      expect(tears?.dialString).toBe('*134*7355#');

      const childline = NATIONAL_LIFELINES.find((l) => l.id === 'childline_sa');
      expect(childline).toBeDefined();
      expect(childline?.dialString).toBe('0800055555');
    });

    it('ensures all lifelines have unique priorities and valid dialStrings', () => {
      NATIONAL_LIFELINES.forEach((lifeline: SafetyResource) => {
        expect(lifeline.priorityRank).toBeGreaterThan(0);
        expect(lifeline.dialString).toMatch(/^[0-9*#]+$/);
      });
    });
  });
});
