'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Truck, ArrowRight, Users, Car } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';

interface Trip {
  id: string;
  purpose: string;
  destination: string;
  departureTime: string;
  returnTime: string;
  status: string;
  passengerCount: number;
  assignedVehicleId: string | null;
}

const TRIP_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DRIVER_CONFIRMED', label: 'Confirmed' },
  { value: 'DRIVER_REJECTED', label: 'Rejected (Driver)' },
  { value: 'START_PENDING', label: 'Start Pending' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
] as const;

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  NEW: { bg: 'hsl(210 40% 96%)', text: 'hsl(215 25% 27%)', border: 'hsl(214 32% 91%)' },
  SUBMITTED: { bg: 'hsl(35 100% 97%)', text: 'hsl(31 92% 34%)', border: 'hsl(36 95% 85%)' },
  APPROVED: { bg: 'hsl(142 76% 94%)', text: 'hsl(142 71% 45%)', border: 'hsl(142 71% 70%)' },
  DRIVER_CONFIRMED: { bg: 'hsl(142 76% 94%)', text: 'hsl(142 71% 32%)', border: 'hsl(142 71% 70%)' },
  DRIVER_REJECTED: { bg: 'hsl(25 100% 95%)', text: 'hsl(25 100% 45%)', border: 'hsl(25 100% 80%)' },
  START_PENDING: { bg: 'hsl(48 96% 95%)', text: 'hsl(38 92% 35%)', border: 'hsl(48 96% 78%)' },
  ONGOING: { bg: 'hsl(45 96% 95%)', text: 'hsl(35 92% 32%)', border: 'hsl(45 96% 78%)' },
  COMPLETED: { bg: 'hsl(210 40% 96%)', text: 'hsl(215 25% 27%)', border: 'hsl(214 32% 84%)' },
  REJECTED: { bg: 'hsl(0 84% 97%)', text: 'hsl(0 84% 60%)', border: 'hsl(0 84% 74%)' },
  CANCELLED: { bg: 'hsl(0 0% 96%)', text: 'hsl(0 0% 40%)', border: 'hsl(0 0% 85%)' },
  EXPIRED: { bg: 'hsl(0 84% 97%)', text: 'hsl(0 84% 60%)', border: 'hsl(0 84% 74%)' },
};

type DriverTripsTabProps = {
  driverId: string;
};

export function DriverTripsTab({ driverId }: DriverTripsTabProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await apiFetch<Trip[]>(`/api/trips/driver/${driverId}`);
      setTrips(allTrips);
      setFilteredTrips(allTrips);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTrips();
  }, [driverId]);

  useEffect(() => {
    if (filterStatus && filterStatus !== 'ALL') {
      setFilteredTrips(trips.filter((t) => t.status === filterStatus));
    } else {
      setFilteredTrips(trips);
    }
  }, [filterStatus, trips]);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    const colors = statusColors[status] || statusColors.NEW;
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      borderColor: colors.border,
    };
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Filter Trips</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-sm w-full md:w-48">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {TRIP_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Trips List */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="vfms-card-header px-4 py-3 pl-8">
          <CardTitle className="text-sm font-semibold text-white">
            {TRIP_FILTERS.find((filter) => filter.value === filterStatus)?.label ?? 'All'} Trips
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {loading ? (
            <div className="m-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-muted-foreground">Loading trips...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="m-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-muted-foreground">No trips found</div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredTrips.map((trip) => {
                const statusColors = getStatusBadgeStyle(trip.status);
                return (
                  <div key={trip.id} className="p-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Destination */}
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                          {trip.destination}
                        </div>
                        
                        {/* Purpose */}
                        <p className="text-xs text-muted-foreground ml-6">
                          {trip.purpose}
                        </p>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs mt-2 ml-6 text-slate-600">
                          {/* Departure to Return */}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700">{formatDateTime(trip.departureTime)}</span>
                            <ArrowRight className="h-3 w-3 text-slate-300" />
                            <span className="font-medium text-slate-700">{formatDateTime(trip.returnTime)}</span>
                          </div>
                          
                          {/* Passengers */}
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span><strong className="text-slate-700">{trip.passengerCount}</strong> pax</span>
                          </div>

                          {/* Assigned Vehicle */}
                          <div className="flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {trip.assignedVehicleId ? `Vehicle #${trip.assignedVehicleId}` : 'No vehicle assigned'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border"
                          style={statusColors}
                        >
                          <Truck className="h-3 w-3" />
                          {trip.status.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                          {trip.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
