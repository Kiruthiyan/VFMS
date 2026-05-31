"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  IdCard,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { UserManagementNav } from "@/components/admin/users/user-management-nav";
import { CreateUserForm } from "@/components/admin/users/create-user-form";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const CREATE_USER_GUIDANCE = [
  "Select the correct role first so the form displays the required account fields.",
  "Create driver accounts only after licence, identity, and operational details are verified.",
  "Use verified employee information before creating staff access accounts.",
];

const ROLE_SIDEBAR_ITEMS = [
  {
    title: "Staff / System User",
    detail:
      "Use employee ID, department, designation, and office location from the company staff registry.",
    icon: UsersRound,
  },
  {
    title: "Driver",
    detail:
      "Check licence number, licence expiry date, experience, and certification details before account creation.",
    icon: IdCard,
  },
];

export default function CreateUserPage() {
  const router = useRouter();

  return (

      <div className="space-y-6">
        <PageHeader
          title="Create User"
          description="Create a new FleetPro account with the correct role, verified identity details, and controlled system access."
          icon={UserPlus}
        />

        <UserManagementNav />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
          <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="text-lg font-black tracking-tight text-slate-950">
                      User Provisioning Form
                    </CardTitle>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Complete the required role-based details below. The system
                      will create the account using the selected access level and
                      verified user information.
                    </p>
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

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <Card className="rounded-[28px] border border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold text-slate-950">
                      Provisioning Standard
                    </CardTitle>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Create accounts only after the role, identity details, and
                      business access requirement have been checked properly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <CardTitle className="text-base font-bold text-slate-950">
                  Role Requirements
                </CardTitle>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Different user roles require different validation details
                  before account access is granted.
                </p>

                <div className="mt-5 space-y-3">
                  {ROLE_SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-950">
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
                <CardTitle className="text-base font-bold text-slate-950">
                  Provisioning Checklist
                </CardTitle>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use this checklist before submitting a new account.
                </p>

                <div className="mt-5 space-y-3">
                  {CREATE_USER_GUIDANCE.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

  );
}
