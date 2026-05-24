import * as z from 'zod';

// Step 1: work email
export const signupStep1Schema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your company email address.')
    .max(255, 'Email address must be 255 characters or fewer.')
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Enter a valid email address in the format name@example.com.'
    ),
});

export type SignupStep1Values = z.infer<typeof signupStep1Schema>;

// Step 2: legacy OTP schema kept only for backward-compatible full-form typing.
// The active staff signup flow no longer collects OTP before registration.
export const signupStep2Schema = z.object({
  otp: z
    .string()
    .min(1, 'Please enter the verification code sent to your email.')
    .max(6, 'Verification code must be 6 digits.')
    .regex(/^\d*$/, 'Verification code must contain only numbers.'),
});

export type SignupStep2Values = z.infer<typeof signupStep2Schema>;

// Accept both legacy and modern Sri Lankan NIC formats.
const validateNIC = (nic: string) => {
  const cleaned = nic.replace(/\s/g, '').toUpperCase();
  return /^[0-9]{9}[VX]$/.test(cleaned) || /^[0-9]{12}$/.test(cleaned);
};

// Restricts signup to supported Sri Lankan mobile number prefixes.
const validateSriLankanPhone = (phone: string) => {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+94/, '0');
  return /^(077|071|078|076|070|074|075|072)[0-9]{7}$/.test(cleaned);
};

// Step 3: personal details
export const signupStep3Schema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must contain at least 2 characters.')
    .max(100, 'Full name must be 100 characters or fewer.')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Enter your name using letters, spaces, apostrophes, or hyphens only.'
    )
    .min(1, 'Please enter your full name as shown in company records.'),
  phone: z
    .string()
    .min(1, 'Please enter your mobile number.')
    .refine(
      (phone) => validateSriLankanPhone(phone),
      'Enter a valid Sri Lankan mobile number, for example 0771234567.'
    ),
  nic: z
    .string()
    .min(1, 'Please enter your NIC number.')
    .refine(
      (nic) => validateNIC(nic),
      'Enter a valid NIC in either 12-digit format or 9 digits followed by V or X.'
    ),
});

export type SignupStep3Values = z.infer<typeof signupStep3Schema>;

// Step 4: staff identity match
export const signupStep4Schema = z
  .object({
    role: z.literal('SYSTEM_USER'),
    employeeId: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const employeeId = data.employeeId?.trim() ?? '';

    if (!employeeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter your employee ID.',
        path: ['employeeId'],
      });
    } else if (!/^[A-Z0-9]{5,10}$/i.test(employeeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Employee ID must be 5 to 10 letters or numbers.',
        path: ['employeeId'],
      });
    }
  });

export type SignupStep4Values = z.infer<typeof signupStep4Schema>;

// Step 5: password setup
export const signupStep5Schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters.')
      .max(128, 'Password must be 128 characters or fewer.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/,
        'Use at least one uppercase letter, one lowercase letter, one number, and one special character.'
      )
      .min(1, 'Please create a password.'),
    confirmPassword: z
      .string()
      .min(1, 'Please re-enter your password to confirm it.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'The password confirmation does not match. Please try again.',
    path: ['confirmPassword'],
  });

export type SignupStep5Values = z.infer<typeof signupStep5Schema>;

// Complete schema is retained for shared validation utilities and tests.
export const completeSignupSchema = signupStep1Schema
  .merge(signupStep2Schema)
  .merge(signupStep3Schema)
  .merge(signupStep4Schema)
  .merge(signupStep5Schema);

export type CompleteSignupValues = z.infer<typeof completeSignupSchema>;
