'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type SignupStep = 1 | 2 | 3 | 4 | 5;

interface SignupFormData {
  step1: SignupStep1Values;
  step2: SignupStep2Values;
  step3: SignupStep3Values;
  step4: SignupStep4Values;
  step5: SignupStep5Values;
}

const TOTAL_STEPS = 5;

const STEP_TITLES = {
  1: 'Email Verification',
  2: 'Confirm Identity',
  3: 'Personal Details',
  4: 'Role & Qualifications',
  5: 'Security Setup',
};

const STEP_DESCRIPTIONS = {
  1: 'Enter your email to begin account creation',
  2: 'Verify your email with the code we sent',
  3: 'Tell us more about yourself',
  4: 'Select your role and provide relevant details',
  5: 'Create a secure password for your account',
};

export function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
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
    hasNumber: /[0-9]/.test(password),
    hasMinLength: password.length >= 8,
  };

  const isPasswordStrong =
    passwordStrength.hasUppercase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasMinLength;

  // Step Handlers
  const handleStep1Submit = async (data: SignupStep1Values) => {
    setServerError(null);
    try {
      console.log('Sending OTP to:', data.email);
      setFormData((prev) => ({ ...prev, step1: data }));
      setCurrentStep(2);

      setOtpResendCountdown(30);
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
      setServerError('Failed to send verification code. Please try again.');
    }
  };

  const handleStep2Submit = async (data: SignupStep2Values) => {
    setServerError(null);
    try {
      console.log('Verifying OTP:', data.otp);
      setFormData((prev) => ({ ...prev, step2: data }));
      setCurrentStep(3);
    } catch (err: unknown) {
      setServerError('Invalid verification code. Please try again.');
    }
  };

  const handleStep3Submit = async (data: SignupStep3Values) => {
    setServerError(null);
    try {
      console.log('User details:', data);
      setFormData((prev) => ({ ...prev, step3: data }));
      setCurrentStep(4);
    } catch (err: unknown) {
      setServerError('Failed to save details. Please try again.');
    }
  };

  const handleStep4Submit = async (data: SignupStep4Values) => {
    setServerError(null);
    try {
      console.log('Role and qualifications:', data);
      setFormData((prev) => ({ ...prev, step4: data }));
      setCurrentStep(5);
    } catch (err: unknown) {
      setServerError('Failed to save role details. Please try again.');
    }
  };

  const handleStep5Submit = async (data: SignupStep5Values) => {
    setServerError(null);
    try {
      const completeData = {
        ...formData.step1,
        ...formData.step2,
        ...formData.step3,
        ...formData.step4,
        ...data,
      };

      console.log('Complete signup data:', completeData);

      setFormData((prev) => ({ ...prev, step5: data }));
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: unknown) {
      setServerError('Registration failed. Please try again.');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SignupStep);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">Account Created!</h2>
        <p className="text-slate-600 text-sm font-medium mb-4">Redirecting to sign in...</p>
        <LoadingSpinner size={20} />
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <motion.div className="space-y-4">
        {/* Enhanced Progress Bar */}
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

        {/* Step Information */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-900">
              {STEP_TITLES[currentStep]}
            </p>
            <p className="text-xs text-slate-600">
              Step {currentStep} of {TOTAL_STEPS}
            </p>
          </div>
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-900">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}%
            </span>
          </motion.div>
        </div>

        {/* Step Dots Indicator */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, idx) => {
            const stepNum = (idx + 1) as unknown as SignupStep;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <motion.div
                key={stepNum}
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30'
                    : isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg shadow-amber-500/40'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
      </motion.div>

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
                {...step2Form.register('otp')}
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
                    setOtpResendCountdown(30);
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
                  className="space-y-2"
                >
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ backgroundColor: passwordStrength.hasMinLength ? '#f59e0b' : '#e2e8f0' }}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                    />
                    <motion.div
                      animate={{ backgroundColor: passwordStrength.hasUppercase ? '#f59e0b' : '#e2e8f0' }}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                    />
                    <motion.div
                      animate={{ backgroundColor: passwordStrength.hasNumber ? '#f59e0b' : '#e2e8f0' }}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {isPasswordStrong ? '✓ Strong password' : '8+ chars, uppercase & number required'}
                  </p>
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
