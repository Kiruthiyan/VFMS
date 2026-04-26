import * as z from 'zod';

// ─── STEP 1: EMAIL ──────────────────────────────────────────────────────

export const signupStep1Schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address (example: name@company.com)'
    ),
});

export type SignupStep1Values = z.infer<typeof signupStep1Schema>;

// ─── STEP 2: OTP VERIFICATION ──────────────────────────────────────────

export const signupStep2Schema = z.object({
  otp: z
    .string()
    .min(1, 'Please enter the verification code sent to your email.')
    .max(6, 'Verification code must be 6 digits')
    .regex(/^\d*$/, 'Verification code must contain only numbers'),
});

export type SignupStep2Values = z.infer<typeof signupStep2Schema>;

// ─── STEP 3: USER DETAILS ──────────────────────────────────────────────

// Sri Lankan NIC validation: Old format (9 digits + v/x) or New format (12 digits)
const validateNIC = (nic: string) => {
  const cleaned = nic.replace(/\s/g, '').toUpperCase(); // Remove whitespace and convert to upper
  // Old format: 9 digits + V/X
  // New format: 12 digits
  return /^[0-9]{9}[VX]$/.test(cleaned) || /^[0-9]{12}$/.test(cleaned);
};

// Sri Lankan phone validation: 077xxxxxxx, 071xxxxxxx, etc.
const validateSriLankanPhone = (phone: string) => {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+94/, '0');
  // Valid formats: 077xxxxxxx, 071xxxxxxx, 078xxxxxxx, 076xxxxxxx, 070xxxxxxx, 074xxxxxxx, 075xxxxxxx, 072xxxxxxx
  return /^(077|071|078|076|070|074|075|072)[0-9]{7}$/.test(cleaned);
};

export const signupStep3Schema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
    .min(1, 'Full name is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (phone) => validateSriLankanPhone(phone),
      'Please enter a valid Sri Lankan phone number (e.g., 077XXXXXXX or +94771234567)'
    ),
  nic: z
    .string()
    .min(1, 'NIC number is required')
    .refine(
      (nic) => validateNIC(nic),
      'Please enter a valid Sri Lankan NIC number (10 or 12 digits)'
    ),
});

export type SignupStep3Values = z.infer<typeof signupStep3Schema>;

// ─── STEP 4: ROLE SELECTION & ROLE-SPECIFIC DETAILS ───────────────────

export const signupStep4Schema = z
  .object({
    role: z.enum(['DRIVER', 'SYSTEM_USER']),
    // Driver-specific fields
    licenseNumber: z.string().optional().default(''),
    licenseExpiryDate: z.string().optional().default(''),
    // SYSTEM_USER (Staff) specific fields
    employeeId: z.string().optional().default(''),
    department: z.string().optional().default(''),
    designation: z.string().optional().default(''),
    officeLocation: z.string().optional().default(''),
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
  )
  .refine(
    (data) => {
      if (data.role === 'DRIVER' && data.licenseExpiryDate) {
        const expiryDate = new Date(data.licenseExpiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return expiryDate >= today; // Must be today or in the future
      }
      return true;
    },
    {
      message: 'License expiry date must be in the future',
      path: ['licenseExpiryDate'],
    }
  )
  .refine(
    (data) => {
      if (data.role === 'SYSTEM_USER') {
        return data.employeeId && data.employeeId.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Employee ID is required for staff members',
      path: ['employeeId'],
    }
  )
  .refine(
    (data) => {
      if (data.role === 'SYSTEM_USER') {
        return data.department && data.department.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Department is required for staff members',
      path: ['department'],
    }
  )
  .refine(
    (data) => {
      if (data.role === 'SYSTEM_USER') {
        return data.designation && data.designation.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Designation is required for staff members',
      path: ['designation'],
    }
  );

export type SignupStep4Values = z.infer<typeof signupStep4Schema>;

// ─── STEP 5: ACCOUNT SECURITY ──────────────────────────────────────────

export const signupStep5Schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
      .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character')
      .min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please check and try again.',
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


