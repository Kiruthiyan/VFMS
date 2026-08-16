/**
 * Driver Self-Portal API functions
 *
 * All calls go to /api/driver/** which is secured to ROLE_DRIVER only.
 * The backend resolves driverId from the JWT — we never pass it here.
 */
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DriverProfileResponse {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  nic: string;
  dateOfBirth?: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
  /** Future Trip Scheduling / Staff Dashboard integration value from 0 to 100. */
  ratingPercentage?: number | null;
}

export interface DriverProfileUpdatePayload {
  fullName?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface DriverLicenseItem {
  id: number;
  driverId: string;
  licenseNumber: string;
  category: string;
  issuingAuthority?: string;
  issueDate: string;
  expiryDate: string;
  isPrimary?: boolean;
  status: string;
  documentUrl?: string;
}

export interface DriverLicensePayload {
  licenseNumber: string;
  category: string;
  issuingAuthority?: string;
  issueDate: string;
  expiryDate: string;
  isPrimary?: boolean;
  // driverId is intentionally excluded — server injects it
  driverId?: string;
}

export interface CertificationItem {
  id: number;
  certType: string | null;
  certName: string | null;
  issuedBy?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  createdAt?: string | null;
}

export interface CertificationPayload {
  certType: string;
  certName: string;
  issuedBy?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface DocumentItem {
  id: number;
  entityType: string;
  entityId?: number;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize: number;
  createdAt?: string;
}

export interface LeaveRequestItem {
  id: number;
  leaveType: string | null;
  startDate: string | null;
  endDate: string | null;
  reason?: string | null;
  status: string | null;
  approvedBy?: string | null;
  approvalNotes?: string | null;
  createdAt?: string | null;
}

export interface LeaveRequestPayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface InfractionItem {
  id: number;
  infractionType: string | null;
  severity: string | null;
  incidentDate: string | null;
  description?: string | null;
  resolutionStatus: string | null;
  resolvedAt?: string | null;
  penaltyNotes?: string | null;
  createdAt?: string | null;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<DriverProfileResponse> {
  const res = await api.get<DriverProfileResponse>('/api/driver/profile');
  return res.data;
}

export async function updateMyProfile(data: DriverProfileUpdatePayload): Promise<DriverProfileResponse> {
  const res = await api.put<DriverProfileResponse>('/api/driver/profile', data);
  return res.data;
}

export async function uploadProfilePicture(file: File): Promise<DocumentItem> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<DocumentItem>('/api/driver/profile/picture', form);
  return res.data;
}

export async function removeProfilePicture(): Promise<void> {
  await api.delete('/api/driver/profile/picture');
}

// ── Licenses ──────────────────────────────────────────────────────────────────

export async function getMyLicenses(): Promise<DriverLicenseItem[]> {
  const res = await api.get<DriverLicenseItem[]>('/api/driver/licenses');
  return res.data;
}

export async function addMyLicense(data: DriverLicensePayload): Promise<DriverLicenseItem> {
  const res = await api.post<DriverLicenseItem>('/api/driver/licenses', data);
  return res.data;
}

export async function updateMyLicense(id: number, data: DriverLicensePayload): Promise<DriverLicenseItem> {
  const res = await api.put<DriverLicenseItem>(`/api/driver/licenses/${id}`, data);
  return res.data;
}

// ── Certifications ────────────────────────────────────────────────────────────

export async function getMyCertifications(): Promise<CertificationItem[]> {
  const res = await api.get<CertificationItem[]>('/api/driver/certifications');
  return res.data;
}

export async function addMyCertification(data: CertificationPayload): Promise<CertificationItem> {
  const res = await api.post<CertificationItem>('/api/driver/certifications', data);
  return res.data;
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function getMyDocuments(): Promise<DocumentItem[]> {
  const res = await api.get<DocumentItem[]>('/api/driver/documents');
  return res.data;
}

export async function uploadMyDocument(
  file: File,
  entityType: string,
  entityId?: number,
  documentName?: string
): Promise<DocumentItem> {
  const form = new FormData();
  form.append('file', file);
  form.append('entityType', entityType);
  if (entityId !== undefined) form.append('entityId', String(entityId));
  if (documentName?.trim()) form.append('documentName', documentName.trim());
  const res = await api.post<DocumentItem>('/api/driver/documents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteMyDocument(id: number): Promise<void> {
  await api.delete(`/api/driver/documents/${id}`);
}

export async function getMyInfractions(): Promise<InfractionItem[]> {
  const res = await api.get<InfractionItem[]>('/api/driver/infractions');
  return res.data;
}

// ── Trips ─────────────────────────────────────────────────────────────────────

export async function getMyTrips(): Promise<unknown[]> {
  const res = await api.get<unknown[]>('/api/driver/trips');
  return res.data;
}

// ── Leave Requests ────────────────────────────────────────────────────────────

export async function getMyLeaveRequests(): Promise<LeaveRequestItem[]> {
  const res = await api.get<LeaveRequestItem[]>('/api/driver/leave-requests');
  return res.data;
}

export async function submitLeaveRequest(data: LeaveRequestPayload): Promise<LeaveRequestItem> {
  const res = await api.post<LeaveRequestItem>('/api/driver/leave-requests', data);
  return res.data;
}

export async function deleteLeaveRequest(id: number): Promise<void> {
  await api.delete(`/api/driver/leave-requests/${id}`);
}

// End of driver portal API helpers.
