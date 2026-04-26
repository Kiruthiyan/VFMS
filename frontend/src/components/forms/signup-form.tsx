'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mail,
  Zap,
  User,
  Shield,
  Lock,
  Home,
  Clock,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
import { sendOTPApi, verifyOTPApi, signupApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AUTH_ROUTES, PUBLIC_ROUTES } from '@/lib/constants/routes';
import { SIGNUP_CONFIG } from '@/lib/constants/signup-config';
import { ERROR_MESSAGES } from '@/lib/constants/error-messages';

type SignupStep = 1 | 2 | 3 | 4 | 5;

interface SignupFormData {
  step1: SignupStep1Values;
  step2: SignupStep2Values;
  step3: SignupStep3Values;
  step4: SignupStep4Values;
  step5: SignupStep5Values;
}

// Password Requirement Item Component
function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          met ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
        animate={{ scale: met ? 1.1 : 1 }}
      >
        {met ? '✓' : '○'}
      </motion.div>
      <span className={`text-xs font-medium ${met ? 'text-emerald-700' : 'text-slate-600'}`}>
        {label}
      </span>
    </motion.div>
  );
}

const TOTAL_STEPS = SIGNUP_CONFIG.TOTAL_STEPS;
const STEP_TITLES = SIGNUP_CONFIG.STEP_TITLES;
const STEP_DESCRIPTIONS = SIGNUP_CONFIG.STEP_DESCRIPTIONS;

