"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { rentalApi, RentalRecord } from "@/lib/api/rental";
import { RentalStatusBadge } from "@/components/rental/RentalStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Edit, CheckCircle, XCircle, Upload, ExternalLink, Car } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function RentalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { canCreate } = useRole();
  const [rental, setRental] = useState<RentalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRental();
  }, [id]);

  const fetchRental = async () => {
    try {
      const res = await rentalApi.getById(Number(id));
      setRental(res.data);
    } catch {
      toast.error("Failed to fetch rental");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    const date = prompt("Enter return date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (date) {
      try {
        await rentalApi.confirmReturn(Number(id), date);
        toast.success("Vehicle return confirmed");
        fetchRental();
      } catch { toast.error("Failed to confirm return"); }
    }
  };

  const handleClose = async () => {
    if (confirm("Close this rental permanently?")) {
      try {
        await rentalApi.close(Number(id));
        toast.success("Rental closed");
        fetchRental();
      } catch { toast.error("Failed to close rental"); }
    }
  };

  const handleUploadAgreement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await rentalApi.uploadAgreement(Number(id), file);
        toast.success("Agreement uploaded");
        fetchRental();
      } catch { toast.error("Failed to upload agreement"); }
    }
    e.target.value = "";
  };

  const handleUploadInvoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await rentalApi.uploadInvoice(Number(id), file);
        toast.success("Invoice uploaded");
        fetchRental();
      } catch { toast.error("Failed to upload invoice"); }
    }
    e.target.value = "";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
        <Button variant="ghost" onClick={() => router.push("/dashboard/rentals")} className="mb-4 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to External Rentals
        </Button>

        <Card className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white text-lg">
                <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                  <Car className="h-5 w-5" />
                </div>
                Rental #{rental.id} — {rental.plateNumber} (from {rental.vendorName})
              </div>
              <RentalStatusBadge status={rental.status} />
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Vendor</p>
                <p className="text-sm font-semibold text-slate-900">{rental.vendorName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Vehicle Type</p>
                <p className="text-sm font-semibold text-slate-900">{rental.vehicleType}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Plate Number</p>
                <p className="text-sm font-semibold text-slate-900">{rental.plateNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Start Date</p>
                <p className="text-sm font-semibold text-slate-900">{rental.startDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">End Date</p>
                <p className="text-sm font-semibold text-slate-900">{rental.endDate || "Ongoing"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Vendor's Daily Rate</p>
                <p className="text-sm font-semibold text-slate-900">Rs.{rental.costPerDay.toLocaleString()}<span className="text-xs text-slate-400 font-normal"> /day (as quoted)</span></p>
              </div>
            </div>

            {/* Total Cost & Purpose */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Cost</p>
                <p className="text-lg font-bold text-emerald-600">
                  {rental.totalCost ? `Rs.${rental.totalCost.toLocaleString()}` : "Pending"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Purpose</p>
                <p className="text-sm text-slate-700">{rental.purpose || "Not specified"}</p>
              </div>
            </div>

            {/* Documents Section */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 mb-2">Rental Agreement</p>
                  {rental.agreementUrl ? (
                    <a href={`http://localhost:8080${rental.agreementUrl}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      <ExternalLink className="h-4 w-4" /> View Agreement
                    </a>
                  ) : (
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      <Upload className="h-3 w-3" /> Upload Agreement
                      <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleUploadAgreement} />
                    </label>
                  )}
                </div>
                <div className="p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 mb-2">Invoice</p>
                  {rental.invoiceUrl ? (
                    <a href={`http://localhost:8080${rental.invoiceUrl}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      <ExternalLink className="h-4 w-4" /> View Invoice
                    </a>
                  ) : (
                    (rental.status === "RETURNED" || rental.status === "CLOSED") ? (
                      <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                        <Upload className="h-3 w-3" /> Upload Invoice
                        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleUploadInvoice} />
                      </label>
                    ) : (
                      <span className="text-xs text-slate-400">Available after return</span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
              {canCreate && rental.status === "ACTIVE" && (
                <>
                  <Button onClick={() => router.push(`/dashboard/rentals/${id}/edit`)}
                    variant="outline" className="text-slate-700">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button onClick={handleConfirmReturn}
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
                    <CheckCircle className="h-4 w-4 mr-2" /> Confirm Return
                  </Button>
                </>
              )}
              {canCreate && rental.status === "RETURNED" && (
                <Button onClick={handleClose}
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
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
