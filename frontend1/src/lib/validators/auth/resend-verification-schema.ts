import { z } from "zod";

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
});

export type ResendVerificationFormValues = z.infer<
  typeof resendVerificationSchema
>;
