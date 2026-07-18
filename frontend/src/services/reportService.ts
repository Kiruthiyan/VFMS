import api from '@/lib/api';
import { getAllFuelRecordsApi } from '@/lib/api/fuel';

export interface DashboardStats {
    totalFuelCost: number;
    totalMaintenanceCost: number;
    totalDistance: number;
    avgEfficiency: number;
    totalVehicles: number;
    monthlyDistances: Record<string, number>;
}

export interface CostAnalysis {
    totalMaintenanceCost: number;
    totalFuelCost: number;
    maintenanceTrend: Record<string, number>;
    fuelTrend: Record<string, number>;
}

export interface VehicleUtilization {
    vehicleId: number;
    licensePlate: string;
    totalDistance: number;
    totalTrips: number;
    fuelConsumed: number;
}

export interface DriverPerformance {
    driverId: number | string;
    driverName: string;
    totalTrips: number;
    totalDistance: number;
    rating: number;
}

export interface TripStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    completed: number;
    cancelled: number;
}

export interface UtilizationDepartmentData {
    name: string;
    requests: number;
}

export interface UtilizationTrendData {
    name: string;
    completed: number;
    cancelled: number;
}

export interface UtilizationSummary {
    overallFleetUtilization: number;
    departmentData: UtilizationDepartmentData[];
    completionTrend: UtilizationTrendData[];
}

type ApiEnvelope<T> = {
    success?: boolean;
    message?: string;
    data?: T;
};

function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as ApiEnvelope<T>).data as T;
    }

    return payload as T;
}

