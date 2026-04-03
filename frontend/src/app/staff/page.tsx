'use client';
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Staff, PageResponse } from '@/types';
import { StatusBadge } from '../../components/StatusBadge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Eye, Pencil, Plus, Search, Trash2, Users2 } from 'lucide-react';
import { toast } from 'sonner';

const staffSchema = z.object({ employeeId: z.string().min(1), firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email().optional().or(z.literal('')), phone: z.string().optional(), department: z.string().optional(), designation: z.string().optional(), role: z.enum(['SYSTEM_USER','APPROVER']), dateOfJoining: z.string().optional() });
type StaffFormData = z.infer<typeof staffSchema>;

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<Staff | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<StaffFormData>({ resolver: zodResolver(staffSchema), defaultValues: { role: 'SYSTEM_USER' } });
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    control: editControl,
    reset: resetEdit,
    formState: { isSubmitting: isEditSubmitting },
  } = useForm<StaffFormData>({ resolver: zodResolver(staffSchema), defaultValues: { role: 'SYSTEM_USER' } });

  const fetchStaff = () => apiFetch<PageResponse<Staff>>('/api/staff?size=50').then(d => setStaff(d.content)).catch(e => toast.error(e.message));
  useEffect(() => { fetchStaff(); }, []);

  const fetchStaffById = async (id: number): Promise<Staff | null> => {
    setLoadingDetails(true);
    try {
      const detail = await apiFetch<Staff>(`/api/staff/${id}`);
      setActiveStaff(detail);
      return detail;
    } catch (e: any) {
      toast.error(e.message || 'Failed to load staff details');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenView = async (id: number) => {
    setViewOpen(true);
    await fetchStaffById(id);
  };

  const handleOpenEdit = async (id: number) => {
    setEditOpen(true);
    const detail = await fetchStaffById(id);
    if (!detail) return;

    resetEdit({
      employeeId: detail.employeeId,
      firstName: detail.firstName,
      lastName: detail.lastName,
      email: detail.email || '',
      phone: detail.phone || '',
      department: detail.department || '',
      designation: detail.designation || '',
      role: detail.role,
      dateOfJoining: detail.dateOfJoining || '',
    });
  };

  const onSubmit = async (data: StaffFormData) => {
    try { await apiFetch('/api/staff', { method: 'POST', body: JSON.stringify(data) }); toast.success('Added'); setOpen(false); reset(); fetchStaff(); }
    catch (e: any) { toast.error(e.message); }
  };

  const onEditSubmit = async (data: StaffFormData) => {
    if (!activeStaff) return;
    try {
      await apiFetch(`/api/staff/${activeStaff.id}`, { method: 'PUT', body: JSON.stringify(data) });
      toast.success('Staff updated');
      setEditOpen(false);
      fetchStaff();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeactivate = async (item: Staff) => {
    if (item.status === 'INACTIVE') {
      toast.info('Staff is already inactive');
      return;
    }

    setRemovingId(item.id);
    try {
      await apiFetch(`/api/staff/${item.id}/deactivate`, { method: 'PATCH' });
      toast.success('Staff removed (set to inactive)');
      fetchStaff();
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove staff');
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = staff.filter(s => `${s.firstName} ${s.lastName} ${s.employeeId}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 animate-fade-in">
      <PageHeader icon={<Users2 className="w-5 h-5" />} title="Staff" subtitle="Manage staff members"
        action={
          <div className="flex items-center gap-2">
            <Link href="/service-requests">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                Service Requests
              </Button>
            </Link>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                  <Plus className="w-4 h-4" />Add Staff
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-white">
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
                    <div><Label className="text-xs text-muted-foreground">Date of Joining</Label><Input type="date" {...register('dateOfJoining')} className="mt-1 h-9 text-sm" /></div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full h-9 rounded-md text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                    {isSubmitting ? 'Saving…' : 'Add Staff Member'}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <Card>
        <CardHeader className="pb-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search staff…" className="pl-9" value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} /></div></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent bg-muted/40">{['Employee ID','Name','Department','Role','Status','Actions'].map(h => <TableHead key={h} className="text-xs font-medium text-muted-foreground">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.employeeId}</TableCell>
                  <TableCell className="font-medium text-sm text-foreground">{s.firstName} {s.lastName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.department || '—'}</TableCell>
                  <TableCell><StatusBadge status={s.role} /></TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={() => handleOpenView(s.id)}>
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={() => handleOpenEdit(s.id)}>
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" className="h-8 px-2" disabled={s.status === 'INACTIVE' || removingId === s.id} onClick={() => handleDeactivate(s)}>
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-16 text-sm">No staff found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {loadingDetails && <p className="text-sm text-muted-foreground">Loading details...</p>}
          {!loadingDetails && activeStaff && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow label="Employee ID" value={activeStaff.employeeId} />
              <DetailRow label="Role" value={activeStaff.role.replace('_', ' ')} />
              <DetailRow label="First Name" value={activeStaff.firstName} />
              <DetailRow label="Last Name" value={activeStaff.lastName} />
              <DetailRow label="Email" value={activeStaff.email || '—'} />
              <DetailRow label="Phone" value={activeStaff.phone || '—'} />
              <DetailRow label="Department" value={activeStaff.department || '—'} />
              <DetailRow label="Designation" value={activeStaff.designation || '—'} />
              <DetailRow label="Date of Joining" value={activeStaff.dateOfJoining || '—'} />
              <DetailRow label="Status" value={activeStaff.status} />
              <DetailRow label="Created At" value={new Date(activeStaff.createdAt).toLocaleString()} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader><DialogTitle>Edit Staff Member</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Employee ID *</Label><Input {...editRegister('employeeId')} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs text-muted-foreground">Role *</Label>
                <Controller name="role" control={editControl} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="SYSTEM_USER">System User</SelectItem><SelectItem value="APPROVER">Approver</SelectItem></SelectContent>
                  </Select>
                )} />
              </div>
              <div><Label className="text-xs text-muted-foreground">First Name *</Label><Input {...editRegister('firstName')} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs text-muted-foreground">Last Name *</Label><Input {...editRegister('lastName')} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs text-muted-foreground">Email</Label><Input type="email" {...editRegister('email')} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs text-muted-foreground">Phone</Label><Input {...editRegister('phone')} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs text-muted-foreground">Department</Label><Input {...editRegister('department')} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs text-muted-foreground">Designation</Label><Input {...editRegister('designation')} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs text-muted-foreground">Date of Joining</Label><Input type="date" {...editRegister('dateOfJoining')} className="mt-1 h-9 text-sm" /></div>
            </div>
            <button type="submit" disabled={isEditSubmitting} className="w-full h-9 rounded-md text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              {isEditSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-all">{value}</p>
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
