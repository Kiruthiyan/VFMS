"use client";

import { LoaderCircle, SearchCheck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  getErrorMessage,
  getFieldErrors,
  getVerifiedStaffProfileApi,
  updateUserApi,
  type UpdateUserRequest,
  type UserSummary,
  type VerifiedStaffProfile,
} from "@/lib/api/admin";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ADMIN_MANAGED_ROLE_OPTIONS, ROLE_LABELS } from "@/lib/auth";

interface EditUserDialogProps {
  user: UserSummary;
  onClose: () => void;
  onSuccess: (updated?: UserSummary) => void;
}

const ROLE_GUIDANCE = {
  ADMIN: {
    title: "Administrator access",
    description:
      "Use this role for trusted platform administrators who manage users, approvals, and system-wide operations.",
  },
  APPROVER: {
    title: "Approver access",
    description:
      "Use this role for staff who review and authorize operational actions. Approval level can be added if your workflow uses approval tiers.",
  },
  SYSTEM_USER: {
    title: "Staff account",
    description:
      "Use this role for company staff who need day-to-day access. Employee ID, department, designation, and office location are required.",
  },
  DRIVER: {
    title: "Driver account",
    description:
      "Use this role only for verified drivers. Licence number and licence expiry date are required before the account is approved.",
  },
} as const;

const inputClass =
  "w-full rounded-lg border border-[#E4E7EC] bg-white px-3 py-2.5 " +
  "text-sm text-[#101828] placeholder:text-[#667085] " +
  "focus:outline-none focus:ring-2 focus:ring-[#0B1736]/30 " +
  "focus:border-[#0B1736] disabled:opacity-50 transition-colors";

const labelClass = "block text-xs font-semibold text-[#344054] mb-1.5";
const hintClass = "mt-1 text-xs leading-5 text-[#667085]";
const errorClass = "mt-1 text-xs text-red-500";
const readOnlyInputClass = `${inputClass} bg-slate-50 text-slate-700`;

