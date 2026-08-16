"use client";

import { use, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { documentDisplayName, openAuthenticatedDocument } from "@/lib/fleet-documents";
import { MaintenanceRequest, maintenanceApi } from "@/lib/api/maintenance";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { FleetFileDropzone } from "@/components/fleet/FleetFileDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Wrench,
  ArrowLeft,
  Car,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Loader2,
  CheckCircle,
  Edit,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

type MaintenanceConfirmAction = "submit" | "approve" | "closeRejected";

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

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeCost, setCloseCost] = useState("");
  const [confirmAction, setConfirmAction] =
    useState<MaintenanceConfirmAction | null>(null);

  const fetchRequest = useCallback(async () => {
    try {
      const res = await maintenanceApi.getById(Number(id));
      setRequest(res.data);
    } catch {
      toast.error("Failed to load request");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleSubmit = () => {
    setConfirmAction("submit");
  };

  const handleApprove = () => {
    setConfirmAction("approve");
  };

  const handleReject = () => {
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    setRejectDialogOpen(false);
    try {
      await maintenanceApi.reject(Number(id), rejectReason);
      toast.success("Request rejected");
      fetchRequest();
    } catch {
      toast.error("Failed to reject");
    }
  };

  const handleClose = async () => {
    if (!request) return;

    if (request.status === "REJECTED") {
      setConfirmAction("closeRejected");
    } else {
      // Approved = maintenance was done, ask for actual cost (optional)
      setCloseCost("");
      setCloseDialogOpen(true);
    }
  };

  const confirmSimpleAction = async () => {
    if (!confirmAction) return;

    const action = confirmAction;
    setConfirmAction(null);

    try {
      if (action === "submit") {
        await maintenanceApi.submit(Number(id));
        toast.success("Request submitted");
      }
      if (action === "approve") {
        await maintenanceApi.approve(Number(id));
        toast.success("Request approved");
      }
      if (action === "closeRejected") {
        await maintenanceApi.close(Number(id), 0);
        toast.success("Request closed");
      }
      fetchRequest();
    } catch {
      if (action === "submit") toast.error("Failed to submit");
      if (action === "approve") toast.error("Failed to approve");
      if (action === "closeRejected") toast.error("Failed to close");
    }
  };

  const confirmClose = async () => {
    const cost = closeCost ? Number(closeCost) : 0;
    setCloseDialogOpen(false);
    try {
      await maintenanceApi.close(Number(id), cost);
      toast.success("Request closed successfully");
      fetchRequest();
    } catch {
      toast.error("Failed to close request");
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
      await openAuthenticatedDocument(url, "maintenance");
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

  const confirmationDetails: Record<
    MaintenanceConfirmAction,
    {
      title: string;
      description: string;
      confirmLabel: string;
      variant?: "default" | "success" | "destructive" | "outline";
    }
  > = {
    submit: {
      title: "Submit maintenance request?",
      description:
        "This request will move to approver review. You will not be able to edit it while it is submitted.",
      confirmLabel: "Submit Request",
    },
    approve: {
      title: "Approve maintenance request?",
      description:
        "This will authorize the maintenance work for the selected vehicle.",
      confirmLabel: "Approve Request",
      variant: "success",
    },
    closeRejected: {
      title: "Acknowledge and close request?",
      description:
        "This rejected request will be closed with no maintenance cost recorded.",
      confirmLabel: "Close Request",
      variant: "destructive",
    },
  };
  const activeConfirmation = confirmAction
    ? confirmationDetails[confirmAction]
    : null;

  return (
    <div className="vfms-detail-page">
      <div className="vfms-detail-container animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
        </Button>

        <Card className="vfms-detail-card mb-6">
          <CardHeader className="vfms-form-header px-6 py-5 pl-8">
            <CardTitle className="flex flex-col gap-3 text-white text-lg sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="min-w-0 flex-1 truncate">
                Maintenance Request #{request.id}
              </span>
              <div className="sm:ml-auto">
                <MaintenanceStatusBadge status={request.status} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="vfms-detail-tile">
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
              <div className="vfms-detail-tile">
                <Wrench className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="font-semibold text-slate-900">
                    {request.maintenanceType.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="vfms-detail-tile md:col-span-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Description</p>
                  <p className="font-semibold text-slate-900">
                    {request.description}
                  </p>
                </div>
              </div>
              <div className="vfms-detail-tile">
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
              <div className="vfms-detail-tile">
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
              <div className="vfms-detail-tile">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Requested Date</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(request.requestedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="vfms-detail-tile">
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
                <div className="flex items-center gap-3 rounded-xl bg-red-50/80 p-4 shadow-sm ring-1 ring-red-100 md:col-span-2">
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
            </div>            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200 flex-wrap">
              {canCreate && request.status === "NEW" && (
                <>
                  <Button
                    onClick={handleSubmit}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Submit for Approval
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboards/fleet/maintenance/${request.id}/edit`)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </>
              )}
              {canApprove && request.status === "SUBMITTED" && (
                <>
                  <Button
                    variant="success"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              {canCreate && request.status === "APPROVED" && (
                <Button
                  variant="destructive"
                  onClick={handleClose}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Close Request
                </Button>
              )}
              {canCreate && request.status === "REJECTED" && (
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Acknowledge & Close
                </Button>
              )}
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Reason for Rejection
              </label>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmReject}
              >
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Maintenance Request</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Actual Maintenance Cost (Rs.)
              </label>
              <Input
                type="number"
                placeholder="e.g. 3000"
                value={closeCost}
                onChange={(e) => setCloseCost(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">
                Leave blank or enter 0 if cost is not yet known.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmClose}>
                Confirm Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(activeConfirmation)}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
        >
          <DialogContent>
            {activeConfirmation && (
              <>
                <DialogHeader>
                  <DialogTitle>{activeConfirmation.title}</DialogTitle>
                  <DialogDescription>
                    {activeConfirmation.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">
                    Maintenance Request #{request.id}
                  </span>{" "}
                  for {request.vehicleBrandModel}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant={activeConfirmation.variant ?? "default"}
                    onClick={confirmSimpleAction}
                  >
                    {activeConfirmation.confirmLabel}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
