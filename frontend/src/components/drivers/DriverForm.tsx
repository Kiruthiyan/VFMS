'use client';

import { useForm } from 'react-hook-form';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { toast } from 'sonner';

const hasMinDigits = (value: string, minDigits = 10) => value.replace(/\D/g, '').length >= minDigits;

type DriverFormData = {
  employeeId: string;
  firstName: string;
  lastName: string;
  nic: string;
  dateOfBirth?: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
};

type DriverFieldConfig = {
  label: string;
  name: keyof DriverFormData;
  type: string;
  placeholder: string;
  required?: boolean;
  helperText?: string;
};

export function DriverForm({ onSuccess, driver }: { onSuccess: () => void; driver?: any }) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormData>({
    defaultValues: {
      ...(driver || {}),
      emergencyContactPhone: driver?.emergencyContactPhone ?? '',
    },
  });

  const requiredFields: Array<keyof DriverFormData> = ['employeeId', 'firstName', 'lastName', 'nic', 'phone', 'licenseNumber', 'licenseExpiryDate'];

  const normalizePayload = (data: DriverFormData) => {
    const emptyToNull = (value?: string) => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    };

    return {
      employeeId: data.employeeId.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      nic: data.nic.trim(),
      dateOfBirth: emptyToNull(data.dateOfBirth),
      phone: data.phone.trim(),
      licenseNumber: data.licenseNumber.trim(),
      licenseExpiryDate: data.licenseExpiryDate,
      email: emptyToNull(data.email),
      address: emptyToNull(data.address),
      emergencyContactName: emptyToNull(data.emergencyContactName),
      emergencyContactPhone: emptyToNull(data.emergencyContactPhone),
      department: emptyToNull(data.department),
      designation: emptyToNull(data.designation),
      dateOfJoining: emptyToNull(data.dateOfJoining),
    };
  };

  const onSubmit = async (data: DriverFormData) => {
    const requiredFieldsAreValid = await validateRequiredFields(data);
    if (!requiredFieldsAreValid) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const applyServerErrors = (message: string) => {
      const fieldMap: Record<string, keyof DriverFormData> = {
        employeeid: 'employeeId',
        firstname: 'firstName',
        lastname: 'lastName',
        nic: 'nic',
        dateofbirth: 'dateOfBirth',
        phone: 'phone',
        email: 'email',
        address: 'address',
        emergencycontactname: 'emergencyContactName',
        emergencycontactphone: 'emergencyContactPhone',
        department: 'department',
        designation: 'designation',
        dateofjoining: 'dateOfJoining',
        licensenumber: 'licenseNumber',
        licenseexpirydate: 'licenseExpiryDate',
      };

      const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');

      const directParts = message.split(':');
      if (directParts.length > 1) {
        const serverField = normalize(directParts[0]);
        const mappedField = fieldMap[serverField];
        if (mappedField) {
          const detail = directParts.slice(1).join(':').trim() || 'Invalid value';
          setError(mappedField, { type: 'server', message: detail });
          return true;
        }
      }

      const lower = message.toLowerCase();
      if (lower.includes('employee id')) {
        setError('employeeId', { type: 'server', message });
        return true;
      }
      if (lower.includes('nic')) {
        setError('nic', { type: 'server', message });
        return true;
      }
      if (lower.includes('email')) {
        setError('email', { type: 'server', message });
        return true;
      }
      if (lower.includes('license number')) {
        setError('licenseNumber', { type: 'server', message });
        return true;
      }
      if (lower.includes('license expiry date')) {
        setError('licenseExpiryDate', { type: 'server', message });
        return true;
      }

      return false;
    };

    clearErrors();
    const phone = data.phone.trim();
    if (!hasMinDigits(phone)) {
      setError('phone', {
        type: 'manual',
        message: 'Phone number must have at least 10 digits',
      });
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const emergencyPhone = (data.emergencyContactPhone || '').trim();
    if (emergencyPhone && !hasMinDigits(emergencyPhone)) {
      setError('emergencyContactPhone', {
        type: 'manual',
        message: 'Emergency contact phone must have at least 10 digits',
      });
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      const payload = normalizePayload(data);
      if (driver) {
        await apiFetch(`/api/drivers/${driver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Driver updated');
      } else {
        await apiFetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Driver created');
      }
      onSuccess();
    } catch (e: any) {
      const message = getErrorMessage(e);
      const hasInlineError = applyServerErrors(message);
      console.error('Driver submit failed:', e?.response?.data || e);
      toast.error(hasInlineError ? 'Please fix the highlighted fields.' : message);
    }
  };

  const fields: DriverFieldConfig[] = [
    { label: 'Employee ID', name: 'employeeId', type: 'text', placeholder: 'Enter employee ID', required: true },
    { label: 'NIC', name: 'nic', type: 'text', placeholder: 'Enter NIC number', required: true },
    { label: 'First Name', name: 'firstName', type: 'text', placeholder: 'Enter first name', required: true },
    { label: 'Last Name', name: 'lastName', type: 'text', placeholder: 'Enter last name', required: true },
    { label: 'Phone', name: 'phone', type: 'text', placeholder: 'Enter phone number', required: true },
    { label: 'License Number', name: 'licenseNumber', type: 'text', placeholder: 'Enter license number', required: true },
    {
      label: 'License Expiry Date',
      name: 'licenseExpiryDate',
      type: 'date',
      placeholder: '',
      required: true,
      helperText: 'Required date field',
    },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter email address' },
    { label: 'Department', name: 'department', type: 'text', placeholder: 'Enter department' },
    { label: 'Designation', name: 'designation', type: 'text', placeholder: 'Enter designation' },
    { label: 'Date of Birth', name: 'dateOfBirth', type: 'date', placeholder: '', helperText: 'Optional date field' },
    { label: 'Date of Joining', name: 'dateOfJoining', type: 'date', placeholder: '', helperText: 'Optional date field' },
  ];

  const formErrorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

  const validateRequiredFields = async (data: DriverFormData) => {
    clearErrors(requiredFields);

    const missingFields = requiredFields.filter((field) => !String(data[field] ?? '').trim());

    missingFields.forEach((field) => {
      setError(field, {
        type: 'manual',
        message: 'Required',
      });
    });

    await trigger(requiredFields);

    return missingFields.length === 0;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-md bg-white p-4">
      <p className="text-xs font-semibold text-black">Fields marked with * are required. Required date: License Expiry Date.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.name}>
            <Label htmlFor={f.name} className="mb-1.5 block text-sm font-semibold text-black">
              {f.label}
              {f.required ? ' *' : ''}
            </Label>
            {f.helperText && <p className="mb-1 text-xs font-medium text-black/80">{f.helperText}</p>}
            <Input
              id={f.name}
              type={f.type}
              placeholder={f.placeholder}
              {...register(f.name as any)}
              className="h-9 text-sm text-black placeholder:text-slate-500"
              style={{
                color: '#111827',
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
              }}
            />
            {errors[f.name as keyof typeof errors] && (
              <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>
                {String(errors[f.name as keyof typeof errors]?.message)}
              </p>
            )}
          </div>
        ))}

        <div className="col-span-2">
          <Label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-black">
            Address
          </Label>
          <Input
            id="address"
            placeholder="Enter address"
            {...register('address')}
            className="h-9 text-sm text-black placeholder:text-slate-500"
            style={{
              color: '#111827',
              backgroundColor: '#ffffff',
              borderColor: '#d1d5db',
            }}
          />
        </div>
        <div>
          <Label htmlFor="emergencyContactName" className="mb-1.5 block text-sm font-semibold text-black">
            Emergency Contact Name
          </Label>
          <Input
            id="emergencyContactName"
            placeholder="Enter emergency contact name"
            {...register('emergencyContactName')}
            className="h-9 text-sm text-black placeholder:text-slate-500"
            style={{
              color: '#111827',
              backgroundColor: '#ffffff',
              borderColor: '#d1d5db',
            }}
          />
        </div>
        <div>
          <Label htmlFor="emergencyContactPhone" className="mb-1.5 block text-sm font-semibold text-black">
            Emergency Contact Phone
          </Label>
          <Input
            id="emergencyContactPhone"
            placeholder="Enter emergency contact phone"
            {...register('emergencyContactPhone')}
            className="h-9 text-sm text-black placeholder:text-slate-500"
            style={{
              color: '#111827',
              backgroundColor: '#ffffff',
              borderColor: '#d1d5db',
            }}
          />
          {errors.emergencyContactPhone && (
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>
              {String(errors.emergencyContactPhone.message)}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <FormErrorSummary messages={formErrorMessages} className="pt-1" />
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
