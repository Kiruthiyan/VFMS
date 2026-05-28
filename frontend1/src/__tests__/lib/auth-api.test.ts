import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/lib/api";
import {
  getFieldErrors,
  loginApi,
  signupApi,
  type SignupRequest,
} from "@/lib/api/auth";

describe("auth api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps login credential failures to a professional message", async () => {
    vi.spyOn(api, "post").mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 401,
        data: {
          message: "Invalid email or password.",
        },
      },
    });

    await expect(
      loginApi({ email: "driver@example.com", password: "WrongPass@1" })
    ).rejects.toMatchObject({
      message:
        "Invalid email or password. Please check your details and try again.",
      status: 401,
    });
  });

  it("preserves backend field errors for signup validation failures", async () => {
    vi.spyOn(api, "post").mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: "Validation failed",
          errors: {
            employeeId:
              "No verified company staff record was found for this employee ID.",
          },
        },
      },
    });

    try {
      await signupApi({
        email: "staff@example.com",
        password: "Secure@123",
        confirmPassword: "Secure@123",
        fullName: "Staff User",
        phone: "0771234567",
        nic: "200012345678",
        requestedRole: "SYSTEM_USER",
        employeeId: "EMP001",
      });
    } catch (error) {
      expect(getFieldErrors(error)).toEqual({
        employeeId:
          "No verified company staff record was found for this employee ID.",
      });
      expect(error).toMatchObject({
        message: "No verified company staff record was found for this employee ID.",
        status: 400,
      });
    }
  });

  it("sends only staff verification fields for public signup", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValue({
      data: { success: true, message: "ok", data: null },
    });

    const request: SignupRequest = {
      email: "staff@example.com",
      password: "Secure@123",
      confirmPassword: "Secure@123",
      fullName: "Staff User",
      phone: "0771234567",
      nic: "200012345678",
      requestedRole: "SYSTEM_USER",
      employeeId: "EMP001",
    };

    await signupApi(request);

    expect(postSpy).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        email: "staff@example.com",
        requestedRole: "SYSTEM_USER",
        employeeId: "EMP001",
      })
    );

    const payload = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("role");
    expect(payload).not.toHaveProperty("licenseNumber");
    expect(payload).not.toHaveProperty("licenseExpiryDate");
  });
});
