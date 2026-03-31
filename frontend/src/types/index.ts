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
