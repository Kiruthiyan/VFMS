'use client';
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Staff, PageResponse } from '@/types';
import { StatusBadge } from '../../components/StatusBadge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Search, Users2 } from 'lucide-react';
import { toast } from 'sonner';

const staffSchema = z.object({ employeeId: z.string().min(1), firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email().optional().or(z.literal('')), phone: z.string().optional(), department: z.string().optional(), designation: z.string().optional(), role: z.enum(['SYSTEM_USER','APPROVER']), dateOfJoining: z.string().optional() });
type StaffFormData = z.infer<typeof staffSchema>;

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<StaffFormData>({ resolver: zodResolver(staffSchema), defaultValues: { role: 'SYSTEM_USER' } });
  const fetchStaff = () => apiFetch<PageResponse<Staff>>('/api/staff?size=50').then(d => setStaff(d.content)).catch(e => toast.error(e.message));
  useEffect(() => { fetchStaff(); }, []);
  const onSubmit = async (data: StaffFormData) => {
    try { await apiFetch('/api/staff', { method: 'POST', body: JSON.stringify(data) }); toast.success('Added'); setOpen(false); reset(); fetchStaff(); }
    catch (e: any) { toast.error(e.message); }
  };
  const filtered = staff.filter(s => `${s.firstName} ${s.lastName} ${s.employeeId}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 animate-fade-in">
      <PageHeader icon={<Users2 className="w-5 h-5" />} title="Staff" subtitle="Manage staff members"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                <Plus className="w-4 h-4" />Add Staff
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New Staff Member</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Employee ID *</Label><Input {...register('employeeId')} className="mt-1 h-9 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Role *</Label>
                    <Controller name="role" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="SYSTEM_USER">System User</SelectItem><SelectItem value="APPROVER">Approver</SelectItem></SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div><Label className="text-xs text-muted-foreground">First Name *</Label><Input {...register('firstName')} className="mt-1 h-9 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Last Name *</Label><Input {...register('lastName')} className="mt-1 h-9 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Email</Label><Input type="email" {...register('email')} className="mt-1 h-9 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Phone</Label><Input {...register('phone')} className="mt-1 h-9 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Department</Label><Input {...register('department')} className="mt-1 h-9 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Designation</Label><Input {...register('designation')} className="mt-1 h-9 text-sm" /></div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full h-9 rounded-md text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                  {isSubmitting ? 'Saving…' : 'Add Staff Member'}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Card>
        <CardHeader className="pb-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search staff…" className="pl-9" value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} /></div></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent bg-muted/40">{['Employee ID','Name','Department','Role','Status'].map(h => <TableHead key={h} className="text-xs font-medium text-muted-foreground">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {filtered.map(s => (<TableRow key={s.id} className="hover:bg-muted/20"><TableCell className="font-mono text-xs text-muted-foreground">{s.employeeId}</TableCell><TableCell className="font-medium text-sm text-foreground">{s.firstName} {s.lastName}</TableCell><TableCell className="text-sm text-muted-foreground">{s.department || '—'}</TableCell><TableCell><StatusBadge status={s.role} /></TableCell><TableCell><StatusBadge status={s.status} /></TableCell></TableRow>))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-16 text-sm">No staff found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2" style={{ backgroundColor: 'hsl(42 100% 50% / 0.12)' }}>
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
