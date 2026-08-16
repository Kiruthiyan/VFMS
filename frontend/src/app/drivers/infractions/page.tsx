'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { getDriverDisplayId } from '@/lib/driver-display';
import { DriverInfraction, PageResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  if (!dateStr) return 'â€”';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        const leftDisplayId = getDriverDisplayId(left.employeeId, '');
        const rightDisplayId = getDriverDisplayId(right.employeeId, '');
        if (!leftDisplayId) return rightDisplayId ? 1 : 0;
        if (!rightDisplayId) return -1;
        return driverIdCollator.compare(leftDisplayId, rightDisplayId);
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
            <DialogContent className="max-w-2xl overflow-hidden p-0">
              <DialogHeader className="vfms-form-header px-6 py-5 pl-8">
                <DialogTitle className="text-white">Log Infraction</DialogTitle>
              </DialogHeader>
              <form onSubmit={submitInfraction} className="space-y-4 px-6 pb-6 pt-5">
                <div>
                  <Label htmlFor="infraction-driver">Select Driver *</Label>
                  <Select value={form.driverId} onValueChange={(val) => setForm((c) => ({ ...c, driverId: val }))} required>
                    <SelectTrigger id="infraction-driver" className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-400/40">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => {
                        const displayDriverId = getDriverDisplayId(driver.employeeId, '');
                        return (
                          <SelectItem key={driver.id} value={driver.id}>
                            {displayDriverId ? `${displayDriverId} - ` : ''}{driver.fullName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="infraction-type">Type *</Label>
                  <Select value={form.infractionType} onValueChange={(val) => setForm((c) => ({ ...c, infractionType: val as InfractionType }))} required>
                    <SelectTrigger id="infraction-type" className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-400/40">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['TRAFFIC_VIOLATION', 'MINOR_ACCIDENT', 'MAJOR_ACCIDENT', 'NEAR_MISS', 'RECKLESS_DRIVING', 'OTHER'] as InfractionType[]).map((type) => <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="infraction-severity">Severity *</Label>
                  <Select value={form.severity} onValueChange={(val) => setForm((c) => ({ ...c, severity: val as InfractionSeverity }))} required>
                    <SelectTrigger id="infraction-severity" className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-400/40">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as InfractionSeverity[]).map((severity) => <SelectItem key={severity} value={severity}>{severity}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="infraction-date">Incident Date *</Label>
                  <Input id="infraction-date" type="date" required value={form.incidentDate} onChange={(event) => setForm((current) => ({ ...current, incidentDate: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                </div>
                <div>
                  <Label htmlFor="infraction-description">Description</Label>
                  <Input id="infraction-description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                </div>
                <div>
                  <Label htmlFor="infraction-penalty">Penalty Notes</Label>
                  <Input id="infraction-penalty" value={form.penaltyNotes} onChange={(event) => setForm((current) => ({ ...current, penaltyNotes: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                </div>
                <div className="flex pt-4 mt-2">
                  <Button type="submit" disabled={submitting} className="h-11 w-full rounded-xl bg-amber-400 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500">{submitting ? 'Saving...' : 'Log Infraction'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchInfractions}
            disabled={loading}
            className="vfms-refresh-button"
            aria-label="Refresh infractions"
            title="Refresh infractions"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger id="infraction-status-filter" className="h-9 w-40 rounded-xl bg-white text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
              </SelectContent>
            </Select>
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
                <TableRow className="hover:bg-slate-950 bg-slate-950">
                  {['Driver', 'Type', 'Incident Date', 'Severity', 'Status', 'Description', ''].map((h) => (
                    <TableHead key={h} className="text-xs font-bold uppercase tracking-[0.18em] text-white">
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
                        {inf.driver?.fullName || 'â€”'}
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
                        {inf.description || 'â€”'}
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
