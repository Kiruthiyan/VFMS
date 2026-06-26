'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Phone, MapPin, Activity, 
  Camera, Loader2, Badge, Briefcase, Building, Trash2, X
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import {
  getMyStaffProfile, updateMyStaffProfile, uploadStaffProfilePicture, removeStaffProfilePicture,
  type StaffProfileResponse, type StaffProfileUpdateRequest
} from '@/lib/api/staff-profile';
import { resolveBackendAssetUrl } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
      <span style={{
        width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
        background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem',
      }}>
        <Icon style={{ width: '0.875rem', height: '0.875rem', color: 'hsl(var(--muted-foreground))' }} />
      </span>
      <div>
        <p style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))', margin: '0.125rem 0 0', fontWeight: 500 }}>{value || '—'}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    APPROVED: { bg: 'hsl(145 63% 94%)', text: 'hsl(145 63% 25%)', border: 'hsl(145 63% 70%)' },
    PENDING: { bg: 'hsl(42 100% 94%)', text: 'hsl(42 100% 25%)', border: 'hsl(42 100% 70%)' },
    REJECTED: { bg: 'hsl(360 79% 95%)', text: 'hsl(360 79% 30%)', border: 'hsl(360 79% 75%)' },
  };
  const c = colors[status] ?? colors.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${c.border}`, background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string' ? response.data.message : fallback;
}

export default function StaffProfilePage() {
  const [profile, setProfile] = useState<StaffProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [showProfilePicturePreview, setShowProfilePicturePreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<StaffProfileUpdateRequest>();

  useEffect(() => {
    getMyStaffProfile()
      .then((data) => {
        setProfile(data);
        reset({
          phone: data.phone || '',
          address: data.address || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
        });
      })
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Failed to load profile')))
      .finally(() => setLoading(false));
  }, [reset]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      await uploadStaffProfilePicture(file);
      const updated = await getMyStaffProfile();
      setProfile(updated);
      toast.success('Profile picture updated');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to upload photo'));
    } finally {
      setUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = async () => {
    if (!profile?.photoUrl) return;
    setUploadingPic(true);
    try {
      await removeStaffProfilePicture();
      const updated = await getMyStaffProfile();
      setProfile(updated);
      toast.success('Profile picture removed');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to remove photo'));
    } finally {
      setUploadingPic(false);
    }
  };

  const onSubmitUpdate = async (data: StaffProfileUpdateRequest) => {
    try {
      const updated = await updateMyStaffProfile(data);
      setProfile(updated);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to update profile'));
    }
  };

  const avatarSrc = profile?.photoUrl ? resolveBackendAssetUrl(profile.photoUrl) : null;

  return (
    <DashboardShell title="My Profile" description="View and manage your personal information">
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'hsl(var(--muted-foreground))' }}>
          <Loader2 style={{ width: '1.5rem', height: '1.5rem', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : !profile ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
          <p>No profile linked to your account. Contact an administrator.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(18rem, 22rem) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start', maxWidth: '74rem', margin: '0 auto', width: '100%' }}>

          {/* Left: Avatar + identity card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Avatar card */}
            <div style={{
              borderRadius: '1.25rem', border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))', overflow: 'hidden',
              boxShadow: '0 16px 40px hsl(220 30% 10% / 0.08)',
            }}>
              {/* Gradient banner */}
              <div style={{ height: '5.5rem', background: 'linear-gradient(135deg, hsl(220 30% 15%), hsl(42 100% 30%))' }} />
              <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative', textAlign: 'center' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '-2.5rem', marginBottom: '0.75rem' }}>
                  {avatarSrc ? (
                    <button
                      type="button"
                      onClick={() => setShowProfilePicturePreview(true)}
                      aria-label="View uploaded profile picture"
                      style={{
                        width: '5rem',
                        height: '5rem',
                        borderRadius: '50%',
                        border: '3px solid hsl(var(--background))',
                        padding: 0,
                        overflow: 'hidden',
                        display: 'block',
                        background: 'transparent',
                        cursor: 'zoom-in',
                      }}
                    >
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  ) : (
                    <div style={{
                      width: '5rem', height: '5rem', borderRadius: '50%',
                      background: 'linear-gradient(135deg, hsl(220 30% 25%), hsl(42 100% 40%))',
                      border: '3px solid hsl(var(--background))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <User style={{ width: '2rem', height: '2rem', color: '#fff' }} />
                    </div>
                  )}
                  {avatarSrc && (
                    <button
                      onClick={handlePhotoRemove}
                      disabled={uploadingPic}
                      aria-label="Remove profile picture"
                      style={{
                        position: 'absolute', top: '0.25rem', right: '-2rem',
                        width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                        background: '#fff', border: '1px solid hsl(var(--border))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px hsl(0 0% 0% / 0.12)'
                      }}
                    >
                      <Trash2 style={{ width: '0.75rem', height: '0.75rem', color: 'hsl(0 84% 45%)' }} />
                    </button>
                  )}
                  {/* Upload overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPic}
                    aria-label="Change profile picture"
                    style={{
                      position: 'absolute', top: avatarSrc ? '2.1rem' : '0.25rem', right: '-2rem',
                      width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                      background: '#fff', border: '1px solid hsl(var(--border))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px hsl(0 0% 0% / 0.12)'
                    }}
                  >
                    {uploadingPic
                      ? <Loader2 style={{ width: '0.75rem', height: '0.75rem', color: 'hsl(var(--foreground))', animation: 'spin 1s linear infinite' }} />
                      : <Camera style={{ width: '0.75rem', height: '0.75rem', color: 'hsl(var(--foreground))' }} />
                    }
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </div>

                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--foreground))', margin: 0 }}>
                  {profile.fullName}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0.25rem 0 0.75rem' }}>
                  {profile.designation || 'Staff'}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <StatusPill status={profile.status} />
                </div>
              </div>
            </div>

            {/* Identity card */}
            <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1rem 1.25rem', boxShadow: '0 8px 24px hsl(220 30% 10% / 0.04)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                System Identity
              </p>
              <InfoRow icon={Badge} label="Employee ID" value={profile.employeeId} />
              <InfoRow icon={Building} label="Department" value={profile.department} />
              <InfoRow icon={Briefcase} label="Office Location" value={profile.officeLocation} />
            </div>
          </div>

          {/* Right: Editable contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            <div style={{ borderRadius: '1.25rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1.5rem', boxShadow: '0 12px 32px hsl(220 30% 10% / 0.06)' }}>
              <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0 }}>Personal Information</h3>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0.125rem 0 0' }}>Your contact details and emergency contacts</p>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Details</Button>
                )}
              </div>

              {!isEditing ? (
                <>
                  <InfoRow icon={Mail} label="Email Address" value={profile.email} />
                  <InfoRow icon={Phone} label="Phone Number" value={profile.phone} />
                  <InfoRow icon={MapPin} label="Address" value={profile.address} />
                  <InfoRow icon={User} label="Emergency Contact Name" value={profile.emergencyContactName} />
                  <InfoRow icon={Activity} label="Emergency Contact Phone" value={profile.emergencyContactPhone} />
                </>
              ) : (
                <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-xs">Phone Number</Label>
                      <Input {...register('phone')} className="h-9 mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Address</Label>
                      <Input {...register('address')} className="h-9 mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Emergency Contact Name</Label>
                      <Input {...register('emergencyContactName')} className="h-9 mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Emergency Contact Phone</Label>
                      <Input {...register('emergencyContactPhone')} className="h-9 mt-1" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} type="button">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showProfilePicturePreview && avatarSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Staff profile picture preview"
          onClick={() => setShowProfilePicturePreview(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'hsl(220 30% 5% / 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 'min(34rem, 92vw)',
              maxHeight: '86vh',
              borderRadius: '1.25rem',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 24px 80px hsl(220 35% 5% / 0.45)',
              padding: '0.75rem',
            }}
          >
            <button
              type="button"
              aria-label="Close profile picture preview"
              onClick={() => setShowProfilePicturePreview(false)}
              style={{
                position: 'absolute',
                top: '-0.75rem',
                right: '-0.75rem',
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                border: '1px solid hsl(var(--border))',
                background: '#fff',
                color: 'hsl(var(--foreground))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px hsl(220 30% 10% / 0.18)',
              }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
            <img
              src={avatarSrc}
              alt="Staff profile picture preview"
              style={{
                display: 'block',
                width: '100%',
                maxHeight: '78vh',
                borderRadius: '0.9rem',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardShell>
  );
}
