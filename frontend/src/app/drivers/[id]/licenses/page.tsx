import { redirect } from 'next/navigation';

export default async function DriverLicensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/drivers/${id}?tab=licenses`);
}