"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getErrorMessage,
  getFuelRecordByIdApi,
  type FuelRecord,
} from "@/lib/api/fuel";

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
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

  return (
    <AdminShell>
      <div className="space-y-6">
        <Link
          href="/admin/fuel"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
        >
          <ArrowLeft size={14} />
          Back to Fuel Management
        </Link>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Fuel Entry Details
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Complete record information for audit, review, and supporting
            documentation.
          </p>
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                <CardTitle className="text-base text-white">Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6">
                <DetailBlock label="License Plate" value={record.vehiclePlate} />
                <DetailBlock
                  label="Make & Model"
                  value={record.vehicleMakeModel}
                />
                <DetailBlock label="Vehicle ID" value={record.vehicleId} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                <CardTitle className="text-base text-white">Driver</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6">
                <DetailBlock
                  label="Driver Name"
                  value={record.driverName || "N/A"}
                />
                <DetailBlock
                  label="Driver ID"
                  value={record.driverId || "N/A"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                <CardTitle className="text-base text-white">
                  Fuel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
                <DetailBlock
                  label="Quantity"
                  value={`${record.quantity.toFixed(2)} L`}
                />
                <DetailBlock
                  label="Cost per Litre"
                  value={`LKR ${record.costPerLitre.toFixed(2)}`}
                />
                <DetailBlock
                  label="Total Cost"
                  value={`LKR ${record.totalCost.toFixed(2)}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                <CardTitle className="text-base text-white">
                  Vehicle Condition
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
                <DetailBlock
                  label="Odometer"
                  value={`${record.odometerReading.toLocaleString()} km`}
                />
                <DetailBlock
                  label="Fuel Efficiency"
                  value={
                    record.efficiencyKmPerLitre
                      ? `${record.efficiencyKmPerLitre.toFixed(2)} km/L`
                      : "N/A"
                  }
                />
                <DetailBlock
                  label="Distance Since Last"
                  value={
                    record.distanceSinceLast
                      ? `${record.distanceSinceLast.toLocaleString()} km`
                      : "N/A"
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                <CardTitle className="text-base text-white">
                  Refueling Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6">
                <DetailBlock
                  label="Fuel Station"
                  value={record.fuelStation || "N/A"}
                />
                <DetailBlock
                  label="Fuel Date"
                  value={new Date(record.fuelDate).toLocaleDateString()}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                <CardTitle className="text-base text-white">
                  Alert Status
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6">
                {record.flaggedForMisuse ? (
                  <>
                    <Badge className="w-fit border-red-200 bg-red-100 text-red-700">
                      Flagged for Review
                    </Badge>
                    {record.flagReason && (
                      <p className="text-sm text-red-600">{record.flagReason}</p>
                    )}
                  </>
                ) : (
                  <Badge className="w-fit border-emerald-200 bg-emerald-100 text-emerald-700">
                    No Alert
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                <CardTitle className="text-base text-white">
                  Record Info
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6">
                <DetailBlock label="Record ID" value={record.id} />
                <DetailBlock label="Created By" value={record.createdBy} />
                <DetailBlock
                  label="Created At"
                  value={new Date(record.createdAt).toLocaleString()}
                />
              </CardContent>
            </Card>

            {record.notes && (
              <Card className="md:col-span-2">
                <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                  <CardTitle className="text-base text-white">Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm leading-6 text-slate-700">
                    {record.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {record.receiptUrl && (
              <Card className="md:col-span-2">
                <CardHeader className="border-b border-slate-200 bg-slate-950 py-4">
                  <CardTitle className="flex items-center gap-2 text-base text-white">
                    <FileText size={16} />
                    Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <a
                    href={record.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
                  >
                    <FileText size={16} />
                    View Receipt ({record.receiptFileName})
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
