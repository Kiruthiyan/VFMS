import { describe, expect, it } from "vitest";

import { createUserSchema } from "@/lib/validators/admin/create-user-schema";

describe("createUserSchema", () => {
  it("accepts a valid driver payload", () => {
    const result = createUserSchema.safeParse({
      fullName: "Test Driver",
      email: "driver@company.com",
      phone: "0771234567",
      nic: "123456789012",
      role: "DRIVER",
      licenseNumber: "B12345678",
      licenseExpiryDate: "2030-12-31",
    });

    expect(result.success).toBe(true);
  });

  it("requires employee ID for staff accounts", () => {
    const result = createUserSchema.safeParse({
      fullName: "Test Staff",
      email: "staff@company.com",
      nic: "123456789",
      role: "SYSTEM_USER",
    });

    expect(result.success).toBe(false);
  });

  it("requires licence fields for driver accounts", () => {
    const result = createUserSchema.safeParse({
      fullName: "Test Driver",
      email: "driver@company.com",
      nic: "123456789",
      role: "DRIVER",
    });

    expect(result.success).toBe(false);
  });
});
