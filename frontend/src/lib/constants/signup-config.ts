/**
 * Signup flow configuration and constants
 * Defines the signup process structure, validation rules, and user-facing text
 * Ensures consistency across all signup-related components and steps
 * 
 * Usage: import { SIGNUP_CONFIG } from '@/lib/constants/signup-config'
 */

export const SIGNUP_CONFIG = {
  // Total number of steps in the signup process
  totalSteps: 4,
  
  // Maximum length for text inputs
  maxLengths: {
    fullName: 100,
    email: 255,
    password: 255,
    phoneNumber: 20,
    nic: 20,
    employeeId: 10,
    licenseNumber: 20,
    department: 100,
    designation: 100,
  },
  
  // Minimum length for text inputs
  minLengths: {
    fullName: 2,
    password: 8,
    phoneNumber: 10,
    nic: 9,
    employeeId: 5,
    licenseNumber: 8,
  },
};

/**
 * Signup step definitions - Each step's title and description
 * Used to render step indicators and provide user guidance
 */
export const SIGNUP_STEPS = {
  1: {
    title: 'Basic Information',
    description: 'Enter your name, email, and phone number',
  },
  2: {
    title: 'Security',
    description: 'Create a strong password',
  },
  3: {
    title: 'Verification',
    description: 'Verify your email address',
  },
  4: {
    title: 'Role Details',
    description: 'Provide role-specific information',
  },
} as const;

/**
 * Password complexity requirements - Displayed to users during signup
 * Each requirement must be met for password validation to pass
 */
export const PASSWORD_REQUIREMENTS = [
  {
    text: 'At least 8 characters',
    regex: /.{8,}/,
  },
  {
    text: 'At least one uppercase letter (A-Z)',
    regex: /[A-Z]/,
  },
  {
    text: 'At least one lowercase letter (a-z)',
    regex: /[a-z]/,
  },
  {
    text: 'At least one digit (0-9)',
    regex: /\d/,
  },
  {
    text: 'At least one special character (@$!%*?&)',
    regex: /[@$!%*?&]/,
  },
] as const;

/**
 * Check if password meets all complexity requirements
 * Used in real-time password validation
 * 
 * @param password - Password to validate
 * @returns object with isValid flag and failedRequirements array
 * 
 * @example
 * const result = validatePasswordComplexity('MyPass123!');
 * // Returns: { isValid: true, failedRequirements: [] }
 */
export function validatePasswordComplexity(password: string): {
  isValid: boolean;
  failedRequirements: string[];
} {
  const failed = PASSWORD_REQUIREMENTS
    .filter(req => !req.regex.test(password))
    .map(req => req.text);
  
  return {
    isValid: failed.length === 0,
    failedRequirements: failed,
  };
}

/**
 * Available user roles in signup
 * Only DRIVER and SYSTEM_USER can self-register
 * ADMIN and APPROVER are created by administrators only
 */
export const AVAILABLE_SIGNUP_ROLES = [
  'DRIVER',
  'SYSTEM_USER',
] as const;

export type SignupRole = (typeof AVAILABLE_SIGNUP_ROLES)[number];

/**
 * Role-specific fields required in signup process
 * Maps each role to the additional fields that must be collected
 */
export const ROLE_SPECIFIC_FIELDS: Record<SignupRole, string[]> = {
  DRIVER: [
    'licenseNumber',
    'licenseExpiryDate',
    'experienceYears',
    'certifications',
  ],
  SYSTEM_USER: [
    'employeeId',
    'department',
    'designation',
    'officeLocation',
  ],
};

/**
 * Field validation rules
 * Specifies regex patterns and constraints for role-specific fields
 */
export const FIELD_VALIDATION = {
  licenseNumber: {
    pattern: /^[A-Z0-9]{8,20}$/,
    message: 'Invalid license number format (8-20 alphanumeric characters)',
  },
  licenseExpiryDate: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'License expiry date must be in YYYY-MM-DD format',
  },
  employeeId: {
    pattern: /^[A-Z0-9]{5,10}$/,
    message: 'Invalid employee ID format (5-10 alphanumeric characters)',
  },
  nic: {
    pattern: /^\d{9,12}$/,
    message: 'NIC must be 9-12 digits',
  },
  phoneNumber: {
    pattern: /^[0-9+\-()\\s]{10,15}$/,
    message: 'Invalid phone number format',
  },
} as const;

/**
 * Signup error messages - Specific to signup process
 */
export const SIGNUP_ERROR_MESSAGES = {
  EMAIL_ALREADY_REGISTERED: 'This email is already registered. Try logging in instead.',
  INVALID_ROLE: 'Invalid role selected. Please choose Driver or System User.',
  MISSING_REQUIRED_FIELDS: 'Please fill in all required fields.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  WEAK_PASSWORD: 'Password does not meet complexity requirements.',
  INVALID_EMAIL_FORMAT: 'Please enter a valid email address.',
} as const;
