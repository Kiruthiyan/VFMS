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
  driverName?: string;
  severity: string;
  status: string;
  infractionType: string;
  type?: string;
  incidentDate: string;
  date?: string;
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

type TripSummaryRow = {
  distanceKm?: number | string | null;
  driverRating?: number | string | null;
};

async function mapDriverPerformance(user: DriverUserSummary): Promise<DriverPerformanceRow> {
  const trips = await apiFetch<TripSummaryRow[]>(`/api/trips/driver/${user.id}`);
  const totalTrips = trips.length;
  const totalDistance = trips.reduce((sum, trip) => sum + Number(trip.distanceKm ?? 0), 0);
  const ratings = trips
    .map((trip) => Number(trip.driverRating ?? 0))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  const rating = ratings.length > 0
    ? ratings.reduce((sum, current) => sum + current, 0) / ratings.length
    : 0;

  return {
    id: user.id,
    driverId: user.id,
    driverName: user.fullName,
    name: user.fullName,
    employeeId: user.employeeId,
    safetyScore: rating,
    feedbackRating: rating,
    totalTrips,
    totalDistance,
    rating,
    status: user.status,
  };
}

function mapInfraction(raw: Record<string, unknown>): DriverInfractionRow {
  const severity = String(raw.severity ?? 'LOW');
  const resolutionStatus = String(raw.resolutionStatus ?? 'OPEN');
  const driver = raw.driver as { fullName?: string; employeeId?: string } | undefined;
  return {
    id: Number(raw.id),
    severity: severity.charAt(0) + severity.slice(1).toLowerCase(),
    status: resolutionStatus === 'RESOLVED' ? 'Resolved' : 'Pending',
    infractionType: String(raw.infractionType ?? ''),
    // Backward-compatible aliases used by older report pages.
    type: String(raw.infractionType ?? ''),
    incidentDate: String(raw.incidentDate ?? ''),
    date: String(raw.incidentDate ?? ''),
    description: raw.description as string | undefined,
    resolutionStatus,
    driverId: String(raw.driverId ?? driver?.employeeId ?? ''),
    driverName: driver?.fullName ?? String(raw.driverName ?? ''),
  };
}

export async function getDriverUsersForReports(): Promise<DriverPerformanceRow[]> {
  const page = await apiFetch<PageResponse<DriverUserSummary>>('/api/drivers/from-users?size=500');
  return Promise.all((page.content ?? []).map(mapDriverPerformance));
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
