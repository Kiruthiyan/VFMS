"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, IdCard, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import Link from "next/link";

import { CreateUserForm } from "@/components/admin/users/create-user-form";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const CREATE_USER_GUIDANCE = [
  "Administrators and approvers should be provisioned only for approved business owners.",
  "Driver accounts should be created only after licence and identity details are verified.",
  "Staff accounts should match company records so downstream approvals and reporting stay accurate.",
];

const ROLE_SIDEBAR_ITEMS = [
  {
    title: "Staff / System User",
    detail: "Employee ID, department, designation, and office location are required.",
    icon: UsersRound,
  },
  {
    title: "Driver",
    detail: "Licence number and licence expiry date are required before access is granted.",
    icon: IdCard,
  },
];

export default function CreateUserPage() {
  const router = useRouter();

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Create User"
          description="Provision a new VFMS account with the correct role details, identity data, and operational access from the start."
          icon={UserPlus}
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/users">
                <ArrowLeft size={16} />
                Back to User Dashboard
              </Link>
            </Button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-slate-200 px-8 py-5">
                <CardTitle className="text-base font-semibold text-slate-950">
                  User Provisioning Form
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  A temporary password will be emailed automatically after the account is created.
                </p>
              </div>
              <div className="p-8">
                <CreateUserForm
                  cancelLabel="Back"
                  onCancel={() => router.push("/admin/users")}
                  onSuccess={() => router.push("/admin/users/all")}
                />
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <Card className="rounded-[28px] border border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-950">
                      Provisioning Standard
                    </CardTitle>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Create accounts only after the role, business owner, and identity details have been checked against company records.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <CardTitle className="text-base font-semibold text-slate-950">
                  Role Requirements
                </CardTitle>
                <div className="mt-4 space-y-3">
                  {ROLE_SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {item.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <CardTitle className="text-base font-semibold text-slate-950">
                  Before You Submit
                </CardTitle>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {CREATE_USER_GUIDANCE.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
