'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Car, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from '@/lib/api';
import { useRole } from '@/lib/role-context';
import { queryKeys } from '@/lib/query-keys';

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

const statusStyles: Record<string, string> = {
  NEW: "bg-slate-50 text-slate-700 border-slate-200",
  SUBMITTED: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRIVER_CONFIRMED: "bg-teal-50 text-teal-700 border-teal-200",
  DRIVER_REJECTED: "bg-orange-50 text-orange-700 border-orange-200",
  START_PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  ONGOING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-300",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-300",
  EXPIRED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_FILTERS = [
  "ALL", "NEW", "SUBMITTED", "APPROVED", "DRIVER_CONFIRMED", "DRIVER_REJECTED",
  "START_PENDING", "ONGOING", "COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"
];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit"
  });

export default function DriverTripsPage() {
  const router = useRouter();
  const { currentUser } = useRole();
  const queryClient = useQueryClient();
  const [rejectingTripId, setRejectingTripId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const {
    data: trips = [],
    error,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.trips("DRIVER", currentUser.id),
    enabled: !!currentUser?.id && currentUser.id !== "anonymous",
    queryFn: async (): Promise<Trip[]> => {
      const res = await api.get(`/trips/driver/${currentUser.id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (error) console.error("Failed to fetch driver trips", error);
  }, [error]);

  const handleConfirm = async (tripId: string) => {
    try {
      setActionLoading(tripId);
      await api.patch(`/trips/${tripId}/driver-accept`);
      toast.success("Trip confirmed successfully!");
      await queryClient.invalidateQueries({ queryKey: queryKeys.trips("DRIVER", currentUser.id) });
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm trip.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingTripId || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    
    try {
      setActionLoading(rejectingTripId);
      await api.patch(`/trips/${rejectingTripId}/driver-reject`, {
        notes: rejectReason,
      });
      toast.success("Trip rejected.");
      setRejectingTripId(null);
      setRejectReason("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.trips("DRIVER", currentUser.id) });
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject trip.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTrips = activeFilter === "ALL" ? trips : trips.filter(t => t.status === activeFilter);

  return (
    <div className="space-y-6">
      <PageHeader title="My Trips" description="View your assigned trip history" icon={MapPin} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === filter
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {filter.replace(/_/g, " ")}
            {filter !== "ALL" && (
              <span className="ml-1.5 opacity-70">({trips.filter(t => t.status === filter).length})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : filteredTrips.length === 0 ? (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',color:'hsl(var(--muted-foreground))' }}>
          <div style={{ width:'4rem',height:'4rem',borderRadius:'1rem',background:'hsl(var(--muted))',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem' }}>
            <MapPin style={{ width:'2rem',height:'2rem',opacity:0.4 }}/>
          </div>
          <h2 style={{ fontSize:'1rem',fontWeight:600,color:'hsl(var(--foreground))',margin:'0 0 0.375rem' }}>No Trips Assigned</h2>
          <p style={{ fontSize:'0.875rem',maxWidth:'22rem',margin:0,lineHeight:1.6 }}>
            You do not have any assigned trips at the moment.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="h-1 bg-amber-400" />

              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <Badge variant="outline" className={`font-bold px-3.5 py-1.5 rounded-full text-[10px] tracking-wider uppercase border ${statusStyles[trip.status] || ""}`}>
                    {trip.status}
                  </Badge>
                  <div className="rounded-xl bg-slate-950 p-2.5 text-amber-400 shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mb-6 line-clamp-2 text-xl font-bold leading-tight text-slate-950">
                  {trip.destination}
                </h3>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500">
                       <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                      <p className="font-semibold text-slate-800 text-[15px]">{formatDate(trip.departureTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500">
                       <ArrowRight className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return</p>
                      <p className="font-semibold text-slate-800 text-[15px]">{formatDate(trip.returnTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500">
                       <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passengers</p>
                      <p className="font-semibold text-slate-800 text-[15px]">{trip.passengerCount} {trip.passengerCount === 1 ? 'Person' : 'Persons'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500">
                       <Car className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                      <p className="font-semibold text-slate-800 text-[15px]">
                        {trip.assignedVehicleId ? `#${trip.assignedVehicleId}` : <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md">Pending</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions & View details */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                  {trip.status === 'APPROVED' ? (
                    <>
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-slate-950 text-white hover:bg-slate-800"
                          onClick={() => handleConfirm(trip.id)}
                          disabled={actionLoading === trip.id}
                        >
                          {actionLoading === trip.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                          Confirm
                        </Button>
                        <Dialog open={rejectingTripId === trip.id} onOpenChange={(open) => {
                          if (!open) {
                            setRejectingTripId(null);
                            setRejectReason("");
                          } else {
                            setRejectingTripId(trip.id);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl">
                            <DialogHeader className="vfms-form-header px-6 py-5 pl-8">
                              <DialogTitle className="text-white">Reject Trip</DialogTitle>
                              <DialogDescription className="text-slate-300">
                                Please provide a reason for rejecting this trip.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="px-6 py-6">
                              <Label htmlFor="reason" className="mb-2 block text-sm font-semibold text-slate-700">Reason</Label>
                              <Textarea 
                                id="reason"
                                placeholder="Type your reason here..." 
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                className="rounded-lg border-slate-300 text-sm shadow-sm focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                              />
                            </div>
                            <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                              <Button variant="outline" onClick={() => {
                                setRejectingTripId(null);
                                setRejectReason("");
                              }}>Cancel</Button>
                              <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || actionLoading === rejectingTripId}>
                                {actionLoading === rejectingTripId && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Submit Rejection
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Button
                        variant="link"
                        className="w-full text-center text-xs font-semibold text-slate-700 hover:text-slate-950"
                        onClick={() => router.push(`/trips/${trip.id}`)}
                      >
                        View Full Route & Details →
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                    >
                      View Route & Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
