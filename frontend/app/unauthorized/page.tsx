'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function UnauthorizedPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Current Role: <span className="font-semibold text-foreground">{user.role}</span>
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
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
                } else {
                  router.push('/auth/login');
                }
              }}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

