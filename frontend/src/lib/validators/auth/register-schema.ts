import { z } from "zod";

export const registerSchema = z
  .object({
    // ── ROLE SELECTION ─────────────────────────────────────────────────
    requestedRole: z.enum(["DRIVER", "SYSTEM_USER"] as const, {
      message: "Please select a role",
    }),

    // ── COMMON FIELDS ──────────────────────────────────────────────────
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must not exceed 100 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),

    phone: z.string().min(1, "Phone number is required"),

    nic: z.string().min(1, "NIC is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    // ── DRIVER FIELDS (conditional) ────────────────────────────────────
    licenseNumber: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
    certifications: z.string().optional(),
    experienceYears: z.coerce
      .number()
      .int()
      .min(0, "Experience cannot be negative")
      .optional()
      .nullable(),

    // ── STAFF FIELDS (conditional) ─────────────────────────────────────
    employeeId: z.string().optional(),
    department: z.string().optional(),
    officeLocation: z.string().optional(),
    designation: z.string().optional(),
  })
  // Password match
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  // Driver required fields
  .refine(
    (data) => {
      if (data.requestedRole === "DRIVER") {
        return !!data.licenseNumber && data.licenseNumber.trim().length > 0;
      }
      return true;
    },
    {
      message: "License number is required for Driver",
      path: ["licenseNumber"],
    }
  )
  .refine(
    (data) => {
      if (data.requestedRole === "DRIVER") {
        return (
          !!data.licenseExpiryDate &&
          data.licenseExpiryDate.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "License expiry date is required for Driver",
      path: ["licenseExpiryDate"],
    }
  )
  // Staff required fields
  .refine(
    (data) => {
      if (data.requestedRole === "SYSTEM_USER") {
        return !!data.employeeId && data.employeeId.trim().length > 0;
      }
      return true;
    },
    {
      message: "Employee ID is required for System User",
      path: ["employeeId"],
    }
  )
  .refine(
    (data) => {
      if (data.requestedRole === "SYSTEM_USER") {
        return !!data.department && data.department.trim().length > 0;
      }
      return true;
    },
    {
      message: "Department is required for System User",
      path: ["department"],
    }
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;
