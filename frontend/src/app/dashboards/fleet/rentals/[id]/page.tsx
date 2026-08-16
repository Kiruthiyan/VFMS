"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { documentDisplayName, openAuthenticatedDocument } from "@/lib/fleet-documents";
import {
  rentalTripVehicleId,
  tripAvailabilityApi,
} from "@/lib/api/trip-availability";
import { rentalApi, RentalRecord } from "@/lib/api/rental";
import { RentalStatusBadge } from "@/components/rental/RentalStatusBadge";
import { FleetFileDropzone } from "@/components/fleet/FleetFileDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Car,
  Building2,
  Hash,
  Calendar,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function RentalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { canCreate } = useRole();
  const [rental, setRental] = useState<RentalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInTripUse, setIsInTripUse] = useState(false);

  // Dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [closeRentalDialogOpen, setCloseRentalDialogOpen] = useState(false);

  const fetchRental = useCallback(async () => {
    try {
      const [res, tripVehicleIds] = await Promise.all([
        rentalApi.getById(Number(id)),
        tripAvailabilityApi.getActiveVehicleIds().catch((): number[] => []),
      ]);
      setRental(res.data);
      setIsInTripUse(
        res.data.status === "ACTIVE" &&
          tripVehicleIds.includes(rentalTripVehicleId(res.data.id)),
      );
    } catch {
      toast.error("Failed to fetch rental");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRental();
  }, [fetchRental]);

  const handleConfirmReturnClick = () => {
    setReturnDate(new Date().toISOString().split("T")[0]);
    setReturnDialogOpen(true);
  };

  const submitConfirmReturn = async () => {
    if (!returnDate) {
      toast.error("Return date is required");
      return;
    }
    setReturnDialogOpen(false);
    try {
      await rentalApi.confirmReturn(Number(id), returnDate);
      toast.success("Vehicle return confirmed");
      fetchRental();
    } catch {
      toast.error("Failed to confirm return");
    }
  };

  const handleClose = () => {
    setCloseRentalDialogOpen(true);
  };

  const confirmClose = async () => {
    setCloseRentalDialogOpen(false);
    try {
      await rentalApi.close(Number(id));
      toast.success("Rental closed");
      fetchRental();
    } catch {
      toast.error("Failed to close rental");
    }
  };

  const handleUploadAgreement = async (file: File | null) => {
    if (file) {
      try {
        await rentalApi.uploadAgreement(Number(id), file);
        toast.success("Agreement uploaded");
        fetchRental();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleUploadInvoice = async (file: File | null) => {
    if (file) {
      try {
        await rentalApi.uploadInvoice(Number(id), file);
        toast.success("Invoice uploaded");
        fetchRental();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleOpenDocument = async (url: string) => {
    try {
      await openAuthenticatedDocument(url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Rental not found</p>
      </div>
    );
  }

  const rentalDisplayStatus = isInTripUse ? "IN_TRIP_USE" : rental.status;

  return (
    <div className="vfms-detail-page">
      <div className="vfms-detail-container animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboards/fleet/rentals")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to External Rentals
        </Button>

        <Card className="vfms-detail-card">
          <CardHeader className="vfms-form-header px-6 py-5 pl-8">
            <CardTitle className="flex flex-col gap-3 text-white text-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950">
                  <Car className="h-5 w-5" />
                </div>
                Rental #{rental.id} — {rental.plateNumber} (from{" "}
                {rental.vendorName})
              </div>
              <RentalStatusBadge status={rentalDisplayStatus} />
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Info Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-slate-100/50">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
                   <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vendor</p>
                  <p className="font-semibold text-slate-800 text-[15px]">{rental.vendorName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-slate-100/50">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
                   <Car className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle Type</p>
                  <p className="font-semibold text-slate-800 text-[15px]">{rental.vehicleType}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-slate-100/50">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
                   <Hash className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Plate Number</p>
                  <p className="font-semibold text-slate-800 text-[15px]">{rental.plateNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-slate-100/50">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
                   <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                  <p className="font-semibold text-slate-800 text-[15px]">{rental.startDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-slate-100/50">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
                   <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</p>
                  <p className="font-semibold text-slate-800 text-[15px]">{rental.endDate || "Ongoing"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-slate-100/50">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
                   <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vendor's Daily Rate</p>
                  <p className="font-semibold text-slate-800 text-[15px]">
                    Rs.{rental.costPerDay.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/day (as quoted)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Total Cost & Purpose */}
            <div className="grid gap-4 pt-6 border-t border-slate-100 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 transition hover:bg-emerald-50">
                <div className="mt-0.5 rounded-xl border border-emerald-200 bg-white p-2.5 text-emerald-600 shadow-sm">
                   <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cost</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {rental.totalCost ? `Rs.${rental.totalCost.toLocaleString()}` : "Pending"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:bg-slate-100/50">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
                   <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Purpose</p>
                  <p className="text-[14px] text-slate-700 leading-snug">
                    {rental.purpose || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Documents
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FleetFileDropzone
                  title="Rental Agreement"
                  readonly={!canCreate || rental.status !== "ACTIVE"}
                  file={null}
                  existingFileName={
                    rental.agreementUrl
                      ? documentDisplayName(rental.agreementUrl, "View agreement")
                      : undefined
                  }
                  onFileChange={handleUploadAgreement}
                  onOpenExisting={() => handleOpenDocument(rental.agreementUrl!)}
                  emptyLabel="No agreement uploaded"
                  uploadLabel="Upload Agreement"
                />
                <FleetFileDropzone
                  title="Invoice"
                  readonly={
                    !canCreate ||
                    (rental.status !== "RETURNED" && rental.status !== "CLOSED")
                  }
                  file={null}
                  existingFileName={
                    rental.invoiceUrl
                      ? documentDisplayName(rental.invoiceUrl, "View invoice")
                      : undefined
                  }
                  onFileChange={handleUploadInvoice}
                  onOpenExisting={() => handleOpenDocument(rental.invoiceUrl!)}
                  emptyLabel={
                    rental.status === "RETURNED" || rental.status === "CLOSED"
                      ? "No invoice uploaded"
                      : "Available after return"
                  }
                  uploadLabel="Upload Invoice"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
              {canCreate && rental.status === "ACTIVE" && (
                <>
                  <Button
                    onClick={() => router.push(`/dashboards/fleet/rentals/${id}/edit`)}
                    variant="outline"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    onClick={handleConfirmReturnClick}
                    variant="success"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Confirm Return
                  </Button>
                </>
              )}
              {canCreate && rental.status === "RETURNED" && (
                <Button
                  onClick={handleClose}
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" /> Close Rental
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Close Rental Dialog */}
        <Dialog open={closeRentalDialogOpen} onOpenChange={setCloseRentalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Rental</DialogTitle>
            </DialogHeader>
            <div className="py-3">
              <p className="text-sm text-slate-700">
                Close Rental{" "}
                <span className="font-semibold">#{rental.id}</span> ({rental.plateNumber}) permanently?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Closing this rental will finalise all records. Make sure the invoice has been uploaded before closing.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCloseRentalDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmClose}>
                Close Rental
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Return Dialog */}
        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Vehicle Return</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Return Date
              </label>
              <Input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={submitConfirmReturn}>
                Confirm Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
