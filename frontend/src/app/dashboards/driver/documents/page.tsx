"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverDocumentsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboards/driver/profile');
  }, [router]);
  return null;
}
