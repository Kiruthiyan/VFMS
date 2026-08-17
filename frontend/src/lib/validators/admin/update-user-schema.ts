import { z } from "zod";

const userRoleSchema = z.enum(["ADMIN", "APPROVER", "SYSTEM_USER", "DRIVER"]);

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name must be 100 characters or fewer.")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Please provide a valid email address.")
    .max(255, "Email must not exceed 255 characters.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === "" || /^[0-9+\-()\s]{10,15}$/.test(value),
      "Invalid phone number format."
    ),
  nic: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === "" || /^(?:\d{9}[VvXx]|\d{12})$/.test(value),
      "Please enter a valid NIC number."
    ),
  role: userRoleSchema.optional(),
  licenseNumber: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === "" || /^[A-Z0-9]{8,20}$/i.test(value),
      "Licence number must be 8-20 alphanumeric characters."
    ),
  licenseExpiryDate: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Licence expiry date must be in YYYY-MM-DD format."
    ),
  certifications: z
    .string()
    .max(255, "Certifications must not exceed 255 characters.")
    .optional()
    .or(z.literal("")),
  experienceYears: z
    .number()
    .min(0, "Experience years cannot be negative.")
    .max(70, "Experience years cannot exceed 70.")
    .optional(),
  employeeId: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === "" || /^[A-Z0-9]{5,10}$/i.test(value),
      "Employee ID must be 5-10 alphanumeric characters."
    ),
  department: z
    .string()
    .max(100, "Department must not exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  officeLocation: z
    .string()
    .max(100, "Office location must not exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  designation: z
    .string()
    .max(100, "Designation must not exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  approvalLevel: z
    .string()
    .max(50, "Approval level must not exceed 50 characters.")
    .optional()
    .or(z.literal("")),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
