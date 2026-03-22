'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const driverSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  nic: z.string().min(1, 'Required'),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  dateOfJoining: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;

export function DriverForm({ onSuccess, driver }: { onSuccess: () => void; driver?: any }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormData>({ resolver: zodResolver(driverSchema), defaultValues: driver || {} });

  const onSubmit = async (data: DriverFormData) => {
    try {
      if (driver) {
        await apiFetch(`/api/drivers/${driver.id}`, { method: 'PUT', body: JSON.stringify(data) });
        toast.success('Driver updated');
      } else {
        await apiFetch('/api/drivers', { method: 'POST', body: JSON.stringify(data) });
        toast.success('Driver created');
      }
      onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const fields = [
    { label: 'Employee ID *', name: 'employeeId', type: 'text' },
    { label: 'NIC *', name: 'nic', type: 'text' },
    { label: 'First Name *', name: 'firstName', type: 'text' },
    { label: 'Last Name *', name: 'lastName', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Phone', name: 'phone', type: 'text' },
    { label: 'Department', name: 'department', type: 'text' },
    { label: 'Designation', name: 'designation', type: 'text' },
    { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
    { label: 'Date of Joining', name: 'dateOfJoining', type: 'date' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.name}>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</Label>
            <Input type={f.type} {...register(f.name as any)} className="h-9 text-sm" />
            {errors[f.name as keyof typeof errors] && (
              <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>
                {String(errors[f.name as keyof typeof errors]?.message)}
              </p>
            )}
          </div>
        ))}

        <div className="col-span-2">
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</Label>
          <Input {...register('address')} className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emergency Contact Name</Label>
          <Input {...register('emergencyContactName')} className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emergency Contact Phone</Label>
          <Input {...register('emergencyContactPhone')} className="h-9 text-sm" />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-8 px-4 text-xs rounded-md font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Driver'}
        </button>
      </div>
    </form>
  );
}
