import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().optional(),
);

const optionalText = z.preprocess(
  (value) =>
    value == null || (typeof value === "string" && value.trim() === "")
      ? undefined
      : value,
  z.string().optional(),
);

export const vehicleFormSchema = z.object({
  plateNumber: z.string().trim().min(1, "Plate number is required").max(20, "Plate number must be 20 characters or fewer"),
  brand: z.string().trim().min(1, "Brand is required").max(50),
  model: z.string().trim().min(1, "Model is required").max(50),
  year: z.coerce
    .number()
    .int("Year must be a whole number")
    .min(1980, "Year must be 1980 or later")
    .max(2100, "Year must be 2100 or earlier"),
  vehicleType: z.enum(["CAR", "VAN", "SUV", "BUS", "MOTORCYCLE"]),
  fuelType: z.enum(["PETROL", "DIESEL", "HYBRID", "ELECTRIC"]),
  department: optionalText,
  color: optionalText,
  seatingCapacity: optionalNumber.refine(
    (value) => value === undefined || (value >= 1 && value <= 100),
    "Seating capacity must be between 1 and 100",
  ),
  insuranceExpiryDate: optionalText,
  revenueLicenseExpiryDate: optionalText,
  odometerReading: optionalNumber.refine(
    (value) => value === undefined || value >= 0,
    "Odometer reading cannot be negative",
  ),
});

export const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required"),
  contactPerson: optionalText,
  phone: optionalText.refine(
    (value) => !value || /^07\d{8}$/.test(value.replace(/[\s-]/g, "")),
    "Enter a valid Sri Lankan number (e.g. 0771234567)",
  ),
  email: optionalText.refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
    "Enter a valid email",
  ),
  address: optionalText,
});

export const maintenanceFormSchema = z.object({
  vehicleId: z.coerce.number().min(1, "Please select a vehicle"),
  maintenanceType: z.enum([
    "ROUTINE_SERVICE",
    "BREAKDOWN",
    "ACCIDENT_DAMAGE",
    "INSPECTION_REPAIR",
  ]),
  description: z.string().trim().min(1, "Description is required"),
  estimatedCost: optionalNumber.refine(
    (value) => value === undefined || value > 0,
    "Cost must be greater than 0",
  ),
});

export const rentalFormSchema = z
  .object({
    vendorId: z.coerce.number().min(1, "Please select a vendor"),
    vehicleType: z.string().trim().min(1, "Vehicle type is required"),
    plateNumber: z.string().trim().min(1, "Plate number is required").max(20, "Plate number must be 20 characters or fewer"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: optionalText,
    costPerDay: z.coerce.number().min(1, "Cost must be greater than 0"),
    purpose: optionalText,
  })
  .refine(
    (value) => !value.endDate || value.endDate >= value.startDate,
    {
      path: ["endDate"],
      message: "End date cannot be before start date",
    },
  );

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}
