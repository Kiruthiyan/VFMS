/**
 * DSM report API — typed calls to driver/staff management endpoints.
 * Used by admin driver analytics pages under /dashboards/admin/reports/drivers/.
 */
import { apiFetch } from '@/lib/api';

export interface DriverUserSummary {
  id: string;
  employeeId: string | null;
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  licenseNumber: string | null;
  licenseExpiryDate: string | null;
  status: string;
  driverId: string | null;
}

export interface DriverPerformanceRow {
  id: string;
  driverId: string;
  driverName: string;
  name: string;
  employeeId: string | null;
  safetyScore: number;
  feedbackRating: number;
  totalTrips: number;
  totalDistance: number;
  rating: number;
  status: string;
}

export interface DriverInfractionRow {
  id: number;
  driverId?: string;
  severity: string;
  status: string;
  infractionType: string;
  incidentDate: string;
  description?: string;
  resolutionStatus?: string;
}

export interface DriverComplianceRow {
  driverId: string;
  driverName: string;
  employeeId?: string;
  licenseExpiry?: string;
  complianceScore: number;
  licenseValid: boolean;
  allCertsValid: boolean;
  onLeaveToday: boolean;
  notReadyReason?: string;
}

export interface DriverLeaveRow {
  id: number;
  driverId?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  driver?: { fullName?: string; employeeId?: string };
}

export interface DriverReadinessRow {
  userId: string;
  licenseValid: boolean;
  allCertsValid: boolean;
  onLeaveToday: boolean;
  notReadyReason?: string;
  ready: boolean;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

function mapDriverPerformance(user: DriverUserSummary): DriverPerformanceRow {
  const complianceBase = user.licenseExpiryDate
    ? (new Date(user.licenseExpiryDate) >= new Date() ? 90 : 50)
    : 70;

  return {
    id: user.id,
    driverId: user.id,
    driverName: user.fullName,
    name: user.fullName,
    employeeId: user.employeeId,
    safetyScore: complianceBase,
    feedbackRating: 4,
    totalTrips: 0,
    totalDistance: 0,
    rating: 0,
    status: user.status,
  };
}

function mapInfraction(raw: Record<string, unknown>): DriverInfractionRow {
  const severity = String(raw.severity ?? 'LOW');
  const resolutionStatus = String(raw.resolutionStatus ?? 'OPEN');
  return {
    id: Number(raw.id),
    severity: severity.charAt(0) + severity.slice(1).toLowerCase(),
    status: resolutionStatus === 'RESOLVED' ? 'Resolved' : 'Pending',
    infractionType: String(raw.infractionType ?? ''),
    incidentDate: String(raw.incidentDate ?? ''),
    description: raw.description as string | undefined,
    resolutionStatus,
  };
}

export async function getDriverUsersForReports(): Promise<DriverPerformanceRow[]> {
  const page = await apiFetch<PageResponse<DriverUserSummary>>('/api/drivers/from-users?size=500');
  return (page.content ?? []).map(mapDriverPerformance);
}

export async function getAllDriverInfractions(): Promise<DriverInfractionRow[]> {
  const rows = await apiFetch<Record<string, unknown>[]>('/api/drivers/infractions');
  return (rows ?? []).map(mapInfraction);
}

export async function getDriverComplianceReport(): Promise<DriverComplianceRow[]> {
  return apiFetch<DriverComplianceRow[]>('/api/drivers/compliance');
}

export async function getAllDriverLeaves(): Promise<DriverLeaveRow[]> {
  return apiFetch<DriverLeaveRow[]>('/api/drivers/leaves');
}

export async function getDriverReadinessReport(): Promise<DriverReadinessRow[]> {
  const rows = await apiFetch<Record<string, unknown>[]>('/api/drivers/readiness');
  return (rows ?? []).map((r) => ({
    userId: String(r.userId ?? ''),
    driverId: String(r.userId ?? ''),
    licenseValid: Boolean(r.licenseValid),
    allCertsValid: Boolean(r.allCertsValid),
    onLeaveToday: Boolean(r.onLeaveToday),
    notReadyReason: r.notReadyReason as string | undefined,
    ready: Boolean(r.licenseValid) && !Boolean(r.onLeaveToday),
    isEligible: Boolean(r.licenseValid) && !Boolean(r.onLeaveToday),
  }));
}

/** @deprecated Use getDriverUsersForReports — kept for pages that still call getDriverPerformance naming */
export const getDriverPerformance = getDriverUsersForReports;

export const getDriverInfractions = getAllDriverInfractions;
export const getDriverCompliance = getDriverComplianceReport;
export const getDriverLeaves = getAllDriverLeaves;
export const getDriverReadiness = getDriverReadinessReport;
