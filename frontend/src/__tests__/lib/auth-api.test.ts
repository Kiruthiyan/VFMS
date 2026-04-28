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
            officeLocation: "Please select or enter the staff office location.",
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
        department: "Operations",
        designation: "Coordinator",
        officeLocation: "",
      });
    } catch (error) {
      expect(getFieldErrors(error)).toEqual({
        officeLocation: "Please select or enter the staff office location.",
      });
      expect(error).toMatchObject({
        message: "Please select or enter the staff office location.",
        status: 400,
      });
    }
  });

  it("sends only driver-relevant fields for driver signup", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValue({
      data: { success: true, message: "ok", data: null },
    });

    const request: SignupRequest = {
      email: "driver@example.com",
      password: "Secure@123",
      confirmPassword: "Secure@123",
      fullName: "Driver User",
      phone: "0771234567",
      nic: "200012345678",
      requestedRole: "DRIVER",
      licenseNumber: "B123456",
      licenseExpiryDate: "2030-05-01",
      employeeId: "EMP001",
      department: "Operations",
      designation: "Coordinator",
      officeLocation: "Colombo",
    };

    await signupApi(request);

    expect(postSpy).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        email: "driver@example.com",
        requestedRole: "DRIVER",
        licenseNumber: "B123456",
        licenseExpiryDate: "2030-05-01",
      })
    );

    const payload = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("role");
    expect(payload).not.toHaveProperty("officeLocation");
    expect(payload).not.toHaveProperty("department");
  });
});
