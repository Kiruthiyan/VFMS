'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { DriverInfraction, PageResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InfractionType = 'TRAFFIC_VIOLATION' | 'MINOR_ACCIDENT' | 'MAJOR_ACCIDENT' | 'NEAR_MISS' | 'RECKLESS_DRIVING' | 'OTHER';
type InfractionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type StatusFilter = 'all' | 'resolved' | 'in-progress';

interface DriverOption {
  id: string;
  employeeId: string | null;
  fullName: string;
  email: string;
}

interface InfractionFormData {
  driverId: string;
  infractionType: InfractionType;
  severity: InfractionSeverity;
  incidentDate: string;
  description: string;
  penaltyNotes: string;
}

const EMPTY_FORM: InfractionFormData = {
  driverId: '', infractionType: 'TRAFFIC_VIOLATION', severity: 'LOW',
  incidentDate: '', description: '', penaltyNotes: '',
};

const driverIdCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function severityConfig(severity: string | null | undefined) {
  switch (severity) {
    case 'CRITICAL':
      return { bg: 'hsl(360 79% 95%)', text: 'hsl(360 79% 30%)', border: 'hsl(360 79% 75%)', label: 'Critical' };
    case 'HIGH':
      return { bg: 'hsl(19 97% 94%)', text: 'hsl(19 97% 28%)', border: 'hsl(19 97% 70%)', label: 'High' };
    case 'MEDIUM':
      return { bg: 'hsl(42 97% 92%)', text: 'hsl(28 88% 28%)', border: 'hsl(36 95% 64%)', label: 'Medium' };
    default:
      return { bg: 'hsl(145 63% 94%)', text: 'hsl(145 63% 25%)', border: 'hsl(145 63% 70%)', label: 'Low' };
  }
}


function formatInfractionType(type: string | null | undefined) {
  return (type || 'Unknown')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InfractionsPage() {
  const [infractions, setInfractions] = useState<DriverInfraction[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<InfractionFormData>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredInfractions = infractions.filter((infraction) => {
    if (statusFilter === 'all') return true;
    const resolved = infraction.resolutionStatus === 'RESOLVED';
    return statusFilter === 'resolved' ? resolved : !resolved;
  });

  const fetchInfractions = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<DriverInfraction[]>('/api/drivers/infractions');
      setInfractions(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const page = await apiFetch<PageResponse<DriverOption>>('/api/drivers/from-users?page=0&size=500');
      setDrivers([...page.content].sort((left, right) => {
        if (!left.employeeId) return right.employeeId ? 1 : 0;
        if (!right.employeeId) return -1;
        return driverIdCollator.compare(left.employeeId, right.employeeId);
      }));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const submitInfraction = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/api/drivers/infractions', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Infraction logged');
      setFormOpen(false);
      setForm({ ...EMPTY_FORM });
      await fetchInfractions();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const resolveInfraction = async (id: number) => {
    try {
      await apiFetch(`/api/drivers/infractions/${id}/resolve`, { method: 'PATCH' });
      toast.success('Infraction resolved');
      await fetchInfractions();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void Promise.all([fetchInfractions(), fetchDrivers()]);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <span style={{ color: 'hsl(var(--primary-foreground))' }}>
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Infractions</h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              All driver infractions submitted across the fleet
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2" onClick={() => setForm({ ...EMPTY_FORM })}>
                <Plus className="h-4 w-4" /> Log Infraction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Infraction</DialogTitle></DialogHeader>
              <form onSubmit={submitInfraction} className="space-y-3">
                <div>
                  <Label htmlFor="infraction-driver" className="text-xs text-muted-foreground">Select Driver *</Label>
                  <select id="infraction-driver" required value={form.driverId} onChange={(event) => setForm((current) => ({ ...current, driverId: event.target.value }))} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select a driver</option>
                    {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.employeeId ? `${driver.employeeId} — ` : ''}{driver.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="infraction-type" className="text-xs text-muted-foreground">Type *</Label>
                  <select id="infraction-type" required value={form.infractionType} onChange={(event) => setForm((current) => ({ ...current, infractionType: event.target.value as InfractionType }))} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {(['TRAFFIC_VIOLATION', 'MINOR_ACCIDENT', 'MAJOR_ACCIDENT', 'NEAR_MISS', 'RECKLESS_DRIVING', 'OTHER'] as InfractionType[]).map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="infraction-severity" className="text-xs text-muted-foreground">Severity *</Label>
                  <select id="infraction-severity" required value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as InfractionSeverity }))} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as InfractionSeverity[]).map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="infraction-date" className="text-xs text-muted-foreground">Incident Date *</Label>
                  <Input id="infraction-date" type="date" required value={form.incidentDate} onChange={(event) => setForm((current) => ({ ...current, incidentDate: event.target.value }))} className="mt-1 h-9" />
                </div>
                <div>
                  <Label htmlFor="infraction-description" className="text-xs text-muted-foreground">Description</Label>
                  <Input id="infraction-description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 h-9" />
                </div>
                <div>
                  <Label htmlFor="infraction-penalty" className="text-xs text-muted-foreground">Penalty Notes</Label>
                  <Input id="infraction-penalty" value={form.penaltyNotes} onChange={(event) => setForm((current) => ({ ...current, penaltyNotes: event.target.value }))} className="mt-1 h-9" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Saving...' : 'Log Infraction'}</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={fetchInfractions} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-muted">
        <CardHeader className="flex flex-row items-center justify-between gap-3 py-3 px-4 border-b border-border bg-muted/30">
          <CardTitle className="text-sm font-semibold">
            Infractions ({filteredInfractions.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="infraction-status-filter" className="text-xs text-muted-foreground">Status</Label>
            <select
              id="infraction-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-8 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="all">All</option>
              <option value="resolved">Resolved</option>
              <option value="in-progress">In progress</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading infractions...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40">
                  {['Driver', 'Type', 'Incident Date', 'Severity', 'Status', 'Description', ''].map((h) => (
                    <TableHead key={h} className="text-xs font-medium text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInfractions.map((inf) => {
                  const sev = severityConfig(inf.severity);
                  const resolved = inf.resolutionStatus === 'RESOLVED';
                  return (
                    <TableRow key={inf.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-semibold text-sm text-foreground">
                        {inf.driver?.fullName || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatInfractionType(inf.infractionType)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(inf.incidentDate)}
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
                          style={{ backgroundColor: sev.bg, color: sev.text, borderColor: sev.border }}
                        >
                          {sev.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${resolved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {resolved ? 'Resolved' : 'In progress'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[260px] truncate">
                        {inf.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {inf.resolutionStatus !== 'RESOLVED' && (
                          <Button variant="outline" size="sm" onClick={() => void resolveInfraction(inf.id)}>
                            Resolved
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredInfractions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-20 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-muted-foreground/40" />
                        No matching infractions found
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
