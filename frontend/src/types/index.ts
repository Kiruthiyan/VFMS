export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Driver {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  nic: string;
  dateOfBirth?: string;
  phone?: string;
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

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
