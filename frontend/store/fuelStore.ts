import { create } from 'zustand';

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  fuelQuantity: number;
  cost: number;
  date: string;
  receiptUrl?: string;
}

export interface FuelSummary {
  totalCostThisMonth: number;
  highestFuelConsumingVehicle: string;
  fuelUsageTrend: 'up' | 'down' | 'stable';
}

export interface FuelAnalytics {
  monthlyConsumption: { month: string; consumption: number }[];
  costComparison: { vehicleName: string; cost: number }[];
  averageMileage: number;
  alerts: { vehicleName: string; message: string }[];
}

interface FuelState {
  fuelLogs: FuelLog[];
  summary: FuelSummary | null;
  analytics: FuelAnalytics | null;
  fetchFuelLogs: (filters?: { vehicleId?: string; month?: string }) => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  addFuelLog: (log: Omit<FuelLog, 'id'>) => Promise<void>;
}

export const useFuelStore = create<FuelState>((set) => ({
  fuelLogs: [],
  summary: null,
  analytics: null,
  fetchFuelLogs: async (filters) => {
    const { api } = await import('@/lib/api');
    const { useAuthStore } = await import('@/store/authStore');
    const token = useAuthStore.getState().token;
    const params = new URLSearchParams();
    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters?.month) params.append('month', filters.month);
    const response = await api.get(`/fuel/history?${params.toString()}`, token || undefined);
    set({ fuelLogs: response });
  },
  fetchSummary: async () => {
    const { api } = await import('@/lib/api');
    const { useAuthStore } = await import('@/store/authStore');
    const token = useAuthStore.getState().token;
    const response = await api.get('/fuel/summary', token || undefined);
    set({ summary: response });
  },
  fetchAnalytics: async () => {
    const { api } = await import('@/lib/api');
    const { useAuthStore } = await import('@/store/authStore');
    const token = useAuthStore.getState().token;
    const response = await api.get('/fuel/analytics', token || undefined);
    set({ analytics: response });
  },
  addFuelLog: async (log) => {
    const { api } = await import('@/lib/api');
    const { useAuthStore } = await import('@/store/authStore');
    const token = useAuthStore.getState().token;
    await api.post('/fuel', log, token || undefined);
    // Refresh the list
    const state = useFuelStore.getState();
    await state.fetchFuelLogs();
  },
}));

