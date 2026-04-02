export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Driver {
  id: string;
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
  photoUrl?: string;
  status: DriverStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentEntityType = 'LICENSE' | 'CERTIFICATION' | 'PROFILE' | 'OTHER';

export interface DriverDocument {
  id: number;
  entityType: DocumentEntityType;
  entityId?: number;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize: number;
  createdAt?: string;
  updatedAt?: string;
}

export type StaffRole = 'SYSTEM_USER' | 'APPROVER';
export type StaffStatus = 'ACTIVE' | 'INACTIVE';

export interface Staff {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  nic?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type AvailabilityStatus =
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'ON_LEAVE'
  | 'INACTIVE';

export interface DriverAvailability {
  driverId: string;
  status: AvailabilityStatus;
  updatedAt: string;
  updatedBy?: string;
  reason?: string;
}

export interface DriverReadinessCache {
  driverId: string;
  licenseValid: boolean;
  allCertsValid: boolean;
  availabilityStatus: AvailabilityStatus;
  lastRefreshed: string;
}

export type LeaveType = 'ANNUAL' | 'MEDICAL' | 'EMERGENCY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface DriverLeave {
  id: number;
  driver: Pick<Driver, 'id' | 'firstName' | 'lastName'>;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InfractionType =
  | 'TRAFFIC_VIOLATION'
  | 'MINOR_ACCIDENT'
  | 'MAJOR_ACCIDENT'
  | 'NEAR_MISS'
  | 'RECKLESS_DRIVING'
  | 'OTHER';

export type InfractionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InfractionResolutionStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';

export interface DriverInfraction {
  id: number;
  driver: Pick<Driver, 'id' | 'firstName' | 'lastName'>;
  infractionType: InfractionType;
  severity: InfractionSeverity;
  incidentDate: string;
  description?: string;
  resolutionStatus: InfractionResolutionStatus;
  resolvedAt?: string;
  penaltyNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverPerformanceScore {
  id: number;
  periodYear: number;
  periodMonth: number;
  tripCompletionRate: number;
  fuelEfficiencyRatio: number;
  infractionDeduction: number;
  feedbackScore: number;
  compositeScore: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EligibilityCheckResponse {
  driverId: string;
  vehicleCategory: string;
  eligible: boolean;
  reasons: string[];
}
