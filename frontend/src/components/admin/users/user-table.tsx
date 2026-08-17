"use client";

import { Fragment, useState } from "react";
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
  isUserActive,
  restoreUserApi,
  toggleUserStatusApi,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { ReviewDialog } from "./review-dialog";
import { UserRoleBadge } from "./user-role-badge";
import { UserStatusBadge } from "./user-status-badge";
import { useAuthStore } from "@/store/auth-store";

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

function hasValue(value: string | null | undefined): boolean {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
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
  const [statusTarget, setStatusTarget] = useState<UserSummary | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<UserSummary | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const currentUserId = useAuthStore((state) => state.user?.userId);

  const isSelf = (user: UserSummary) => user.id === currentUserId;

  const handleToggleStatus = async (user: UserSummary) => {
    setTogglingId(user.id);
    try {
      await toggleUserStatusApi(user.id);
      const action = isUserActive(user) ? "deactivated" : "activated";
      toast.success(`${user.fullName} has been ${action}.`);
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
      setStatusTarget(null);
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
      setRestoreTarget(null);
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
            : "Try adjusting your filters or create a new account."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-0 text-sm">
          <thead className="bg-slate-950">
            <tr>
              <th className="rounded-tl-2xl bg-slate-950 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">
                User
              </th>
              <th className="bg-slate-950 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">
                Role
              </th>
              <th className="bg-slate-950 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">
                Status
              </th>
              <th className="bg-slate-950 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">
                {showDeletedActions ? "Deleted" : "Registered"}
              </th>
              <th className="rounded-tr-2xl bg-slate-950 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/90">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-slate-50">
            {users.map((user) => (
              <Fragment key={user.id}>
              <tr className="transition-colors hover:bg-white">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-sm font-bold uppercase text-slate-950 shadow-sm ring-1 ring-black/5">
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
                  <UserStatusBadge status={user.status} enabled={user.enabled} />
                </td>

                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  {showDeletedActions
                    ? formatDateTime(user.deletedAt)
                    : formatDate(user.createdAt)}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRow(expandedRow === user.id ? null : user.id)
                      }
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950"
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
                        onClick={() => setRestoreTarget(user)}
                        disabled={restoringId === user.id}
                        className="rounded-xl border border-emerald-200 bg-white p-2 text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50 disabled:opacity-40"
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
                              className="rounded-xl border border-amber-200 bg-white p-2 text-amber-600 shadow-sm transition-colors hover:bg-amber-50"
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
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}

                        {(user.status === "APPROVED" ||
                          user.status === "DEACTIVATED") && (
                          <button
                            type="button"
                            onClick={() => setStatusTarget(user)}
                            disabled={togglingId === user.id || isSelf(user)}
                            className={`rounded-xl border bg-white p-2 shadow-sm transition-colors disabled:opacity-40 ${
                              isUserActive(user)
                                ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                : "border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                            title={
                              isSelf(user)
                                ? "You cannot change your own status"
                                : isUserActive(user)
                                  ? "Deactivate"
                                  : "Activate"
                            }
                          >
                            {isUserActive(user) ? (
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
                            disabled={isSelf(user)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            title={
                              isSelf(user)
                                ? "You cannot delete your own account"
                                : "Delete"
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>

              {expandedRow === user.id && (
                  <tr className="bg-slate-50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 text-xs md:grid-cols-4">
                        <div className="md:col-span-4 grid gap-4 border-b border-slate-100 pb-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="mb-1 font-medium text-slate-500">Full Name</p>
                            <p className="text-slate-900">{user.fullName}</p>
                          </div>
                          <div>
                            <p className="mb-1 font-medium text-slate-500">Email</p>
                            <p className="truncate text-slate-900">{user.email}</p>
                          </div>
                          <div>
                            <p className="mb-1 font-medium text-slate-500">Role</p>
                            <UserRoleBadge role={user.role} />
                          </div>
                          <div>
                            <p className="mb-1 font-medium text-slate-500">Account Status</p>
                            <UserStatusBadge status={user.status} enabled={user.enabled} />
                          </div>
                          <div>
                            <p className="mb-1 font-medium text-slate-500">
                              {showDeletedActions ? "Deleted On" : "Registered On"}
                            </p>
                            <p className="text-slate-900">
                              {showDeletedActions
                                ? formatDateTime(user.deletedAt)
                                : formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>

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
                          user.role === "ADMIN") &&
                          (hasValue(user.employeeId) ||
                            hasValue(user.department) ||
                            hasValue(user.officeLocation) ||
                            hasValue(user.designation)) && (
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

                        {user.role === "APPROVER" && hasValue(user.approvalLevel) && (
                          <div>
                            <p className="mb-1 font-medium text-slate-500">
                              Approval Level
                            </p>
                            <p className="text-slate-900">
                              {user.approvalLevel}
                            </p>
                          </div>
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

                        {user.passwordChangeRequired && (
                          <div>
                            <p className="mb-1 font-medium text-slate-500">
                              Password Update
                            </p>
                            <p className="text-slate-900">
                              User must change the temporary password
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
              )}
              </Fragment>
            ))}
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

      <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusTarget && isUserActive(statusTarget)
                ? "Deactivate account?"
                : "Activate account?"}
            </DialogTitle>
            <DialogDescription>
              {statusTarget && isUserActive(statusTarget)
                ? `${statusTarget.fullName} will lose system access and active sessions will be revoked.`
                : `${statusTarget?.fullName ?? "This user"} will be able to sign in again with their approved account.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusTarget(null)}
              disabled={Boolean(statusTarget && togglingId === statusTarget.id)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={statusTarget && isUserActive(statusTarget) ? "destructive" : "success"}
              onClick={() => {
                if (statusTarget) {
                  void handleToggleStatus(statusTarget);
                }
              }}
              disabled={Boolean(statusTarget && togglingId === statusTarget.id)}
            >
              {statusTarget && togglingId === statusTarget.id
                ? "Processing..."
                : statusTarget && isUserActive(statusTarget)
                  ? "Deactivate"
                  : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(restoreTarget)} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore archived account?</DialogTitle>
            <DialogDescription>
              {restoreTarget?.fullName ?? "This user"} will return to their previous lifecycle status and appear in active user records again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRestoreTarget(null)}
              disabled={Boolean(restoreTarget && restoringId === restoreTarget.id)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={() => {
                if (restoreTarget) {
                  void handleRestore(restoreTarget);
                }
              }}
              disabled={Boolean(restoreTarget && restoringId === restoreTarget.id)}
            >
              {restoreTarget && restoringId === restoreTarget.id ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
