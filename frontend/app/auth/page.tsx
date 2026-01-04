'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { LogIn, Mail, Lock, User, Shield, ArrowRight, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSliding, setIsSliding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleSlide = (toLogin: boolean) => {
    setIsSliding(true);
    setTimeout(() => {
      setIsLogin(toLogin);
      setIsSliding(false);
      setError(null);
      loginForm.reset();
      signupForm.reset();
    }, 300);
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      if (user) {
        switch (user.role) {
          case 'ADMIN':
            router.push('/dashboard/admin');
            break;
          case 'APPROVER':
            router.push('/dashboard/approver');
            break;
          case 'STAFF':
            router.push('/dashboard/staff');
            break;
          case 'DRIVER':
            router.push('/dashboard/driver');
            break;
          default:
            router.push('/dashboard/staff');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setError('Signup is only available for admin-created accounts. Please contact your administrator.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:block space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VFMS
              </h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Vehicle Fleet Management System
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Streamline your fleet operations with our comprehensive management platform. 
              Track vehicles, manage fuel, schedule trips, and optimize your fleet efficiency.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Smart Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Secure & Reliable</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full">
            <div className="relative">
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isSliding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {isLogin ? (
                  <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
                    <CardHeader className="space-y-2 pb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full">
                          <LogIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome Back
                      </CardTitle>
                      <CardDescription className="text-center text-base">
                        Sign in to your account to continue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                        {error && (
                          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-sm font-semibold flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="name@example.com"
                            className="h-12 border-2 focus:border-blue-500 transition-colors"
                            {...loginForm.register('email')}
                          />
                          {loginForm.formState.errors.email && (
                            <p className="text-sm text-destructive animate-in slide-in-from-top-1">
                              {loginForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-sm font-semibold flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Password
                          </Label>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            className="h-12 border-2 focus:border-blue-500 transition-colors"
                            {...loginForm.register('password')}
                          />
                          {loginForm.formState.errors.password && (
                            <p className="text-sm text-destructive animate-in slide-in-from-top-1">
                              {loginForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rememberMe"
                              {...loginForm.register('rememberMe')}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                              Remember me
                            </Label>
                          </div>
                          <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Signing in...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Sign In <ArrowRight className="h-4 w-4" />
                            </span>
                          )}
                        </Button>

                        <div className="text-center text-sm pt-2">
                          <span className="text-muted-foreground">New user? </span>
                          <button
                            type="button"
                            onClick={() => handleSlide(false)}
                            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                          >
                            Contact Administrator
                          </button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
                    <CardHeader className="space-y-2 pb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Account Setup
                      </CardTitle>
                      <CardDescription className="text-center text-base">
                        Signup is only available for admin-created accounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                        <AlertDescription className="text-sm">
                          <strong>Note:</strong> User accounts are created by administrators only. 
                          If you need access, please contact your system administrator to create an account for you.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                            How to get access:
                          </h3>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <li>Contact your system administrator</li>
                            <li>Provide your official email address</li>
                            <li>Wait for account creation and verification email</li>
                            <li>Set your password after email verification</li>
                          </ol>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleSlide(true)}
                          variant="outline"
                          className="w-full h-12 border-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 rotate-180" />
                            Back to Login
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

