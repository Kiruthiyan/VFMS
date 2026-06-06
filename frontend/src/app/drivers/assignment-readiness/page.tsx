'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DriverReadinessCache } from '@/types';

/** Shape from GET /api/drivers/from-users (user-creation data for DRIVER role) */
interface DriverUserItem {
	id: string;
	employeeId: string | null;
	fullName: string;
	email: string;
	phone: string;
	nic: string;
	licenseExpiryDate: string | null;
	status: string;
	driverId: string | null;
}

/** Combined row: user data + optional readiness data */
interface ReadinessRow {
	user: DriverUserItem;
	readiness: DriverReadinessCache | null;
}

export default function DriverReadinessPage() {
	const [rows, setRows] = useState<ReadinessRow[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		setLoading(true);
		try {
			// Fetch user data (primary) and readiness data (enrichment) in parallel
			const [usersPage, readiness] = await Promise.all([
				apiFetch<any>('/api/drivers/from-users?page=0&size=500'),
				apiFetch<DriverReadinessCache[]>('/api/drivers/readiness').catch(() => [] as DriverReadinessCache[]),
			]);

			const users: DriverUserItem[] = Array.isArray(usersPage)
				? usersPage
				: usersPage?.content ?? [];

			// Build readiness lookup by driverId
			const readinessMap = new Map<string, DriverReadinessCache>();
			for (const r of readiness) {
				readinessMap.set(r.driverId, r);
			}

			// Primary data source = users table. Enrich with readiness where linked.
			const combined: ReadinessRow[] = users.map((user) => ({
				user,
				readiness: user.driverId ? (readinessMap.get(user.driverId) ?? null) : null,
			}));

			setRows(combined);
		} catch (e: any) {
			toast.error(e.message);
		} finally {
			setLoading(false);
		}
	};

	const refreshDriver = async (driverId: string) => {
		try {
			await apiFetch(`/api/drivers/${driverId}/readiness/refresh`, { method: 'POST' });
			toast.success('Refreshed');
			fetchData();
		} catch (e: any) {
			toast.error(e.message);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const isRowReady = (row: ReadinessRow): boolean => {
		if (!row.readiness) {
			// No linked driver record — check license from user data directly
			if (!row.user.licenseExpiryDate) return false;
			const expiry = new Date(`${row.user.licenseExpiryDate}T00:00:00`);
			return !isNaN(expiry.getTime()) && expiry >= new Date(new Date().toDateString());
		}
		return row.readiness.ready ?? (row.readiness.licenseValid && !row.readiness.onLeaveToday);
	};

	const getNotReadyReason = (row: ReadinessRow): string => {
		if (row.readiness?.notReadyReason) return row.readiness.notReadyReason;
		if (!row.readiness) {
			// No linked driver record — derive reason from user data
			if (!row.user.licenseExpiryDate) return 'No license expiry date';
			const expiry = new Date(`${row.user.licenseExpiryDate}T00:00:00`);
			if (!isNaN(expiry.getTime()) && expiry < new Date(new Date().toDateString())) {
				return 'License expired';
			}
			return 'Driver record not linked';
		}
		return 'Unknown';
	};

	const readyCount = rows.filter(isRowReady).length;
	const notReadyCount = rows.filter((r) => !isRowReady(r)).length;

	const filtered = rows.filter((row) => {
		if (!search) return true;
		const query = search.toLowerCase();
		return (
			(row.user.employeeId || '').toLowerCase().includes(query) ||
			row.user.fullName.toLowerCase().includes(query) ||
			row.user.email.toLowerCase().includes(query) ||
			(row.user.nic || '').toLowerCase().includes(query) ||
			(row.user.phone || '').toLowerCase().includes(query)
		);
	});

	return (
		<div className="p-6 animate-fade-in">
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
						<LayoutDashboard className="w-5 h-5" style={{ color: 'hsl(var(--primary-foreground))' }} />
					</div>
					<div>
						<h1 className="text-xl font-semibold text-foreground">Assignment Readiness</h1>
						<p className="text-sm text-muted-foreground">Real-time driver readiness status</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Link href="/drivers" className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-border hover:bg-muted transition-colors">
						Back
					</Link>
					<button
						className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium border transition-colors"
						style={{
							borderColor: 'hsl(var(--primary))',
							color: 'hsl(var(--primary))',
							backgroundColor: 'transparent',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
							e.currentTarget.style.color = 'hsl(var(--primary-foreground))';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'transparent';
							e.currentTarget.style.color = 'hsl(var(--primary))';
						}}
						onClick={fetchData}
					>
						<RefreshCw className="w-3.5 h-3.5" />
						Refresh All
					</button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
				<Card style={{ borderTopWidth: 4, borderTopStyle: 'solid', borderTopColor: 'hsl(var(--success))' }}>
					<CardContent className="pt-4 pb-4 px-4">
						<p className="text-3xl font-bold tabular-nums" style={{ color: 'hsl(var(--success))' }}>
							{readyCount}
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">Ready to assign</p>
					</CardContent>
				</Card>

				<Card style={{ borderTopWidth: 4, borderTopStyle: 'solid', borderTopColor: 'hsl(19 97% 50%)' }}>
					<CardContent className="pt-4 pb-4 px-4">
						<p className="text-3xl font-bold tabular-nums" style={{ color: 'hsl(19 97% 40%)' }}>
							{notReadyCount}
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">Not ready</p>
					</CardContent>
				</Card>
			</div>

			{/* Not Ready Reasons Legend */}
			<div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
				<p className="text-xs font-medium text-amber-800 mb-1">A driver is Not Ready if:</p>
				<ul className="text-xs text-amber-700 list-disc list-inside space-y-0.5">
					<li>Driver license is expired</li>
					<li>Driver is on approved leave</li>
				</ul>
			</div>

			<Card>
				<CardHeader className="pb-3 px-4 pt-4">
					<Input
						placeholder="Search by Driver ID, name, email, NIC or phone..."
						className="h-9 text-sm"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</CardHeader>

				<CardContent className="p-0">
					{loading ? (
						<div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent bg-muted/40">
									{['Driver ID', 'Full Name', 'Email', 'Phone', 'Availability', 'Ready', 'Reason', 'Last Refreshed', ''].map((h) => (
										<TableHead key={h} className="text-xs font-medium text-muted-foreground">
											{h}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((row) => {
									const ready = isRowReady(row);
									return (
										<TableRow key={row.user.id} className="hover:bg-muted/20">
											<TableCell className="font-semibold text-sm text-foreground">
												{row.user.employeeId || '—'}
											</TableCell>
											<TableCell className="font-medium text-sm text-foreground">
												{row.user.fullName}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{row.user.email}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{row.user.phone || '—'}
											</TableCell>
											<TableCell>
												{row.readiness ? (
													<StatusBadge status={row.readiness.availabilityStatus} />
												) : (
													<span className="text-xs text-muted-foreground">—</span>
												)}
											</TableCell>
											<TableCell>
												<span
													className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
													style={
														ready
															? {
																	backgroundColor: 'hsl(145 63% 94%)',
																	color: 'hsl(145 63% 25%)',
																	borderColor: 'hsl(145 63% 70%)',
																}
															: {
																	backgroundColor: 'hsl(19 97% 93%)',
																	color: 'hsl(19 97% 20%)',
																	borderColor: 'hsl(19 97% 60%)',
																}
													}
												>
													{ready ? 'Ready' : 'Not Ready'}
												</span>
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{ready ? '—' : getNotReadyReason(row)}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground tabular-nums">
												{row.readiness
													? new Date(row.readiness.lastRefreshed).toLocaleTimeString()
													: '—'}
											</TableCell>
											<TableCell>
												{row.user.driverId && (
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-muted-foreground"
														onMouseEnter={(e) => {
															e.currentTarget.style.color = 'hsl(var(--primary))';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.color = '';
														}}
														onClick={() => refreshDriver(row.user.driverId!)}
													>
														<RefreshCw className="w-3.5 h-3.5" />
													</Button>
												)}
											</TableCell>
										</TableRow>
									);
								})}

								{filtered.length === 0 && (
									<TableRow>
										<TableCell colSpan={9} className="text-center text-muted-foreground py-16 text-sm">
											No drivers found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}