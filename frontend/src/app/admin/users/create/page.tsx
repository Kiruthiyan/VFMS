"use client";

import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { UserManagementNav } from "@/components/admin/users/user-management-nav";
import { CreateUserForm } from "@/components/admin/users/create-user-form";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function CreateUserPage() {
  const router = useRouter();

  return (
      <div className="space-y-6">
        <PageHeader
          title="Create User"
          description="Create role-based user access."
          icon={UserPlus}
        />

        <UserManagementNav />

        <div className="max-w-5xl">
          <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="vfms-form-header px-6 py-5 pl-8 sm:px-8 sm:pl-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="text-lg font-black tracking-tight text-white">
                      Create Account
                    </CardTitle>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <CreateUserForm
                  cancelLabel="Back"
                  onCancel={() => router.push("/admin/users")}
                  onSuccess={() => router.push("/admin/users/all")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
