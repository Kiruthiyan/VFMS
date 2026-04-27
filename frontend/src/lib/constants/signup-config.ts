export const SIGNUP_CONFIG = {
  TOTAL_STEPS: 5,
  STEPS: [
    {
      number: 1,
      title: "Email Verification",
      description: "Enter your email to begin account creation",
      fields: ["email"],
    },
    {
      number: 2,
      title: "Confirm Identity",
      description: "Verify your email with the code we sent",
      fields: ["otp"],
    },
    {
      number: 3,
      title: "Personal Details",
      description: "Tell us more about yourself",
      fields: ["fullName", "phone", "nic"],
    },
    {
      number: 4,
      title: "Role and Qualifications",
      description: "Select your role and provide any required details",
      fields: [
        "role",
        "licenseNumber",
        "licenseExpiryDate",
        "employeeId",
        "department",
        "designation",
        "officeLocation",
      ],
    },
    {
      number: 5,
      title: "Security Setup",
      description: "Create a secure password for your account",
      fields: ["password", "confirmPassword"],
    },
  ],
  STEP_TITLES: {
    1: "Email Verification",
    2: "Confirm Identity",
    3: "Personal Details",
    4: "Role and Qualifications",
    5: "Security Setup",
  },
  STEP_DESCRIPTIONS: {
    1: "Enter your email to begin account creation",
    2: "Verify your email with the code we sent",
    3: "Tell us more about yourself",
    4: "Select your role and provide any required details",
    5: "Create a secure password for your account",
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

export const AVAILABLE_SIGNUP_ROLES = ["DRIVER", "SYSTEM_USER"] as const;

export type SignupRole = (typeof AVAILABLE_SIGNUP_ROLES)[number];

export const ROLE_SPECIFIC_FIELDS: Record<SignupRole, string[]> = {
  DRIVER: ["licenseNumber", "licenseExpiryDate"],
  SYSTEM_USER: ["employeeId", "department", "designation", "officeLocation"],
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
    pattern: /^[A-Z0-9]{3,20}$/,
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
  INVALID_ROLE: "Invalid role selected. Please choose Driver or System User.",
  MISSING_REQUIRED_FIELDS: "Please fill in all required fields.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  WEAK_PASSWORD: "Password does not meet complexity requirements.",
  INVALID_EMAIL_FORMAT: "Please enter a valid email address.",
} as const;
