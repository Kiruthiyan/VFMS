import { redirect } from 'next/navigation';
import { DRIVER_PORTAL_ROUTES } from '@/lib/constants/routes';

/**
 * /dashboards/driver → redirect to the default landing page (profile).
 * This keeps the URL clean while ensuring drivers land on the correct page.
 */
export default function DriverDashboardRoot() {
  redirect(DRIVER_PORTAL_ROUTES.PROFILE);
}
