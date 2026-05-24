import { redirect } from 'next/navigation';

export default async function DriverQualificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/drivers/${id}?tab=qualification`);
}