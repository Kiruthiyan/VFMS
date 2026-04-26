/**
 * Signup flow configuration
 * Defines steps, titles, descriptions, and validation rules
 */

export const SIGNUP_CONFIG = {
  TOTAL_STEPS: 5,
  STEPS: [
    {
      number: 1,
      title: 'Email Verification',
      description: 'Enter your email to begin account creation',
      fields: ['email'],
    },
    {
      number: 2,
      title: 'Confirm Identity',
      description: 'Verify your email with the code we sent',
      fields: ['otp'],
    },
    {
      number: 3,
      title: 'Personal Details',
      description: 'Tell us more about yourself',
      fields: ['firstName', 'lastName'],
    },
    {
      number: 4,
      title: 'Role & Qualifications',
      description: 'Select your role and provide relevant details',
      fields: ['role', 'phone', 'nic'],
    },
    {
      number: 5,
      title: 'Security Setup',
      description: 'Create a secure password for your account',
      fields: ['password', 'confirmPassword'],
    },
  ],
  
  // Step titles object for easy access
  STEP_TITLES: {
    1: 'Email Verification',
    2: 'Confirm Identity',
    3: 'Personal Details',
    4: 'Role & Qualifications',
    5: 'Security Setup',
  },
  
  // Step descriptions object for easy access
  STEP_DESCRIPTIONS: {
    1: 'Enter your email to begin account creation',
    2: 'Verify your email with the code we sent',
    3: 'Tell us more about yourself',
    4: 'Select your role and provide relevant details',
    5: 'Create a secure password for your account',
  },
  
  // Requirements display
  PASSWORD_REQUIREMENTS: [
    { label: 'At least 8 characters', key: 'length' },
    { label: 'One uppercase letter (A-Z)', key: 'uppercase' },
    { label: 'One lowercase letter (a-z)', key: 'lowercase' },
    { label: 'One number (0-9)', key: 'number' },
    { label: 'One special character (@$!%*?&)', key: 'special' },
  ],
} as const;
