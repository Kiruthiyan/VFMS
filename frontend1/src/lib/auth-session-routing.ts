import type { UserRole, UserStatus } from "@/lib/auth";
import { AUTH_ROUTES, SETTINGS_ROUTES } from "@/lib/constants/routes";

export interface SessionUser {
  role: UserRole;
  status: UserStatus;
  passwordChangeRequired?: boolean;
}

/**
 * Returns a redirect path when the current session should not access the page,
 * or null when access may continue.
 */
export function resolveSessionRedirect(
  user: SessionUser | null | undefined,
  accessToken: string | null | undefined,
  pathname: string
): string | null {
  if (!accessToken || !user) {
    return `${AUTH_ROUTES.LOGIN}?from=${encodeURIComponent(pathname)}`;
  }

  if (user.status === "EMAIL_UNVERIFIED") {
    return AUTH_ROUTES.VERIFY_EMAIL;
  }

  if (user.status === "PENDING_APPROVAL") {
    return `${AUTH_ROUTES.LOGIN}?pending=1`;
  }

  if (user.status === "REJECTED" || user.status === "DEACTIVATED") {
    return `${AUTH_ROUTES.LOGIN}?blocked=1`;
  }

  if (
    user.passwordChangeRequired &&
    !pathname.startsWith(SETTINGS_ROUTES.CHANGE_PASSWORD)
  ) {
    return SETTINGS_ROUTES.CHANGE_PASSWORD;
  }

  if (user.status !== "APPROVED") {
    return AUTH_ROUTES.LOGIN;
  }

  return null;
}
