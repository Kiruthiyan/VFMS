'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Phone, MapPin, Activity, 
  Camera, Loader2, Badge, Briefcase, Building, Trash2, X, UserRound
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  getMyStaffProfile, updateMyStaffProfile, uploadStaffProfilePicture, removeStaffProfilePicture,
  type StaffProfileResponse, type StaffProfileUpdateRequest
} from '@/lib/api/staff-profile';
import { resolveBackendAssetUrl } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { StatusBadge } from '@/components/StatusBadge';

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
    <div className="space-y-6">
      <PageHeader 
        title="My Profile" 
        description="View and manage your personal information" 
        icon={UserRound} 
      />
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : !profile ? (
        <div className="p-12 text-center text-slate-500">
          <p>No profile linked to your account. Contact an administrator.</p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-start">

          {/* Left: Avatar + identity card */}
          <div className="flex w-full flex-shrink-0 flex-col gap-6 xl:w-80">
            
            {/* Avatar card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="relative mb-4">
                <button
                  type="button"
                  onClick={() => avatarSrc && setShowProfilePicturePreview(true)}
                  aria-label={avatarSrc ? "View uploaded profile picture" : "No profile picture"}
                  className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm ${avatarSrc ? 'cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2' : 'cursor-default'}`}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-slate-300" />
                  )}
                </button>
                {avatarSrc && (
                  <button
                    onClick={handlePhotoRemove}
                    disabled={uploadingPic}
                    aria-label="Remove profile picture"
                    className="absolute -right-2 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {/* Upload overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPic}
                  aria-label="Change profile picture"
                  className={`absolute -right-2 ${avatarSrc ? 'bottom-4' : 'bottom-0'} z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50`}
                >
                  {uploadingPic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              <h2 className="text-center text-lg font-bold text-slate-900">{profile.fullName}</h2>
              <p className="mb-4 text-center text-sm font-medium text-slate-500">{profile.designation || 'Staff'}</p>
              <StatusBadge status={profile.status} />
            </div>

            {/* Identity card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                System Identity
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Employee ID</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{profile.employeeId || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Department</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{profile.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Office Location</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{profile.officeLocation || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editable contact info */}
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                <p className="mt-1 text-sm text-slate-500">Your contact details and emergency contacts</p>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="vfms-detail-tile">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="vfms-detail-label">Email Address</p>
                    <p className="vfms-detail-value">{profile.email || '-'}</p>
                  </div>
                </div>
                <div className="vfms-detail-tile">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="vfms-detail-label">Phone Number</p>
                    <p className="vfms-detail-value">{profile.phone || '-'}</p>
                  </div>
                </div>
                <div className="vfms-detail-tile">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="vfms-detail-label">Address</p>
                    <p className="vfms-detail-value">{profile.address || '-'}</p>
                  </div>
                </div>
                <div className="vfms-detail-tile">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="vfms-detail-label">Emergency Contact Name</p>
                    <p className="vfms-detail-value">{profile.emergencyContactName || '-'}</p>
                  </div>
                </div>
                <div className="vfms-detail-tile">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="vfms-detail-label">Emergency Contact Phone</p>
                    <p className="vfms-detail-value">{profile.emergencyContactPhone || '-'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-xs">Phone Number</Label>
                    <Input {...register('phone')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Input {...register('address')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                  </div>
                  <div>
                    <Label className="text-xs">Emergency Contact Name</Label>
                    <Input {...register('emergencyContactName')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                  </div>
                  <div>
                    <Label className="text-xs">Emergency Contact Phone</Label>
                    <Input {...register('emergencyContactPhone')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" className="h-11 rounded-xl" onClick={() => setIsEditing(false)} type="button">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="h-11 rounded-xl bg-amber-400 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showProfilePicturePreview && avatarSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Staff profile picture preview"
          onClick={() => setShowProfilePicturePreview(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[86vh] max-w-[92vw] sm:max-w-xl rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close profile picture preview"
              onClick={() => setShowProfilePicturePreview(false)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition-colors hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={avatarSrc}
              alt="Staff profile picture preview"
              className="block max-h-[78vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
