'use client';

import { useState } from 'react';
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
      setResult(await apiFetch<EligibilityCheckResponse>(`/api/internal/drivers/eligibility?employeeId=${encodeURIComponent(employeeId)}&vehicleCategory=${vehicleCategory}&tripDate=${tripDate}`));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl animate-fade-in">
      <PageHeader icon={<Search className="w-5 h-5" />} title="Eligibility Check" subtitle="Verify driver eligibility for trip assignment" />

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
          <CardTitle className="text-sm font-semibold">Check Parameters</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-3 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Driver Employee ID</Label>
            <Input
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
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
                {['LIGHT', 'MEDIUM', 'HEAVY', 'PASSENGER', 'TANKER'].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Trip Date</Label>
            <Input
              type="date"
              value={tripDate}
              onChange={e => setTripDate(e.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>

          <button
            onClick={check}
            disabled={loading}
            className="w-full h-9 rounded-md text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </CardContent>
      </Card>

      {result && (
        <Card
          className="mt-4"
          style={{
            borderLeftWidth: 4,
            borderLeftStyle: 'solid',
            borderLeftColor: result.eligible ? 'hsl(var(--success))' : 'hsl(var(--secondary))'
          }}
        >
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center gap-3 mb-3">
              {result.eligible ? (
                <CheckCircle2 className="w-8 h-8 flex-shrink-0" style={{ color: 'hsl(var(--success))' }} />
              ) : (
                <XCircle className="w-8 h-8 flex-shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
              )}
              <div>
                <p className="text-base font-semibold" style={{ color: result.eligible ? 'hsl(var(--success))' : 'hsl(var(--secondary))' }}>
                  {result.eligible ? 'Eligible for Assignment' : 'Not Eligible'}
                </p>
                <p className="text-xs text-muted-foreground">Driver #{result.driverId} · {result.vehicleCategory}</p>
              </div>
            </div>

            {result.reasons.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                {result.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'hsl(var(--secondary))' }}>
                    <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
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
