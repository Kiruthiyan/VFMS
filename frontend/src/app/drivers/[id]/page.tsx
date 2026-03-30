'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, UserRound } from 'lucide-react';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { Driver } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DriverForm } from '@/components/drivers/DriverForm';
import { toast } from 'sonner';

export default function DriverDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchDriver = async () => {
    if (!id) {
      setError('Driver id is missing from URL.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Driver>(`/api/drivers/${id}`);
      setDriver(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const handleRemoveDriver = async () => {
    if (!id || isRemoving) return;
    if (!window.confirm('Remove this driver? This will set status to Inactive.')) return;

    try {
      setIsRemoving(true);
      await apiFetch<void>(`/api/drivers/${id}/deactivate`, { method: 'PATCH' });
      toast.success('Driver removed successfully.');
      router.push('/drivers');
      router.refresh();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
            <UserRound className="w-5 h-5" style={{ color: 'hsl(var(--primary-foreground))' }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Driver Profile</h1>
            <p className="text-sm text-muted-foreground">Driver details view</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {driver && !loading && !error && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
                  <Pencil className="w-4 h-4" />
                  Edit Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">Edit Driver</DialogTitle>
                  <DialogDescription className="text-black/80 dark:text-white/80">
                    Update driver details and save your changes.
                  </DialogDescription>
                </DialogHeader>
                <DriverForm
                  driver={driver}
                  onSuccess={() => {
                    setEditOpen(false);
                    fetchDriver();
                    toast.success('Driver updated successfully.');
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          {driver && !loading && !error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveDriver}
              disabled={isRemoving}
              className="inline-flex items-center gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              {isRemoving ? 'Removing...' : 'Remove Driver'}
            </Button>
          )}

          <Link href="/drivers" className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading driver...</p>}

          {!loading && error && (
            <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
              {error}
            </p>
          )}

          {!loading && !error && driver && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Detail label="Employee ID" value={driver.employeeId} />
              <Detail label="NIC" value={driver.nic} />
              <Detail label="First Name" value={driver.firstName} />
              <Detail label="Last Name" value={driver.lastName} />
              <Detail label="Phone" value={driver.phone} />
              <Detail label="License Number" value={driver.licenseNumber} />
              <Detail label="License Expiry Date" value={driver.licenseExpiryDate} />
              <Detail label="Date of Birth" value={driver.dateOfBirth} />
              <Detail label="Date of Joining" value={driver.dateOfJoining} />
              <Detail label="Department" value={driver.department} />
              <Detail label="Designation" value={driver.designation} />
              <Detail label="Email" value={driver.email} />
              <Detail label="Address" value={driver.address} className="md:col-span-2" />
              <Detail label="Emergency Contact Name" value={driver.emergencyContactName} />
              <Detail label="Emergency Contact Phone" value={driver.emergencyContactPhone} />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <StatusBadge status={driver.status} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || '-'}</p>
    </div>
  );
}
