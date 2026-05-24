import { describe, expect, it } from "vitest";

import {
  calcAverageEfficiency,
  calcTotalCost,
  calcTotalLitres,
  countFlagged,
  formatEfficiency,
  todayStr,
} from "@/lib/fuel-utils";
import type { FuelRecord } from "@/lib/api/fuel";

function buildRecord(overrides: Partial<FuelRecord>): FuelRecord {
  return {
    id: "record-1",
    vehicleId: "1",
    vehiclePlate: "ABC-1234",
    vehicleMakeModel: "Toyota Aqua",
    driverId: null,
    driverName: null,
    fuelDate: "2026-04-28",
    quantity: 10,
    costPerLitre: 100,
    totalCost: 1000,
    odometerReading: 1000,
    fuelStation: null,
    notes: null,
    receiptUrl: null,
    receiptFileName: null,
    flaggedForMisuse: false,
    flagReason: null,
    createdBy: "admin@vfms.com",
    createdAt: "2026-04-28T10:00:00",
    efficiencyKmPerLitre: null,
    distanceSinceLast: null,
    ...overrides,
  };
}

describe("fuel-utils", () => {
  it("calculates aggregate fuel values safely", () => {
    const records = [
      buildRecord({
        quantity: 12,
        totalCost: 2400,
        flaggedForMisuse: true,
        efficiencyKmPerLitre: 14,
      }),
      buildRecord({
        id: "record-2",
        quantity: 8,
        totalCost: 1600,
        efficiencyKmPerLitre: 10,
      }),
    ];

    expect(calcTotalLitres(records)).toBe(20);
    expect(calcTotalCost(records)).toBe(4000);
    expect(countFlagged(records)).toBe(1);
    expect(calcAverageEfficiency(records)).toBe(12);
  });

  it("formats missing efficiency values consistently", () => {
    expect(formatEfficiency(null)).toBe("N/A");
  });

  it("returns ISO date strings for today", () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
