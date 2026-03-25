import * as z from 'zod';

// ─── STEP 1: EMAIL ──────────────────────────────────────────────────────

export const signupStep1Schema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

export type SignupStep1Values = z.infer<typeof signupStep1Schema>;

// ─── STEP 2: OTP VERIFICATION ──────────────────────────────────────────

export const signupStep2Schema = z.object({
  otp: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers'),
});

export type SignupStep2Values = z.infer<typeof signupStep2Schema>;

// ─── STEP 3: USER DETAILS ──────────────────────────────────────────────

export const signupStep3Schema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .min(1, 'Full name is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9\s\-\+\(\)]+$/, 'Invalid phone format'),
  nic: z
    .string()
    .min(1, 'NIC number is required'),
});

export type SignupStep3Values = z.infer<typeof signupStep3Schema>;

// ─── STEP 4: ROLE SELECTION & ROLE-SPECIFIC DETAILS ───────────────────

export const signupStep4Schema = z
  .object({
    role: z
      .enum(['DRIVER', 'SYSTEM_USER'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
      }),
    // Driver-specific fields
    licenseNumber: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'DRIVER') {
        return data.licenseNumber && data.licenseNumber.trim().length > 0;
      }
      return true;
    },
    {
      message: 'License number is required for drivers',
      path: ['licenseNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.role === 'DRIVER') {
        return data.licenseExpiryDate && data.licenseExpiryDate.trim().length > 0;
      }
      return true;
    },
    {
      message: 'License expiry date is required for drivers',
      path: ['licenseExpiryDate'],
    }
  );

export type SignupStep4Values = z.infer<typeof signupStep4Schema>;

// ─── STEP 5: ACCOUNT SECURITY ──────────────────────────────────────────

export const signupStep5Schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[0-9]/, 'Password must contain number')
      .min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupStep5Values = z.infer<typeof signupStep5Schema>;

// ─── COMPLETE SIGNUP FORM ──────────────────────────────────────────────

export const completeSignupSchema = signupStep1Schema
  .merge(signupStep2Schema)
  .merge(signupStep3Schema)
  .merge(signupStep4Schema)
  .merge(signupStep5Schema);

export type CompleteSignupValues = z.infer<typeof completeSignupSchema>;


