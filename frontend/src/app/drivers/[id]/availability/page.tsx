import { redirect } from 'next/navigation';

export default async function DriverAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/drivers/${id}?tab=availability`);
}