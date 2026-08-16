'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { getDriverDisplayId } from '@/lib/driver-display';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type DriverQuickListProps = {
  activeDriverId?: string;
};

/** Minimal user shape from /api/drivers/from-users (matches DriverUserResponse). */
interface DriverUserItem {
  id: string;
  employeeId: string | null;
  fullName: string;
  email: string;
  nic: string;
  phone: string;
  driverId: string | null;
}

interface DriverUserPage {
  content?: DriverUserItem[];
}

export function DriverQuickList({ activeDriverId }: DriverQuickListProps) {
  const [drivers, setDrivers] = useState<DriverUserItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDrivers = async () => {
      try {
        setLoading(true);
        // Fetch all driver-role users from users table (large page to get all)
        const data = await apiFetch<DriverUserItem[] | DriverUserPage>('/api/drivers/from-users?page=0&size=100');

        let list: DriverUserItem[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.content)) {
          list = data.content;
        }

        if (mounted) {
          setDrivers(list);
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadDrivers();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return drivers;
    }

    return drivers.filter((driver) => {
      return (
        getDriverDisplayId(driver.employeeId, '').toLowerCase().includes(normalizedQuery) ||
        driver.fullName.toLowerCase().includes(normalizedQuery) ||
        (driver.email || '').toLowerCase().includes(normalizedQuery) ||
        (driver.nic || '').toLowerCase().includes(normalizedQuery)
      );
    });
  }, [drivers, query]);

  return (
    <aside className="hidden w-full max-w-[280px] shrink-0 rounded-xl border-l border-border bg-card p-4 shadow-sm lg:block">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Driver List</p>
          <p className="text-xs text-muted-foreground">Quick navigation between profiles</p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search drivers"
            className="pl-9"
          />
        </div>

        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {loading ? (
            <p className="py-6 text-sm text-muted-foreground">Loading drivers...</p>
          ) : filteredDrivers.length > 0 ? (
            <div className="space-y-2">
              {filteredDrivers.map((driver) => {
                const isActive = driver.id === activeDriverId || driver.driverId === activeDriverId;
                const displayDriverId = getDriverDisplayId(driver.employeeId, '');
                const nameParts = driver.fullName.split(' ');
                const initials = nameParts.length >= 2
                  ? `${nameParts[0]?.[0] || ''}${nameParts[nameParts.length - 1]?.[0] || ''}`.toUpperCase()
                  : (nameParts[0]?.[0] || '').toUpperCase();

                return (
                  <Link
                    key={driver.id}
                    href={`/drivers/${driver.id}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        isActive ? 'bg-primary-foreground/15' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {initials || <UserRound className="h-4 w-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate font-medium">
                          {driver.fullName}
                        </p>
                        {displayDriverId && (
                          <span className={cn('text-[10px] font-mono font-semibold px-1 py-0.5 rounded border leading-none', 
                            isActive ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30' : 'bg-muted text-muted-foreground border-border')}>
                            {displayDriverId}
                          </span>
                        )}
                      </div>
                      <p className={cn('truncate text-xs', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {driver.email}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">No drivers found.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
