import { describe, it, expect } from "vitest";
import { calculateDistanceKm, sortCentresByDistance, THUTHUZELA_CENTERS } from "../data/saSafetyData";

describe("TCC Distance Calculation & Nearest Sorting", () => {
  it("calculates accurate geodesic distance between South African coordinates", () => {
    // Johannesburg CBD: (-26.2041, 28.0473)
    // Cape Town CBD: (-33.9249, 18.4241)
    const distJhbToCpt = calculateDistanceKm(-26.2041, 28.0473, -33.9249, 18.4241);
    expect(distJhbToCpt).toBeGreaterThan(1240);
    expect(distJhbToCpt).toBeLessThan(1280);

    // Distance to self should be 0
    expect(calculateDistanceKm(-26.2041, 28.0473, -26.2041, 28.0473)).toBe(0);

    // Soweto to Chris Hani Baragwanath TCC (-26.2606, 27.9429) from Johannesburg CBD
    const distToBara = calculateDistanceKm(-26.2041, 28.0473, -26.2606, 27.9429);
    expect(distToBara).toBeGreaterThan(10);
    expect(distToBara).toBeLessThan(15);
  });

  it("sorts Thuthuzela Centres with nearest safe havens ranked first when user GPS is provided", () => {
    // User in Johannesburg Central: (-26.2041, 28.0473)
    const sortedFromJhb = sortCentresByDistance(THUTHUZELA_CENTERS, -26.2041, 28.0473);

    // First center should be Gauteng (e.g. Helen Joseph or Chris Hani Bara)
    expect(sortedFromJhb[0].province).toBe("Gauteng");
    expect(sortedFromJhb[0].distanceKm).toBeDefined();
    expect(sortedFromJhb[0].distanceKm).toBeLessThan(15);

    // Cape Town centers should be at the bottom
    const lastCenter = sortedFromJhb[sortedFromJhb.length - 1];
    expect(lastCenter.distanceKm).toBeGreaterThan(500);

    // Array should be strictly ascending by distance
    for (let i = 0; i < sortedFromJhb.length - 1; i++) {
      expect(sortedFromJhb[i].distanceKm!).toBeLessThanOrEqual(sortedFromJhb[i + 1].distanceKm!);
    }
  });

  it("returns original array when user GPS coordinates are undefined", () => {
    const unsorted = sortCentresByDistance(THUTHUZELA_CENTERS, undefined, undefined);
    expect(unsorted.length).toBe(THUTHUZELA_CENTERS.length);
    expect(unsorted[0].id).toBe(THUTHUZELA_CENTERS[0].id);
  });
});
