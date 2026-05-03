'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type FieldError, type FieldErrors, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronLeft, ChevronRight, CircleCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ZodError } from 'zod';

import {
  AuthField,
  AuthFormLinks,
  AuthInlineMessage,
  AuthInput,
  AuthSectionHeader,
  AuthStatusPanel,
  PasswordField,
} from '@/components/auth/auth-ui';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  getErrorMessage,
  getFieldErrors,
  signupApi,
  verifyStaffDetailsApi,
  verifyStaffEmailApi,
} from '@/lib/api/auth';
import { AUTH_ROUTES, PUBLIC_ROUTES } from '@/lib/constants/routes';
import {
  signupStep1Schema,
  signupStep3Schema,
  signupStep4Schema,
  signupStep5Schema,
  type SignupStep1Values,
  type SignupStep3Values,
  type SignupStep4Values,
  type SignupStep5Values,
} from '@/lib/validators/auth/signup-schema';

type SignupStep = 1 | 2 | 3 | 4;

interface SignupFormData {
  step1: SignupStep1Values;
  step3: SignupStep3Values;
  step4: SignupStep4Values;
  step5: SignupStep5Values;
}

interface SignupAlert {
  title?: string;
  message: string;
}

const SIGNUP_ERROR_COPY = {
  staffNotFound: {
    title: 'Staff record not found',
    message: 'Use your official company email or contact the system administrator.',
  },
  staffInactive: {
    title: 'Staff record inactive',
    message: 'Contact the system administrator.',
  },
  staffVerificationFailed: {
    title: 'Staff verification failed',
    message: 'Please check your details or contact the system administrator.',
  },
  accountExists: {
    title: 'Account already exists',
    message: 'Please sign in or contact the system administrator.',
  },
  unknown: {
    title: 'Unable to continue',
    message: 'Please try again.',
  },
} as const;

function normalizeText(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function hasRegistryFieldErrors(fieldErrors?: Record<string, string>): boolean {
  if (!fieldErrors) {
    return false;
  }

  return Object.keys(fieldErrors).some((field) =>
    ['employeeId', 'email', 'fullName', 'nic', 'phone'].includes(field)
  );
}

function mapSignupApiError(
  title: string,
  fieldErrors?: Record<string, string>
): SignupAlert {
  const normalizedTitle = normalizeText(title);
  const fieldMessages = Object.values(fieldErrors ?? {});
  const normalizedFieldMessages = fieldMessages.map((message) => normalizeText(message));
  const combined = [normalizedTitle, ...normalizedFieldMessages].join(' ');

  if (combined.includes('already exists') || combined.includes('duplicate')) {
    return SIGNUP_ERROR_COPY.accountExists;
  }

  if (combined.includes('inactive')) {
    return SIGNUP_ERROR_COPY.staffInactive;
  }

  if (
    combined.includes('staff record not found') ||
    combined.includes('not registered in the company staff registry')
  ) {
    return SIGNUP_ERROR_COPY.staffNotFound;
  }

  if (
    hasRegistryFieldErrors(fieldErrors) ||
    combined.includes('staff verification failed') ||
    combined.includes('does not match the verified company staff record')
  ) {
    return SIGNUP_ERROR_COPY.staffVerificationFailed;
  }

  if (title && title !== 'Validation failed') {
    return { title, message: title };
  }

  return SIGNUP_ERROR_COPY.unknown;
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
          'flex h-5 w-5 items-center justify-center rounded-full border',
          satisfied
            ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-400',
        ].join(' ')}
      >
        <CircleCheck className="h-3.5 w-3.5" />
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

function createSafeResolver<T extends Record<string, unknown>>(schema: object): Resolver<T> {
  return async (values, context, options) => {
    try {
      return await zodResolver(schema as never)(values, context, options);
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
          values: {} as never,
          errors: fieldErrors as FieldErrors<T>,
        };
      }

      throw error;
    }
  };
}

const step1Resolver = createSafeResolver<SignupStep1Values>(signupStep1Schema);
const step3Resolver = createSafeResolver<SignupStep3Values>(signupStep3Schema);
const step4Resolver = createSafeResolver<SignupStep4Values>(signupStep4Schema);
const step5Resolver = createSafeResolver<SignupStep5Values>(signupStep5Schema);

