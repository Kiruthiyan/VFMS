'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { EligibilityCheckResponse } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function EligibilityPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('LIGHT');
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<EligibilityCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!employeeId) {
      toast.error('Enter driver employee ID');
      return;
    }

    setLoading(true);
    try {
      setResult(await apiFetch<EligibilityCheckResponse>(`/api/drivers/eligibility?employeeId=${encodeURIComponent(employeeId)}&vehicleCategory=${vehicleCategory}&tripDate=${tripDate}`));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PageHeader
            icon={<Search className="w-5 h-5" />}
            title="Eligibility Check"
            subtitle="Verify driver eligibility for trip assignment"
          />
          <Link
            href="/drivers"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-muted transition-colors lg:mt-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card>
            <CardHeader className="border-b border-border bg-muted/30 py-3 px-4">
              <CardTitle className="text-sm font-semibold">Check Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 pt-3">
              <div>
                <Label className="text-xs text-muted-foreground">Driver Employee ID</Label>
                <Input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter driver employee ID"
                  className="mt-1 h-9 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Vehicle Category</Label>
                <Select value={vehicleCategory} onValueChange={setVehicleCategory}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['LIGHT', 'MEDIUM', 'HEAVY', 'PASSENGER', 'TANKER'].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Trip Date</Label>
                <Input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>

              <button
                onClick={check}
                disabled={loading}
                className="h-9 w-full rounded-md text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                {loading ? 'Checking...' : 'Check Eligibility'}
              </button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-border bg-muted/30 py-3 px-4">
                <CardTitle className="text-sm font-semibold">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 pt-3 text-sm text-muted-foreground">
                <p>Enter the driver employee ID, choose the vehicle category, and select the trip date.</p>
                <p>The result will explain whether the driver is eligible and list any blocking reasons.</p>
              </CardContent>
            </Card>

            {result ? (
              <Card
                style={{
                  borderLeftWidth: 4,
                  borderLeftStyle: 'solid',
                  borderLeftColor: result.eligible ? 'hsl(var(--success))' : 'hsl(var(--secondary))',
                }}
              >
                <CardContent className="px-4 pb-4 pt-5">
                  <div className="mb-3 flex items-center gap-3">
                    {result.eligible ? (
                      <CheckCircle2 className="w-8 h-8 flex-shrink-0" style={{ color: 'hsl(var(--success))' }} />
                    ) : (
                      <XCircle className="w-8 h-8 flex-shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                    )}
                    <div>
                      <p
                        className="text-base font-semibold"
                        style={{ color: result.eligible ? 'hsl(var(--success))' : 'hsl(var(--secondary))' }}
                      >
                        {result.eligible ? 'Eligible for Assignment' : 'Not Eligible'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Driver #{result.driverId} · {result.vehicleCategory}
                      </p>
                    </div>
                  </div>

                  {result.reasons.length > 0 && (
                    <div className="space-y-1.5 border-t border-border pt-2">
                      {result.reasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs" style={{ color: 'hsl(var(--secondary))' }}>
                          <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex min-h-[240px] items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground">
                  Run a check to see eligibility results here.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          <span style={{ color: 'hsl(var(--primary-foreground))' }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
