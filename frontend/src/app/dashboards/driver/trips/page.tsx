'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Car, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
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
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  ONGOING: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-300",
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit"
  });

export default function DriverTripsPage() {
  const router = useRouter();
  const { currentUser } = useRole();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingTripId, setRejectingTripId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id && currentUser.id !== "anonymous") {
      fetchTrips();
    }
  }, [currentUser]);

  const fetchTrips = async () => {
    try {
      const res = await api.get(`/trips/driver/${currentUser.id}`);
      setTrips(res.data);
    } catch (err) {
      console.error("Failed to fetch driver trips", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (tripId: string) => {
    try {
      setActionLoading(tripId);
      await api.patch(`/trips/${tripId}/driver-accept`);
      toast.success("Trip confirmed successfully!");
      fetchTrips();
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
      fetchTrips();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject trip.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardShell title="My Trips" description="View your assigned trip history">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : trips.length === 0 ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {trips.map(trip => (
            <div key={trip.id} className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-blue-300/50 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <Badge variant="outline" className={`font-bold px-3.5 py-1.5 rounded-full text-[10px] tracking-wider uppercase border ${statusStyles[trip.status] || ""}`}>
                    {trip.status}
                  </Badge>
                  <div className="p-2.5 bg-blue-50/80 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
                
                <h3 className="text-xl font-extrabold text-slate-900 mb-7 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                  {trip.destination}
                </h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-6 text-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 bg-slate-50/80 rounded-xl text-slate-400 border border-slate-100 group-hover:border-blue-100 transition-colors">
                       <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                      <p className="font-semibold text-slate-800 text-[15px]">{formatDate(trip.departureTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 bg-slate-50/80 rounded-xl text-slate-400 border border-slate-100 group-hover:border-blue-100 transition-colors">
                       <ArrowRight className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return</p>
                      <p className="font-semibold text-slate-800 text-[15px]">{formatDate(trip.returnTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 bg-slate-50/80 rounded-xl text-slate-400 border border-slate-100 group-hover:border-blue-100 transition-colors">
                       <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passengers</p>
                      <p className="font-semibold text-slate-800 text-[15px]">{trip.passengerCount} {trip.passengerCount === 1 ? 'Person' : 'Persons'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 bg-slate-50/80 rounded-xl text-slate-400 border border-slate-100 group-hover:border-blue-100 transition-colors">
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
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
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
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Trip</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this trip.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label htmlFor="reason" className="sr-only">Reason</Label>
                              <Textarea 
                                id="reason"
                                placeholder="Type your reason here..." 
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <DialogFooter>
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
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold text-center w-full"
                        onClick={() => router.push(`/trips/${trip.id}`)}
                      >
                        View Full Route & Details →
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold"
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
    </DashboardShell>
  );
}
