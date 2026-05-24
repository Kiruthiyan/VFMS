import { z } from "zod";

export const fuelEntrySchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().optional(),
  fuelDate: z.string().min(1, "Fuel date is required"),
  quantity: z.coerce
    .number({ message: "Quantity must be a number" })
    .positive("Quantity must be greater than 0"),
  costPerLitre: z.coerce
    .number({ message: "Cost per litre must be a number" })
    .positive("Cost per litre must be greater than 0"),
  odometerReading: z.coerce
    .number({ message: "Odometer reading must be a number" })
    .nonnegative("Odometer cannot be negative"),
  fuelStation: z.string().optional(),
  notes: z.string().optional(),
});

export type FuelEntryFormValues = z.infer<typeof fuelEntrySchema>;
