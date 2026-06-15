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
}

export interface DriverProfileUpdatePayload {
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
  certType: string;
  certName: string;
  issuedBy?: string;
  issueDate?: string;
  expiryDate?: string;
  createdAt?: string;
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

export interface InfractionItem {
  id: number;
  infractionType: string;
  severity: string;
  incidentDate: string;
  description?: string;
  resolutionStatus: string;
  penaltyNotes?: string;
  createdAt?: string;
}

export interface InfractionPayload {
  infractionType: string;
  severity: string;
  incidentDate: string;
  description?: string;
  penaltyNotes?: string;
}

export interface LeaveRequestItem {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approvedBy?: string;
  approvalNotes?: string;
  createdAt?: string;
}

export interface LeaveRequestPayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ServiceRequestItem {
  id: number;
  requestType: string;
  vehicleId?: number;
  description?: string;
  urgency: string;
  status: string;
  driverId?: string;
  requesterId?: string;
  createdAt?: string;
}

export interface ServiceRequestPayload {
  requestType: string;
  vehicleId?: number;
  description?: string;
  urgency?: string;
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
  const res = await api.post<DocumentItem>('/api/driver/profile/picture', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
  entityId?: number
): Promise<DocumentItem> {
  const form = new FormData();
  form.append('file', file);
  form.append('entityType', entityType);
  if (entityId !== undefined) form.append('entityId', String(entityId));
  const res = await api.post<DocumentItem>('/api/driver/documents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteMyDocument(id: number): Promise<void> {
  await api.delete(`/api/driver/documents/${id}`);
}

// ── Infractions ───────────────────────────────────────────────────────────────

export async function getMyInfractions(): Promise<InfractionItem[]> {
  const res = await api.get<InfractionItem[]>('/api/driver/infractions');
  return res.data;
}

export async function submitMyInfraction(data: InfractionPayload): Promise<InfractionItem> {
  const res = await api.post<InfractionItem>('/api/driver/infractions', data);
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

// ── Service Requests ──────────────────────────────────────────────────────────

export async function getMyServiceRequests(): Promise<ServiceRequestItem[]> {
  const res = await api.get<ServiceRequestItem[]>('/api/driver/service-requests');
  return res.data;
}

export async function submitServiceRequest(data: ServiceRequestPayload): Promise<ServiceRequestItem> {
  const res = await api.post<ServiceRequestItem>('/api/driver/service-requests', data);
  return res.data;
}
