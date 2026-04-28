import * as z from 'zod';

// ─── STEP 1: EMAIL ──────────────────────────────────────────────────────

export const signupStep1Schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .max(255, 'Email must be less than 255 characters.')
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address.'
    ),
});

export type SignupStep1Values = z.infer<typeof signupStep1Schema>;

// ─── STEP 2: OTP VERIFICATION ──────────────────────────────────────────

export const signupStep2Schema = z.object({
  otp: z
    .string()
    .min(1, 'Please enter the verification code sent to your email.')
    .max(6, 'Verification code must be 6 digits.')
    .regex(/^\d*$/, 'Verification code must contain only numbers.'),
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
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must be less than 100 characters.')
    .regex(/^[a-zA-Z\s'-]+$/, 'Please enter a valid full name.')
    .min(1, 'Full name is required.'),
  phone: z
    .string()
    .min(1, 'Phone number is required.')
    .refine(
      (phone) => validateSriLankanPhone(phone),
      'Please enter a valid phone number.'
    ),
  nic: z
    .string()
    .min(1, 'NIC number is required.')
    .refine(
      (nic) => validateNIC(nic),
      'Please enter a valid NIC number.'
    ),
});

export type SignupStep3Values = z.infer<typeof signupStep3Schema>;

// ─── STEP 4: ROLE SELECTION & ROLE-SPECIFIC DETAILS ───────────────────

export const signupStep4Schema = z
  .object({
    role: z.enum(['DRIVER', 'SYSTEM_USER'], {
      message: 'Please select a role.',
    }),
    licenseNumber: z.string().optional().default(''),
    licenseExpiryDate: z.string().optional().default(''),
    employeeId: z.string().optional().default(''),
    department: z.string().optional().default(''),
    designation: z.string().optional().default(''),
    officeLocation: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'DRIVER') {
      const licenseNumber = data.licenseNumber?.trim() ?? '';
      const licenseExpiryDate = data.licenseExpiryDate?.trim() ?? '';

      if (!licenseNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the driver license number.',
          path: ['licenseNumber'],
        });
      } else if (!/^[A-Z0-9]{6,20}$/i.test(licenseNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid license number.',
          path: ['licenseNumber'],
        });
      }

      if (!licenseExpiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the driver license expiry date.',
          path: ['licenseExpiryDate'],
        });
      } else {
        const expiryDate = new Date(licenseExpiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(expiryDate.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please enter a valid license expiry date.',
            path: ['licenseExpiryDate'],
          });
        } else if (expiryDate < today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'License expiry date must be today or later.',
            path: ['licenseExpiryDate'],
          });
        }
      }
    }

    if (data.role === 'SYSTEM_USER') {
      const employeeId = data.employeeId?.trim() ?? '';
      const department = data.department?.trim() ?? '';
      const designation = data.designation?.trim() ?? '';
      const officeLocation = data.officeLocation?.trim() ?? '';

      if (!employeeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the staff employee ID.',
          path: ['employeeId'],
        });
      } else if (!/^[A-Z0-9]{3,20}$/i.test(employeeId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid employee ID.',
          path: ['employeeId'],
        });
      }

      if (!department) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select or enter the staff department.',
          path: ['department'],
        });
      }

      if (!designation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the staff designation.',
          path: ['designation'],
        });
      }

      if (!officeLocation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select or enter the staff office location.',
          path: ['officeLocation'],
        });
      }
    }
  });

export type SignupStep4Values = z.infer<typeof signupStep4Schema>;

// ─── STEP 5: ACCOUNT SECURITY ──────────────────────────────────────────

export const signupStep5Schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must be less than 128 characters.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/,
        'Password must include uppercase, lowercase, number, and special character.'
      )
      .min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
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


