"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { LoaderCircle, SearchCheck } from "lucide-react";

import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { CreateUserRequest, VerifiedStaffProfile } from "@/lib/api/admin";
import {
  createUserApi,
  getErrorMessage,
  getFieldErrors,
  getVerifiedStaffProfileApi,
} from "@/lib/api/admin";
import { ADMIN_MANAGED_ROLE_OPTIONS, ROLE_LABELS } from "@/lib/auth";

interface CreateUserFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  showCancelButton?: boolean;
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
      "Use this role only for verified drivers. Licence number and licence expiry date are required before the account is created.",
  },
} as const;

const inputClass =
  "w-full rounded-lg border border-[#E4E7EC] bg-white px-3 py-2.5 " +
  "text-sm text-[#101828] placeholder:text-[#667085] " +
  "focus:outline-none focus:ring-2 focus:ring-[#0B1736]/30 " +
  "focus:border-[#0B1736] disabled:opacity-50 transition-colors";

const labelClass = "mb-1.5 block text-xs font-semibold text-[#344054]";
const hintClass = "mt-1 text-xs leading-5 text-[#667085]";
const errorClass = "mt-1 text-xs text-red-500";
const readOnlyInputClass = `${inputClass} bg-slate-50 text-slate-700`;

/**
 * Keeps the admin user provisioning rules in one shared form so the dedicated
 * create page and any future inline workflows stay aligned with backend validation.
 */
