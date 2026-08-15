"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Droplets,
  FileText,
  Fuel,
  Gauge,
  Pencil,
  MapPin,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getErrorMessage,
  getFuelReceiptAccessUrlApi,
  getFuelRecordByIdApi,
  type FuelRecord,
} from "@/lib/api/fuel";
import { formatEfficiency, formatLKR } from "@/lib/fuel-utils";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-6 border-b border-slate-100 py-3.5 last:border-b-0 last:pb-0 first:pt-0",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="min-w-0 break-words text-right text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "vfms-detail-card overflow-hidden",
        className
      )}
    >
      <CardHeader className="vfms-card-header px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </p>
        <CardTitle className="text-xl font-bold text-slate-950">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm font-medium text-slate-500">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

export default function AdminFuelDetailPage() {
  const params = useParams();
  const [record, setRecord] = useState<FuelRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setError(null);

      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) {
          setError("Invalid fuel record ID");
          setLoading(false);
          return;
        }

        const fetchedRecord = await getFuelRecordByIdApi(id);
        setRecord(fetchedRecord);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [params.id]);

  const statusBadge = useMemo(() => {
    if (!record) return null;

    return record.flaggedForMisuse ? (
      <Badge className="border-red-200 bg-red-50 text-red-700">
        Review Required
      </Badge>
    ) : (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
        Verified Record
      </Badge>
    );
  }, [record]);

  async function openReceipt() {
    if (!record) {
      return;
    }

    const receiptWindow = window.open("about:blank", "_blank", "noopener,noreferrer");
    try {
      const signedUrl = await getFuelReceiptAccessUrlApi(record.id);
      if (receiptWindow) {
        receiptWindow.location.href = signedUrl;
      } else {
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      receiptWindow?.close();
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="vfms-detail-page">
      <div className="vfms-detail-container max-w-none animate-in fade-in duration-500">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="text-slate-600 hover:text-slate-900"
          >
            <Link href="/admin/fuel">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Fuel Management
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-slate-950" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : !record ? (
          <FormMessage type="error" message="Fuel entry not found" />
        ) : (
          <>
              <Card className="vfms-detail-card mb-6 overflow-hidden">
                <CardHeader className="vfms-form-header px-6 py-5">
                  <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950">
                        <Fuel className="h-5 w-5" />
                      </div>
                      <CardTitle className="min-w-0 flex-1 truncate text-lg font-bold text-white">
                        {record.vehiclePlate}
                      </CardTitle>
                    </div>
                    <div className="sm:ml-auto">
                      {statusBadge}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="vfms-detail-tile xl:col-span-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="min-w-0">
                        <p className="vfms-detail-label">Record ID</p>
                        <p className="vfms-detail-value truncate">{record.id}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile xl:col-span-2">
                      <CarFront className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Vehicle</p>
                        <p className="vfms-detail-value">{record.vehicleMakeModel}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <UserRound className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Driver</p>
                        <p className="vfms-detail-value">{record.driverName ?? "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Fuel Date</p>
                        <p className="vfms-detail-value">{formatDate(record.fuelDate)}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Station</p>
                        <p className="vfms-detail-value">{record.fuelStation ?? "Not specified"}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <CircleDollarSign className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Total Cost</p>
                        <p className="vfms-detail-value">{formatLKR(record.totalCost)}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Quantity</p>
                        <p className="vfms-detail-value">{record.quantity.toFixed(2)} L</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <CircleDollarSign className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Cost per Litre</p>
                        <p className="vfms-detail-value">{formatLKR(record.costPerLitre)}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <Gauge className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Efficiency</p>
                        <p className="vfms-detail-value">{formatEfficiency(record.efficiencyKmPerLitre)}</p>
                      </div>
                    </div>
                    <div className="vfms-detail-tile">
                      <CarFront className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="vfms-detail-label">Odometer</p>
                        <p className="vfms-detail-value">{record.odometerReading.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5 xl:grid-cols-2">
              <SectionCard
                eyebrow="Vehicle Context"
                title="Trip and asset details"
                description="Core operational information tied to this fuel event."
              >
                <DetailRow label="Vehicle ID" value={record.vehicleId} />
                <DetailRow label="License Plate" value={record.vehiclePlate} />
                <DetailRow
                  label="Make and Model"
                  value={record.vehicleMakeModel}
                />
                <DetailRow
                  label="Driver Name"
                  value={record.driverName ?? "N/A"}
                />
                <DetailRow
                  label="Driver ID"
                  value={record.driverId ?? "N/A"}
                />
                <DetailRow
                  label="Distance Since Last"
                  value={
                    record.distanceSinceLast != null
                      ? `${record.distanceSinceLast.toLocaleString()} km`
                      : "N/A"
                  }
                />
              </SectionCard>

              <SectionCard
                eyebrow="Review Status"
                title="Compliance signal"
                description="Quick status for trust, follow-up, and exception handling."
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        record.flaggedForMisuse
                          ? "bg-red-100 text-red-600"
                          : "bg-emerald-100 text-emerald-600"
                      )}
                    >
                      <ShieldAlert className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {record.flaggedForMisuse
                          ? "Flagged for review"
                          : "No anomaly detected"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {record.flagReason ??
                          "This entry currently shows no flagged misuse condition."}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Fueling Snapshot"
                title="Purchase and location summary"
                description="Structured values used for cost control and anomaly review."
              >
                <DetailRow label="Fuel Date" value={formatDate(record.fuelDate)} />
                <DetailRow
                  label="Fuel Station"
                  value={record.fuelStation ?? "N/A"}
                />
                <DetailRow
                  label="Quantity"
                  value={`${record.quantity.toFixed(2)} L`}
                />
                <DetailRow
                  label="Cost per Litre"
                  value={formatLKR(record.costPerLitre)}
                />
                <DetailRow label="Total Cost" value={formatLKR(record.totalCost)} />
                <DetailRow
                  label="Fuel Efficiency"
                  value={formatEfficiency(record.efficiencyKmPerLitre)}
                />
              </SectionCard>

              <SectionCard
                eyebrow="Audit Trail"
                title="Record ownership"
                description="Administrative metadata used for traceability."
              >
                <DetailRow label="Created By" value={record.createdBy} />
                <DetailRow
                  label="Created At"
                  value={formatDateTime(record.createdAt)}
                />
              </SectionCard>

              {record.notes && (
                <SectionCard
                  eyebrow="Operator Notes"
                  title="Recorded observations"
                  description="Free-text context captured at the time of entry."
                  className="xl:col-span-2"
                >
                  <p className="text-sm leading-7 text-slate-700">
                    {record.notes}
                  </p>
                </SectionCard>
              )}

              <SectionCard
                eyebrow="Supporting Files"
                title="Receipt evidence"
                description="Stored attachment linked to this transaction."
                className="xl:col-span-2"
              >
                {record.receiptUrl ? (
                  <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {record.receiptFileName ?? "Receipt attachment"}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Open the uploaded receipt in a new tab for document verification.
                      </p>
                    </div>
                    <Button type="button" onClick={openReceipt}>
                      <FileText />
                      Open Receipt
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    No receipt file is attached to this fuel entry.
                  </div>
                )}
              </SectionCard>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 mt-2 flex-wrap">
                {record && (
                  <Button
                    asChild
                    variant="outline"
                  >
                    <Link href={`/admin/fuel/${record.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Entry
                    </Link>
                  </Button>
                )}
              </div>
          </>
        )}
      </div>
    </div>
  );
}
