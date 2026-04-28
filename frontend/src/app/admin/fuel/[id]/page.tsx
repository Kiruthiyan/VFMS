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
  Gauge,
  type LucideIcon,
  MapPin,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
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
        "flex items-start justify-between gap-6 border-b border-slate-100 py-4 last:border-b-0 last:pb-0 first:pt-0",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-right text-sm font-semibold text-slate-900">{value}</p>
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
      className={cn("overflow-hidden rounded-3xl border-slate-200/90", className)}
    >
      <CardHeader className="border-b border-slate-100 bg-slate-50/70">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          {eyebrow}
        </p>
        <CardTitle className="text-lg text-slate-950">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  meta,
  icon: Icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="rounded-3xl border-slate-200/90 bg-white">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{meta}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
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

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/fuel"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
          >
            <ArrowLeft size={14} />
            Back to Fuel Management
          </Link>

          {record?.receiptUrl && (
            <Button asChild variant="outline" size="sm">
              <a
                href={record.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText />
                View Receipt
              </a>
            </Button>
          )}
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
            <Card className="overflow-hidden rounded-[30px] border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#fff8e7_100%)]">
              <CardContent className="p-0">
                <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="bg-white/80">
                        Fuel Record
                      </Badge>
                      {statusBadge}
                    </div>
                    <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      {record.vehiclePlate}
                    </h1>
                    <p className="mt-2 text-base text-slate-600">
                      {record.vehicleMakeModel} with full fueling, audit, and
                      supporting evidence details for administrative review.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <UserRound className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                            Driver
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-950">
                          {record.driverName ?? "Unassigned"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <CalendarDays className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                            Fuel Date
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-950">
                          {formatDate(record.fuelDate)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                            Station
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-950">
                          {record.fuelStation ?? "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Total Cost
                      </p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        {formatLKR(record.totalCost)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Captured for audit and reimbursement reporting
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                        Record ID
                      </p>
                      <p className="mt-3 truncate text-lg font-semibold text-slate-950">
                        {record.id}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Reference for support and traceability
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Quantity"
                value={`${record.quantity.toFixed(2)} L`}
                meta="Dispensed volume"
                icon={Droplets}
              />
              <StatCard
                label="Cost per Litre"
                value={formatLKR(record.costPerLitre)}
                meta="Unit purchase cost"
                icon={CircleDollarSign}
              />
              <StatCard
                label="Efficiency"
                value={formatEfficiency(record.efficiencyKmPerLitre)}
                meta="Estimated vehicle performance"
                icon={Gauge}
              />
              <StatCard
                label="Odometer"
                value={`${record.odometerReading.toLocaleString()} km`}
                meta="Reading at fueling"
                icon={CarFront}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
              <div className="space-y-6">
                <SectionCard
                  eyebrow="Vehicle Context"
                  title="Trip and asset details"
                  description="Core operational information tied to this fuel event."
                >
                  <div className="grid gap-x-8 md:grid-cols-2">
                    <div>
                      <DetailRow label="Vehicle ID" value={record.vehicleId} />
                      <DetailRow
                        label="License Plate"
                        value={record.vehiclePlate}
                      />
                      <DetailRow
                        label="Make and Model"
                        value={record.vehicleMakeModel}
                      />
                    </div>
                    <div>
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
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  eyebrow="Fueling Snapshot"
                  title="Purchase and location summary"
                  description="Structured values used for cost control and anomaly review."
                >
                  <div className="grid gap-x-8 md:grid-cols-2">
                    <div>
                      <DetailRow
                        label="Fuel Date"
                        value={formatDate(record.fuelDate)}
                      />
                      <DetailRow
                        label="Fuel Station"
                        value={record.fuelStation ?? "N/A"}
                      />
                      <DetailRow
                        label="Quantity"
                        value={`${record.quantity.toFixed(2)} L`}
                      />
                    </div>
                    <div>
                      <DetailRow
                        label="Cost per Litre"
                        value={formatLKR(record.costPerLitre)}
                      />
                      <DetailRow
                        label="Total Cost"
                        value={formatLKR(record.totalCost)}
                      />
                      <DetailRow
                        label="Fuel Efficiency"
                        value={formatEfficiency(record.efficiencyKmPerLitre)}
                      />
                    </div>
                  </div>
                </SectionCard>

                {record.notes && (
                  <SectionCard
                    eyebrow="Operator Notes"
                    title="Recorded observations"
                    description="Free-text context captured at the time of entry."
                  >
                    <p className="text-sm leading-7 text-slate-700">
                      {record.notes}
                    </p>
                  </SectionCard>
                )}
              </div>

              <div className="space-y-6">
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

                <SectionCard
                  eyebrow="Supporting Files"
                  title="Receipt evidence"
                  description="Stored attachment linked to this transaction."
                >
                  {record.receiptUrl ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-950">
                        {record.receiptFileName ?? "Receipt attachment"}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Open the uploaded receipt in a new tab for document
                        verification.
                      </p>
                      <Button asChild className="mt-4 w-full">
                        <a
                          href={record.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText />
                          Open Receipt
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                      No receipt file is attached to this fuel entry.
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
