import api from "../api";

export const RENTAL_TRIP_ID_OFFSET = 100000000;

export type FleetTripUsageStatus = "IN_TRIP_USE";

export const tripAvailabilityApi = {
  getActiveVehicleIds: () =>
    api.get<number[]>("/api/trips/active-vehicle-ids").then((res) => res.data),
};

export function rentalTripVehicleId(rentalId: number): number {
  return rentalId + RENTAL_TRIP_ID_OFFSET;
}
