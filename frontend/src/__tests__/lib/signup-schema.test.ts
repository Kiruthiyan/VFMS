import { describe, expect, it } from "vitest";

import {
  signupStep4Schema,
  signupStep5Schema,
} from "@/lib/validators/auth/signup-schema";

describe("signup validation", () => {
  it("allows a driver signup without staff-only office location", () => {
    const result = signupStep4Schema.safeParse({
      role: "DRIVER",
      licenseNumber: "B123456",
      licenseExpiryDate: "2030-05-01",
      employeeId: "",
      department: "",
      designation: "",
      officeLocation: "",
    });

    expect(result.success).toBe(true);
  });

  it("requires office location for staff signup", () => {
    const result = signupStep4Schema.safeParse({
      role: "SYSTEM_USER",
      employeeId: "EMP001",
      department: "Operations",
      designation: "Coordinator",
      officeLocation: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.officeLocation).toContain(
      "Please select or enter the staff office location."
    );
  });

  it("rejects weak passwords before submit", () => {
    const result = signupStep5Schema.safeParse({
      password: "weakpass",
      confirmPassword: "weakpass",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toContain(
      "Password must include uppercase, lowercase, number, and special character."
    );
  });
});