export const reportService = {
  getFuelLogs: async (): Promise<any[]> => {
    try {
      const { getAllFuelRecordsApi } = await import('@/lib/api/fuel');
      const result = await getAllFuelRecordsApi();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Failed to fetch fuel logs:', error);
      return [];
    }
  },

  getVehicles: async (): Promise<any[]> => {
    try {
      const { vehicleApi } = await import('@/lib/api/vehicle');
      const result = await vehicleApi.getAll();
      return Array.isArray(result) ? result : result?.data || [];
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      return [];
    }
  },

  getRentals: async (): Promise<any[]> => {
    try {
      const { rentalApi } = await import('@/lib/api/rental');
      const result = await rentalApi.getAll();
      return Array.isArray(result) ? result : result?.data || [];
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      return [];
    }
  },

  getMaintenanceAnalytics: async (): Promise<any[]> => {
    try {
      const { maintenanceApi } = await import('@/lib/api/maintenance');
      const result = await maintenanceApi.getAll();
      return Array.isArray(result) ? result : result?.data || [];
    } catch (error) {
      console.error('Failed to fetch maintenance:', error);
      return [];
    }
  },

  async getFuelLogs(): Promise<any[]> {
    try {
      const response = await apiClient.get('/fuel');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch fuel logs:', error);
      return [];
    }
  },

  async getVehicles(): Promise<any[]> {
    try {
      const response = await apiClient.get('/vehicles');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      return [];
    }
  },

  async getRentals(): Promise<any[]> {
    try {
      const response = await apiClient.get('/rentals');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      return [];
    }
  },

  async getMaintenanceAnalytics(): Promise<any[]> {
    try {
      const response = await apiClient.get('/maintenance');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch maintenance records:', error);
      return [];
    }
  },
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const response = await api.get<DashboardStats>('/api/reports/dashboard');
            return response.data;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return {
                totalFuelCost: 0,
                totalMaintenanceCost: 0,
                totalDistance: 0,
                avgEfficiency: 0,
                totalVehicles: 0,
                monthlyDistances: {}
            };
        }
    },

    getCostAnalysis: async (startDate?: string, endDate?: string): Promise<CostAnalysis> => {
        try {
            const response = await api.get<CostAnalysis>('/api/reports/costs', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching cost analysis:", error);
            return {
                maintenanceTrend: {},
                fuelTrend: {},
                totalMaintenanceCost: 0,
                totalFuelCost: 0
            };
        }
    },

    getVehicleUtilization: async (): Promise<VehicleUtilization[]> => {
        try {
            const response = await api.get<VehicleUtilization[]>('/api/reports/utilization');
            return response.data;
        } catch (error) {
            console.error("Error fetching vehicle utilization:", error);
            return [];
        }
    },

    getDriverPerformance: async (): Promise<any[]> => {
        try {
            const response = await api.get<any[]>('/api/reports/driver-performance');
            return response.data;
        } catch (error) {
            console.error("Error fetching driver performance:", error);
            return [];
        }
    },

    getMaintenanceAnalytics: async () => {
        try {
            const response = await api.get<ApiEnvelope<any[]> | any[]>('/api/maintenance');
            return unwrapApiData<any[]>(response.data);
        } catch (error) {
            console.error("Error fetching maintenance analytics:", error);
            return [];
        }
    },

    getRentalAnalytics: async () => {
        try {
            const response = await api.get<ApiEnvelope<any[]> | any[]>('/api/rentals');
            return unwrapApiData<any[]>(response.data);
        } catch (error) {
            console.error("Error fetching rental analytics:", error);
            return [];
        }
    },

    getVehicles: async () => {
        try {
            const response = await api.get<ApiEnvelope<any[]> | any[]>('/api/vehicles');
            return unwrapApiData<any[]>(response.data);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            return [];
        }
    },

    getVehicleTotalCount: async () => {
        try {
            const response = await api.get<ApiEnvelope<any[]> | any[]>('/api/vehicles');
            const vehicles = unwrapApiData<any[]>(response.data);
            return vehicles.length;
        } catch (error) {
            console.error("Error fetching vehicle count:", error);
            return 0;
        }
    },

    getDriverInfractions: async () => {
        try {
            const response = await api.get<any[]>('/api/drivers/infractions');
            return response.data;
        } catch (error) {
            console.error("Error fetching driver infractions:", error);
            return [];
        }
    },

    getDriverCompliance: async () => {
        try {
            const response = await api.get<any[]>('/api/drivers/compliance');
            return response.data;
        } catch (error) {
            console.error("Error fetching driver compliance:", error);
            return [];
        }
    },

    getDriverReadiness: async () => {
        try {
            const response = await api.get<any[]>('/api/drivers/readiness');
            return response.data;
        } catch (error) {
            console.error("Error fetching driver readiness:", error);
            return [];
        }
    },

    getStaffRequests: async () => {
        return [];
    },

    getDriverLeaves: async () => {
        try {
            const response = await api.get<any[]>('/api/drivers/leaves');
            return response.data;
        } catch (error) {
            console.error("Error fetching driver leaves:", error);
            return [];
        }
    },

    getFuelLogs: async () => {
        try {
            const records = await getAllFuelRecordsApi();
            return records.map((record) => ({
                id: record.id,
                vehicleId: record.vehicleId,
                licensePlate: record.vehiclePlate,
                date: record.fuelDate,
                fuelQuantity: record.quantity,
                pricePerLiter: record.costPerLitre,
                totalCost: record.totalCost,
                odometer: record.odometerReading,
                fuelStation: record.fuelStation ?? '',
            }));
        } catch (error) {
            console.error("Error fetching fuel logs:", error);
            return [];
        }
    },

    getTripStats: async (): Promise<TripStats> => {
        try {
            const response = await api.get<TripStats>('/api/reports/trips/stats');
            return response.data;
        } catch (error) {
            console.error("Error fetching trip stats:", error);
            return {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                active: 0,
                completed: 0,
                cancelled: 0
            };
        }
    },

    getUtilizationSummary: async (): Promise<UtilizationSummary> => {
        try {
            const response = await api.get<UtilizationSummary>('/api/reports/utilization/summary');
            return response.data;
        } catch (error) {
            console.error("Error fetching utilization summary:", error);
            return {
                overallFleetUtilization: 0,
                departmentData: [],
                completionTrend: []
            };
        }
    },

    getRentals: async () => {
        try {
            const response = await api.get<ApiEnvelope<any[]> | any[]>('/api/rentals');
            return unwrapApiData<any[]>(response.data);
        } catch (error) {
            console.error("Error fetching rentals:", error);
            return [];
        }
    },

async getFuelLogs(): Promise<any[]> {
    try {
      const records = await getAllFuelRecordsApi();
      return records.map((record: any) => ({
        id: record.id,
        vehicleId: record.vehicleId,
        licensePlate: record.vehiclePlate,
        date: record.fuelDate,
        fuelQuantity: record.quantity,
        pricePerLiter: record.costPerLitre,
        totalCost: record.totalCost,
        odometer: record.odometerReading,
        fuelStation: record.fuelStation ?? "",
      }));
    } catch (error) {
      console.error('Failed to fetch fuel logs:', error);
      return [];
    }
  },

  async getVehicles(): Promise<any[]> {
    try {
      const { vehicleApi } = await import('@/lib/api/vehicle');
      const result = await vehicleApi.getAll();
      return Array.isArray(result) ? result : result?.data || [];
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      return [];
    }
  },

  async getRentals(): Promise<any[]> {
    try {
      const { rentalApi } = await import('@/lib/api/rental');
      const result = await rentalApi.getAll();
      return Array.isArray(result) ? result : result?.data || [];
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      return [];
    }
  },

  async getMaintenanceAnalytics(): Promise<any[]> {
    try {
      const { maintenanceApi } = await import('@/lib/api/maintenance');
      const result = await maintenanceApi.getAll();
      return Array.isArray(result) ? result : result?.data || [];
    } catch (error) {
      console.error('Failed to fetch maintenance:', error);
      return [];
    }
  },
};
