'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { getFuelRecordByIdApi, getErrorMessage, type FuelRecord } from '@/lib/api/fuel';
import { AdminShell } from '@/components/layout/admin-shell';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FormMessage } from '@/components/ui/form-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
          setError('Invalid fuel record ID');
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
    <AdminShell requireAdmin={true}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/admin/fuel"
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Fuel Management
        </Link>

        {/* Header */}
        <div className="pb-2 border-b border-amber-200">
          <h1 className="text-3xl font-bold text-slate-900">Fuel Entry Details</h1>
          <p className="text-sm text-slate-500 mt-1">Complete fuel record information</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-amber-400" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : !record ? (
          <FormMessage type="error" message="Fuel entry not found" />
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Vehicle Info */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                <CardTitle className="text-sm text-white">Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">License Plate</p>
                  <p className="text-lg font-bold text-slate-900">{record.vehiclePlate}</p>
                  </div>
                <div>
                  <p className="text-xs text-slate-500">Make & Model</p>
                  <p className="text-sm text-slate-700">{record.vehicleMakeModel}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Vehicle ID</p>
                  <p className="text-xs font-mono text-slate-600">{record.vehicleId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Driver Info */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                <CardTitle className="text-sm text-white">Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Driver Name</p>
                  <p className="text-lg font-bold text-slate-900">{record.driverName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Driver ID</p>
                  <p className="text-xs font-mono text-slate-600">{record.driverId || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Fuel Details */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                <CardTitle className="text-sm text-white">Fuel Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Quantity</p>
                    <p className="text-lg font-bold text-amber-600">{record.quantity}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cost per Liter</p>
                    <p className="text-lg font-bold text-slate-900">₹{record.costPerLitre.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Cost</p>
                  <p className="text-lg font-bold text-green-600">₹{record.totalCost.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Odometer & Efficiency */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                <CardTitle className="text-sm text-white">Vehicle Condition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Odometer Reading</p>
                  <p className="text-lg font-bold text-slate-900">{record.odometerReading}km</p>
                </div>
                {record.efficiencyKmPerLitre && (
                  <div>
                    <p className="text-xs text-slate-500">Fuel Efficiency</p>
                    <p className="text-lg font-bold text-slate-900">
                      {record.efficiencyKmPerLitre.toFixed(2)}km/L
                    </p>
                  </div>
                )}
                {record.distanceSinceLast && (
                  <div>
                    <p className="text-xs text-slate-500">Distance Since Last</p>
                    <p className="text-sm text-slate-700">{record.distanceSinceLast}km</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Station & Date */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                <CardTitle className="text-sm text-white">Refueling Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {record.fuelStation && (
                  <div>
                    <p className="text-xs text-slate-500">Fuel Station</p>
                    <p className="text-sm font-semibold text-slate-900">{record.fuelStation}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Fuel Date</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(record.fuelDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status & Flags */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                <CardTitle className="text-sm text-white">Alert Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {record.flaggedForMisuse ? (
                  <div>
                    <Badge className="bg-red-100 text-red-900 border-red-200">
                      ⚠ Flagged for Review
                    </Badge>
                    {record.flagReason && (
                      <p className="text-xs text-red-700 mt-2">{record.flagReason}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Badge className="bg-green-100 text-green-900 border-green-200">
                      ✓ No Alert
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Record Metadata */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                <CardTitle className="text-sm text-white">Record Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Record ID</p>
                  <p className="text-xs font-mono text-slate-600">{record.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created By</p>
                  <p className="text-xs text-slate-700">{record.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created At</p>
                  <p className="text-xs text-slate-600">
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {record.notes && (
              <Card className="bg-white border-slate-200 md:col-span-2 overflow-hidden">
                <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                  <CardTitle className="text-sm text-white">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{record.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Receipt */}
            {record.receiptUrl && (
              <Card className="bg-white border-slate-200 md:col-span-2 overflow-hidden">
                <CardHeader className="bg-blue-950 py-3 rounded-t rounded-b-none border-b-0">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <FileText size={16} />
                    Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={record.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
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
    </div>
    </AdminShell>
  );
}
