import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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

export const reportService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/dashboard`);
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
            const response = await axios.get(`${API_BASE_URL}/reports/costs`, {
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
            const response = await axios.get(`${API_BASE_URL}/reports/utilization`);
            return response.data;
        } catch (error) {
            console.error("Error fetching vehicle utilization:", error);
            return [];
        }
    },

    getDriverPerformance: async (): Promise<any[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers`);
            return response.data;
        } catch (error) {
            console.error("Error fetching driver performance:", error);
            return [];
        }
    },

    getMaintenanceAnalytics: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/maintenance/requests`);
            return response.data;
        } catch (error) {
            console.error("Error fetching maintenance analytics:", error);
            return [];
        }
    },

    getRentalAnalytics: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rentals`);
            return response.data;
        } catch (error) {
            console.error("Error fetching rental analytics:", error);
            return [];
        }
    },

    getVehicles: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/vehicles`);
            return response.data;
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            return [];
        }
    },

    getVehicleTotalCount: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/vehicles/total`);
            return response.data;
        } catch (error) {
            console.error("Error fetching vehicle count:", error);
            return 0;
        }
    },

    getDriverInfractions: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/infractions`);
            return response.data;
        } catch (error) {
            console.error("Error fetching driver infractions:", error);
            return [];
        }
    },

    getDriverCompliance: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/compliance`);
            return response.data;
        } catch (error) {
            console.error("Error fetching driver compliance:", error);
            return [];
        }
    },

    getDriverReadiness: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/readiness`);
            return response.data;
        } catch (error) {
            console.error("Error fetching driver readiness:", error);
            return [];
        }
    },

    getStaffRequests: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/staff/requests`);
            return response.data;
        } catch (error) {
            console.error("Error fetching staff requests:", error);
            return [];
        }
    },

    getDriverLeaves: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/leaves`);
            return response.data;
        } catch (error) {
            console.error("Error fetching driver leaves:", error);
            return [];
        }
    },

    getFuelLogs: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/fuel/logs`);
            return response.data;
        } catch (error) {
            console.error("Error fetching fuel logs:", error);
            return [];
        }
    },

    getTripStats: async (): Promise<TripStats> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/trips/stats`);
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

    getRentals: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rentals`);
            return response.data;
        } catch (error) {
            console.error("Error fetching rentals:", error);
            return [];
        }
    },

    getExportUrl: (type: string, format: 'pdf' | 'excel') => {
        return `${API_BASE_URL}/reports/export/${type}?format=${format}`;
    }
};
