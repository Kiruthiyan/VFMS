'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else if (email) {
      setStatus('loading');
      setMessage('Please check your email and click the verification link.');
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      await api.get(`/auth/verify-email?token=${verificationToken}`);
      setStatus('success');
      setMessage('Your email has been verified successfully! Please set your password to continue.');
      // Redirect to set password page after 2 seconds
      setTimeout(() => {
        router.push(`/auth/set-password?token=${verificationToken}`);
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Verification Complete'}
            {status === 'error' && 'Verification Failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <>
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <p className="text-sm text-center text-muted-foreground animate-pulse">
                Redirecting to password setup...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/auth/signup">Sign Up Again</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

