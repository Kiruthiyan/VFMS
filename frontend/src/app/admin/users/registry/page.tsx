"use client";

import { useCallback, useEffect, useState } from "react";
import { BookUser, RefreshCw } from "lucide-react";

import { EmployeeRegistryForm } from "@/components/admin/users/employee-registry-form";
import { UserManagementNav } from "@/components/admin/users/user-management-nav";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  getEmployeeRegistryApi,
  getErrorMessage,
  type EmployeeRegistryRecord,
} from "@/lib/api/admin";

export default function EmployeeRegistryPage() {
  const [records, setRecords] = useState<EmployeeRegistryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getEmployeeRegistryApi();
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Registry"
        description="Manage the company employee directory used to verify staff accounts before VFMS login access is created."
        icon={BookUser}
      />

      <UserManagementNav />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-6 py-5 sm:px-8">
              <div>
                <CardTitle className="text-lg font-black tracking-tight text-slate-950">
                  Registry Records
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  These records power staff verification during account creation.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => void loadRecords()}
                disabled={isLoading}
                className="rounded-xl"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="p-5 sm:p-8">
              {error && <FormMessage type="error" message={error} />}

              {isLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <LoadingSpinner size={24} />
                </div>
              ) : records.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No employee registry records found. Add the first company staff record using the form.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Employee ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td className="px-4 py-3 font-semibold text-slate-950">
                            {record.employeeId}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{record.fullName}</td>
                          <td className="px-4 py-3 text-slate-700">{record.email}</td>
                          <td className="px-4 py-3 text-slate-700">{record.department}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                record.active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {record.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <CardTitle className="text-lg font-black tracking-tight text-slate-950">
              Add Registry Record
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Add verified company staff details here before creating a SYSTEM_USER account.
            </p>

            <div className="mt-6">
              <EmployeeRegistryForm onSuccess={() => void loadRecords()} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
