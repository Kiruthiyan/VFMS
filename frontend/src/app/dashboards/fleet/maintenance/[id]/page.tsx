"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { documentDisplayName, openAuthenticatedDocument } from "@/lib/fleet-documents";
import { MaintenanceRequest, maintenanceApi } from "@/lib/api/maintenance";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { FleetFileDropzone } from "@/components/fleet/FleetFileDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  ArrowLeft,
  Car,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { canCreate, canApprove } = useRole();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequest = async () => {
    try {
      const res = await maintenanceApi.getById(Number(id));
      setRequest(res.data);
    } catch {
      toast.error("Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleSubmit = async () => {
    if (confirm("Submit this request for approval?")) {
      try {
        await maintenanceApi.submit(Number(id));
        toast.success("Request submitted");
        fetchRequest();
      } catch {
        toast.error("Failed to submit");
      }
    }
  };

  const handleApprove = async () => {
    if (confirm("Approve this request?")) {
      try {
        await maintenanceApi.approve(Number(id));
        toast.success("Request approved");
        fetchRequest();
      } catch {
        toast.error("Failed to approve");
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await maintenanceApi.reject(Number(id), reason);
        toast.success("Request rejected");
        fetchRequest();
      } catch {
        toast.error("Failed to reject");
      }
    }
  };

  const handleClose = async () => {
    if (!request) return;

    if (request.status === "REJECTED") {
      // Rejected = no work done, no cost needed
      if (!confirm("Acknowledge and close this rejected request?")) return;
      try {
        await maintenanceApi.close(Number(id), 0);
        toast.success("Request closed");
        fetchRequest();
      } catch {
        toast.error("Failed to close");
      }
    } else {
      // Approved = maintenance was done, ask for actual cost (optional)
      const costInput = prompt(
        "Enter actual maintenance cost (Rs.):\n\nLeave blank or enter 0 if cost is not yet known.",
      );
      const cost = costInput ? Number(costInput) : 0;
      if (
        !confirm(
          `Close this request with actual cost: Rs.${cost.toLocaleString()}?`,
        )
      )
        return;
      try {
        await maintenanceApi.close(Number(id), cost);
        toast.success("Request closed successfully");
        fetchRequest();
      } catch {
        toast.error("Failed to close request");
      }
    }
  };

  const handleUploadQuotation = async (file: File | null) => {
    if (file) {
      try {
        await maintenanceApi.uploadQuotation(Number(id), file);
        toast.success("Quotation uploaded");
        fetchRequest();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleUploadInvoice = async (file: File | null) => {
    if (file) {
      try {
        await maintenanceApi.uploadInvoice(Number(id), file);
        toast.success("Invoice uploaded");
        fetchRequest();
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

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Request not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
        </Button>

        <Card className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden mb-6">
          <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Wrench className="h-5 w-5" />
              </div>
              Maintenance Request #{request.id}
              <div className="ml-auto">
                <MaintenanceStatusBadge status={request.status} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <Car className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Vehicle</p>
                  <p className="font-semibold text-slate-900">
                    {request.vehicleBrandModel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {request.vehiclePlateNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <Wrench className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="font-semibold text-slate-900">
                    {request.maintenanceType.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm col-span-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Description</p>
                  <p className="font-semibold text-slate-900">
                    {request.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Estimated Cost</p>
                  <p className="font-semibold text-slate-900">
                    {request.estimatedCost
                      ? `Rs. ${request.estimatedCost.toLocaleString()}`
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-slate-500">Actual Cost</p>
                  <p className="font-semibold text-slate-900">
                    {request.actualCost
                      ? `Rs. ${request.actualCost.toLocaleString()}`
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Requested Date</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(request.requestedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Downtime</p>
                  <p className="font-semibold text-slate-900">
                    {request.downtimeHours != null
                      ? request.downtimeHours === 0
                        ? "Less than 1 hour"
                        : request.downtimeHours >= 24
                          ? `${Math.floor(request.downtimeHours / 24)}d ${request.downtimeHours % 24}h`
                          : `${request.downtimeHours} hours`
                      : request.status === "CLOSED"
                        ? "Not recorded"
                        : "In progress"}
                  </p>
                </div>
              </div>
              {request.rejectionReason && (
                <div className="flex items-center gap-3 p-4 bg-red-50/80 rounded-xl ring-1 ring-red-100 shadow-sm col-span-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-xs text-red-500">Rejection Reason</p>
                    <p className="font-semibold text-red-900">
                      {request.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Documents
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FleetFileDropzone
                  title="Quotation"
                  readonly={Boolean(request.quotationUrl) || !canCreate || request.status !== "NEW"}
                  file={null}
                  existingFileName={
                    request.quotationUrl
                      ? documentDisplayName(request.quotationUrl, "View quotation")
                      : undefined
                  }
                  onFileChange={handleUploadQuotation}
                  onOpenExisting={() => handleOpenDocument(request.quotationUrl!)}
                  emptyLabel="No quotation uploaded"
                  uploadLabel="Upload Quotation"
                />
                <FleetFileDropzone
                  title="Invoice"
                  readonly={
                    Boolean(request.invoiceUrl) ||
                    !canCreate ||
                    request.status === "NEW" ||
                    request.status === "SUBMITTED" ||
                    request.status === "REJECTED"
                  }
                  file={null}
                  existingFileName={
                    request.invoiceUrl
                      ? documentDisplayName(request.invoiceUrl, "View invoice")
                      : undefined
                  }
                  onFileChange={handleUploadInvoice}
                  onOpenExisting={() => handleOpenDocument(request.invoiceUrl!)}
                  emptyLabel={
                    request.status === "APPROVED" || request.status === "CLOSED"
                      ? "No invoice uploaded"
                      : "Available after approval"
                  }
                  uploadLabel="Upload Invoice"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200 flex-wrap">
              {canCreate && request.status === "NEW" && (
                <>
                  <Button
                    className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                    onClick={handleSubmit}
                  >
                    Submit for Approval
                  </Button>
                  <Button
                    className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboards/fleet/maintenance/${request.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                </>
              )}
              {canApprove && request.status === "SUBMITTED" && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                    onClick={handleApprove}
                  >
                    Approve
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                </>
              )}
              {canCreate && request.status === "APPROVED" && (
                <Button
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  onClick={handleClose}
                >
                  Close Request
                </Button>
              )}
              {canCreate && request.status === "REJECTED" && (
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  onClick={handleClose}
                >
                  Acknowledge &amp; Close
                </Button>
              )}
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
