'use client';

import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, UserRound, X, Hash, User, CreditCard, Mail, Phone, FileText, Calendar, Award, Briefcase } from 'lucide-react';
import { apiFetch, getErrorMessage, resolveBackendAssetUrl } from '@/lib/api';
import { getDriverDisplayId } from '@/lib/driver-display';
import { DriverDocument } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

import { DriverLicensesTab } from '@/components/drivers/DriverLicensesTab';
import { DriverCertificationsTab } from '@/components/drivers/DriverCertificationsTab';
import { DriverDocumentsTab } from '@/components/drivers/DriverDocumentsTab';
import { DriverTripsTab } from '@/components/drivers/DriverTripsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverQuickList } from '@/components/driver/DriverQuickList';
import { queryKeys } from '@/lib/query-keys';

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
	/** Future Trip Scheduling / Staff Dashboard integration value from 0 to 100. */
	ratingPercentage?: number | null;
	/** Future Trip Scheduling / Staff Dashboard feedback entries. */
	feedbacks?: DriverFeedback[];
}

interface DriverFeedback {
	id?: string | null;
	ratingPercentage?: number | null;
	feedback?: string | null;
	comment?: string | null;
	givenBy?: string | null;
	createdAt?: string | null;
}

export default function DriverDetailsPage() {

	const params = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const id = params?.id; // This is the USER id from the users table
	const requestedTab = searchParams.get('tab') || 'overview';
	const initialTab = ['overview', 'licenses', 'certifications', 'documents', 'trips', 'feedbacks'].includes(requestedTab)
		? requestedTab
		: 'overview';

	const [showProfilePicturePreview, setShowProfilePicturePreview] = useState(false);
	const {
		data,
		error,
		isLoading: loading,
	} = useQuery({
		queryKey: queryKeys.driver(id ?? ''),
		enabled: Boolean(id),
		queryFn: async () => {
			if (!id) throw new Error('Driver user id is missing from URL.');
			const driverUser = await apiFetch<DriverUserDetail>(`/api/drivers/from-users/${id}`);
			let profilePicture: DriverDocument | null = null;
			if (driverUser.id) {
				try {
					profilePicture = await apiFetch<DriverDocument>(`/api/drivers/${driverUser.id}/profile-picture`);
				} catch {
					profilePicture = null;
				}
			}
			return { driverUser, profilePicture };
		},
	});
	const driverUser = data?.driverUser ?? null;
	const profilePicture = data?.profilePicture ?? null;
	const errorMessage = error ? getErrorMessage(error) : null;
	const profilePictureUrl = profilePicture?.fileUrl ? resolveBackendAssetUrl(profilePicture.fileUrl) : '';
	const displayDriverId = getDriverDisplayId(driverUser?.employeeId, '-');

	/** User UUID — same value used for all driver sub-resource APIs */
	const driverResourceId = id;
	const linkedDriverId = driverUser?.driverId ?? null;

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

							{!loading && errorMessage && (
								<p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
									{errorMessage}
								</p>
							)}

							{!loading && !errorMessage && driverUser && id && (
								<Tabs defaultValue={initialTab} className="w-full">
									<div className="w-full overflow-x-auto mb-6">
										<TabsList className="w-full flex border-b border-slate-200 bg-transparent h-auto p-0 rounded-none justify-start">
											<TabsTrigger value="overview" className="px-6 py-3 text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-blue-950 data-[state=active]:text-blue-950 text-slate-500 hover:text-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Overview</TabsTrigger>
											<TabsTrigger value="licenses" className="px-6 py-3 text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-blue-950 data-[state=active]:text-blue-950 text-slate-500 hover:text-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Licenses</TabsTrigger>
											<TabsTrigger value="certifications" className="px-6 py-3 text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-blue-950 data-[state=active]:text-blue-950 text-slate-500 hover:text-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Certs</TabsTrigger>
											<TabsTrigger value="documents" className="px-6 py-3 text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-blue-950 data-[state=active]:text-blue-950 text-slate-500 hover:text-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Documents</TabsTrigger>
											<TabsTrigger value="trips" className="px-6 py-3 text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-blue-950 data-[state=active]:text-blue-950 text-slate-500 hover:text-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Trips</TabsTrigger>
											<TabsTrigger value="feedbacks" className="px-6 py-3 text-sm font-medium transition-colors border-b-2 border-transparent data-[state=active]:border-blue-950 data-[state=active]:text-blue-950 text-slate-500 hover:text-slate-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Feedbacks</TabsTrigger>
										</TabsList>
									</div>

									<TabsContent value="overview" className="mt-0">
										<div className="flex flex-col gap-6 md:flex-row">
											<div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm md:w-64">
												<button
													type="button"
													onClick={() => profilePicture && setShowProfilePicturePreview(true)}
													aria-label={profilePicture ? "View uploaded profile picture" : "No profile picture"}
													className={`h-32 w-32 overflow-hidden rounded-full border-4 border-slate-50 shadow-sm bg-slate-100 flex items-center justify-center ${profilePicture ? 'cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2' : 'cursor-default'}`}
												>
													{profilePicture ? (
														<img
															src={profilePictureUrl}
															alt="Driver Profile Picture"
															className="h-full w-full object-cover"
															onError={(e) => {
																(e.target as HTMLImageElement).style.display = 'none';
															}}
														/>
													) : (
														<UserRound className="h-12 w-12 text-slate-300" />
													)}
												</button>
												<p className="text-center text-sm font-bold text-slate-900 mt-4">{driverUser.fullName}</p>
												<div className="mt-2">
													<StatusBadge status={driverUser.status} />
												</div>
											</div>

											<div className="flex-1 grid gap-4 md:grid-cols-2">
												<div className="vfms-detail-tile">
													<Hash className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">Driver ID</p>
														<p className="vfms-detail-value">{displayDriverId}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<User className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">Full Name</p>
														<p className="vfms-detail-value">{driverUser.fullName || '-'}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<CreditCard className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">NIC</p>
														<p className="vfms-detail-value">{driverUser.nic || '-'}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<Mail className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">Email</p>
														<p className="vfms-detail-value">{driverUser.email || '-'}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<Phone className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">Phone</p>
														<p className="vfms-detail-value">{driverUser.phone || '-'}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<FileText className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">License Number</p>
														<p className="vfms-detail-value">{driverUser.licenseNumber || '-'}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<Calendar className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">License Expiry Date</p>
														<p className="vfms-detail-value">{driverUser.licenseExpiryDate || '-'}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<Award className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">Certifications</p>
														<p className="vfms-detail-value">{driverUser.certifications || '-'}</p>
													</div>
												</div>
												<div className="vfms-detail-tile">
													<Briefcase className="h-5 w-5 text-blue-600" />
													<div>
														<p className="vfms-detail-label">Experience (Years)</p>
														<p className="vfms-detail-value">{driverUser.experienceYears != null ? String(driverUser.experienceYears) : '-'}</p>
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
										<DriverDocumentsTab driverId={driverResourceId} />
									</TabsContent>

									<TabsContent value="trips">
										<DriverTripsTab driverId={driverResourceId} />
									</TabsContent>

									<TabsContent value="feedbacks">
										<DriverFeedbacksTab driverUserId={id ?? ''} />
									</TabsContent>
								</Tabs>
							)}
						</CardContent>
					</Card>
				</div>

				{driverUser && !loading && !errorMessage && (
					<DriverQuickList activeDriverId={linkedDriverId ?? driverUser.id} />
				)}
			</div>

			{showProfilePicturePreview && profilePictureUrl && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
					role="dialog"
					aria-modal="true"
					aria-label="Driver profile picture preview"
					onClick={() => setShowProfilePicturePreview(false)}
				>
					<div className="relative max-h-[90vh] max-w-4xl" onClick={(event) => event.stopPropagation()}>
						<button
							type="button"
							onClick={() => setShowProfilePicturePreview(false)}
							aria-label="Close profile picture preview"
							className="absolute -right-3 -top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg transition-colors hover:bg-muted"
						>
							<X className="h-5 w-5" />
						</button>
						<img
							src={profilePictureUrl}
							alt="Driver Profile Picture Large View"
							className="max-h-[90vh] max-w-full rounded-lg border border-border bg-background object-contain shadow-2xl"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

function getSafeRatingPercentage(ratingPercentage?: number | null) {
	if (typeof ratingPercentage !== 'number' || Number.isNaN(ratingPercentage)) return null;
	return Math.min(100, Math.max(0, ratingPercentage));
}

function DriverStarRating({ ratingPercentage }: { ratingPercentage?: number | null }) {
	const safeRating = getSafeRatingPercentage(ratingPercentage);

	if (safeRating === null) {
		return <span className="text-xs font-medium text-muted-foreground">Not rated</span>;
	}

	return (
		<div className="inline-flex items-center gap-2" title={`${safeRating}% driver rating`}>
			<div className="relative h-5 w-[7.1rem]" aria-label={`${safeRating}% driver rating`}>
				<div className="absolute inset-0 flex gap-0.5 text-muted-foreground/35">
					{Array.from({ length: 5 }).map((_, index) => (
						<Star key={`empty-${index}`} className="h-5 w-5" />
					))}
				</div>
				<div className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-500" style={{ width: `${safeRating}%` }}>
					{Array.from({ length: 5 }).map((_, index) => (
						<Star key={`filled-${index}`} className="h-5 w-5 shrink-0 fill-current" />
					))}
				</div>
			</div>
			<span className="text-sm font-semibold text-foreground">{safeRating}%</span>
		</div>
	);
}

function DriverFeedbacksTab({ driverUserId }: { driverUserId: string }) {
	const [trips, setTrips] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		if (!driverUserId) return;
		setLoading(true);
		apiFetch<any[]>(`/api/trips/driver/${driverUserId}`)
			.then(data => setTrips(Array.isArray(data) ? data : []))
			.catch(() => setTrips([]))
			.finally(() => setLoading(false));
	}, [driverUserId]);

	const ratedTrips = trips.filter(t => t.driverRating && t.driverRating > 0);
	const avgRating = ratedTrips.length > 0
		? ratedTrips.reduce((sum: number, t: any) => sum + t.driverRating, 0) / ratedTrips.length
		: null;

	const formatDate = (d: string) =>
		new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

	return (
		<Card>
			<CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
				<CardTitle className="text-sm font-semibold">Driver Feedbacks</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 px-4 pb-4 pt-4">
				{/* Overall Rating */}
				<div className="rounded-lg border border-border bg-background p-4">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Rating</p>
					{loading ? (
						<p className="text-xs text-muted-foreground">Loading…</p>
					) : avgRating !== null ? (
						<div className="flex items-center gap-3">
							<div className="flex gap-0.5">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										className={`h-6 w-6 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
									/>
								))}
							</div>
							<span className="text-2xl font-black text-foreground">{avgRating.toFixed(1)}</span>
							<span className="text-sm text-muted-foreground">/ 5.0 ({ratedTrips.length} {ratedTrips.length === 1 ? 'rating' : 'ratings'})</span>
						</div>
					) : (
						<p className="text-xs text-muted-foreground">No ratings yet. Ratings appear after completed trips are reviewed.</p>
					)}
				</div>

				{/* Individual Feedback Entries */}
				<div className="space-y-2">
					{loading && <p className="py-4 text-center text-xs text-muted-foreground">Loading feedbacks…</p>}
					{!loading && ratedTrips.map((trip: any) => (
						<div key={trip.id} className="rounded-lg border border-border p-3">
							<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
								<div className="flex gap-0.5">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star
											key={i}
											className={`h-4 w-4 ${i < trip.driverRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
										/>
									))}
								</div>
								<span className="text-xs text-muted-foreground">
									{trip.endTime ? formatDate(trip.endTime) : trip.updatedAt ? formatDate(trip.updatedAt) : 'Date not available'}
								</span>
							</div>
							{trip.driverFeedback && (
								<p className="text-sm text-foreground italic">"{trip.driverFeedback}"</p>
							)}
							<p className="mt-1 text-xs text-muted-foreground truncate" title={trip.destination}>
								Trip: {trip.destination ? trip.destination.replace(/ -> /g, ' → ') : 'N/A'}
							</p>
						</div>
					))}
					{!loading && ratedTrips.length === 0 && (
						<p className="py-4 text-center text-xs text-muted-foreground">
							No feedbacks yet. Feedback from completed trip ratings will appear here.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
