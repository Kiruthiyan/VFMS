import api from "@/lib/api";

export interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    category: string; // "SEDAN", "SUV", "VAN", "TRUCK", "BUS"
    status: string;   // "AVAILABLE", "MAINTENANCE", "ON_TRIP", "RENTED", "INACTIVE"
    fuelType: string;
    fuelLevel: string;
    year: number;
    currentOdometer: number;
    lastServiceDate: string; // ISO date string
}

export const vehicleService = {
    getAll: async () => {
        const response = await api.get<Vehicle[]>("/vehicles");
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Vehicle>(`/vehicles/${id}`);
        return response.data;
    },

    create: async (vehicle: Omit<Vehicle, "id">) => {
        const response = await api.post<Vehicle>("/vehicles", vehicle);
        return response.data;
    },

    update: async (id: number, vehicle: Partial<Vehicle>) => {
        const response = await api.put<Vehicle>(`/vehicles/${id}`, vehicle);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/vehicles/${id}`);
    }
};
