import { redirect } from 'next/navigation';

export default async function DriverTripsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/drivers/${id}?tab=trips`);
}
