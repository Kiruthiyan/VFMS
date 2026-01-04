import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { FuelLog } from '@/store/fuelStore';

export const fuelApi = {
  addFuelLog: async (data: FormData) => {
    const token = useAuthStore.getState().token;
    return api.postFormData('/fuel', data, token || undefined);
  },
  getFuelHistory: async (filters?: { vehicleId?: string; month?: string }) => {
    const token = useAuthStore.getState().token;
    const params = new URLSearchParams();
    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters?.month) params.append('month', filters.month);
    return api.get(`/fuel/history?${params.toString()}`, token || undefined);
  },
  getFuelSummary: async () => {
    const token = useAuthStore.getState().token;
    return api.get('/fuel/summary', token || undefined);
  },
  getFuelAnalytics: async () => {
    const token = useAuthStore.getState().token;
    return api.get('/fuel/analytics', token || undefined);
  },
};