export function CreateUserForm({
  onCancel,
  onSuccess,
  cancelLabel = "Cancel",
  submitLabel = "Create User",
  showCancelButton = true,
}: CreateUserFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [staffLookupError, setStaffLookupError] = useState<string | null>(null);
  const [isLoadingStaffProfile, setIsLoadingStaffProfile] = useState(false);
  const [staffProfile, setStaffProfile] = useState<VerifiedStaffProfile | null>(null);
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<CreateUserRequest>({
    shouldUnregister: true,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nic: "",
      role: "SYSTEM_USER",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });
  const watchedEmployeeId = useWatch({ control, name: "employeeId" });
  const roleGuidance = ROLE_GUIDANCE[selectedRole ?? "SYSTEM_USER"];
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

  const loadVerifiedStaffProfile = async () => {
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
      const profile = await getVerifiedStaffProfileApi(normalizedEmployeeId);
      setStaffProfile(profile);
      setResolvedEmployeeId(profile.employeeId);
      setStaffFormValues(profile);
      setValue("employeeId", profile.employeeId);
    } catch (err) {
      resetResolvedStaffProfile();
      const fieldErrors = getFieldErrors(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateUserRequest, {
            type: "server",
            message,
          });
        });
      }

      setStaffLookupError(getErrorMessage(err));
    } finally {
      setIsLoadingStaffProfile(false);
    }
  };

  const onSubmit = async (data: CreateUserRequest) => {
    setServerError(null);
    clearErrors();

    if (showStaffFields && !staffProfile) {
      setError("employeeId", {
        type: "manual",
        message: "Load the verified staff profile before creating this account.",
      });
      return;
    }

    try {
      await createUserApi(data);
      toast.success(
        "User created successfully. A welcome email with a temporary password has been sent."
      );
      onSuccess?.();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateUserRequest, {
            type: "server",
            message,
          });
        });
      }

      setServerError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <FormMessage type="error" message={serverError} />}

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Role *</label>
          <select
            {...register("role", { required: "Role is required." })}
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
      </div>

      {showStaffFields ? (
        <div className="space-y-4 rounded-2xl border border-[#E4E7EC] bg-[#F9FAFC] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
              Staff Verification
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              Enter the employee ID first. VFMS will load the verified staff profile from the company registry automatically.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <label className={labelClass}>Employee ID *</label>
              <input
                type="text"
                placeholder="EMP-XXX"
                {...register("employeeId", {
                  onBlur: () => {
                    void loadVerifiedStaffProfile();
                  },
                })}
                disabled={isSubmitting}
                className={inputClass}
              />
              <p className={hintClass}>Use the official staff ID from the company employee registry.</p>
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
                Review the registry details below before creating the user account.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                placeholder="Full name will appear here"
                {...register("fullName", { required: "Full name is required." })}
                readOnly
                disabled={isSubmitting}
                className={readOnlyInputClass}
              />
              {errors.fullName && (
                <p className={errorClass}>{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                placeholder="Email will appear here"
                {...register("email", { required: "Email address is required." })}
                readOnly
                disabled={isSubmitting}
                className={readOnlyInputClass}
              />
              {errors.email && (
                <p className={errorClass}>{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                type="tel"
                placeholder="Phone will appear here"
                {...register("phone", { required: "Phone number is required." })}
                readOnly
                disabled={isSubmitting}
                className={readOnlyInputClass}
              />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelClass}>NIC *</label>
              <input
                type="text"
                placeholder="NIC will appear here"
                {...register("nic", { required: "NIC is required." })}
                readOnly
                disabled={isSubmitting}
                className={readOnlyInputClass}
              />
              {errors.nic && <p className={errorClass}>{errors.nic.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Department *</label>
              <input
                type="text"
                placeholder="Department will appear here"
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
                placeholder="Designation will appear here"
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
              placeholder="Office location will appear here"
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
          <div className="space-y-4 rounded-2xl border border-[#E4E7EC] bg-[#F8FAFC] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">
                Account Setup
              </p>
              <p className="mt-1 text-sm text-[#667085]">
                Start with the verified identity details that will be used across the user profile and login records.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  {...register("fullName", { required: "Full name is required." })}
                  disabled={isSubmitting}
                  className={inputClass}
                />
                <p className={hintClass}>Use the official employee or driver name.</p>
                {errors.fullName && (
                  <p className={errorClass}>{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register("email", { required: "Email address is required." })}
                  disabled={isSubmitting}
                  className={inputClass}
                />
                <p className={hintClass}>The temporary password will be sent to this address.</p>
                {errors.email && (
                  <p className={errorClass}>{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                type="tel"
                placeholder="07XXXXXXXX"
                {...register("phone", { required: "Phone number is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              <p className={hintClass}>Use the primary contact number for this account.</p>
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelClass}>NIC *</label>
              <input
                type="text"
                placeholder="NIC number"
                {...register("nic", { required: "NIC is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              <p className={hintClass}>Enter the NIC exactly as recorded in company documents.</p>
              {errors.nic && <p className={errorClass}>{errors.nic.message}</p>}
            </div>
          </div>
        </>
      )}

      {showDriverFields && (
        <div className="space-y-4 rounded-2xl border border-[#E4E7EC] bg-[#F9FAFC] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
              Driver Details
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              Capture the verified licence and experience details before activating driver access.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Licence Number *</label>
              <input
                type="text"
                placeholder="Licence number"
                {...register("licenseNumber")}
                disabled={isSubmitting}
                className={inputClass}
              />
              <p className={hintClass}>Required for verified driver accounts.</p>
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
              <p className={hintClass}>The expiry date must be today or later.</p>
              {errors.licenseExpiryDate && (
                <p className={errorClass}>{errors.licenseExpiryDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Experience (Years)</label>
              <input
                type="number"
                min={0}
                placeholder="0"
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
                placeholder="Certifications"
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
        <div className="space-y-4 rounded-2xl border border-[#E4E7EC] bg-[#F9FAFC] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
              Approver Details
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              Add approval routing details when the approver participates in tiered workflows.
            </p>
          </div>

          <div>
            <label className={labelClass}>Approval Level</label>
            <input
              type="text"
              placeholder="e.g. Level 1 or Finance Approval"
              {...register("approvalLevel")}
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

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        {showCancelButton && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-[#E4E7EC] bg-[#F9FAFC] px-5 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F5F7FB] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0B1736] px-5 text-sm font-bold text-white shadow-lg shadow-[0_0_20px_rgba(11,23,54,0.15)] transition-colors hover:bg-[#122347] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <LoadingSpinner size={14} />}
          {isSubmitting ? "Creating..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
