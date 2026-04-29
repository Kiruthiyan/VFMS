'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldError, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronLeft, ChevronRight, Home, LogIn, Mail, Shield, UserRound, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ZodError } from 'zod';

import {
  AuthField,
  AuthInlineMessage,
  AuthInput,
  AuthSectionHeader,
  AuthSelect,
  AuthStatusPanel,
  PasswordField,
} from '@/components/auth/auth-ui';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  getErrorMessage,
  getFieldErrors,
  sendOTPApi,
  signupApi,
  verifyOTPApi,
} from '@/lib/api/auth';
import { ROLE_LABELS } from '@/lib/auth';
import { AUTH_ROUTES, PUBLIC_ROUTES } from '@/lib/constants/routes';
import { SIGNUP_CONFIG } from '@/lib/constants/signup-config';
import {
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
  signupStep4Schema,
  signupStep5Schema,
  type SignupStep1Values,
  type SignupStep2Values,
  type SignupStep3Values,
  type SignupStep4Values,
  type SignupStep5Values,
} from '@/lib/validators/auth/signup-schema';

type SignupStep = 1 | 2 | 3 | 4 | 5;

interface SignupFormData {
  step1: SignupStep1Values;
  step2: SignupStep2Values;
  step3: SignupStep3Values;
  step4: SignupStep4Values;
  step5: SignupStep5Values;
}

const DEPARTMENT_OPTIONS = [
  'Finance',
  'Operations',
  'Human Resources',
  'Administration',
  'IT',
  'Maintenance',
];

const roleCards = [
  {
    role: 'DRIVER' as const,
    title: 'Driver',
    description: 'For assigned driving responsibilities, route execution, and vehicle-based duties.',
    icon: Shield,
  },
  {
    role: 'SYSTEM_USER' as const,
    title: 'Staff / System User',
    description: 'For office and operational staff working with requests, records, and approvals.',
    icon: Users,
  },
];

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function PasswordRequirement({
  satisfied,
  label,
}: {
  satisfied: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
          satisfied
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-200 text-slate-500',
        ].join(' ')}
      >
        {satisfied ? 'OK' : '...'}
      </span>
      <span
        className={
          satisfied ? 'text-xs font-medium text-emerald-700' : 'text-xs text-slate-500'
        }
      >
        {label}
      </span>
    </div>
  );
}

const step4Resolver: Resolver<SignupStep4Values> = async (values, context, options) => {
  try {
    return await zodResolver(signupStep4Schema)(values, context, options);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.reduce<Record<string, FieldError>>((acc, issue) => {
        const field = issue.path[0];

        if (typeof field === 'string' && !acc[field]) {
          acc[field] = {
            type: issue.code,
            message: issue.message,
          };
        }

        return acc;
      }, {});

      return {
        values: {},
        errors: fieldErrors,
      };
    }

    throw error;
  }
};