export function SignupForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPasswordStep5, setShowPasswordStep5] = useState(false);
  const [showConfirmPasswordStep5, setShowConfirmPasswordStep5] = useState(false);

  // Step 1: Email
  const step1Form = useForm<SignupStep1Values>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: {
      email: formData.step1?.email || '',
    },
  });

  // Step 2: OTP
  const step2Form = useForm<SignupStep2Values>({
    resolver: zodResolver(signupStep2Schema),
    mode: 'onSubmit', // Only validate when user clicks Verify button, not while typing
    defaultValues: {
      otp: formData.step2?.otp || '',
    },
  });

  // Step 3: User Details
  const step3Form = useForm<SignupStep3Values>({
    resolver: zodResolver(signupStep3Schema),
    defaultValues: {
      fullName: formData.step3?.fullName || '',
      phone: formData.step3?.phone || '',
      nic: formData.step3?.nic || '',
    },
  });

  // Step 4: Role Selection
  const step4Form = useForm<SignupStep4Values>({
    resolver: zodResolver(signupStep4Schema),
    defaultValues: {
      role: formData.step4?.role,
      licenseNumber: formData.step4?.licenseNumber || '',
      licenseExpiryDate: formData.step4?.licenseExpiryDate || '',
    },
  });

  // Step 5: Security
  const step5Form = useForm<SignupStep5Values>({
    resolver: zodResolver(signupStep5Schema),
    defaultValues: {
      password: formData.step5?.password || '',
      confirmPassword: formData.step5?.confirmPassword || '',
    },
  });

  const selectedRole = step4Form.watch('role');
  const password = step5Form.watch('password');

  const passwordStrength = {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasMinLength: password.length >= 8,
  };

  const isPasswordStrong =
    passwordStrength.hasUppercase &&
    passwordStrength.hasLowercase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecialChar &&
    passwordStrength.hasMinLength;

  // Step Handlers
  const handleStep1Submit = async (data: SignupStep1Values) => {
    setServerError(null);
    try {
      // Call API to send OTP
      const response = await sendOTPApi(data.email);
      
      // Save to form state and advance
      setFormData((prev) => ({ ...prev, step1: data }));
      setCurrentStep(2);

      // Start countdown timer for RESEND button (2 minutes = 120 seconds to match backend OTP validity)
      setOtpResendCountdown(120);
      const timer = setInterval(() => {
        setOtpResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to send verification code. Please check your email address and try again.'
        : (err as any)?.message || 'Failed to send verification code. Please try again.';
      setServerError(message);
    }
  };

  const handleStep2Submit = async (data: SignupStep2Values) => {
    // Validate OTP length before sending to server
    if (data.otp.length !== 6) {
      setServerError('Verification code must be exactly 6 digits');
      return;
    }

    setServerError(null);
    try {
      // Verify OTP with backend
      const response = await verifyOTPApi(formData.step1?.email || '', data.otp);
      
      if (!response.success || (response.data && !(response.data as any).verified)) {
        throw new Error('[INVALID_OTP] Verification code is incorrect. Please check and try again.');
      }

      // Mark OTP as verified and save data
      setOtpVerified(true);
      setFormData((prev) => ({ ...prev, step2: data }));
      setCurrentStep(3);
    } catch (err: unknown) {
      let message = 'Verification failed. Please try again.';
      let errorMsg = '';
      
      // Extract error message from different error types
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if ((err as any)?.message) {
        errorMsg = (err as any).message;
      }

      // Map specific error codes to professional, user-friendly messages
      if (errorMsg.includes('[INVALID_OTP]')) {
        message = 'The verification code you entered is incorrect. Please try again.';
      } else if (errorMsg.includes('[OTP_EXPIRED]')) {
        message = 'Your verification code has expired. Please request a new code to continue.';
      } else if (errorMsg.includes('[NO_OTP]')) {
        message = 'No verification code found for your email. Please request a new code.';
      } else if (errorMsg) {
        message = errorMsg;
      }
      
      setServerError(message);
    }
  };

  // Clear server error when user starts typing a corrected code
  const handleOtpChange = (value: string) => {
    if (serverError) {
      setServerError(null);
    }
  };

  const handleStep3Submit = async (data: SignupStep3Values) => {
    setServerError(null);
    try {
      // Trim all string fields
      const trimmedData: SignupStep3Values = {
        fullName: data.fullName.trim(),
        phone: data.phone.trim().replace(/\s+/g, ''),
        nic: data.nic.trim().replace(/\s+/g, ''),
      };
      
      setFormData((prev) => ({ ...prev, step3: trimmedData }));
      setCurrentStep(4);
    } catch (err: unknown) {
      setServerError('Failed to save details. Please check all fields and try again.');
    }
  };

  const handleStep4Submit = async (data: SignupStep4Values) => {
    setServerError(null);
    try {
      // Validate role-specific fields
      if (data.role === 'DRIVER') {
        if (!data.licenseNumber?.trim()) {
          setServerError('License number is required for drivers');
          return;
        }
        if (!data.licenseExpiryDate?.trim()) {
          setServerError('License expiry date is required for drivers');
          return;
        }
        const expiryDate = new Date(data.licenseExpiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiryDate < today) {
          setServerError('License has expired. Please provide a valid license.');
          return;
        }
      }

      if (data.role === 'SYSTEM_USER') {
        if (!data.employeeId?.trim()) {
          setServerError('Employee ID is required for staff members');
          return;
        }
        if (!data.department?.trim()) {
          setServerError('Department is required for staff members');
          return;
        }
        if (!data.designation?.trim()) {
          setServerError('Designation is required for staff members');
          return;
        }
      }

      setFormData((prev) => ({ ...prev, step4: data }));
      setCurrentStep(5);
    } catch (err: unknown) {
      setServerError('Failed to save role details. Please try again.');
    }
  };

  const handleStep5Submit = async (data: SignupStep5Values) => {
    setServerError(null);
    try {
      // Check if OTP was verified
      if (!otpVerified) {
        setServerError('Please verify your email first');
        setCurrentStep(2);
        return;
      }

      // Combine all form data
      const completeSignupData = {
        email: formData.step1?.email || '',
        password: data.password,
        fullName: formData.step3?.fullName || '',
        phone: formData.step3?.phone || '',
        nic: formData.step3?.nic || '',
        role: formData.step4?.role as 'DRIVER' | 'SYSTEM_USER',
        licenseNumber: formData.step4?.licenseNumber,
        licenseExpiryDate: formData.step4?.licenseExpiryDate,
        employeeId: formData.step4?.employeeId,
        department: formData.step4?.department,
        designation: formData.step4?.designation,
        officeLocation: formData.step4?.officeLocation,
      };

      // Validate complete data
      if (!completeSignupData.email ||!completeSignupData.fullName || !completeSignupData.phone) {
        setServerError('Please complete all required fields');
        return;
      }

      // Call signup API
      await signupApi(completeSignupData);

      // Do NOT redirect to dashboard — account is pending admin approval
      setFormData((prev) => ({ ...prev, step5: data }));
      setIsSuccess(true);
    } catch (err: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || 
                      'Registration failed. Please check all fields and ensure your email has been verified.';
        
        // Handle specific error cases
        if (err.response?.status === 409) {
          errorMessage = 'This email is already registered. Please use a different email or sign in.';
        } else if (err.response?.status === 400) {
          errorMessage = err.response?.data?.message || 'Invalid registration data. Please check all fields.';
        }
      } else if ((err as any)?.message) {
        errorMessage = (err as any).message;
      }
      
      setServerError(errorMessage);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SignupStep);
    }
  };

  // Success State — Pending Admin Approval
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="text-center py-8 space-y-6"
      >
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative mx-auto w-20 h-20"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/20"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registration Successful</h2>
          <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-sm mx-auto">
            Your account has been created successfully and is currently{' '}
            <span className="font-semibold text-amber-600">pending admin approval</span>.
            You will be able to log in once your account has been approved.
          </p>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left"
        >
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Once your account is approved by an administrator, you can log in using your
            registered email and password.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => router.push(AUTH_ROUTES.LOGIN)}
            className="flex-1 h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/25 transition-all duration-200"
          >
            <LogIn size={16} strokeWidth={2} /> Go to Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => router.push(PUBLIC_ROUTES.HOME)}
            className="flex-1 h-12 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            <Home size={16} strokeWidth={2} /> Back to Home
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/40"
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStep / TOTAL_STEPS) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50/80 border border-red-200 backdrop-blur-sm"
          >
            <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="font-medium text-red-700 text-sm">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        {/* STEP 1: EMAIL */}
        {currentStep === 1 && (
          <motion.form
            key="step1"
            onSubmit={step1Form.handleSubmit(handleStep1Submit)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center"
              >
                <Mail className="w-6 h-6 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>

            <div className="space-y-1.5 mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {STEP_TITLES[1]}
              </h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                {STEP_DESCRIPTIONS[1]}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoFocus
                {...step1Form.register('email')}
                className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 focus:bg-white focus:shadow-lg focus:shadow-amber-500/15
                           hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                           disabled:opacity-50 placeholder:text-slate-400"
                disabled={step1Form.formState.isSubmitting}
              />
              <AnimatePresence>
                {step1Form.formState.errors.email && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step1Form.formState.errors.email.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(120, 113, 108, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={step1Form.formState.isSubmitting}
              className="relative w-full h-12 mt-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/25 overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative flex items-center gap-2">
                {step1Form.formState.isSubmitting ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    Send Code <ChevronRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>
        )}

        {/* STEP 2: OTP */}
        {currentStep === 2 && (
          <motion.form
            key="step2"
            onSubmit={step2Form.handleSubmit(handleStep2Submit)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center"
              >
                <Zap className="w-6 h-6 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>

            <div className="space-y-1.5 mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{STEP_TITLES[2]}</h2>
              <p className="text-slate-600 text-sm font-medium">
                Code sent to <span className="font-semibold text-slate-900">{formData.step1?.email}</span>
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="otp" className="block text-sm font-semibold text-slate-700">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                autoFocus
                {...step2Form.register('otp', {
                  onChange: (e) => handleOtpChange(e.target.value),
                })}
                className="w-full px-4 py-3.5 text-center text-2xl font-black tracking-widest rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-500/15
                           hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                           disabled:opacity-50"
                disabled={step2Form.formState.isSubmitting}
              />
              <AnimatePresence>
                {step2Form.formState.errors.otp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step2Form.formState.errors.otp.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
              className="text-center text-xs border-t border-slate-200 pt-4"
            >
              {otpResendCountdown > 0 ? (
                <p className="text-slate-700 font-medium">
                  Resend in <span className="text-blue-600 font-black">{otpResendCountdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setServerError(null);
                    step2Form.setValue('otp', ''); // Clear the field for fresh attempt
                    setOtpResendCountdown(120); // Match the 2-minute backend OTP validity
                    const timer = setInterval(() => {
                      setOtpResendCountdown((prev) => {
                        if (prev <= 1) clearInterval(timer);
                        return prev - 1;
                      });
                    }, 1000);
                  }}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Didn't receive? Resend
                </button>
              )}
            </motion.div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={step2Form.formState.isSubmitting}
                className="flex-1 h-11 border-2 border-slate-300 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <motion.button
                type="submit"
                disabled={step2Form.formState.isSubmitting}
                className="relative flex-1 h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl font-semibold overflow-hidden group disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-xl"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {step2Form.formState.isSubmitting ? (
                    <>
                      <LoadingSpinner size={16} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify <ChevronRight size={16} />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* STEP 3: PERSONAL DETAILS */}
        {currentStep === 3 && (
          <motion.form
            key="step3"
            onSubmit={step3Form.handleSubmit(handleStep3Submit)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center"
              >
                <User className="w-6 h-6 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>

            <div className="space-y-1.5 mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{STEP_TITLES[3]}</h2>
              <p className="text-slate-600 text-sm font-medium">{STEP_DESCRIPTIONS[3]}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                autoFocus
                {...step3Form.register('fullName')}
                className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white focus:shadow-lg focus:shadow-purple-500/15
                           hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                           disabled:opacity-50 placeholder:text-slate-400"
                disabled={step3Form.formState.isSubmitting}
              />
              <AnimatePresence>
                {step3Form.formState.errors.fullName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step3Form.formState.errors.fullName.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="077XXXXXXX"
                {...step3Form.register('phone')}
                className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white focus:shadow-lg focus:shadow-purple-500/15
                           hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                           disabled:opacity-50 placeholder:text-slate-400"
                disabled={step3Form.formState.isSubmitting}
              />
              <AnimatePresence>
                {step3Form.formState.errors.phone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step3Form.formState.errors.phone.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="nic" className="block text-sm font-semibold text-slate-700">
                NIC Number
              </label>
              <input
                id="nic"
                type="text"
                placeholder="199XXXXXXXX"
                {...step3Form.register('nic')}
                className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white focus:shadow-lg focus:shadow-purple-500/15
                           hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                           disabled:opacity-50 placeholder:text-slate-400"
                disabled={step3Form.formState.isSubmitting}
              />
              <AnimatePresence>
                {step3Form.formState.errors.nic && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step3Form.formState.errors.nic.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={step3Form.formState.isSubmitting}
                className="flex-1 h-11 border-2 border-slate-300 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <motion.button
                type="submit"
                disabled={step3Form.formState.isSubmitting}
                className="relative flex-1 h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl font-semibold overflow-hidden group disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-xl"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {step3Form.formState.isSubmitting ? (
                    <>
                      <LoadingSpinner size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight size={16} />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* STEP 4: ROLE SELECTION */}
        {currentStep === 4 && (
          <motion.form
            key="step4"
            onSubmit={step4Form.handleSubmit(handleStep4Submit)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>

            <div className="space-y-1.5 mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{STEP_TITLES[4]}</h2>
              <p className="text-slate-600 text-sm font-medium">{STEP_DESCRIPTIONS[4]}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                Select Your Role
              </label>
              <select
                id="role"
                autoFocus
                {...step4Form.register('role')}
                className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white appearance-none cursor-pointer backdrop-blur-sm transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 focus:bg-white focus:shadow-lg focus:shadow-cyan-500/15
                           hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                           disabled:opacity-50 placeholder:text-slate-400"
                disabled={step4Form.formState.isSubmitting}
              >
                <option value="">Choose your role...</option>
                <option value="DRIVER">Driver</option>
                <option value="SYSTEM_USER">Staff</option>
              </select>
              <AnimatePresence>
                {step4Form.formState.errors.role && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step4Form.formState.errors.role.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Driver Fields */}
            <AnimatePresence>
              {selectedRole === 'DRIVER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3.5 p-4 rounded-xl bg-cyan-50/60 border border-cyan-200/50"
                >
                  <p className="text-xs font-bold text-cyan-900 uppercase tracking-wide">License Information</p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
                    className="space-y-2.5"
                  >
                    <label htmlFor="licenseNumber" className="block text-sm font-semibold text-slate-700">
                      License Number
                    </label>
                    <input
                      id="licenseNumber"
                      type="text"
                      placeholder="DL0123456"
                      {...step4Form.register('licenseNumber')}
                      className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 focus:bg-white focus:shadow-lg focus:shadow-cyan-500/15
                                 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                                 disabled:opacity-50 placeholder:text-slate-400"
                      disabled={step4Form.formState.isSubmitting}
                    />
                    <AnimatePresence>
                      {step4Form.formState.errors.licenseNumber && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -4 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -4 }}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                        >
                          <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                          <p className="text-xs font-medium text-red-700">{step4Form.formState.errors.licenseNumber.message}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
                    className="space-y-2.5"
                  >
                    <label htmlFor="licenseExpiryDate" className="block text-sm font-semibold text-slate-700">
                      Expiry Date
                    </label>
                    <input
                      id="licenseExpiryDate"
                      type="date"
                      {...step4Form.register('licenseExpiryDate')}
                      className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 focus:bg-white focus:shadow-lg focus:shadow-cyan-500/15
                                 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                                 disabled:opacity-50"
                      disabled={step4Form.formState.isSubmitting}
                    />
                    <AnimatePresence>
                      {step4Form.formState.errors.licenseExpiryDate && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -4 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -4 }}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                        >
                          <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                          <p className="text-xs font-medium text-red-700">{step4Form.formState.errors.licenseExpiryDate.message}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SYSTEM_USER (Staff) Fields */}
            <AnimatePresence>
              {selectedRole === 'SYSTEM_USER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3.5 p-4 rounded-xl bg-teal-50/60 border border-teal-200/50"
                >
                  <p className="text-xs font-bold text-teal-900 uppercase tracking-wide">Staff Information</p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
                    className="space-y-2.5"
                  >
                    <label htmlFor="employeeId" className="block text-sm font-semibold text-slate-700">
                      Employee ID
                    </label>
                    <input
                      id="employeeId"
                      type="text"
                      placeholder="EMP001234"
                      {...step4Form.register('employeeId')}
                      className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:bg-white focus:shadow-lg focus:shadow-teal-500/15
                                 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                                 disabled:opacity-50 placeholder:text-slate-400"
                      disabled={step4Form.formState.isSubmitting}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 100, damping: 20 }}
                    className="space-y-2.5"
                  >
                    <label htmlFor="department" className="block text-sm font-semibold text-slate-700">
                      Department
                    </label>
                    <select
                      id="department"
                      {...step4Form.register('department')}
                      className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white appearance-none cursor-pointer backdrop-blur-sm transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:bg-white focus:shadow-lg focus:shadow-teal-500/15
                                 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                                 disabled:opacity-50"
                      disabled={step4Form.formState.isSubmitting}
                    >
                      <option value="">Select Department...</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Administration">Administration</option>
                      <option value="IT">IT</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
                    className="space-y-2.5"
                  >
                    <label htmlFor="designation" className="block text-sm font-semibold text-slate-700">
                      Designation
                    </label>
                    <input
                      id="designation"
                      type="text"
                      placeholder="Manager, Analyst, etc."
                      {...step4Form.register('designation')}
                      className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:bg-white focus:shadow-lg focus:shadow-teal-500/15
                                 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                                 disabled:opacity-50 placeholder:text-slate-400"
                      disabled={step4Form.formState.isSubmitting}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 100, damping: 20 }}
                    className="space-y-2.5"
                  >
                    <label htmlFor="officeLocation" className="block text-sm font-semibold text-slate-700">
                      Office Location (Optional)
                    </label>
                    <input
                      id="officeLocation"
                      type="text"
                      placeholder="Colombo, Galle, etc."
                      {...step4Form.register('officeLocation')}
                      className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:bg-white focus:shadow-lg focus:shadow-teal-500/15
                                 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                                 disabled:opacity-50 placeholder:text-slate-400"
                      disabled={step4Form.formState.isSubmitting}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={step4Form.formState.isSubmitting}
                className="flex-1 h-11 border-2 border-slate-300 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <motion.button
                type="submit"
                disabled={step4Form.formState.isSubmitting}
                className="relative flex-1 h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl font-semibold overflow-hidden group disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-xl"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {step4Form.formState.isSubmitting ? (
                    <>
                      <LoadingSpinner size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight size={16} />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* STEP 5: SECURITY SETUP */}
        {currentStep === 5 && (
          <motion.form
            key="step5"
            onSubmit={step5Form.handleSubmit(handleStep5Submit)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center"
              >
                <Lock className="w-6 h-6 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>

            <div className="space-y-1.5 mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{STEP_TITLES[5]}</h2>
              <p className="text-slate-600 text-sm font-medium">{STEP_DESCRIPTIONS[5]}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Create Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPasswordStep5 ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoFocus
                  {...step5Form.register('password')}
                  className="w-full px-4 py-3.5 pr-11 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                             focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 focus:bg-white focus:shadow-lg focus:shadow-red-500/15
                             hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                             disabled:opacity-50 placeholder:text-slate-400"
                  disabled={step5Form.formState.isSubmitting}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPasswordStep5(!showPasswordStep5)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-red-600 transition-colors duration-200"
                  disabled={step5Form.formState.isSubmitting}
                  aria-label={showPasswordStep5 ? 'Hide password' : 'Show password'}
                >
                  {showPasswordStep5 ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>

              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  {/* Password Requirements Checklist */}
                  <div className="space-y-2">
                    <RequirementItem 
                      met={passwordStrength.hasMinLength} 
                      label="At least 8 characters" 
                    />
                    <RequirementItem 
                      met={passwordStrength.hasUppercase} 
                      label="Uppercase letter (A-Z)" 
                    />
                    <RequirementItem 
                      met={passwordStrength.hasLowercase} 
                      label="Lowercase letter (a-z)" 
                    />
                    <RequirementItem 
                      met={passwordStrength.hasNumber} 
                      label="Number (0-9)" 
                    />
                    <RequirementItem 
                      met={passwordStrength.hasSpecialChar} 
                      label="Special character (!@#$%^&*)" 
                    />
                  </div>

                  {/* Strength Indicator */}
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ backgroundColor: passwordStrength.hasMinLength ? '#06b6d4' : '#e2e8f0' }}
                      className="h-2 flex-1 rounded-full transition-colors"
                    />
                    <motion.div
                      animate={{ backgroundColor: passwordStrength.hasUppercase && passwordStrength.hasLowercase ? '#06b6d4' : '#e2e8f0' }}
                      className="h-2 flex-1 rounded-full transition-colors"
                    />
                    <motion.div
                      animate={{ backgroundColor: passwordStrength.hasNumber && passwordStrength.hasSpecialChar ? '#06b6d4' : '#e2e8f0' }}
                      className="h-2 flex-1 rounded-full transition-colors"
                    />
                  </div>

                  <motion.p 
                    className="text-xs font-semibold"
                    animate={{ color: isPasswordStrong ? '#10b981' : '#ef4444' }}
                  >
                    {isPasswordStrong ? '✓ Password is strong and secure' : '⚠ Password does not meet all requirements'}
                  </motion.p>
                </motion.div>
              )}

              <AnimatePresence>
                {step5Form.formState.errors.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step5Form.formState.errors.password.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
              className="space-y-2.5"
            >
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPasswordStep5 ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...step5Form.register('confirmPassword')}
                  className="w-full px-4 py-3.5 pr-11 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                             focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 focus:bg-white focus:shadow-lg focus:shadow-red-500/15
                             hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                             disabled:opacity-50 placeholder:text-slate-400"
                  disabled={step5Form.formState.isSubmitting}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPasswordStep5(!showConfirmPasswordStep5)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-red-600 transition-colors duration-200"
                  disabled={step5Form.formState.isSubmitting}
                  aria-label={showConfirmPasswordStep5 ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPasswordStep5 ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
              <AnimatePresence>
                {step5Form.formState.errors.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
                  >
                    <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{step5Form.formState.errors.confirmPassword.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 space-y-3"
            >
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Account Summary</p>
              <div className="text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Email:</span>
                  <span className="font-semibold text-slate-900">{formData.step1?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Name:</span>
                  <span className="font-semibold text-slate-900">{formData.step3?.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Role:</span>
                  <span className="font-semibold text-slate-900">
                    {formData.step4?.role === 'DRIVER' ? 'Driver' : 'Staff'}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={step5Form.formState.isSubmitting}
                className="flex-1 h-11 border-2 border-slate-300 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <motion.button
                type="submit"
                disabled={step5Form.formState.isSubmitting || !isPasswordStrong}
                className="relative flex-1 h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl font-semibold overflow-hidden group disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-xl"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {step5Form.formState.isSubmitting ? (
                    <>
                      <LoadingSpinner size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account <CheckCircle2 size={16} />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
