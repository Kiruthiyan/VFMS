import { z } from "zod";

const userRoleSchema = z.enum(["ADMIN", "APPROVER", "SYSTEM_USER", "DRIVER"]);

export const createUserSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required.")
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must be 100 characters or fewer."),
    email: z
      .string()
      .min(1, "Email address is required.")
      .email("Please provide a valid email address.")
      .max(255, "Email must not exceed 255 characters."),
    phone: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.trim() === "" || /^[0-9+\-()\s]{10,15}$/.test(value),
        "Invalid phone number format."
      ),
    nic: z
      .string()
      .min(1, "NIC is required.")
      .regex(/^(?:\d{9}[VvXx]|\d{12})$/, "Please enter a valid NIC number."),
    role: userRoleSchema,
    licenseNumber: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
    certifications: z
      .string()
      .max(255, "Certifications must not exceed 255 characters.")
      .optional(),
    experienceYears: z.coerce
      .number()
      .min(0, "Experience years cannot be negative.")
      .max(70, "Experience years cannot exceed 70.")
      .optional(),
    employeeId: z.string().optional(),
    department: z
      .string()
      .max(100, "Department must not exceed 100 characters.")
      .optional(),
    officeLocation: z
      .string()
      .max(100, "Office location must not exceed 100 characters.")
      .optional(),
    designation: z
      .string()
      .max(100, "Designation must not exceed 100 characters.")
      .optional(),
    approvalLevel: z
      .string()
      .max(50, "Approval level must not exceed 50 characters.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "DRIVER") {
      const phone = data.phone?.trim() ?? "";
      if (!phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number is required for driver accounts.",
          path: ["phone"],
        });
      }

      const licenseNumber = data.licenseNumber?.trim() ?? "";
      if (!licenseNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Licence number is required for driver accounts.",
          path: ["licenseNumber"],
        });
      } else if (!/^[A-Z0-9]{8,20}$/i.test(licenseNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Licence number must be 8-20 alphanumeric characters.",
          path: ["licenseNumber"],
        });
      }

      const licenseExpiryDate = data.licenseExpiryDate?.trim() ?? "";
      if (!licenseExpiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Licence expiry date is required for driver accounts.",
          path: ["licenseExpiryDate"],
        });
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(licenseExpiryDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Licence expiry date must be in YYYY-MM-DD format.",
          path: ["licenseExpiryDate"],
        });
      }
    }

    if (data.role === "SYSTEM_USER") {
      const employeeId = data.employeeId?.trim() ?? "";
      if (!employeeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID is required for staff accounts.",
          path: ["employeeId"],
        });
      } else if (!/^[A-Z0-9]{5,10}$/i.test(employeeId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID must be 5-10 alphanumeric characters.",
          path: ["employeeId"],
        });
      }
    }
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
