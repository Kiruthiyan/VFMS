export const SIGNUP_CONFIG = {
  TOTAL_STEPS: 4,
  STEPS: [
    {
      number: 1,
      title: "Email Address",
      description: "Enter your company email to begin account creation",
      fields: ["email"],
    },
    {
      number: 2,
      title: "Personal Details",
      description: "Tell us more about yourself",
      fields: ["fullName", "phone", "nic"],
    },
    {
      number: 3,
      title: "Staff Verification",
      description: "Confirm your company staff identity with your employee ID",
      fields: [
        "role",
        "employeeId",
      ],
    },
    {
      number: 4,
      title: "Security Setup",
      description: "Create a secure password for your account",
      fields: ["password", "confirmPassword"],
    },
  ],
  STEP_TITLES: {
    1: "Email Address",
    2: "Personal Details",
    3: "Staff Verification",
    4: "Security Setup",
  },
  STEP_DESCRIPTIONS: {
    1: "Enter your company email to begin account creation",
    2: "Tell us more about yourself",
    3: "Confirm your company staff identity with your employee ID",
    4: "Create a secure password for your account",
  },
  PASSWORD_REQUIREMENTS: [
    { label: "At least 8 characters", key: "length", regex: /.{8,}/ },
    { label: "One uppercase letter (A-Z)", key: "uppercase", regex: /[A-Z]/ },
    { label: "One lowercase letter (a-z)", key: "lowercase", regex: /[a-z]/ },
    { label: "One number (0-9)", key: "number", regex: /\d/ },
    {
      label: "One special character (@$!%*?&)",
      key: "special",
      regex: /[@$!%*?&]/,
    },
  ],
} as const;

export const SIGNUP_STEPS = SIGNUP_CONFIG.STEPS;
export const PASSWORD_REQUIREMENTS = SIGNUP_CONFIG.PASSWORD_REQUIREMENTS;

export function validatePasswordComplexity(password: string): {
  isValid: boolean;
  failedRequirements: string[];
} {
  const failedRequirements = PASSWORD_REQUIREMENTS.filter(
    (requirement) => !requirement.regex.test(password)
  ).map((requirement) => requirement.label);

  return {
    isValid: failedRequirements.length === 0,
    failedRequirements,
  };
}

export const AVAILABLE_SIGNUP_ROLES = ["SYSTEM_USER"] as const;

export type SignupRole = (typeof AVAILABLE_SIGNUP_ROLES)[number];

export const ROLE_SPECIFIC_FIELDS: Record<SignupRole, string[]> = {
  SYSTEM_USER: ["employeeId"],
};

export const FIELD_VALIDATION = {
  licenseNumber: {
    pattern: /^[A-Z0-9]{8,20}$/,
    message: "Invalid license number format (8-20 alphanumeric characters)",
  },
  licenseExpiryDate: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: "License expiry date must be in YYYY-MM-DD format",
  },
  employeeId: {
    pattern: /^[A-Z0-9]{5,10}$/,
    message: "Invalid employee ID format",
  },
  nic: {
    pattern: /^[0-9VvXx]{9,12}$/,
    message: "NIC must be 9-12 characters",
  },
  phone: {
    pattern: /^[0-9+\-()\s]{10,15}$/,
    message: "Invalid phone number format",
  },
} as const;

export const SIGNUP_ERROR_MESSAGES = {
  EMAIL_ALREADY_REGISTERED:
    "This email is already registered. Try logging in instead.",
  INVALID_ROLE: "Only company staff can self-register.",
  MISSING_REQUIRED_FIELDS: "Please fill in all required fields.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  WEAK_PASSWORD: "Password does not meet complexity requirements.",
  INVALID_EMAIL_FORMAT: "Please enter a valid email address.",
} as const;
