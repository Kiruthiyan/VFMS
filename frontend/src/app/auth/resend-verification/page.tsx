import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/lib/constants/routes";

export default function ResendVerificationPage() {
  redirect(AUTH_ROUTES.VERIFY_EMAIL);
}
