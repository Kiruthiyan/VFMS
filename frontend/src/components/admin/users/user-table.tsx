"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import type { UserSummary } from "@/lib/api/admin";
import {
  getErrorMessage,
  restoreUserApi,
  toggleUserStatusApi,
} from "@/lib/api/admin";

import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { ReviewDialog } from "./review-dialog";
import { UserRoleBadge } from "./user-role-badge";
import { UserStatusBadge } from "./user-status-badge";

interface UserTableProps {
  users: UserSummary[];
  showReviewActions?: boolean;
  showDeletedActions?: boolean;
  onRefresh: () => void;
}

const DEFAULT_LOCALE = "en-US";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString(DEFAULT_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString(DEFAULT_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserTable({
  users,
  showReviewActions = false,
  showDeletedActions = false,
  onRefresh,
}: UserTableProps) {
  const [reviewingUser, setReviewingUser] = useState<UserSummary | null>(null);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserSummary | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleToggleStatus = async (user: UserSummary) => {
    setTogglingId(user.id);
    try {
      await toggleUserStatusApi(user.id);
      const action =
        user.status === "APPROVED" ? "deactivated" : "reactivated";
      toast.success(`${user.fullName} has been ${action}.`);
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleRestore = async (user: UserSummary) => {
    setRestoringId(user.id);
    try {
      await restoreUserApi(user.id);
      toast.success(`${user.fullName} has been restored.`);
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRestoringId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          {showDeletedActions ? (
            <RotateCcw className="h-5 w-5 text-slate-400" />
          ) : (
            <UserX className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <p className="text-sm font-medium text-slate-600">No users found.</p>
        <p className="mt-1 text-xs text-slate-400">
          {showDeletedActions
            ? "No deleted users in history."
            : "Try adjusting your filters or create a new user."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {showDeletedActions ? "Deleted" : "Registered"}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                      {user.fullName.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-950">
                          {user.fullName}
                        </p>
                        {user.createdByAdmin && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                            <ShieldCheck size={10} />
                            Admin Created
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <UserRoleBadge role={user.role} />
                </td>

                <td className="px-6 py-4">
                  <UserStatusBadge status={user.status} />
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {showDeletedActions
                    ? formatDateTime(user.deletedAt)
                    : formatDate(user.createdAt)}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRow(expandedRow === user.id ? null : user.id)
                      }
                      className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                      title="View details"
                    >
                      {expandedRow === user.id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>

                    {showDeletedActions && (
                      <button
                        type="button"
                        onClick={() => handleRestore(user)}
                        disabled={restoringId === user.id}
                        className="rounded-xl p-2 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                        title="Restore user"
                      >
                        <RotateCcw
                          size={14}
                          className={restoringId === user.id ? "animate-spin" : ""}
                        />
                      </button>
                    )}

                    {!showDeletedActions && (
                      <>
                        {showReviewActions &&
                          user.status === "PENDING_APPROVAL" && (
                            <button
                              type="button"
                              onClick={() => setReviewingUser(user)}
                              className="rounded-xl p-2 text-amber-600 transition-colors hover:bg-amber-50"
                              title="Review"
                            >
                              <MoreVertical size={14} />
                            </button>
                          )}

                        {(user.status === "APPROVED" ||
                          user.status === "DEACTIVATED") && (
                          <button
                            type="button"
                            onClick={() => setEditingUser(user)}
                            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}

                        {(user.status === "APPROVED" ||
                          user.status === "DEACTIVATED") && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingId === user.id}
                            className={`rounded-xl p-2 transition-colors disabled:opacity-40 ${
                              user.status === "APPROVED"
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                            title={
                              user.status === "APPROVED"
                                ? "Deactivate"
                                : "Reactivate"
                            }
                          >
                            {user.status === "APPROVED" ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>
                        )}

                        {user.status !== "PENDING_APPROVAL" && (
                          <button
                            type="button"
                            onClick={() => setDeletingUser(user)}
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {users.map(
              (user) =>
                expandedRow === user.id && (
                  <tr key={`${user.id}-expanded`} className="bg-slate-50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 text-xs md:grid-cols-4">
                        <div>
                          <p className="mb-1 font-medium text-slate-500">Phone</p>
                          <p className="text-slate-900">{user.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="mb-1 font-medium text-slate-500">NIC</p>
                          <p className="text-slate-900">{user.nic || "N/A"}</p>
                        </div>

                        {user.role === "DRIVER" && (
                          <>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                License No.
                              </p>
                              <p className="text-slate-900">
                                {user.licenseNumber || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                License Expiry
                              </p>
                              <p className="text-slate-900">
                                {user.licenseExpiryDate || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                Experience
                              </p>
                              <p className="text-slate-900">
                                {user.experienceYears != null
                                  ? `${user.experienceYears} yrs`
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                Certifications
                              </p>
                              <p className="text-slate-900">
                                {user.certifications || "N/A"}
                              </p>
                            </div>
                          </>
                        )}

                        {(user.role === "SYSTEM_USER" ||
                          user.role === "APPROVER" ||
                          user.role === "ADMIN") && (
                          <>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                Employee ID
                              </p>
                              <p className="text-slate-900">
                                {user.employeeId || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                Department
                              </p>
                              <p className="text-slate-900">
                                {user.department || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                Office Location
                              </p>
                              <p className="text-slate-900">
                                {user.officeLocation || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                Designation
                              </p>
                              <p className="text-slate-900">
                                {user.designation || "N/A"}
                              </p>
                            </div>
                          </>
                        )}

                        {user.rejectionReason && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="mb-1 font-medium text-slate-500">
                              Rejection Reason
                            </p>
                            <p className="text-red-600">{user.rejectionReason}</p>
                          </div>
                        )}

                        {showDeletedActions && user.deletedReason && (
                          <div className="col-span-2 space-y-2 md:col-span-4">
                            <div>
                              <p className="mb-1 font-medium text-slate-500">
                                Deletion Reason
                              </p>
                              <p className="text-red-600">{user.deletedReason}</p>
                            </div>
                            {user.deletedBy && (
                              <div>
                                <p className="mb-1 font-medium text-slate-500">
                                  Deleted By
                                </p>
                                <p className="text-slate-900">{user.deletedBy}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {user.createdBy && (
                          <div>
                            <p className="mb-1 font-medium text-slate-500">
                              Created By
                            </p>
                            <p className="text-slate-900">{user.createdBy}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>

      {reviewingUser && (
        <ReviewDialog
          user={reviewingUser}
          onClose={() => setReviewingUser(null)}
          onSuccess={onRefresh}
        />
      )}

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={onRefresh}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
