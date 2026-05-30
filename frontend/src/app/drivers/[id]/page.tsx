'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, UserRound } from 'lucide-react';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { Driver, DriverDocument } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DriverForm } from '@/components/drivers/DriverForm';
import { DriverLicensesTab } from '@/components/drivers/DriverLicensesTab';
import { DriverCertificationsTab } from '@/components/drivers/DriverCertificationsTab';
import { DriverDocumentsTab } from '@/components/drivers/DriverDocumentsTab';
import { DriverAvailabilityTab } from '@/components/drivers/DriverAvailabilityTab';
import { DriverInfractionsTab } from '@/components/drivers/DriverInfractionsTab';
import { DriverQualificationTab } from '@/components/drivers/DriverQualificationTab';
import { DriverTripsTab } from '@/components/drivers/DriverTripsTab';
import { DriverLeaveRequestDialog } from '@/components/drivers/DriverLeaveRequestDialog';
import { DriverServiceRequestDialog } from '@/components/drivers/DriverServiceRequestDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverQuickList } from '@/components/driver/DriverQuickList';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function DriverDetailsPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const id = params?.id;
	const requestedTab = searchParams.get('tab') || 'overview';
	const initialTab = ['overview', 'licenses', 'certifications', 'documents', 'availability', 'infractions', 'qualification', 'trips'].includes(requestedTab)
		? requestedTab
		: 'overview';

	const [driver, setDriver] = useState<Driver | null>(null);
	const [profilePicture, setProfilePicture] = useState<DriverDocument | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);

	const fetchDriver = async () => {
		if (!id) {
			setError('Driver id is missing from URL.');
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const data = await apiFetch<Driver>(`/api/drivers/${id}`);
			setDriver(data);
			
			// Fetch profile picture
			try {
				const profilePic = await apiFetch<DriverDocument>(`/api/drivers/${id}/profile-picture`);
				setProfilePicture(profilePic);
			} catch (e) {
				// Profile picture not found is not an error, just means no profile picture uploaded yet
				setProfilePicture(null);
			}
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchDriver();
	}, [id]);

	const handleRemoveDriver = async () => {
		if (!id || isRemoving) return;
		if (!window.confirm('Remove this driver? This will set status to Inactive.')) return;

		try {
			setIsRemoving(true);
			await apiFetch<void>(`/api/drivers/${id}/deactivate`, { method: 'PATCH' });
			toast.success('Driver removed successfully.');
			router.push('/drivers');
			router.refresh();
		} catch (e) {
			toast.error(getErrorMessage(e));
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<div className="p-6 space-y-4 animate-fade-in">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
						<UserRound className="w-5 h-5" style={{ color: 'hsl(var(--primary-foreground))' }} />
					</div>
					<div>
						<h1 className="text-xl font-semibold text-foreground">
							Driver Profile {driver && !loading && `- ${driver.firstName} ${driver.lastName}`}
						</h1>
						<p className="text-sm text-muted-foreground">
							{driver && !loading ? `${driver.employeeId} • ${driver.department || 'N/A'}` : 'Driver details view'}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{driver && !loading && !error && <DriverLeaveRequestDialog driverId={id} />}
					{driver && !loading && !error && <DriverServiceRequestDialog driverId={id} />}

					{driver && !loading && !error && (
						<Dialog open={editOpen} onOpenChange={setEditOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
									<Pencil className="w-4 h-4" />
									Edit Driver
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle className="text-black dark:text-white">Edit Driver</DialogTitle>
									<DialogDescription className="text-black/80 dark:text-white/80">
										Update driver details and save your changes.
									</DialogDescription>
								</DialogHeader>
								<DriverForm
									driver={driver}
									onSuccess={() => {
										setEditOpen(false);
										void fetchDriver();
										toast.success('Driver updated successfully.');
									}}
								/>
							</DialogContent>
						</Dialog>
					)}

					{driver && !loading && !error && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleRemoveDriver}
							disabled={isRemoving}
							className="inline-flex items-center gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
						>
							<Trash2 className="w-4 h-4" />
							{isRemoving ? 'Removing...' : 'Remove Driver'}
						</Button>
					)}

					<Link href="/drivers" className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-border hover:bg-muted transition-colors">
						<ArrowLeft className="w-4 h-4" />
						Back
					</Link>
				</div>
			</div>

			<div className="flex flex-col gap-6 xl:flex-row xl:items-start">
				<div className="min-w-0 flex-1">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Driver Monitoring</CardTitle>
						</CardHeader>
						<CardContent>
							{loading && <p className="text-sm text-muted-foreground">Loading driver...</p>}

							{!loading && error && (
								<p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
									{error}
								</p>
							)}

							{!loading && !error && driver && id && (
								<Tabs defaultValue={initialTab} className="w-full">
														<div className="w-full overflow-x-auto">
															<TabsList className="flex gap-2 w-max whitespace-nowrap px-2">
																<TabsTrigger value="overview" className="px-4 py-2 rounded-md inline-flex">Overview</TabsTrigger>
																<TabsTrigger value="licenses" className="px-4 py-2 rounded-md inline-flex">Licenses</TabsTrigger>
																<TabsTrigger value="certifications" className="px-4 py-2 rounded-md inline-flex">Certs</TabsTrigger>
																<TabsTrigger value="documents" className="px-4 py-2 rounded-md inline-flex">Documents</TabsTrigger>
																<TabsTrigger value="availability" className="px-4 py-2 rounded-md inline-flex">Availability</TabsTrigger>
																<TabsTrigger value="infractions" className="px-4 py-2 rounded-md inline-flex">Infractions</TabsTrigger>
																<TabsTrigger value="qualification" className="px-4 py-2 rounded-md inline-flex">Qualification</TabsTrigger>
																<TabsTrigger value="trips" className="px-4 py-2 rounded-md inline-flex">Trips</TabsTrigger>
															</TabsList>
														</div>

									<TabsContent value="overview">
										<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
											{profilePicture && (
												<div className="md:col-span-1 flex flex-col items-center">
													<div className="mb-3 h-32 w-32 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
														<img
															src={`${API_BASE}${profilePicture.fileUrl}`}
															alt="Driver Profile Picture"
															className="h-full w-full object-cover"
															onError={(e) => {
																(e.target as HTMLImageElement).style.display = 'none';
															}}
														/>
													</div>
													<p className="text-center text-xs font-medium text-muted-foreground">{driver.firstName} {driver.lastName}</p>
												</div>
											)}
											<div className={profilePicture ? 'md:col-span-2' : 'md:col-span-3'}>
												<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
													<Detail label="Employee ID" value={driver.employeeId} />
													<Detail label="NIC" value={driver.nic} />
													<Detail label="First Name" value={driver.firstName} />
													<Detail label="Last Name" value={driver.lastName} />
													<Detail label="Phone" value={driver.phone} />
													<Detail label="License Number" value={driver.licenseNumber} />
													<Detail label="License Expiry Date" value={driver.licenseExpiryDate} />
													<Detail label="Date of Birth" value={driver.dateOfBirth} />
													<Detail label="Date of Joining" value={driver.dateOfJoining} />
													<Detail label="Department" value={driver.department} />
													<Detail label="Designation" value={driver.designation} />
													<Detail label="Email" value={driver.email} />
													<div className="md:col-span-2">
														<Detail label="Address" value={driver.address} className="md:col-span-2" />
													</div>
													<Detail label="Emergency Contact Name" value={driver.emergencyContactName} />
													<Detail label="Emergency Contact Phone" value={driver.emergencyContactPhone} />
													<div className="space-y-1">
														<p className="text-xs font-medium text-muted-foreground">Status</p>
														<StatusBadge status={driver.status} />
													</div>
												</div>
											</div>
										</div>
									</TabsContent>

									<TabsContent value="licenses">
										<DriverLicensesTab driverId={id} />
									</TabsContent>

									<TabsContent value="certifications">
										<DriverCertificationsTab driverId={id} />
									</TabsContent>

									<TabsContent value="documents">
										<DriverDocumentsTab 
											driverId={id} 
											onProfilePictureUpload={async () => {
												try {
													const profilePic = await apiFetch<DriverDocument>(`/api/drivers/${id}/profile-picture`);
													setProfilePicture(profilePic);
												} catch (e) {
													setProfilePicture(null);
												}
											}}
										/>
									</TabsContent>

									<TabsContent value="availability">
										<DriverAvailabilityTab driverId={id} />
									</TabsContent>

									<TabsContent value="infractions">
										<DriverInfractionsTab driverId={id} />
									</TabsContent>

									<TabsContent value="qualification">
										<DriverQualificationTab driverId={id} />
									</TabsContent>

									<TabsContent value="trips">
										<DriverTripsTab driverId={id} />
									</TabsContent>
								</Tabs>
							)}
						</CardContent>
					</Card>
				</div>

				{driver && !loading && !error && id && (
					<DriverQuickList activeDriverId={id} />
				)}
			</div>
		</div>
	);
}

function Detail({ label, value, className }: { label: string; value?: string; className?: string }) {
	return (
		<div className={className}>
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p className="text-sm text-foreground">{value || '-'}</p>
		</div>
	);
}
