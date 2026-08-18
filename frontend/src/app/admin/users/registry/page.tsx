"use client";

import { useQuery } from "@tanstack/react-query";
import { BookUser, RefreshCw, UserPlus } from "lucide-react";

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
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/query-keys";

export default function EmployeeRegistryPage() {
  const {
    data: records = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.employeeRegistry,
    queryFn: getEmployeeRegistryApi,
    placeholderData: (previous) => previous,
  });
  const errorMessage = error ? getErrorMessage(error) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Registry"
        description="Manage the company employee directory used to verify staff accounts before VFMS login access is created."
        icon={BookUser}
      />

      <UserManagementNav />

      <div className="space-y-6">
        <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="vfms-card-header flex flex-col gap-3 px-6 py-5 pl-8 sm:flex-row sm:items-center sm:justify-between">
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
                size="icon"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="vfms-refresh-button"
                aria-label="Refresh user registry"
                title="Refresh user registry"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="p-5 sm:p-8">
              {errorMessage && <FormMessage type="error" message={errorMessage} />}

              {isLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <LoadingSpinner size={24} />
                </div>
              ) : records.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No employee registry records found. Add the first company staff record using the form.
                </p>
              ) : (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] table-fixed text-sm">
                      <thead className="bg-slate-950 text-left text-xs font-black uppercase tracking-[0.14em] text-white">
                        <tr>
                          <th className="w-[16%] px-7 py-4">Employee ID</th>
                          <th className="w-[22%] px-7 py-4">Name</th>
                          <th className="w-[30%] px-7 py-4">Email</th>
                          <th className="w-[20%] px-7 py-4">Department</th>
                          <th className="w-[12%] px-7 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-slate-50/70">
                        {records.map((record) => (
                          <tr key={record.id} className="transition-colors hover:bg-white">
                            <td className="truncate px-7 py-5 font-bold text-slate-950">
                              {record.employeeId}
                            </td>
                            <td className="px-7 py-5 font-medium text-slate-800">
                              {record.fullName}
                            </td>
                            <td className="truncate px-7 py-5 text-slate-600" title={record.email}>
                              {record.email}
                            </td>
                            <td className="truncate px-7 py-5 text-slate-700">
                              {record.department}
                            </td>
                            <td className="px-7 py-5 text-center">
                              <span
                                className={`inline-flex min-w-24 justify-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${
                                  record.active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-100 text-slate-600"
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="vfms-form-header px-6 py-5 pl-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight text-white">
                    Add Registry Record
                  </CardTitle>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Add verified staff details before creating a system user account.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <EmployeeRegistryForm onSuccess={() => void refetch()} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
