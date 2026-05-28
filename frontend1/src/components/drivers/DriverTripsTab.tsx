'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { TripRequest, TripStatus } from '@/types';

type DriverTripsTabProps = {
  driverId: string;
};

const TRIP_STATUSES: TripStatus[] = ['SCHEDULED', 'DRIVER_CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusColors: Record<TripStatus, { bg: string; text: string; border: string }> = {
  SCHEDULED: { bg: 'hsl(218 100% 97%)', text: 'hsl(221 83% 53%)', border: 'hsl(221 83% 74%)' },
  DRIVER_CONFIRMED: { bg: 'hsl(260 100% 97%)', text: 'hsl(263 83% 53%)', border: 'hsl(263 83% 74%)' },
  IN_PROGRESS: { bg: 'hsl(47 100% 97%)', text: 'hsl(38 92% 50%)', border: 'hsl(38 92% 72%)' },
  COMPLETED: { bg: 'hsl(142 76% 94%)', text: 'hsl(142 71% 45%)', border: 'hsl(142 71% 70%)' },
  CANCELLED: { bg: 'hsl(0 84% 97%)', text: 'hsl(0 84% 60%)', border: 'hsl(0 84% 74%)' },
};

export function DriverTripsTab({ driverId }: DriverTripsTabProps) {
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await apiFetch<TripRequest[]>(`/api/trips/driver/${driverId}`);
      setTrips(allTrips);
      setFilteredTrips(allTrips);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load trips');
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
    return new Date(dateTime).toLocaleString();
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadgeStyle = (status: TripStatus) => {
    const colors = statusColors[status];
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      borderColor: colors.border,
    };
  };

  const activeTrips = trips.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED' || t.status === 'DRIVER_CONFIRMED');
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
  const cancelledTrips = trips.filter((t) => t.status === 'CANCELLED');

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-2xl font-bold">{trips.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-2xl font-bold" style={{ color: 'hsl(38 92% 50%)' }}>
              {activeTrips.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Active Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-2xl font-bold" style={{ color: 'hsl(142 71% 45%)' }}>
              {completedTrips.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-2xl font-bold" style={{ color: 'hsl(0 84% 60%)' }}>
              {cancelledTrips.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Filter by Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-sm w-full md:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {TRIP_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Trips List */}
      <Card>
        <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
          <CardTitle className="text-sm font-semibold">
            {filterStatus === 'ALL' ? 'All Trips' : `${filterStatus.replace(/_/g, ' ')} Trips`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading trips...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No trips found</div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredTrips.map((trip) => {
                const status = trip.status as TripStatus;
                const statusColors = getStatusBadgeStyle(status);
                return (
                  <div key={trip.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Route Info */}
                        {(trip.origin || trip.destination) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>
                              {trip.origin || 'Unknown'} → {trip.destination || 'Unknown'}
                            </span>
                          </div>
                        )}

                        {/* Departure Time */}
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3.5 w-3.5" style={{ color: 'hsl(var(--primary))' }} />
                          <span>
                            <span className="font-medium">Departure:</span> {formatDateTime(trip.departureTime)}
                          </span>
                        </div>

                        {/* Completion Time */}
                        {trip.completionTime && (
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5" style={{ color: 'hsl(var(--success))' }} />
                            <span>
                              <span className="font-medium">Completed:</span> {formatDateTime(trip.completionTime)}
                            </span>
                          </div>
                        )}

                        {/* Notes */}
                        {trip.notes && (
                          <div className="text-xs text-muted-foreground mt-2 italic">
                            <span className="font-medium">Notes:</span> {trip.notes}
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                          style={statusColors}
                        >
                          <Truck className="h-3 w-3" />
                          {status.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          #{trip.id}
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
