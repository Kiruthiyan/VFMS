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
import {
  Loader2,
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Car,
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

  const handleConfirmReturn = async () => {
    const date = prompt(
      "Enter return date (YYYY-MM-DD):",
      new Date().toISOString().split("T")[0],
    );
    if (date) {
      try {
        await rentalApi.confirmReturn(Number(id), date);
        toast.success("Vehicle return confirmed");
        fetchRental();
      } catch {
        toast.error("Failed to confirm return");
      }
    }
  };

  const handleClose = async () => {
    if (confirm("Close this rental permanently?")) {
      try {
        await rentalApi.close(Number(id));
        toast.success("Rental closed");
        fetchRental();
      } catch {
        toast.error("Failed to close rental");
      }
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
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Vendor
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {rental.vendorName}
                </p>
              </div>
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Vehicle Type
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {rental.vehicleType}
                </p>
              </div>
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Plate Number
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {rental.plateNumber}
                </p>
              </div>
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Start Date
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {rental.startDate}
                </p>
              </div>
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  End Date
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {rental.endDate || "Ongoing"}
                </p>
              </div>
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Vendor&apos;s Daily Rate
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Rs.{rental.costPerDay.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal">
                    {" "}
                    /day (as quoted)
                  </span>
                </p>
              </div>
            </div>

            {/* Total Cost & Purpose */}
            <div className="grid gap-4 pt-6 border-t border-slate-200 md:grid-cols-2">
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Total Cost
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {rental.totalCost
                    ? `Rs.${rental.totalCost.toLocaleString()}`
                    : "Pending"}
                </p>
              </div>
              <div className="vfms-detail-tile">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Purpose
                </p>
                <p className="text-sm text-slate-700">
                  {rental.purpose || "Not specified"}
                </p>
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
                  readonly={Boolean(rental.agreementUrl) || !canCreate || rental.status !== "ACTIVE"}
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
                    Boolean(rental.invoiceUrl) ||
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
                    className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    onClick={handleConfirmReturn}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Confirm Return
                  </Button>
                </>
              )}
              {canCreate && rental.status === "RETURNED" && (
                <Button
                  onClick={handleClose}
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Close Rental
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
