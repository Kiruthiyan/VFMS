"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  UserX,
  UserCheck,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toggleUserStatusApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { UserStatusBadge } from "./user-status-badge";
import { UserRoleBadge } from "./user-role-badge";
import { ReviewDialog } from "./review-dialog";
import { EditUserDialog } from "./edit-user-dialog";

interface UserTableProps {
  users: UserSummary[];
  showReviewActions?: boolean;
  onRefresh: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UserTable({
  users,
  showReviewActions = false,
  onRefresh,
}: UserTableProps) {
  const [reviewingUser, setReviewingUser] = useState<UserSummary | null>(null);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm">No users found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                User
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Registered
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((user) => (
              <>
                <tr
                  key={user.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {/* User */}
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-slate-200">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4">
                    <UserRoleBadge role={user.role} />
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <UserStatusBadge status={user.status} />
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Expand row */}
                      <button
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === user.id ? null : user.id
                          )
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        {expandedRow === user.id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>

                      {/* Review (pending only) */}
                      {showReviewActions &&
                        user.status === "PENDING_APPROVAL" && (
                          <button
                            onClick={() => setReviewingUser(user)}
                            className="p-1.5 rounded-lg text-amber-500 hover:text-amber-400 hover:bg-amber-950/30 transition-colors"
                            title="Review"
                          >
                            <MoreVertical size={14} />
                          </button>
                        )}

                      {/* Edit */}
                      {user.status === "APPROVED" && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      {/* Deactivate / Reactivate */}
                      {(user.status === "APPROVED" ||
                        user.status === "DEACTIVATED") && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={togglingId === user.id}
                          className={`p-1.5 rounded-lg transition-colors
                            ${
                              user.status === "APPROVED"
                                ? "text-slate-500 hover:text-red-400 hover:bg-red-950/30"
                                : "text-slate-500 hover:text-green-400 hover:bg-green-950/30"
                            }
                            disabled:opacity-40`}
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
                    </div>
                  </td>
                </tr>

                {/* Expanded row details */}
                {expandedRow === user.id && (
                  <tr key={`${user.id}-expanded`} className="bg-slate-900/50">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-slate-500 mb-1">Phone</p>
                          <p className="text-slate-300">
                            {user.phone || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">NIC</p>
                          <p className="text-slate-300">{user.nic || "—"}</p>
                        </div>

                        {/* Driver fields */}
                        {user.role === "DRIVER" && (
                          <>
                            <div>
                              <p className="text-slate-500 mb-1">
                                License No.
                              </p>
                              <p className="text-slate-300">
                                {user.licenseNumber || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">
                                License Expiry
                              </p>
                              <p className="text-slate-300">
                                {user.licenseExpiryDate || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Experience</p>
                              <p className="text-slate-300">
                                {user.experienceYears != null
                                  ? `${user.experienceYears} yrs`
                                  : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">
                                Certifications
                              </p>
                              <p className="text-slate-300">
                                {user.certifications || "—"}
                              </p>
                            </div>
                          </>
                        )}

                        {/* Staff fields */}
                        {(user.role === "SYSTEM_USER" ||
                          user.role === "APPROVER") && (
                          <>
                            <div>
                              <p className="text-slate-500 mb-1">
                                Employee ID
                              </p>
                              <p className="text-slate-300">
                                {user.employeeId || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Department</p>
                              <p className="text-slate-300">
                                {user.department || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Location</p>
                              <p className="text-slate-300">
                                {user.officeLocation || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">
                                Designation
                              </p>
                              <p className="text-slate-300">
                                {user.designation || "—"}
                              </p>
                            </div>
                          </>
                        )}

                        {/* Rejection reason */}
                        {user.rejectionReason && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="text-slate-500 mb-1">
                              Rejection Reason
                            </p>
                            <p className="text-red-400">
                              {user.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Dialog */}
      {reviewingUser && (
        <ReviewDialog
          user={reviewingUser}
          onClose={() => setReviewingUser(null)}
          onSuccess={onRefresh}
        />
      )}

      {/* Edit Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