export function SignupForm() {
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});
  const [serverAlert, setServerAlert] = useState<SignupAlert | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const step1Form = useForm<SignupStep1Values>({
    resolver: step1Resolver,
    mode: 'onChange',
    defaultValues: {
      email: formData.step1?.email ?? '',
    },
  });

  const step3Form = useForm<SignupStep3Values>({
    resolver: step3Resolver,
    defaultValues: {
      fullName: formData.step3?.fullName ?? '',
      phone: formData.step3?.phone ?? '',
      nic: formData.step3?.nic ?? '',
    },
  });

  const step4Form = useForm<SignupStep4Values>({
    resolver: step4Resolver,
    defaultValues: {
      role: formData.step4?.role ?? 'SYSTEM_USER',
      employeeId: formData.step4?.employeeId ?? '',
    },
  });

  const step5Form = useForm<SignupStep5Values>({
    resolver: step5Resolver,
    defaultValues: {
      password: formData.step5?.password ?? '',
      confirmPassword: formData.step5?.confirmPassword ?? '',
    },
  });

  const password = useWatch({
    control: step5Form.control,
    name: 'password',
  }) ?? '';
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z\d]/.test(password),
  };

  const clearFieldErrors = () => {
    step1Form.clearErrors();
    step3Form.clearErrors();
    step4Form.clearErrors();
    step5Form.clearErrors();
  };

  const applySignupFieldErrors = (
    fieldErrors: Record<string, string> | undefined,
    alertTitle: string
  ) => {
    let nextStep: SignupStep | null = null;

    Object.entries(fieldErrors ?? {}).forEach(([field]) => {
      switch (field) {
        case 'email':
          nextStep = nextStep ?? 1;
          break;
        case 'fullName':
        case 'phone':
        case 'nic':
          nextStep = nextStep ?? 2;
          break;
        case 'requestedRole':
          nextStep = nextStep ?? 3;
          break;
        case 'employeeId':
          nextStep = nextStep ?? 3;
          break;
        case 'password':
        case 'confirmPassword':
          nextStep = nextStep ?? 4;
          break;
        default:
          break;
      }
    });

    setServerAlert(mapSignupApiError(alertTitle, fieldErrors));

    if (nextStep) {
      setCurrentStep(nextStep);
      return true;
    }

    return true;
  };

  const handleStep1Submit = async (data: SignupStep1Values) => {
    setServerAlert(null);
    const email = data.email.trim().toLowerCase();
    step1Form.clearErrors();

    try {
      await verifyStaffEmailApi({ email });
      setFormData((prev) => ({ ...prev, step1: { email } }));
      setCurrentStep(2);
    } catch (error: unknown) {
      const fieldErrors = getFieldErrors(error);
      setServerAlert(mapSignupApiError(getErrorMessage(error), fieldErrors));
    }
  };

  const handleStep3Submit = (data: SignupStep3Values) => {
    setServerAlert(null);
    setFormData((prev) => ({
      ...prev,
      step3: {
        fullName: data.fullName.trim(),
        phone: data.phone.trim().replace(/\s+/g, ''),
        nic: data.nic.trim().replace(/\s+/g, ''),
      },
    }));
    setCurrentStep(3);
  };

  const handleStep4Submit = async (data: SignupStep4Values) => {
    setServerAlert(null);

    const employeeId = data.employeeId?.trim().toUpperCase() ?? '';
    const verificationPayload = {
      email: formData.step1?.email ?? '',
      fullName: formData.step3?.fullName ?? '',
      phone: formData.step3?.phone ?? '',
      nic: formData.step3?.nic ?? '',
      employeeId,
    };

    step4Form.clearErrors();

    try {
      await verifyStaffDetailsApi(verificationPayload);
      setFormData((prev) => ({
        ...prev,
        step4: {
          role: 'SYSTEM_USER',
          employeeId,
        },
      }));
      setCurrentStep(4);
    } catch (error: unknown) {
      const title = getErrorMessage(error);
      const fieldErrors = getFieldErrors(error);
      const handled = applySignupFieldErrors(fieldErrors, title);

      if (!handled) {
        setServerAlert(SIGNUP_ERROR_COPY.staffVerificationFailed);
      }
    }
  };

  const handleStep5Submit = async (data: SignupStep5Values) => {
    setServerAlert(null);
    clearFieldErrors();

    const completeSignupData = {
      email: formData.step1?.email ?? '',
      password: data.password,
      confirmPassword: data.confirmPassword,
      fullName: formData.step3?.fullName ?? '',
      phone: formData.step3?.phone ?? '',
      nic: formData.step3?.nic ?? '',
      requestedRole: 'SYSTEM_USER' as const,
      employeeId: formData.step4?.employeeId,
    };

    try {
      await signupApi(completeSignupData);
      setFormData((prev) => ({ ...prev, step5: data }));
      setIsSuccess(true);
    } catch (error: unknown) {
      const fieldErrors = getFieldErrors(error);
      const title = getErrorMessage(error);
      const handled = applySignupFieldErrors(fieldErrors, title);

      if (!handled) {
        setServerAlert(mapSignupApiError(title, fieldErrors));
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setServerAlert(null);
      setCurrentStep((currentStep - 1) as SignupStep);
    }
  };

  if (isSuccess) {
    return (
      <AuthStatusPanel
        icon={CheckCircle2}
        tone="success"
        title="Check your company email"
        description="Your registration has been submitted. Verify your email to activate your FleetPro account."
      />
    );
  }

  return (
    <div className="space-y-2">
      <AuthInlineMessage
        type="error"
        title={serverAlert?.title}
        message={serverAlert?.message ?? null}
        className="shadow-sm"
      />

      {currentStep === 1 ? (
        <motion.form
          key="step1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step1Form.handleSubmit(handleStep1Submit)}
          className="space-y-3"
          noValidate
        >
          <AuthSectionHeader
            eyebrow="Step 1 of 4"
            title="Company Email"
            description="Enter your company email."
          />

          <AuthField
            htmlFor="email"
            label="Company Email Address"
            error={step1Form.formState.errors.email?.message}
            required
          >
            <AuthInput
              id="email"
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="name@company.com"
              disabled={step1Form.formState.isSubmitting}
              aria-invalid={Boolean(step1Form.formState.errors.email)}
              {...step1Form.register('email')}
            />
          </AuthField>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={step1Form.formState.isSubmitting || !step1Form.formState.isValid}
          >
            {step1Form.formState.isSubmitting ? (
              <>
                <LoadingSpinner size={16} />
                Checking...
              </>
            ) : (
              'Continue'
            )}
          </Button>

          <AuthFormLinks
            prompt="Already have an account?"
            actionLabel="Sign in"
            actionHref={AUTH_ROUTES.LOGIN}
            homeHref={PUBLIC_ROUTES.HOME}
          />
        </motion.form>
      ) : null}

      {currentStep === 2 ? (
        <motion.form
          key="step2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step3Form.handleSubmit(handleStep3Submit)}
          className="space-y-3"
          noValidate
        >
          <AuthSectionHeader
            eyebrow="Step 2 of 4"
            title="Personal Details"
            description="Enter the details in your staff profile."
          />

          <div className="grid gap-2.5">
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

            <div className="grid gap-2.5 md:grid-cols-2">
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

          <AuthFormLinks
            prompt="Already have an account?"
            actionLabel="Sign in"
            actionHref={AUTH_ROUTES.LOGIN}
            homeHref={PUBLIC_ROUTES.HOME}
          />
        </motion.form>
      ) : null}

      {currentStep === 3 ? (
        <motion.form
          key="step3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={step4Form.handleSubmit(handleStep4Submit)}
           className="space-y-3"
          noValidate
        >
          <AuthSectionHeader
            eyebrow="Step 3 of 4"
            title="Staff Verification"
            description="Confirm your staff identity."
          />

          <AuthField
            htmlFor="employeeId"
            label="Employee ID"
            error={step4Form.formState.errors.employeeId?.message}
            required
          >
            <AuthInput
              id="employeeId"
              autoFocus
              placeholder="EMP001"
              disabled={step4Form.formState.isSubmitting}
              {...step4Form.register('employeeId')}
            />
          </AuthField>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handlePreviousStep}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={step4Form.formState.isSubmitting}>
              {step4Form.formState.isSubmitting ? (
                <>
                  <LoadingSpinner size={16} />
                  Checking...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <AuthFormLinks
            prompt="Already have an account?"
            actionLabel="Sign in"
            actionHref={AUTH_ROUTES.LOGIN}
            homeHref={PUBLIC_ROUTES.HOME}
          />
        </motion.form>
      ) : null}

      {currentStep === 4 ? (
  <motion.form
    key="step4"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    onSubmit={step5Form.handleSubmit(handleStep5Submit)}
    className="space-y-2 lg:flex lg:min-h-[360px] lg:flex-col"
    noValidate
  >
    <AuthSectionHeader
      eyebrow="Step 4 of 4"
      title="Password Setup"
      description="Create a secure password."
    />

    <div className="space-y-2 lg:sidebar-scrollbar-hidden lg:max-h-[210px] lg:flex-1 lg:overflow-y-auto lg:pr-1">
      <PasswordField
        id="password"
        label="Create Password"
        placeholder="Create a strong password"
        autoFocus
        autoComplete="new-password"
        error={step5Form.formState.errors.password?.message}
        disabled={step5Form.formState.isSubmitting}
        required
        {...step5Form.register('password')}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Password requirements
        </p>

        <div className="mt-1 grid gap-1 sm:grid-cols-2">
          <PasswordRequirement
            satisfied={passwordChecks.length}
            label="At least 8 characters"
          />
          <PasswordRequirement
            satisfied={passwordChecks.uppercase}
            label="One uppercase letter"
          />
          <PasswordRequirement
            satisfied={passwordChecks.lowercase}
            label="One lowercase letter"
          />
          <PasswordRequirement
            satisfied={passwordChecks.number}
            label="One number"
          />
          <PasswordRequirement
            satisfied={passwordChecks.special}
            label="One special character"
          />
        </div>
      </div>

      <PasswordField
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        error={step5Form.formState.errors.confirmPassword?.message}
        disabled={step5Form.formState.isSubmitting}
        required
        {...step5Form.register('confirmPassword')}
      />
    </div>

    <div className="space-y-2 pt-0">
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handlePreviousStep}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="submit"
          className="flex-1"
          disabled={step5Form.formState.isSubmitting}
        >
          {step5Form.formState.isSubmitting ? (
            <>
              <LoadingSpinner size={16} />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>

      <AuthFormLinks
        prompt="Already have an account?"
        actionLabel="Sign in"
        actionHref={AUTH_ROUTES.LOGIN}
        homeHref={PUBLIC_ROUTES.HOME}
      />
    </div>
  </motion.form>
) : null}
    </div>
  );
}