export function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const step1Form = useForm<SignupStep1Values>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: {
      email: formData.step1?.email ?? '',
    },
  });

  const step2Form = useForm<SignupStep2Values>({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: {
      otp: formData.step2?.otp ?? '',
    },
  });

  const step3Form = useForm<SignupStep3Values>({
    resolver: zodResolver(signupStep3Schema),
    defaultValues: {
      fullName: formData.step3?.fullName ?? '',
      phone: formData.step3?.phone ?? '',
      nic: formData.step3?.nic ?? '',
    },
  });

  const step4Form = useForm<SignupStep4Values>({
    resolver: step4Resolver,
    defaultValues: {
      role: formData.step4?.role,
      licenseNumber: formData.step4?.licenseNumber ?? '',
      licenseExpiryDate: formData.step4?.licenseExpiryDate ?? '',
      employeeId: formData.step4?.employeeId ?? '',
      department: formData.step4?.department ?? '',
      designation: formData.step4?.designation ?? '',
      officeLocation: formData.step4?.officeLocation ?? '',
    },
  });

  const step5Form = useForm<SignupStep5Values>({
    resolver: zodResolver(signupStep5Schema),
    defaultValues: {
      password: formData.step5?.password ?? '',
      confirmPassword: formData.step5?.confirmPassword ?? '',
    },
  });

  const selectedRole = step4Form.watch('role');
  const password = step5Form.watch('password') ?? '';
  const otpRegistration = step2Form.register('otp');
  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z\d]/.test(password),
    }),
    [password]
  );

  useEffect(() => {
    if (otpResendCountdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setOtpResendCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpResendCountdown]);

  const summaryRows = [
    { label: 'Email', value: formData.step1?.email ?? '-' },
    { label: 'Full name', value: formData.step3?.fullName ?? '-' },
    {
      label: 'Role',
      value: formData.step4?.role ? ROLE_LABELS[formData.step4.role] : '-',
    },
    {
      label: 'Phone',
      value: formData.step3?.phone ?? '-',
    },
  ];

  const clearFieldErrors = () => {
    step1Form.clearErrors();
    step2Form.clearErrors();
    step3Form.clearErrors();
    step4Form.clearErrors();
    step5Form.clearErrors();
  };

  const applySignupFieldErrors = (fieldErrors?: Record<string, string>) => {
    if (!fieldErrors) {
      return false;
    }

    let nextStep: SignupStep | null = null;

    Object.entries(fieldErrors).forEach(([field, message]) => {
      switch (field) {
        case 'email':
          step1Form.setError('email', { type: 'server', message });
          nextStep = nextStep ?? 1;
          break;
        case 'otp':
          step2Form.setError('otp', { type: 'server', message });
          nextStep = nextStep ?? 2;
          break;
        case 'fullName':
        case 'phone':
        case 'nic':
          step3Form.setError(field as 'fullName' | 'phone' | 'nic', {
            type: 'server',
            message,
          });
          nextStep = nextStep ?? 3;
          break;
        case 'requestedRole':
          step4Form.setError('role', { type: 'server', message });
          nextStep = nextStep ?? 4;
          break;
        case 'licenseNumber':
        case 'licenseExpiryDate':
        case 'employeeId':
        case 'department':
        case 'designation':
        case 'officeLocation':
          step4Form.setError(
            field as
              | 'licenseNumber'
              | 'licenseExpiryDate'
              | 'employeeId'
              | 'department'
              | 'designation'
              | 'officeLocation',
            { type: 'server', message }
          );
          nextStep = nextStep ?? 4;
          break;
        case 'password':
        case 'confirmPassword':
          step5Form.setError(field as 'password' | 'confirmPassword', {
            type: 'server',
            message,
          });
          nextStep = nextStep ?? 5;
          break;
        default:
          break;
      }
    });

    if (nextStep) {
      setCurrentStep(nextStep);
      return true;
    }

    return false;
  };

  const handleStep1Submit = async (data: SignupStep1Values) => {
    setServerError(null);

    try {
      const email = data.email.trim().toLowerCase();
      await sendOTPApi(email);
      setFormData((prev) => ({ ...prev, step1: { email } }));
      setOtpVerified(false);
      setCurrentStep(2);
      setOtpResendCountdown(120);
      step2Form.setValue('otp', '');
    } catch (error: unknown) {
      setServerError(getErrorMessage(error) || 'Failed to send verification code. Please try again.');
    }
  };

  const handleRoleSelection = (role: 'DRIVER' | 'SYSTEM_USER') => {
    step4Form.setValue('role', role, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });

    step4Form.clearErrors([
      'role',
      'licenseNumber',
      'licenseExpiryDate',
      'employeeId',
      'department',
      'designation',
      'officeLocation',
    ]);

    if (role === 'DRIVER') {
      step4Form.setValue('employeeId', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      step4Form.setValue('department', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      step4Form.setValue('designation', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      step4Form.setValue('officeLocation', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    } else {
      step4Form.setValue('licenseNumber', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      step4Form.setValue('licenseExpiryDate', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    }

    if (serverError) {
      setServerError(null);
    }
  };

  const handleStep2Submit = async (data: SignupStep2Values) => {
    setServerError(null);
    const normalizedOtp = data.otp.replace(/\D/g, '').slice(0, 6);
    const parsed = signupStep2Schema.safeParse({ otp: normalizedOtp });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ??
        'Please enter a valid verification code.';
      step2Form.setError('otp', { type: 'manual', message });
      setServerError(message);
      return;
    }

    try {
      const response = await verifyOTPApi(formData.step1?.email ?? '', normalizedOtp);

      if (!response.success || (response.data && !response.data.verified)) {
        throw new Error('[INVALID_OTP] Invalid verification code.');
      }

      setOtpVerified(true);
      setFormData((prev) => ({ ...prev, step2: { otp: normalizedOtp } }));
      setCurrentStep(3);
    } catch (error: unknown) {
      let message = 'Verification failed. Please try again.';
      let backendMessage = '';

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        backendMessage = String(error.response.data.message);
      } else if (error instanceof Error) {
        backendMessage = error.message;
      }

      if (backendMessage.includes('[INVALID_OTP]')) {
        message = 'The verification code you entered is incorrect. Please try again.';
      } else if (backendMessage.includes('[OTP_EXPIRED]')) {
        message = 'Your verification code has expired. Please request a new code to continue.';
      } else if (backendMessage.includes('[NO_OTP]')) {
        message = 'No verification code was found for this email. Please request a new code.';
      } else if (backendMessage) {
        message = backendMessage;
      }

      step2Form.setError('otp', { type: 'server', message });
      setServerError(message);
    }
  };

  const handleStep3Submit = (data: SignupStep3Values) => {
    setServerError(null);
    setFormData((prev) => ({
      ...prev,
      step3: {
        fullName: data.fullName.trim(),
        phone: data.phone.trim().replace(/\s+/g, ''),
        nic: data.nic.trim().replace(/\s+/g, ''),
      },
    }));
    setCurrentStep(4);
  };

  const handleStep4Submit = (data: SignupStep4Values) => {
    setServerError(null);
    setFormData((prev) => ({
      ...prev,
      step4: {
        ...data,
        licenseNumber: data.licenseNumber?.trim().toUpperCase() ?? '',
        licenseExpiryDate: data.licenseExpiryDate?.trim() ?? '',
        employeeId: data.employeeId?.trim().toUpperCase() ?? '',
        department: data.department?.trim() ?? '',
        designation: data.designation?.trim() ?? '',
        officeLocation: data.officeLocation?.trim() ?? '',
      },
    }));
    setCurrentStep(5);
  };

  const handleStep5Submit = async (data: SignupStep5Values) => {
    setServerError(null);
    clearFieldErrors();

    if (!otpVerified) {
      setServerError('Please verify your email address before completing registration.');
      setCurrentStep(2);
      return;
    }

    const completeSignupData = {
      email: formData.step1?.email ?? '',
      password: data.password,
      confirmPassword: data.confirmPassword,
      fullName: formData.step3?.fullName ?? '',
      phone: formData.step3?.phone ?? '',
      nic: formData.step3?.nic ?? '',
      requestedRole: formData.step4?.role as 'DRIVER' | 'SYSTEM_USER',
      licenseNumber: formData.step4?.licenseNumber,
      licenseExpiryDate: formData.step4?.licenseExpiryDate,
      employeeId: formData.step4?.employeeId,
      department: formData.step4?.department,
      designation: formData.step4?.designation,
      officeLocation: formData.step4?.officeLocation,
    };

    try {
      await signupApi(completeSignupData);
      setFormData((prev) => ({ ...prev, step5: data }));
      setIsSuccess(true);
    } catch (error: unknown) {
      const fieldErrors = getFieldErrors(error);
      const handled = applySignupFieldErrors(fieldErrors);

      if (!handled) {
        setServerError(getErrorMessage(error));
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setServerError(null);
      setCurrentStep((currentStep - 1) as SignupStep);
    }
  };

  const handleOtpChange = (value: string) => {
    const normalized = value.replace(/\D/g, '').slice(0, 6);
    step2Form.setValue('otp', normalized, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    if (serverError) {
      setServerError(null);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.step1?.email || otpResendCountdown > 0) {
      return;
    }

    setServerError(null);
    setIsResendingOtp(true);

    try {
      await sendOTPApi(formData.step1.email);
      step2Form.setValue('otp', '');
      step2Form.clearErrors('otp');
      setOtpVerified(false);
      setOtpResendCountdown(120);
    } catch (error: unknown) {
      setServerError(getErrorMessage(error) || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthStatusPanel
        icon={CheckCircle2}
        tone="success"
        title="Registration submitted"
        description="Your account request has been created successfully and is now pending administrator approval."
      >
        <div className="space-y-4">
          <AuthInlineMessage
            type="info"
            message="You will be able to sign in after your account is reviewed and approved."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => router.push(AUTH_ROUTES.LOGIN)} className="w-full">
              <LogIn className="h-4 w-4" />
              Go to sign in
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(PUBLIC_ROUTES.HOME)}
              className="w-full"
            >
              <Home className="h-4 w-4" />
              Back to home
            </Button>
          </div>
        </div>
      </AuthStatusPanel>
    );
  }

  return (
    <div className="space-y-6">
      <AuthInlineMessage type="error" message={serverError} />

      {currentStep === 1 ? (
        <motion.form
          key="step1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step1Form.handleSubmit(handleStep1Submit)}
          className="space-y-6"
          noValidate
        >
          <AuthField
            htmlFor="email"
            label="Email address"
            error={step1Form.formState.errors.email?.message}
            required
          >
            <AuthInput
              id="email"
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              disabled={step1Form.formState.isSubmitting}
              aria-invalid={Boolean(step1Form.formState.errors.email)}
              {...step1Form.register('email')}
            />
          </AuthField>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={step1Form.formState.isSubmitting}
          >
            {step1Form.formState.isSubmitting ? (
              <>
                <LoadingSpinner size={16} />
                Sending verification code...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Continue with email
              </>
            )}
          </Button>
        </motion.form>
      ) : null}

      {currentStep === 2 ? (
        <motion.form
          key="step2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step2Form.handleSubmit(handleStep2Submit)}
          className="space-y-6"
          noValidate
        >
          <AuthSectionHeader
            title="Confirm your email"
            description={`Enter the 6-digit verification code sent to ${formData.step1?.email ?? 'your email address'}.`}
          />

          <AuthField
            htmlFor="otp"
            label="Verification code"
            error={step2Form.formState.errors.otp?.message}
            hint="Codes are numeric and valid for a limited time."
            required
          >
            <AuthInput
              id="otp"
              name={otpRegistration.name}
              ref={otpRegistration.ref}
              onBlur={otpRegistration.onBlur}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              className="text-center text-2xl font-bold tracking-[0.35em]"
              disabled={step2Form.formState.isSubmitting}
              aria-invalid={Boolean(step2Form.formState.errors.otp)}
              value={step2Form.watch('otp') ?? ''}
              onChange={(event) => handleOtpChange(event.target.value)}
            />
          </AuthField>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Need another code?</p>
              <p className="text-xs text-slate-500">
                {otpResendCountdown > 0
                  ? `You can request a new code in ${formatCountdown(otpResendCountdown)}.`
                  : 'You can request a fresh verification code now.'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={otpResendCountdown > 0 || isResendingOtp}
              onClick={handleResendOtp}
            >
              {isResendingOtp ? (
                <>
                  <LoadingSpinner size={16} />
                  Resending...
                </>
              ) : (
                'Resend code'
              )}
            </Button>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handlePreviousStep}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={step2Form.formState.isSubmitting}
            >
              {step2Form.formState.isSubmitting ? (
                <>
                  <LoadingSpinner size={16} />
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      ) : null}

      {currentStep === 3 ? (
        <motion.form
          key="step3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step3Form.handleSubmit(handleStep3Submit)}
          className="space-y-6"
          noValidate
        >
          <AuthSectionHeader
            title="Add your personal details"
            description="These details help administrators identify and review your registration request accurately."
          />

          <div className="grid gap-5">
            <AuthField
              htmlFor="fullName"
              label="Full name"
              error={step3Form.formState.errors.fullName?.message}
              required
            >
              <AuthInput
                id="fullName"
                autoFocus
                autoComplete="name"
                placeholder="Enter your full name"
                disabled={step3Form.formState.isSubmitting}
                {...step3Form.register('fullName')}
              />
            </AuthField>

            <div className="grid gap-5 md:grid-cols-2">
              <AuthField
                htmlFor="phone"
                label="Phone number"
                error={step3Form.formState.errors.phone?.message}
                required
              >
                <AuthInput
                  id="phone"
                  autoComplete="tel"
                  placeholder="0771234567"
                  disabled={step3Form.formState.isSubmitting}
                  {...step3Form.register('phone')}
                />
              </AuthField>

              <AuthField
                htmlFor="nic"
                label="NIC number"
                error={step3Form.formState.errors.nic?.message}
                required
              >
                <AuthInput
                  id="nic"
                  placeholder="200012345678 or 123456789V"
                  disabled={step3Form.formState.isSubmitting}
                  {...step3Form.register('nic')}
                />
              </AuthField>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handlePreviousStep}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={step3Form.formState.isSubmitting}>
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.form>
      ) : null}

      {currentStep === 4 ? (
        <motion.form
          key="step4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step4Form.handleSubmit(handleStep4Submit)}
          className="space-y-6"
          noValidate
        >
          <AuthSectionHeader
            title="Choose your role"
            description="Select the role that matches how you will use VFMS. We will show only the required qualification fields."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {roleCards.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedRole === item.role;

              return (
                <button
	                  key={item.role}
	                  type="button"
	                  onClick={() => handleRoleSelection(item.role)}
	                  className={[
                    'rounded-3xl border p-5 text-left transition-all',
                    isSelected
                      ? 'border-amber-300 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-2xl',
                      isSelected ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </button>
              );
            })}
          </div>

          {step4Form.formState.errors.role?.message ? (
            <p className="text-xs font-medium text-red-600">
              {step4Form.formState.errors.role.message}
            </p>
          ) : null}

          {selectedRole === 'DRIVER' ? (
            <div className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
              <AuthField
                htmlFor="licenseNumber"
                label="License number"
                error={step4Form.formState.errors.licenseNumber?.message}
                required
              >
                <AuthInput
                  id="licenseNumber"
                  placeholder="DL0123456"
                  disabled={step4Form.formState.isSubmitting}
                  {...step4Form.register('licenseNumber')}
                />
              </AuthField>

              <AuthField
                htmlFor="licenseExpiryDate"
                label="License expiry date"
                error={step4Form.formState.errors.licenseExpiryDate?.message}
                required
              >
                <AuthInput
                  id="licenseExpiryDate"
                  type="date"
                  disabled={step4Form.formState.isSubmitting}
                  {...step4Form.register('licenseExpiryDate')}
                />
              </AuthField>
            </div>
          ) : null}

          {selectedRole === 'SYSTEM_USER' ? (
            <div className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
              <AuthField
                htmlFor="employeeId"
                label="Employee ID"
                error={step4Form.formState.errors.employeeId?.message}
                required
              >
                <AuthInput
                  id="employeeId"
                  placeholder="EMP001234"
                  disabled={step4Form.formState.isSubmitting}
                  {...step4Form.register('employeeId')}
                />
              </AuthField>

              <AuthField
                htmlFor="department"
                label="Department"
                error={step4Form.formState.errors.department?.message}
                required
              >
                <AuthSelect
                  id="department"
                  disabled={step4Form.formState.isSubmitting}
                  {...step4Form.register('department')}
                >
                  <option value="">Select department</option>
                  {DEPARTMENT_OPTIONS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </AuthSelect>
              </AuthField>

              <AuthField
                htmlFor="designation"
                label="Designation"
                error={step4Form.formState.errors.designation?.message}
                required
              >
                <AuthInput
                  id="designation"
                  placeholder="Manager, Analyst, Coordinator"
                  disabled={step4Form.formState.isSubmitting}
                  {...step4Form.register('designation')}
                />
              </AuthField>

              <AuthField
                htmlFor="officeLocation"
                label="Office location"
                error={step4Form.formState.errors.officeLocation?.message}
                required
              >
                <AuthInput
                  id="officeLocation"
                  placeholder="Colombo, Galle, Kandy"
                  disabled={step4Form.formState.isSubmitting}
                  {...step4Form.register('officeLocation')}
                />
              </AuthField>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handlePreviousStep}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={step4Form.formState.isSubmitting}>
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.form>
      ) : null}

      {currentStep === 5 ? (
        <motion.form
          key="step5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step5Form.handleSubmit(handleStep5Submit)}
          className="space-y-6"
          noValidate
        >
          <AuthSectionHeader
            title="Secure your account"
            description="Create a strong password and review your registration details before submitting your account request."
          />

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-5">
              <PasswordField
                id="password"
                label="Create password"
                placeholder="Create a secure password"
                autoFocus
                autoComplete="new-password"
                error={step5Form.formState.errors.password?.message}
                disabled={step5Form.formState.isSubmitting}
                required
                {...step5Form.register('password')}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Password requirements
                </p>
                <div className="mt-3 space-y-2">
                  <PasswordRequirement satisfied={passwordChecks.length} label="At least 8 characters" />
                  <PasswordRequirement satisfied={passwordChecks.uppercase} label="One uppercase letter" />
                  <PasswordRequirement satisfied={passwordChecks.lowercase} label="One lowercase letter" />
                  <PasswordRequirement satisfied={passwordChecks.number} label="One number" />
                  <PasswordRequirement satisfied={passwordChecks.special} label="One special character" />
                </div>
              </div>

              <PasswordField
                id="confirmPassword"
                label="Confirm password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={step5Form.formState.errors.confirmPassword?.message}
                disabled={step5Form.formState.isSubmitting}
                required
                {...step5Form.register('confirmPassword')}
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Registration summary
                  </p>
                  <h3 className="text-lg font-bold text-slate-950">Review before submit</h3>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {summaryRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {row.label}
                    </span>
                    <span className="text-sm font-medium text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs leading-6 text-slate-500">
                By submitting, your account will enter the approval queue. An administrator must approve access before you can sign in.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handlePreviousStep}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={step5Form.formState.isSubmitting}>
              {step5Form.formState.isSubmitting ? (
                <>
                  <LoadingSpinner size={16} />
                  Submitting request...
                </>
              ) : (
                <>
                  Submit registration
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      ) : null}

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href={AUTH_ROUTES.LOGIN} className="font-semibold text-slate-900 hover:text-amber-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
