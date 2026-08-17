import { z } from "zod";

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const fuelEntrySchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().optional(),
  fuelDate: z
    .string()
    .min(1, "Fuel date is required")
    .refine((value) => value <= todayIsoDate(), "Fuel date cannot be in the future"),
  quantity: z.coerce
    .number({ message: "Quantity must be a number" })
    .positive("Quantity must be greater than 0")
    .max(2000, "Quantity must not exceed 2000 litres"),
  costPerLitre: z.coerce
    .number({ message: "Cost per litre must be a number" })
    .positive("Cost per litre must be greater than 0"),
  odometerReading: z.coerce
    .number({ message: "Odometer reading must be a number" })
    .nonnegative("Odometer cannot be negative")
    .max(2000000, "Odometer reading must not exceed 2,000,000 km"),
  fuelStation: z.string().optional(),
  notes: z.string().optional(),
});

export type FuelEntryFormValues = z.infer<typeof fuelEntrySchema>;
