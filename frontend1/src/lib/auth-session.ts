import type { UserStatus } from "@/lib/auth";
import { AUTH_ROUTES, SETTINGS_ROUTES } from "@/lib/constants/routes";

interface SessionUser {
  status: UserStatus;
  passwordChangeRequired?: boolean;
}

/**
 * Returns a redirect target when the current session cannot access protected UI.
 * Returns null when the user may continue on the current path.
 */
export function resolveSessionRedirect(
  pathname: string,
  user: SessionUser | null,
  hasToken: boolean
): string | null {
  if (!hasToken || !user) {
    return `${AUTH_ROUTES.LOGIN}?from=${encodeURIComponent(pathname)}`;
  }

  if (user.status === "EMAIL_UNVERIFIED") {
    return `${AUTH_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent("")}`;
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
