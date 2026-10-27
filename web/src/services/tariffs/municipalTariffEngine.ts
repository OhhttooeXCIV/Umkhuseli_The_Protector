/**
 * South African Municipal Electricity Tariff Engine
 * Single Responsibility Principle (SRP) & Strategy Pattern implementation
 * for NERSA-approved Incline Block Tariffs (IBT) & 15% VAT calculations.
 */

export const VAT_RATE = 0.15;
export const DEFAULT_BLOCK1_THRESHOLD_KWH = 350;

export interface MunicipalityTariff {
  id: string;
  name: string;
  province: string;
  ratePerKwh: number;
  block1: number; // 0-350 kWh lifeline rate
  block2: number; // 350+ kWh standard rate
  block1ThresholdKwh: number;
}

export interface SteppedUnitsResult {
  totalUnits: number;
  block1Units: number;
  block2Units: number;
}

export interface MunicipalCalculationResult {
  unitsKwh: number; // Standard flat rate units (net / ratePerKwh), compatible with standard UI & tests
  standardUnitsKwh: number;
  steppedUnitsKwh: number; // Incline Block Tariff (IBT) calculation
  vat: number; // 15% VAT included
  net: number; // Amount excluding VAT
  ratePerKwh: number;
  block1Rate: number;
  block2Rate: number;
  block1Units: number;
  block2Units: number;
  municipalityId: string;
  municipalityName: string;
}

export interface TariffStrategy {
  readonly id: string;
  readonly name: string;
  readonly province: string;
  readonly ratePerKwh: number;
  readonly block1: number;
  readonly block2: number;
  readonly block1ThresholdKwh: number;
  calculateUnits(netAmount: number): number;
  calculateSteppedUnits(netAmount: number): SteppedUnitsResult;
  calculate(randAmount: number, options?: { useStepped?: boolean }): MunicipalCalculationResult;
}

/**
 * Pure function: Calculate 15% VAT included in gross Rand amount.
 * South African VAT Formula: VAT = (Gross * 0.15) / 1.15
 */
export function calculateVat(grossAmount: number): number {
  if (isNaN(grossAmount) || grossAmount <= 0) return 0;
  return (grossAmount * VAT_RATE) / (1 + VAT_RATE);
}

/**
 * Pure function: Calculate Net Rand amount excluding 15% VAT.
 */
export function calculateNet(grossAmount: number): number {
  if (isNaN(grossAmount) || grossAmount <= 0) return 0;
  return grossAmount - calculateVat(grossAmount);
}

/**
 * Pure function: Calculate Stepped Incline Block Tariff (IBT) units.
 * Lifeline block applies up to threshold (default 350 kWh).
 */
export function calculateSteppedInclineUnits(
  netAmount: number,
  block1Rate: number,
  block2Rate: number,
  thresholdKwh: number = DEFAULT_BLOCK1_THRESHOLD_KWH
): SteppedUnitsResult {
  if (isNaN(netAmount) || netAmount <= 0 || block1Rate <= 0 || block2Rate <= 0) {
    return { totalUnits: 0, block1Units: 0, block2Units: 0 };
  }

  const block1MaxCost = thresholdKwh * block1Rate;

  if (netAmount <= block1MaxCost) {
    const units = netAmount / block1Rate;
    return {
      totalUnits: units,
      block1Units: units,
      block2Units: 0,
    };
  }

  const block1Units = thresholdKwh;
  const remainingNet = netAmount - block1MaxCost;
  const block2Units = remainingNet / block2Rate;

  return {
    totalUnits: block1Units + block2Units,
    block1Units,
    block2Units,
  };
}

/**
 * Base strategy implementation for a South African municipality
 */
export class BaseMunicipalTariffStrategy implements TariffStrategy {
  readonly id: string;
  readonly name: string;
  readonly province: string;
  readonly ratePerKwh: number;
  readonly block1: number;
  readonly block2: number;
  readonly block1ThresholdKwh: number;

  constructor(config: {
    id: string;
    name: string;
    province: string;
    ratePerKwh: number;
    block1: number;
    block2: number;
    block1ThresholdKwh?: number;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.province = config.province;
    this.ratePerKwh = config.ratePerKwh;
    this.block1 = config.block1;
    this.block2 = config.block2;
    this.block1ThresholdKwh = config.block1ThresholdKwh ?? DEFAULT_BLOCK1_THRESHOLD_KWH;
  }

  calculateUnits(netAmount: number): number {
    if (netAmount <= 0 || this.ratePerKwh <= 0) return 0;
    return netAmount / this.ratePerKwh;
  }

  calculateSteppedUnits(netAmount: number): SteppedUnitsResult {
    return calculateSteppedInclineUnits(
      netAmount,
      this.block1,
      this.block2,
      this.block1ThresholdKwh
    );
  }

  calculate(randAmount: number, options?: { useStepped?: boolean }): MunicipalCalculationResult {
    const vat = calculateVat(randAmount);
    const net = calculateNet(randAmount);
    const standardUnitsKwh = this.calculateUnits(net);
    const stepped = this.calculateSteppedUnits(net);

    return {
      unitsKwh: options?.useStepped ? stepped.totalUnits : standardUnitsKwh,
      standardUnitsKwh,
      steppedUnitsKwh: stepped.totalUnits,
      vat,
      net,
      ratePerKwh: this.ratePerKwh,
      block1Rate: this.block1,
      block2Rate: this.block2,
      block1Units: stepped.block1Units,
      block2Units: stepped.block2Units,
      municipalityId: this.id,
      municipalityName: this.name,
    };
  }
}

// ── CONCRETE STRATEGIES FOR SOUTH AFRICAN MUNICIPALITIES ──

export class EskomTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "eskom",
      name: "Eskom Direct Residential",
      province: "National",
      ratePerKwh: 2.22,
      block1: 1.67,
      block2: 2.22,
    });
  }
}

