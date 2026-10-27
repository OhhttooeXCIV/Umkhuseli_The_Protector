import { describe, it, expect } from "vitest";
import {
  calculateMunicipalUnits,
  getMunicipalityById,
  getTariffStrategy,
  calculateVat,
  calculateNet,
  calculateSteppedInclineUnits,
  MUNICIPAL_TARIFFS,
  VAT_RATE,
  EskomTariffStrategy,
  CityPowerTariffStrategy,
  TshwaneTariffStrategy,
  EkurhuleniTariffStrategy,
  CapeTownTariffStrategy,
  MangaungTariffStrategy,
} from "../services/tariffs/municipalTariffEngine";

describe("Municipal Electricity Tariff Engine (Strategy & IBT Math)", () => {
  describe("15% South African VAT Calculations", () => {
    it("computes exact VAT and net amounts for standard municipal purchases", () => {
      expect(VAT_RATE).toBe(0.15);

      // R200 purchase: VAT = (200 * 0.15) / 1.15 = 26.086956... -> 26.09
      const vat200 = calculateVat(200);
      const net200 = calculateNet(200);
      expect(vat200.toFixed(2)).toBe("26.09");
      expect(net200.toFixed(2)).toBe("173.91");
      expect(vat200 + net200).toBeCloseTo(200, 6);

      // R50 purchase: VAT = (50 * 0.15) / 1.15 = 6.521739... -> 6.52
      const vat50 = calculateVat(50);
      const net50 = calculateNet(50);
      expect(vat50.toFixed(2)).toBe("6.52");
      expect(net50.toFixed(2)).toBe("43.48");
      expect(vat50 + net50).toBeCloseTo(50, 6);

      // R500 purchase: VAT = (500 * 0.15) / 1.15 = 65.21739... -> 65.22
      const vat500 = calculateVat(500);
      const net500 = calculateNet(500);
      expect(vat500.toFixed(2)).toBe("65.22");
      expect(net500.toFixed(2)).toBe("434.78");
      expect(vat500 + net500).toBeCloseTo(500, 6);
    });

    it("returns zero for zero, negative, or invalid amounts", () => {
      expect(calculateVat(0)).toBe(0);
      expect(calculateNet(0)).toBe(0);
      expect(calculateVat(-100)).toBe(0);
      expect(calculateNet(-100)).toBe(0);
      expect(calculateVat(NaN)).toBe(0);
      expect(calculateNet(NaN)).toBe(0);
    });
  });

  describe("Municipality Registry & Strategy Pattern", () => {
    it("includes all 6 core South African municipalities plus major metros", () => {
      const muniIds = MUNICIPAL_TARIFFS.map((m) => m.id);
      expect(muniIds).toContain("city-power");
      expect(muniIds).toContain("eskom");
      expect(muniIds).toContain("tshwane");
      expect(muniIds).toContain("ekurhuleni");
      expect(muniIds).toContain("cape-town");
      expect(muniIds).toContain("mangaung");

      expect(MUNICIPAL_TARIFFS.length).toBeGreaterThanOrEqual(6);
    });

    it("retrieves municipalities by id, name, or case-insensitive partial match", () => {
      const cityPower = getMunicipalityById("city-power");
      expect(cityPower).toBeDefined();
      expect(cityPower?.name).toBe("City Power (Johannesburg)");
      expect(cityPower?.ratePerKwh).toBe(2.45);

      const eskom = getMunicipalityById("Eskom Direct Residential");
      expect(eskom).toBeDefined();
      expect(eskom?.id).toBe("eskom");
      expect(eskom?.ratePerKwh).toBe(2.22);

      const tshwane = getMunicipalityById("tshwane");
      expect(tshwane?.name).toBe("City of Tshwane (Pretoria)");
      expect(tshwane?.ratePerKwh).toBe(2.50);

      const capeTown = getMunicipalityById("City of Cape Town");
      expect(capeTown?.ratePerKwh).toBe(2.38);

      const ekurhuleni = getMunicipalityById("City of Ekurhuleni (Boksburg / East Rand)");
      expect(ekurhuleni?.ratePerKwh).toBe(2.42);

      const mangaung = getMunicipalityById("Mangaung Metro (Bloemfontein)");
      expect(mangaung?.ratePerKwh).toBe(2.48);
    });

    it("instantiates concrete strategy classes with accurate NERSA block tariffs", () => {
      const eskomStrategy = new EskomTariffStrategy();
      expect(eskomStrategy.id).toBe("eskom");
      expect(eskomStrategy.ratePerKwh).toBe(2.22);
      expect(eskomStrategy.block1).toBe(1.67);
      expect(eskomStrategy.block2).toBe(2.22);

      const cpStrategy = new CityPowerTariffStrategy();
      expect(cpStrategy.id).toBe("city-power");
      expect(cpStrategy.ratePerKwh).toBe(2.45);
      expect(cpStrategy.block1).toBe(1.85);
      expect(cpStrategy.block2).toBe(2.45);

      const tshwaneStrategy = new TshwaneTariffStrategy();
      expect(tshwaneStrategy.ratePerKwh).toBe(2.50);
      expect(tshwaneStrategy.block1).toBe(1.90);

      const ekurhuleniStrategy = new EkurhuleniTariffStrategy();
      expect(ekurhuleniStrategy.ratePerKwh).toBe(2.42);
      expect(ekurhuleniStrategy.block1).toBe(1.82);

      const capeTownStrategy = new CapeTownTariffStrategy();
      expect(capeTownStrategy.ratePerKwh).toBe(2.38);
      expect(capeTownStrategy.block1).toBe(1.79);

      const mangaungStrategy = new MangaungTariffStrategy();
      expect(mangaungStrategy.ratePerKwh).toBe(2.48);
      expect(mangaungStrategy.block1).toBe(1.88);
    });
  });

  describe("Stepped Incline Block Tariff (IBT) Calculations", () => {
    it("allocates 100% of units to Block 1 when net spend is under the 350 kWh threshold", () => {
      // Threshold 350 kWh at R1.85 (City Power Block 1) = R647.50 net
      // For R200 purchase: Net = 173.913043...
      const net = calculateNet(200);
      const stepped = calculateSteppedInclineUnits(net, 1.85, 2.45, 350);

      // 173.913043 / 1.85 = 94.007... kWh
      expect(stepped.block1Units).toBeCloseTo(94.007, 2);
      expect(stepped.block2Units).toBe(0);
      expect(stepped.totalUnits).toBeCloseTo(94.007, 2);
    });

    it("splits units across Block 1 and Block 2 when net spend exceeds the 350 kWh threshold", () => {
      // City Power: Block 1 rate = 1.85 (cap 350 kWh = R647.50), Block 2 rate = 2.45
      // Gross R1,000 purchase:
      // VAT = (1000 * 0.15) / 1.15 = 130.43478
      // Net = 869.565217
      const net = calculateNet(1000);
      const stepped = calculateSteppedInclineUnits(net, 1.85, 2.45, 350);

      expect(stepped.block1Units).toBe(350);
      // Remaining net = 869.565217 - 647.50 = 222.065217
      // Block 2 units = 222.065217 / 2.45 = 90.6388...
      expect(stepped.block2Units).toBeCloseTo(90.639, 2);
      expect(stepped.totalUnits).toBeCloseTo(350 + 90.639, 2);
    });
  });

  describe("calculateMunicipalUnits Helper Function", () => {
    it("matches standard calculator expectations for City Power R200 purchase (71.0 kWh)", () => {
      const res = calculateMunicipalUnits("city-power", 200);
      expect(res.unitsKwh.toFixed(1)).toBe("71.0");
      expect(res.vat.toFixed(2)).toBe("26.09");
      expect(res.net.toFixed(2)).toBe("173.91");
      expect(res.ratePerKwh).toBe(2.45);
      expect(res.municipalityId).toBe("city-power");
    });

    it("matches standard calculator expectations for Eskom R200 purchase (78.3 kWh)", () => {
      const res = calculateMunicipalUnits("Eskom Direct Residential", 200);
      expect(res.unitsKwh.toFixed(1)).toBe("78.3");
      expect(res.ratePerKwh).toBe(2.22);
      expect(res.municipalityId).toBe("eskom");
    });

    it("matches standard calculator expectations for City Power R500 purchase (177.5 kWh)", () => {
      const res = calculateMunicipalUnits("city-power", 500);
      expect(res.unitsKwh.toFixed(1)).toBe("177.5");
      expect(res.vat.toFixed(2)).toBe("65.22");
      expect(res.net.toFixed(2)).toBe("434.78");
    });

    it("provides stepped incline block units when useStepped option is enabled", () => {
      const res = calculateMunicipalUnits("city-power", 200, { useStepped: true });
      expect(res.unitsKwh).toBe(res.steppedUnitsKwh);
      expect(res.block1Units).toBeGreaterThan(0);
      expect(res.block2Units).toBe(0);
    });
  });
});
