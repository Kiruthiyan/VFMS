import { describe, expect, it } from "vitest";

import {
  maintenanceFormSchema,
  rentalFormSchema,
  vehicleFormSchema,
  vendorFormSchema,
} from "@/lib/validators/fleet-schemas";

describe("fleet schemas", () => {
  it("rejects negative vehicle odometer", () => {
    const result = vehicleFormSchema.safeParse({
      plateNumber: "CP-NBM-4567",
      brand: "Toyota",
      model: "Aqua",
      year: 2024,
      vehicleType: "CAR",
      fuelType: "PETROL",
      odometerReading: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejects vendor phone with invalid format", () => {
    const result = vendorFormSchema.safeParse({
      name: "City Rentals",
      phone: "0112345678",
    });

    expect(result.success).toBe(false);
  });

  it("rejects maintenance estimated cost <= 0", () => {
    const result = maintenanceFormSchema.safeParse({
      vehicleId: 1,
      maintenanceType: "BREAKDOWN",
      description: "Issue",
      estimatedCost: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects rental when end date is before start date", () => {
    const result = rentalFormSchema.safeParse({
      vendorId: 1,
      vehicleType: "VAN",
      plateNumber: "CP-XYZ-1234",
      startDate: "2026-08-15",
      endDate: "2026-08-14",
      costPerDay: 5000,
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid rental payload", () => {
    const result = rentalFormSchema.safeParse({
      vendorId: 1,
      vehicleType: "VAN",
      plateNumber: "CP-XYZ-1234",
      startDate: "2026-08-15",
      endDate: "2026-08-16",
      costPerDay: 5000,
      purpose: "Project transport",
    });

    expect(result.success).toBe(true);
  });
});
