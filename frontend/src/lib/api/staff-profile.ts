import { api } from '@/lib/api';

export interface StaffProfileResponse {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  role: string;
  status: string;
  department: string;
  designation: string;
  officeLocation: string;
  photoUrl: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfileUpdateRequest {
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UserSummaryResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  employeeId: string;
  department: string;
  officeLocation: string;
  designation: string;
}

export async function getMyStaffProfile(): Promise<StaffProfileResponse> {
  const res = await api.get<StaffProfileResponse>('/api/staff-profile/me');
  return res.data;
}

export async function updateMyStaffProfile(data: StaffProfileUpdateRequest): Promise<StaffProfileResponse> {
  const res = await api.put<StaffProfileResponse>('/api/staff-profile/me', data);
  return res.data;
}

export async function uploadStaffProfilePicture(file: File): Promise<StaffProfileResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<StaffProfileResponse>('/api/staff-profile/picture', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function removeStaffProfilePicture(): Promise<void> {
  await api.delete('/api/staff-profile/picture');
}

export async function getStaffList(): Promise<UserSummaryResponse[]> {
  const res = await api.get<UserSummaryResponse[]>('/api/staff-profile/list');
  return res.data;
}
