'use client';

import { useState } from 'react';
import { CheckCircle2, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch, getErrorMessage } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type QualificationCheckResponse = {
  driverId: string;
  vehicleCategory: string;
  qualified: boolean;
  reasons: string[];
};

const VEHICLE_CATEGORIES = ['LIGHT', 'MEDIUM', 'HEAVY', 'PASSENGER', 'TANKER'] as const;

export function DriverQualificationTab({ driverId }: { driverId: string }) {
  const [vehicleCategory, setVehicleCategory] = useState<(typeof VEHICLE_CATEGORIES)[number]>('LIGHT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualificationCheckResponse | null>(null);

  const checkQualification = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<QualificationCheckResponse>(
        `/api/drivers/${driverId}/qualification?vehicleCategory=${encodeURIComponent(vehicleCategory)}`
      );
      setResult(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
          <CardTitle className="text-sm font-semibold">Qualification Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-3">
          <div>
            <Label className="text-xs text-muted-foreground">Vehicle Category</Label>
            <Select value={vehicleCategory} onValueChange={(value) => setVehicleCategory(value as (typeof VEHICLE_CATEGORIES)[number])}>
              <SelectTrigger className="mt-1 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={checkQualification}
            disabled={loading}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-sm font-medium disabled:opacity-50"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            <Search className="h-3.5 w-3.5" />
            {loading ? 'Checking...' : 'Validate Qualification'}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
          <CardTitle className="text-sm font-semibold">Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-3">
          {!result && <p className="text-sm text-muted-foreground">Run a qualification check to view result.</p>}

          {result && (
            <>
              <div className="flex items-center gap-2">
                {result.qualified ? (
                  <CheckCircle2 className="h-5 w-5" style={{ color: 'hsl(var(--success))' }} />
                ) : (
                  <XCircle className="h-5 w-5" style={{ color: 'hsl(var(--destructive))' }} />
                )}
                <p className="text-sm font-medium text-foreground">
                  {result.qualified ? 'Qualified for assignment' : 'Not qualified'}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Category: {result.vehicleCategory}
              </p>

              {result.reasons.length > 0 && (
                <div className="space-y-1 rounded-md border border-border p-2">
                  {result.reasons.map((reason) => (
                    <p key={reason} className="text-xs text-muted-foreground">
                      - {reason}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
