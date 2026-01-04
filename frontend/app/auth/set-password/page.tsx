'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

const setPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: SetPasswordFormData) => {
    if (!token) {
      setError('Invalid verification token. Please check your email link.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.post('/auth/set-password', { token, password: data.password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth?message=password-set');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Password Set Successfully!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Your password has been set. You can now sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <AlertDescription>Redirecting to login page...</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Invalid Link</CardTitle>
            <CardDescription className="text-center">
              This password setup link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600">
              <a href="/auth">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Set Your Password
          </CardTitle>
          <CardDescription className="text-center text-base">
            Create a secure password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                className="h-12 border-2 focus:border-blue-500 transition-colors"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive animate-in slide-in-from-top-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                className="h-12 border-2 focus:border-blue-500 transition-colors"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive animate-in slide-in-from-top-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                <strong>Password Requirements:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>At least 6 characters long</li>
                  <li>Use a mix of letters and numbers</li>
                  <li>Avoid common words or personal information</li>
                </ul>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Set Password <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}

