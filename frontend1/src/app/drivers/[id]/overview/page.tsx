import { redirect } from 'next/navigation';

export default async function DriverOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/drivers/${id}`);
}