export function EditUserDialog({
  user,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [staffLookupError, setStaffLookupError] = useState<string | null>(null);
  const [isLoadingStaffProfile, setIsLoadingStaffProfile] = useState(false);
  const [staffProfile, setStaffProfile] = useState<VerifiedStaffProfile | null>(
    user.role === "SYSTEM_USER" && user.employeeId
      ? {
          employeeId: user.employeeId,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          nic: user.nic,
          department: user.department ?? "",
          designation: user.designation ?? "",
          officeLocation: user.officeLocation ?? "",
        }
      : null
  );
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState<string | null>(
    user.role === "SYSTEM_USER" ? user.employeeId : null
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<UpdateUserRequest>({
    shouldUnregister: true,
    defaultValues: {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      nic: user.nic ?? "",
      role: user.role,
      licenseNumber: user.licenseNumber ?? "",
      licenseExpiryDate: user.licenseExpiryDate ?? "",
      certifications: user.certifications ?? "",
      experienceYears: user.experienceYears ?? undefined,
      employeeId: user.employeeId ?? "",
      department: user.department ?? "",
      officeLocation: user.officeLocation ?? "",
      designation: user.designation ?? "",
      approvalLevel: user.approvalLevel ?? "",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });
  const watchedEmployeeId = useWatch({ control, name: "employeeId" });
  const roleGuidance = ROLE_GUIDANCE[selectedRole ?? user.role];
  const showDriverFields = selectedRole === "DRIVER";
  const showStaffFields = selectedRole === "SYSTEM_USER";
  const showApproverFields = selectedRole === "APPROVER";
  const normalizedEmployeeId = watchedEmployeeId?.trim().toUpperCase() ?? "";

  const setStaffFormValues = useCallback((profile: VerifiedStaffProfile | null) => {
    setValue("fullName", profile?.fullName ?? "");
    setValue("email", profile?.email ?? "");
    setValue("phone", profile?.phone ?? "");
    setValue("nic", profile?.nic ?? "");
    setValue("department", profile?.department ?? "");
    setValue("designation", profile?.designation ?? "");
    setValue("officeLocation", profile?.officeLocation ?? "");
  }, [setValue]);

  const resetResolvedStaffProfile = useCallback(() => {
    setStaffProfile(null);
    setResolvedEmployeeId(null);
    setStaffLookupError(null);
    setStaffFormValues(null);
  }, [setStaffFormValues]);

  const loadVerifiedStaffProfile = useCallback(async () => {
    if (!showStaffFields) {
      return;
    }

    if (!normalizedEmployeeId) {
      setError("employeeId", {
        type: "manual",
        message: "Enter the employee ID to load verified staff details.",
      });
      resetResolvedStaffProfile();
      return;
    }

    setIsLoadingStaffProfile(true);
    setStaffLookupError(null);
    clearErrors([
      "employeeId",
      "fullName",
      "email",
      "phone",
      "nic",
      "department",
      "designation",
      "officeLocation",
    ]);

    try {
      const profile = await getVerifiedStaffProfileApi(normalizedEmployeeId, {
        excludeUserId: user.id,
      });
      setStaffProfile(profile);
      setResolvedEmployeeId(profile.employeeId);
      setStaffFormValues(profile);
      setValue("employeeId", profile.employeeId);
    } catch (err) {
      resetResolvedStaffProfile();
      const fieldErrors = getFieldErrors(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof UpdateUserRequest, {
            type: "server",
            message,
          });
        });
      }

      setStaffLookupError(getErrorMessage(err));
    } finally {
      setIsLoadingStaffProfile(false);
    }
  }, [
    clearErrors,
    normalizedEmployeeId,
    resetResolvedStaffProfile,
    setError,
    setStaffFormValues,
    setValue,
    showStaffFields,
    user.id,
  ]);

  useEffect(() => {
    if (!showStaffFields) {
      resetResolvedStaffProfile();
      return;
    }

    if (!normalizedEmployeeId) {
      resetResolvedStaffProfile();
      return;
    }

    if (resolvedEmployeeId && normalizedEmployeeId !== resolvedEmployeeId) {
      setStaffProfile(null);
      setResolvedEmployeeId(null);
      setStaffLookupError(null);
      setStaffFormValues(null);
    }
  }, [
    normalizedEmployeeId,
    resetResolvedStaffProfile,
    resolvedEmployeeId,
    setStaffFormValues,
    showStaffFields,
  ]);

  useEffect(() => {
    if (
      showStaffFields &&
      normalizedEmployeeId &&
      !resolvedEmployeeId &&
      !isLoadingStaffProfile
    ) {
      void loadVerifiedStaffProfile();
    }
  }, [
    isLoadingStaffProfile,
    loadVerifiedStaffProfile,
    normalizedEmployeeId,
    resolvedEmployeeId,
    showStaffFields,
  ]);

  const onSubmit = async (data: UpdateUserRequest) => {
    setServerError(null);
    clearErrors();

    if (showStaffFields && !staffProfile) {
      setError("employeeId", {
        type: "manual",
        message: "Load the verified staff profile before saving this account.",
      });
      return;
    }

    try {
      const updated = await updateUserApi(user.id, data);
      toast.success("User details updated.");
      onSuccess(updated);
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof UpdateUserRequest, {
            type: "server",
            message,
          });
        });
      }

      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-lg">
        <div className="flex items-start justify-between bg-[#0B1736] px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">Edit User</h3>
            <p className="mt-0.5 text-sm text-white opacity-90">
              {user.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-white opacity-90 transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 overflow-y-auto p-6"
        >
          {serverError && <FormMessage type="error" message={serverError} />}

          <div>
            <label className={labelClass}>Role</label>
            <select
              {...register("role")}
              disabled={isSubmitting}
              className={inputClass}
            >
              {ADMIN_MANAGED_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3">
            <p className="text-sm font-semibold text-[#101828]">
              {roleGuidance.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#667085]">
              {roleGuidance.description}
            </p>
          </div>

          {showStaffFields ? (
            <div className="space-y-4 rounded-2xl border border-[#E4E7EC] bg-[#F9FAFC] p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
                  Staff Verification
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  Load the staff profile from the company registry before saving changes.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <label className={labelClass}>Employee ID *</label>
                  <input
                    type="text"
                    {...register("employeeId", {
                      onBlur: () => {
                        void loadVerifiedStaffProfile();
                      },
                    })}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  <p className={hintClass}>Use the staff ID from the verified company registry.</p>
                  {errors.employeeId && (
                    <p className={errorClass}>{errors.employeeId.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void loadVerifiedStaffProfile()}
                  disabled={isSubmitting || isLoadingStaffProfile}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingStaffProfile ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchCheck className="h-4 w-4" />
                  )}
                  Load Details
                </button>
              </div>

              {staffLookupError && (
                <FormMessage type="error" message={staffLookupError} />
              )}

              {staffProfile && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-900">
                    Verified company staff profile loaded
                  </p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Confirm these registry details before saving the updated account.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    {...register("fullName")}
                    readOnly
                    disabled={isSubmitting}
                    className={readOnlyInputClass}
                  />
                  {errors.fullName && (
                    <p className={errorClass}>{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    readOnly
                    disabled={isSubmitting}
                    className={readOnlyInputClass}
                  />
                  {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    {...register("phone")}
                    readOnly
                    disabled={isSubmitting}
                    className={readOnlyInputClass}
                  />
                  {errors.phone && (
                    <p className={errorClass}>{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>NIC</label>
                  <input
                    type="text"
                    {...register("nic")}
                    readOnly
                    disabled={isSubmitting}
                    className={readOnlyInputClass}
                  />
                  {errors.nic && (
                    <p className={errorClass}>{errors.nic.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Department *</label>
                  <input
                    type="text"
                    {...register("department")}
                    readOnly
                    disabled={isSubmitting}
                    className={readOnlyInputClass}
                  />
                  {errors.department && (
                    <p className={errorClass}>{errors.department.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Designation *</label>
                  <input
                    type="text"
                    {...register("designation")}
                    readOnly
                    disabled={isSubmitting}
                    className={readOnlyInputClass}
                  />
                  {errors.designation && (
                    <p className={errorClass}>{errors.designation.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Office Location *</label>
                <input
                  type="text"
                  {...register("officeLocation")}
                  readOnly
                  disabled={isSubmitting}
                  className={readOnlyInputClass}
                />
                {errors.officeLocation && (
                  <p className={errorClass}>{errors.officeLocation.message}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    {...register("fullName")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  {errors.fullName && (
                    <p className={errorClass}>{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    {...register("phone")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  <p className={hintClass}>Update the primary contact number if needed.</p>
                  {errors.phone && (
                    <p className={errorClass}>{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>NIC</label>
                  <input
                    type="text"
                    {...register("nic")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  {errors.nic && (
                    <p className={errorClass}>{errors.nic.message}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {showDriverFields && (
            <div className="space-y-4 rounded-2xl border border-[#E4E7EC] bg-[#F9FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
                Driver Details
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Licence Number *</label>
                  <input
                    type="text"
                    {...register("licenseNumber")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  {errors.licenseNumber && (
                    <p className={errorClass}>{errors.licenseNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Licence Expiry Date *</label>
                  <input
                    type="date"
                    {...register("licenseExpiryDate")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  {errors.licenseExpiryDate && (
                    <p className={errorClass}>{errors.licenseExpiryDate.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    {...register("experienceYears", { valueAsNumber: true })}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  <p className={hintClass}>Optional but recommended for driver profiles.</p>
                </div>
                <div>
                  <label className={labelClass}>Certifications</label>
                  <input
                    type="text"
                    {...register("certifications")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                  <p className={hintClass}>Add licence classes or fleet-related certifications.</p>
                </div>
              </div>
            </div>
          )}

          {showApproverFields && (
            <div className="space-y-4 rounded-2xl border border-[#E4E7EC] bg-[#F9FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
                Approver Details
              </p>
              <div>
                <label className={labelClass}>Approval Level</label>
                <input
                  type="text"
                  {...register("approvalLevel")}
                  placeholder="e.g. Level 1 or Finance Approval"
                  disabled={isSubmitting}
                  className={inputClass}
                />
                <p className={hintClass}>
                  Optional. Use this when your approval workflow has tiers or domain-specific approvers.
                </p>
                {errors.approvalLevel && (
                  <p className={errorClass}>{errors.approvalLevel.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-[#E4E7EC] bg-[#F9FAFC] text-sm font-medium text-[#475467] transition-colors hover:bg-[#F5F7FB] disabled:opacity-50 h-11"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0B1736] text-sm font-bold text-white shadow-lg shadow-[0_0_20px_rgba(11,23,54,0.15)] transition-colors hover:bg-[#122347] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoadingSpinner size={14} />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
