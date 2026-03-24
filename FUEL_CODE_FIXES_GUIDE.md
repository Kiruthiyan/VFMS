# Fuel Module - FIXES IMPLEMENTATION GUIDE

## 🚀 How to Fix Each Critical Issue

---

## FIX #1: Add Auth to `/admin/fuel/flagged/page.tsx`

### Current Code (BROKEN)
```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getFlaggedFuelRecordsApi, getErrorMessage, type FuelRecord } from "@/lib/api/fuel";
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

export default function FlaggedFuelPage() {
  return (
    <AdminShell>
      {/* ... rest of component */}
    </AdminShell>
  );
}
```

### Fixed Code
```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw, AlertCircle } from "lucide-react";
import { getFlaggedFuelRecordsApi, getErrorMessage, type FuelRecord } from "@/lib/api/fuel";
import { useUser } from "@/lib/useUser";  // ✅ ADD THIS
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { ProtectedLayout } from "@/components/layout/protected-layout";  // ✅ ADD THIS

export default function FlaggedFuelPage() {
  const { user } = useUser();  // ✅ ADD THIS
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlaggedRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlaggedFuelRecordsApi();
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlaggedRecords(); }, [fetchFlaggedRecords]);

  // ✅ ADD THIS BLOCK - Access control check
  if (!user || user.role !== 'ADMIN') {
    return (
      <ProtectedLayout>
        <AdminShell>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-200 mb-2">Access Denied</h2>
              <p className="text-slate-400">Only admins can view flagged records</p>
            </div>
          </div>
        </AdminShell>
      </ProtectedLayout>
    );
  }

  // ✅ WRAP RETURN IN ProtectedLayout
  return (
    <ProtectedLayout>
      <AdminShell>
        <div className="space-y-6">
          <PageHeader
            title="Flagged Fuel Records"
            description="Entries flagged for misuse review"
            icon={AlertTriangle}
            iconClassName="text-red-500"
            actions={
              <button
                onClick={fetchFlaggedRecords}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            }
          />

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size={28} className="text-amber-400" />
            </div>
          ) : error ? (
            <FormMessage type="error" message={error} />
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle size={32} className="text-slate-500 mb-3" />
              <h3 className="text-lg font-semibold text-slate-200 mb-1">
                No flagged records
              </h3>
              <p className="text-sm text-slate-400">
                All fuel entries have passed integrity checks
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <FuelRecordsTable records={records} />
            </div>
          )}
        </div>
      </AdminShell>
    </ProtectedLayout>
  );
}
```

**Changes Summary**:
- ✅ Import `useUser` hook
- ✅ Import `ProtectedLayout` component
- ✅ Import `AlertCircle` icon
- ✅ Call `useUser()` to get user
- ✅ Add role check (`user.role !== 'ADMIN'`)
- ✅ Wrap entire component in `ProtectedLayout`
- ✅ Show access denied message if not admin

---

## FIX #2: Add Auth to `/admin/fuel/alerts/page.tsx`

### At the top of file, add imports:
```typescript
// ✅ ADD THESE IMPORTS:
import { useUser } from '@/lib/useUser';
import { ProtectedLayout } from '@/components/layout/protected-layout';
```

### In the component function, add:
```typescript
export default function FuelAlertsPage() {
  const { user } = useUser();  // ✅ ADD THIS
  const [alerts, setAlerts] = useState<FuelAlert[]>([]);
  // ... rest of state

  // ✅ ADD THIS BEFORE THE RETURN:
  if (!user || user.role !== 'ADMIN') {
    return (
      <ProtectedLayout>
        <AdminShell>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-200 mb-2">Access Denied</h2>
              <p className="text-slate-400">Only admins can view fuel alerts</p>
            </div>
          </div>
        </AdminShell>
      </ProtectedLayout>
    );
  }

  // ✅ WRAP THE MAIN RETURN IN ProtectedLayout:
  return (
    <ProtectedLayout>
      <AdminShell>
        {/* existing JSX */}
      </AdminShell>
    </ProtectedLayout>
  );
}
```

---

## FIX #3 & #4: Fetch Vehicles and Drivers

### In `/admin/fuel/page.tsx`, replace:
```typescript
// ❌ CURRENT (BROKEN):
const vehicles: { id: string; label: string }[] = [];
const drivers: { id: string; label: string }[] = [];
```

### With:
```typescript
// ✅ FIXED (WORKING):
const [vehicles, setVehicles] = useState<{ id: string; label: string }[]>([]);
const [drivers, setDrivers] = useState<{ id: string; label: string }[]>([]);

useEffect(() => {
  const loadFilters = async () => {
    try {
      // TODO: Import these from your API
      // const vehiclesData = await getAllVehiclesApi();
      // const driversData = await getAllDriversApi();
      
      // For now, you can test with mock data:
      setVehicles([
        { id: 'v1', label: 'Toyota Corolla (ABC-123)' },
        { id: 'v2', label: 'Honda Civic (XYZ-789)' },
        { id: 'v3', label: 'Nissan Altima (DEF-456)' },
      ]);
      
      setDrivers([
        { id: 'd1', label: 'John Driver' },
        { id: 'd2', label: 'Sarah Driver' },
        { id: 'd3', label: 'Mike Driver' },
      ]);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  loadFilters();
}, []);
```

