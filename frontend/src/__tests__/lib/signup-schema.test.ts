import { describe, expect, it } from "vitest";

import {
  signupStep3Schema,
  signupStep4Schema,
  signupStep5Schema,
} from "@/lib/validators/auth/signup-schema";

describe("signup validation", () => {
  it("accepts verified company staff signup details", () => {
    const result = signupStep4Schema.safeParse({
      role: "SYSTEM_USER",
      employeeId: "EMP001",
    });

    expect(result.success).toBe(true);
  });

  it("requires employee ID for staff signup", () => {
    const result = signupStep4Schema.safeParse({
      role: "SYSTEM_USER",
      employeeId: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.employeeId).toContain(
      "Please enter your employee ID."
    );
  });

  it("shows a professional NIC validation message", () => {
    const result = signupStep3Schema.safeParse({
      fullName: "Test User",
      phone: "0771234567",
      nic: "12345",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.nic).toContain(
      "Enter a valid NIC in either 12-digit format or 9 digits followed by V or X."
    );
  });

  it("rejects weak passwords before submit", () => {
    const result = signupStep5Schema.safeParse({
      password: "weakpass",
      confirmPassword: "weakpass",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toContain(
      "Use at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  });
});
