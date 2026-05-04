'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { Driver } from '@/types';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type DriverQuickListProps = {
  activeDriverId?: string;
};

export function DriverQuickList({ activeDriverId }: DriverQuickListProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDrivers = async () => {
      try {
        setLoading(true);
        // The API may return either an array or a paginated response { content: Driver[] }
        const data = await apiFetch<any>('/api/drivers');

        let list: Driver[] = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.content)) {
          list = data.content;
        } else if (data && Array.isArray(data.drivers)) {
          // fallback if backend uses a different key
          list = data.drivers;
        } else {
          // If response shape is unexpected, attempt to coerce single object into array
          if (data && typeof data === 'object') {
            // no-op: leave list empty or try to push if it looks like a driver
          }
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
      const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
      return (
        fullName.includes(normalizedQuery) ||
        driver.employeeId.toLowerCase().includes(normalizedQuery) ||
        (driver.department || '').toLowerCase().includes(normalizedQuery)
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
                const isActive = driver.id === activeDriverId;
                const initials = `${driver.firstName?.[0] || ''}${driver.lastName?.[0] || ''}`.toUpperCase();

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
                      <p className="truncate font-medium">
                        {driver.firstName} {driver.lastName}
                      </p>
                      <p className={cn('truncate text-xs', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {driver.employeeId}
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