### For Driver Fuel Entry Form, in `/driver/fuel/add/page.tsx`:
```typescript
// ✅ ADD THIS BEFORE THE COMPONENT RETURN:
const [vehicles, setVehicles] = useState<{ id: string; label: string }[]>([]);

useEffect(() => {
  const loadVehicles = async () => {
    try {
      // Option 1: If drivers have assigned vehicles, fetch only theirs:
      // const vehiclesData = await getVehiclesByDriverApi(user.id);
      
      // Option 2: Fetch all available vehicles:
      // const vehiclesData = await getAllVehiclesApi();
      
      // For testing:
      setVehicles([
        { id: 'v1', label: 'Toyota Corolla (ABC-123)' },
        { id: 'v2', label: 'Honda Civic (XYZ-789)' },
      ]);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  };

  if (user?.role === 'DRIVER') {
    loadVehicles();
  }
}, [user?.id, user?.role]);

// ✅ PASS VEHICLES TO FORM:
<FuelEntryForm
  driverId={user.id}
  driverName={user.name}
  vehicles={vehicles}  // ✅ ADD THIS
  onSuccess={handleSuccess}
/>
```

---

## FIX #5: Remove Unused Import from `/driver/fuel/history/[id]/page.tsx`

### Current Line 8:
```typescript
import { getFuelRecordByIdApi, getFuelByDriverApi, getErrorMessage, type FuelRecord }
//                               ↑ UNUSED
```

### Should Be:
```typescript
import { getFuelRecordByIdApi, getErrorMessage, type FuelRecord }
```

---

## FIX #6: Fix driverId Security in `fuel-entry-form.tsx`

### Current Code (VULNERABLE):
```typescript
// Driver selector shown even when driverId is provided
<select {...register("driverId")} ... >
  <option value="">No driver assigned</option>
  {drivers.map((d) => (
    <option key={d.id} value={d.id}>{d.label}</option>
  ))}
</select>
```

### Fixed Code:
```typescript
{driverId ? (
  // When driverId is provided, show as readonly (driver context)
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-300">
      Driver
    </label>
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-slate-300">
      {driverName || driverId}
    </div>
    {/* Hidden input to submit driverId */}
    <input type="hidden" {...register("driverId")} value={driverId} />
  </div>
) : (
  // When not provided (admin context), show selector
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-300">
      Driver
    </label>
    <select {...register("driverId")} ... >
      <option value="">No driver assigned</option>
      {drivers.map((d) => (
        <option key={d.id} value={d.id}>{d.label}</option>
      ))}
    </select>
  </div>
)}
```

---

## FIX #7: Add Date Validation to `fuel-filter-bar.tsx`

### Current Code:
```typescript
const handleFilter = () => {
  onFilter({
    from,
    to,
    vehicleId: vehicleId || undefined,
    driverId: driverId || undefined,
  });
};
```

### Fixed Code:
```typescript
const [dateError, setDateError] = useState<string | null>(null);

const handleFilter = () => {
  setDateError(null);
  
  // ✅ ADD VALIDATION:
  if (from > to) {
    setDateError("Start date must be before end date");
    return;
  }

  onFilter({
    from,
    to,
    vehicleId: vehicleId || undefined,
    driverId: driverId || undefined,
  });
};

// ✅ SHOW ERROR:
{dateError && (
  <div className="text-xs text-red-400 mt-2">{dateError}</div>
)}
```

---

## FIX #8: Refactor Layout Component Names

### Option A: Rename AdminShell to MainShell

**In `components/layout/admin-shell.tsx`**:
```typescript
// Rename from AdminShell to MainShell
export function MainShell({ children }: MainShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </main>
  );
}
```

**Update all imports**:
```typescript
// Replace all:
import { AdminShell } from '@/components/layout/admin-shell';
// With:
import { MainShell } from '@/components/layout/main-shell';  // renamed file too

// Replace all:
<AdminShell>
// With:
<MainShell>
```

### Option B: Create specific shells (Better UX)

```typescript
// components/layout/driver-shell.tsx
export function DriverShell({ children }: ShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </main>
  );
}

// components/layout/admin-shell.tsx
export function AdminShell({ children }: ShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </main>
  );
}
```

Then use context-appropriate shells:
```typescript
// In driver pages:
import { DriverShell } from '@/components/layout/driver-shell';
<DriverShell>

// In admin pages:
import { AdminShell } from '@/components/layout/admin-shell';
<AdminShell>
```

---

## FIX #9 & #10: Replace Mock Auth (Larger Task)

### Example: Using Supabase Auth

```typescript
// lib/useUser.ts (REPLACEMENT)
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DRIVER';
}

export function useUser() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from Supabase session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile with role
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          name: data?.name || session.user.email || '',
          email: session.user.email || '',
          role: data?.role || 'DRIVER',
        });
      }

      setLoading(false);
    };

    getUser();
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout };
}
```

### Login Page Example:

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
    } else {
      // Redirect to dashboard
      window.location.href = '/admin/fuel';
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form UI */}
    </form>
  );
}
```

---

## 📋 Implementation Checklist

### Critical Fixes (Do First)
- [ ] Fix #1: Add auth to flagged page (5 min)
- [ ] Fix #2: Add auth to alerts page (5 min)
- [ ] Fix #3 & #4: Fetch vehicles/drivers (30 min)
- [ ] Test: Driver can create fuel entries
- [ ] Test: Admin can filter properly

### Security Fixes (Do Second)
- [ ] Fix #6: Secure driverId field (15 min)

### Moderate Fixes (Do Third)
- [ ] Fix #5: Remove unused import (1 min)
- [ ] Fix #7: Add date validation (10 min)
- [ ] Fix #8: Refactor layout names (30 min)
- [ ] Fix #9 & #10: Replace mock auth (2-4 hours)

### Refactoring (Do Last)
- [ ] Fix #11: Extract CSS
- [ ] Fix #12: Add detail page links
- [ ] Add unit tests
- [ ] Add integration tests

---

**Total Time to Fix Critical Issues**: ~1 hour
**Total Time to Fix All Issues**: ~3-4 hours (depending on auth replacement)
