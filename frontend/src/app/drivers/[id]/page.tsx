'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, UserRound, X, Hash, User, CreditCard, Mail, Phone, FileText, Calendar, Award, Briefcase } from 'lucide-react';
import { apiFetch, getErrorMessage, resolveBackendAssetUrl } from '@/lib/api';
import { DriverDocument } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

import { DriverLicensesTab } from '@/components/drivers/DriverLicensesTab';
import { DriverCertificationsTab } from '@/components/drivers/DriverCertificationsTab';
import { DriverDocumentsTab } from '@/components/drivers/DriverDocumentsTab';
import { DriverTripsTab } from '@/components/drivers/DriverTripsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverQuickList } from '@/components/driver/DriverQuickList';

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

	const [driverUser, setDriverUser] = useState<DriverUserDetail | null>(null);
	const [profilePicture, setProfilePicture] = useState<DriverDocument | null>(null);
	const [showProfilePicturePreview, setShowProfilePicturePreview] = useState(false);
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
				} catch {
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
														<p className="vfms-detail-value">{driverUser.employeeId || '-'}</p>
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
										<DriverFeedbacksTab
											ratingPercentage={driverUser.ratingPercentage}
											feedbacks={driverUser.feedbacks ?? []}
										/>
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

function Detail({ label, value, className }: { label: string; value?: string; className?: string }) {
	return (
		<div className={className}>
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
			<p className="text-sm font-medium text-foreground mt-1">{value || '-'}</p>
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

function DriverFeedbacksTab({
	ratingPercentage,
	feedbacks,
}: {
	ratingPercentage?: number | null;
	feedbacks: DriverFeedback[];
}) {
	return (
		<Card>
			<CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
				<CardTitle className="text-sm font-semibold">Driver Feedbacks</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 px-4 pb-4 pt-4">
				<div className="rounded-lg border border-border bg-background p-4">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Rating</p>
					<DriverStarRating ratingPercentage={ratingPercentage} />
					<p className="mt-2 text-xs text-muted-foreground">
						Rating will sync from staff trip scheduling feedback.
					</p>
				</div>

				<div className="space-y-2">
					{feedbacks.map((item, index) => (
						<div key={item.id ?? index} className="rounded-lg border border-border p-3">
							<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
								<DriverStarRating ratingPercentage={item.ratingPercentage} />
								<span className="text-xs text-muted-foreground">{item.createdAt ?? 'Date not available'}</span>
							</div>
							<p className="text-sm text-foreground">{item.feedback || item.comment || 'No feedback comment provided.'}</p>
							<p className="mt-2 text-xs text-muted-foreground">Given by: {item.givenBy || 'Staff'}</p>
						</div>
					))}

					{feedbacks.length === 0 && (
						<p className="py-4 text-center text-xs text-muted-foreground">
							No feedbacks yet. Feedbacks from Staff Dashboard / Trip Scheduling will appear here.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
