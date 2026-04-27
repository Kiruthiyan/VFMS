import { create } from 'zustand';

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    status: string;
}

interface VehicleState {
    vehicles: Vehicle[];
    setVehicles: (vehicles: Vehicle[]) => void;
}

export const useVehicleStore = create<VehicleState>((set) => ({
    vehicles: [],
    setVehicles: (vehicles) => set({ vehicles }),
}));
