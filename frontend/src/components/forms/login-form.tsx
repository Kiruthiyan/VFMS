'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { loginSchema, type LoginFormValues } from '@/lib/validators/auth/login-schema';
import { loginApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: '/dashboards/admin',
  APPROVER: '/dashboards/approver',
  STAFF: '/dashboards/staff',
  DRIVER: '/dashboards/driver',
};

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await loginApi({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      setAuth(response);
      setIsSuccess(true);
      setTimeout(() => {
        router.replace(ROLE_REDIRECT[response.role] ?? '/dashboards/staff');
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiMessage = (err.response?.data as { message?: string } | undefined)?.message;

        if (status === 401) {
          setServerError('Invalid email or password.');
        } else if (status === 403) {
          setServerError(apiMessage ?? 'Your account is disabled. Contact your administrator.');
        } else if (status === 400) {
          setServerError(apiMessage ?? 'Please verify your email first.');
        } else {
          setServerError(apiMessage ?? 'Unable to sign in. Please try again.');
        }
      } else {
        setServerError('Unexpected error occurred. Please try again.');
      }
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome!</h2>
        <p className="text-slate-600 text-sm font-medium">Redirecting...</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
      noValidate
    >
      {/* Server Error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="font-medium text-red-700 text-sm">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
        className="space-y-2.5"
      >
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          Email Address
        </label>
        <motion.div
          className="relative"
          whileHover="hover"
          initial="rest"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.01 }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            aria-invalid={!!errors.email}
            {...register('email')}
            className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 focus:bg-white focus:shadow-lg focus:shadow-amber-500/15
                       hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                       disabled:opacity-50 placeholder:text-slate-400"
            disabled={isSubmitting}
          />
        </motion.div>
        <AnimatePresence>
          {errors.email && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
            >
              <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-700">{errors.email.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Password Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
        className="space-y-2.5"
      >
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <motion.div
          className="relative"
          whileHover="hover"
          initial="rest"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.01 }
          }}
        >
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register('password')}
            className="w-full px-4 py-3.5 pr-12 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 focus:bg-white focus:shadow-lg focus:shadow-amber-500/15
                       hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                       disabled:opacity-50 placeholder:text-slate-400"
            disabled={isSubmitting}
          />
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-slate-500 hover:text-amber-600 transition-all duration-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isSubmitting}
          >
            {showPassword ? <EyeOff size={19} strokeWidth={2.2} /> : <Eye size={19} strokeWidth={2.2} />}
          </motion.button>
        </motion.div>
        <AnimatePresence>
          {errors.password && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
            >
              <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-700">{errors.password.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
        whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(120, 113, 108, 0.3)' }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className="relative w-full h-12 mt-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/25 overflow-hidden group"
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        <span className="relative flex items-center gap-2">
          {isSubmitting ? (
            <>
              <LoadingSpinner size={16} />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign In'
          )}
        </span>
      </motion.button>

      {/* Forgot Password Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs text-slate-600 pt-3"
      >
        <a
          href="/auth/forgot-password"
          className="font-semibold text-slate-900 hover:text-amber-600 transition-colors duration-200 relative group"
        >
          Forgot password?
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full transition-all duration-300" />
        </a>
      </motion.p>
    </motion.form>
  );
}