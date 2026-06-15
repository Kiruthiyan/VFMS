'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, UserRound } from 'lucide-react';
import { apiFetch, getErrorMessage, resolveBackendAssetUrl } from '@/lib/api';
import { DriverDocument } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

import { DriverLicensesTab } from '@/components/drivers/DriverLicensesTab';
import { DriverCertificationsTab } from '@/components/drivers/DriverCertificationsTab';
import { DriverDocumentsTab } from '@/components/drivers/DriverDocumentsTab';
import { DriverInfractionsTab } from '@/components/drivers/DriverInfractionsTab';
import { DriverTripsTab } from '@/components/drivers/DriverTripsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverQuickList } from '@/components/driver/DriverQuickList';
import { useUser } from '@/lib/useUser';

/** Shape returned by GET /api/drivers/from-users/{userId} */
interface DriverUserDetail {
	id: string;
	employeeId: string | null;
	fullName: string;
	email: string;
	phone: string;
	nic: string;
	licenseNumber: string | null;
	licenseExpiryDate: string | null;
	certifications: string | null;
	experienceYears: number | null;
	status: string;
	createdAt: string;
	updatedAt: string | null;
	/** Linked driver-table UUID (resolved by email). Used for sub-resource tabs. */
	driverId: string | null;
}

export default function DriverDetailsPage() {

	const { isApprover } = useUser();
	const params = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const id = params?.id; // This is the USER id from the users table
	const requestedTab = searchParams.get('tab') || 'overview';
	const initialTab = ['overview', 'licenses', 'certifications', 'documents', 'infractions', 'trips'].includes(requestedTab)
		? requestedTab
		: 'overview';

	const [driverUser, setDriverUser] = useState<DriverUserDetail | null>(null);
	const [profilePicture, setProfilePicture] = useState<DriverDocument | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const profilePictureUrl = profilePicture?.fileUrl ? resolveBackendAssetUrl(profilePicture.fileUrl) : '';

	/** User UUID — same value used for all driver sub-resource APIs */
	const driverResourceId = id;
	const linkedDriverId = driverUser?.driverId ?? null;

	const fetchDriverUser = async () => {
		if (!id) {
			setError('Driver user id is missing from URL.');
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			// Fetch user-creation data from users table
			const data = await apiFetch<DriverUserDetail>(`/api/drivers/from-users/${id}`);
			setDriverUser(data);

			// Fetch profile picture using user UUID
			if (data.id) {
				try {
					const profilePic = await apiFetch<DriverDocument>(`/api/drivers/${data.id}/profile-picture`);
					setProfilePicture(profilePic);
				} catch (e) {
					setProfilePicture(null);
				}
			}
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchDriverUser();
	}, [id]);

	return (
		<div className="p-6 md:p-8 space-y-6 animate-fade-in">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'hsl(var(--primary))' }}>
						<UserRound className="w-5 h-5" style={{ color: 'hsl(var(--primary-foreground))' }} />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Driver Profile {driverUser && !loading && `- ${driverUser.fullName}`}
						</h1>
						<p className="text-sm font-medium text-muted-foreground mt-1">
							{driverUser && !loading ? `${driverUser.email}` : 'Driver details view'}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Link href="/drivers" className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-border hover:bg-muted transition-colors">
						<ArrowLeft className="w-4 h-4" />
						Back
					</Link>
					{isApprover && (
						<Link href="/dashboards/approver" className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
							Back to Approver Dashboard
						</Link>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-6 xl:flex-row xl:items-start">
				<div className="min-w-0 flex-1">
					<Card className="shadow-sm border-muted">
						<CardHeader className="pb-4">
							<CardTitle className="text-base font-semibold">Driver Monitoring</CardTitle>
						</CardHeader>
						<CardContent>
							{loading && <p className="text-sm text-muted-foreground">Loading driver...</p>}

							{!loading && error && (
								<p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
									{error}
								</p>
							)}

							{!loading && !error && driverUser && id && (
								<Tabs defaultValue={initialTab} className="w-full">
									<div className="w-full overflow-x-auto border-b border-border mb-4 pb-px">
										<TabsList className="flex gap-2 w-max whitespace-nowrap bg-transparent h-auto p-0">
											<TabsTrigger value="overview" className="px-4 py-2 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground inline-flex">Overview</TabsTrigger>
											<TabsTrigger value="licenses" className="px-4 py-2 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground inline-flex">Licenses</TabsTrigger>
											<TabsTrigger value="certifications" className="px-4 py-2 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground inline-flex">Certs</TabsTrigger>
											<TabsTrigger value="documents" className="px-4 py-2 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground inline-flex">Documents</TabsTrigger>
											<TabsTrigger value="infractions" className="px-4 py-2 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground inline-flex">Infractions</TabsTrigger>
											<TabsTrigger value="trips" className="px-4 py-2 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground inline-flex">Trips</TabsTrigger>
										</TabsList>
									</div>

									<TabsContent value="overview" className="mt-0">
										<div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3 bg-muted/20 p-6 rounded-lg border border-border">
											{profilePicture && (
												<div className="md:col-span-1 flex flex-col items-center">
													<div className="mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-sm bg-muted flex items-center justify-center">
														<img
															src={profilePictureUrl}
															alt="Driver Profile Picture"
															className="h-full w-full object-cover"
															onError={(e) => {
																(e.target as HTMLImageElement).style.display = 'none';
															}}
														/>
													</div>
													<p className="text-center text-xs font-semibold text-muted-foreground">{driverUser.fullName}</p>
												</div>
											)}
											<div className={profilePicture ? 'md:col-span-2' : 'md:col-span-3'}>
												<div className="grid grid-cols-1 gap-y-5 gap-x-8 md:grid-cols-2">
													<Detail label="Driver ID" value={driverUser.employeeId ?? undefined} />
													<Detail label="Full Name" value={driverUser.fullName} />
													<Detail label="NIC" value={driverUser.nic} />
													<Detail label="Email" value={driverUser.email} />
													<Detail label="Phone" value={driverUser.phone} />
													<Detail label="License Number" value={driverUser.licenseNumber ?? undefined} />
													<Detail label="License Expiry Date" value={driverUser.licenseExpiryDate ?? undefined} />
													<Detail label="Certifications" value={driverUser.certifications ?? undefined} />
													<Detail label="Experience (Years)" value={driverUser.experienceYears != null ? String(driverUser.experienceYears) : undefined} />
													<div className="space-y-1.5">
														<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
														<StatusBadge status={driverUser.status} />
													</div>
												</div>
											</div>
										</div>
									</TabsContent>

									<TabsContent value="licenses">
										<DriverLicensesTab driverId={driverResourceId} />
									</TabsContent>

									<TabsContent value="certifications">
										<DriverCertificationsTab driverId={driverResourceId} />
									</TabsContent>

									<TabsContent value="documents">
										<DriverDocumentsTab
											driverId={driverResourceId}
											onProfilePictureUpload={async () => {
												try {
													const profilePic = await apiFetch<DriverDocument>(`/api/drivers/${driverResourceId}/profile-picture`);
													setProfilePicture(profilePic);
												} catch (e) {
													setProfilePicture(null);
												}
											}}
										/>
									</TabsContent>

									<TabsContent value="infractions">
										<DriverInfractionsTab driverId={driverResourceId} />
									</TabsContent>

									<TabsContent value="trips">
										<DriverTripsTab driverId={driverResourceId} />
									</TabsContent>
								</Tabs>
							)}
						</CardContent>
					</Card>
				</div>

				{driverUser && !loading && !error && (
					<DriverQuickList activeDriverId={linkedDriverId ?? driverUser.id} />
				)}
			</div>
		</div>
	);
}

function Detail({ label, value, className }: { label: string; value?: string; className?: string }) {
	return (
		<div className={className}>
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
			<p className="text-sm font-medium text-foreground mt-1">{value || '-'}</p>
		</div>
	);
}
