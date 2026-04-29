'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, Wrench } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

type DriverServiceRequest = {
  id: number;
  vehicleId?: number;
  requestType: string;
  description: string;
  urgency: string;
  status: string;
  createdAt: string;
};

const urgencyLeftBorder: Record<string, string> = {
  LOW: 'hsl(var(--success))',
  MEDIUM: 'hsl(var(--warning))',
  HIGH: 'hsl(var(--secondary))',
};

export default function DriverServiceRequestsPage() {
  const [requests, setRequests] = useState<DriverServiceRequest[]>([]);

  const fetchRequests = () =>
    apiFetch<DriverServiceRequest[]>('/api/drivers/service-requests/open')
      .then(setRequests)
      .catch((e: Error) => toast.error(e.message));

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/api/drivers/service-requests/${id}/status?status=${status}`, { method: 'PATCH' });
      fetchRequests();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        icon={<Wrench className="w-5 h-5" />}
        title="Driver Service Requests"
        subtitle="Request maintenance or fault follow-up"
        action={
          <div className="flex items-center gap-2">
            <Link href="/drivers" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-muted transition-colors">
              Back
            </Link>
          </div>
        }
      />

      <div className="space-y-2.5">
        {requests.map((req) => (
          <Card
            key={req.id}
            style={{
              borderLeftWidth: 4,
              borderLeftStyle: 'solid',
              borderLeftColor: urgencyLeftBorder[req.urgency] || 'hsl(var(--border))',
            }}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {req.urgency === 'HIGH' && (
                      <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'hsl(var(--secondary))' }} />
                    )}
                    <span className="text-sm font-medium text-foreground">{req.requestType.replace(/_/g, ' ')}</span>
                    <StatusBadge status={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{req.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-border"
                    onClick={() => updateStatus(req.id, 'ACKNOWLEDGED')}
                  >
                    Acknowledge
                  </Button>
                  <button
                    className="h-7 px-3 text-xs rounded-md font-medium"
                    style={{
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                    }}
                    onClick={() => updateStatus(req.id, 'RESOLVED')}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
          <Card>
            <CardContent className="text-center text-muted-foreground py-16 text-sm">No open requests</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2" style={{ backgroundColor: 'hsl(42 100% 50% / 0.12)' }}>
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