export class CityPowerTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "city-power",
      name: "City Power (Johannesburg)",
      province: "Gauteng",
      ratePerKwh: 2.45,
      block1: 1.85,
      block2: 2.45,
    });
  }
}

export class TshwaneTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "tshwane",
      name: "City of Tshwane (Pretoria)",
      province: "Gauteng",
      ratePerKwh: 2.50,
      block1: 1.90,
      block2: 2.50,
    });
  }
}

export class EkurhuleniTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "ekurhuleni",
      name: "City of Ekurhuleni (Boksburg / East Rand)",
      province: "Gauteng",
      ratePerKwh: 2.42,
      block1: 1.82,
      block2: 2.42,
    });
  }
}

export class CapeTownTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "cape-town",
      name: "City of Cape Town",
      province: "Western Cape",
      ratePerKwh: 2.38,
      block1: 1.79,
      block2: 2.38,
    });
  }
}

export class MangaungTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "mangaung",
      name: "Mangaung Metro (Bloemfontein)",
      province: "Free State",
      ratePerKwh: 2.48,
      block1: 1.88,
      block2: 2.48,
    });
  }
}

export class EthekwiniTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "ethekwini",
      name: "eThekwini Electricity (Durban)",
      province: "KwaZulu-Natal",
      ratePerKwh: 2.40,
      block1: 1.81,
      block2: 2.40,
    });
  }
}

export class BuffaloCityTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "buffalo-city",
      name: "Buffalo City Metro (East London)",
      province: "Eastern Cape",
      ratePerKwh: 2.35,
      block1: 1.77,
      block2: 2.35,
    });
  }
}

export class NelsonMandelaBayTariffStrategy extends BaseMunicipalTariffStrategy {
  constructor() {
    super({
      id: "nelson-mandela-bay",
      name: "Nelson Mandela Bay (Port Elizabeth)",
      province: "Eastern Cape",
      ratePerKwh: 2.37,
      block1: 1.78,
      block2: 2.37,
    });
  }
}

// ── REGISTRY & MASTER LISTS ──

const STRATEGY_INSTANCES: TariffStrategy[] = [
  new CityPowerTariffStrategy(),
  new EkurhuleniTariffStrategy(),
  new TshwaneTariffStrategy(),
  new CapeTownTariffStrategy(),
  new EthekwiniTariffStrategy(),
  new MangaungTariffStrategy(),
  new BuffaloCityTariffStrategy(),
  new NelsonMandelaBayTariffStrategy(),
  new EskomTariffStrategy(),
];

/**
 * All NERSA-approved South African Municipal Electricity Tariffs (2026/27)
 */
export const MUNICIPAL_TARIFFS: MunicipalityTariff[] = STRATEGY_INSTANCES.map((s) => ({
  id: s.id,
  name: s.name,
  province: s.province,
  ratePerKwh: s.ratePerKwh,
  block1: s.block1,
  block2: s.block2,
  block1ThresholdKwh: s.block1ThresholdKwh,
}));

/**
 * Normalizes an identifier string for resilient matching.
 */
function normalizeId(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Retrieves the tariff strategy for a given municipality ID or authority name.
 */
export function getTariffStrategy(identifier: string): TariffStrategy {
  const norm = normalizeId(identifier);

  const matched = STRATEGY_INSTANCES.find((s) => {
    return (
      s.id === identifier ||
      s.name === identifier ||
      normalizeId(s.id) === norm ||
      normalizeId(s.name) === norm ||
      normalizeId(s.name).includes(norm) ||
      norm.includes(normalizeId(s.id))
    );
  });

  return matched || STRATEGY_INSTANCES[0]; // fallback to City Power
}

/**
 * Retrieves municipality tariff metadata by id or name.
 */
export function getMunicipalityById(id: string): MunicipalityTariff | undefined {
  const strategy = getTariffStrategy(id);
  return MUNICIPAL_TARIFFS.find((m) => m.id === strategy.id);
}

/**
 * Main calculation helper: calculates units, VAT, and net amount.
 *
 * @param municipalityId - Municipality ID or authority name (e.g. 'city-power', 'Eskom Direct Residential')
 * @param randAmount - Gross purchase amount in ZAR
 * @param options - Optional calculation flags (e.g. useStepped)
 */
export function calculateMunicipalUnits(
  municipalityId: string,
  randAmount: number,
  options?: { useStepped?: boolean }
): MunicipalCalculationResult {
  const strategy = getTariffStrategy(municipalityId);
  return strategy.calculate(randAmount, options);
}
