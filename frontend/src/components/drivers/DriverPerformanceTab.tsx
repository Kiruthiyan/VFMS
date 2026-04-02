'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DriverPerformanceScore } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function KpiBar({
  label,
  value,
  max = 100,
  tokenVar,
}: {
  label: string;
  value: number;
  max?: number;
  tokenVar: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min((value / max) * 100, 100)}%`,
            backgroundColor: `hsl(var(${tokenVar}))`,
          }}
        />
      </div>
    </div>
  );
}

export function DriverPerformanceTab({ driverId }: { driverId: string }) {
  const [scores, setScores] = useState<DriverPerformanceScore[]>([]);

  useEffect(() => {
    apiFetch<DriverPerformanceScore[]>(`/api/drivers/${driverId}/performance-scores`)
      .then(setScores)
      .catch((e) => toast.error(e.message));
  }, [driverId]);

  const latest = scores[0];
  const scoreTokenVar = (s: number) => (s >= 70 ? '--success' : s >= 50 ? '--warning' : '--secondary');
  const scoreLabelStyle = (s: number): React.CSSProperties =>
    s >= 70
      ? {
          backgroundColor: 'hsl(145 63% 94%)',
          color: 'hsl(145 63% 25%)',
          border: '1px solid hsl(145 63% 70%)',
          borderRadius: 6,
          padding: '2px 10px',
          fontSize: 12,
          fontWeight: 500,
        }
      : s >= 50
        ? {
            backgroundColor: 'hsl(42 74% 94%)',
            color: 'hsl(42 74% 22%)',
            border: '1px solid hsl(42 74% 65%)',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 500,
          }
        : {
            backgroundColor: 'hsl(19 97% 93%)',
            color: 'hsl(19 97% 20%)',
            border: '1px solid hsl(19 97% 60%)',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 500,
          };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        {latest ? (
          <Card>
            <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
              <CardTitle className="text-sm font-semibold">
                Latest - {MONTHS[latest.periodMonth]} {latest.periodYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p
                    className="tabular-nums text-4xl font-bold"
                    style={{ color: `hsl(var(${scoreTokenVar(latest.compositeScore)}))` }}
                  >
                    {latest.compositeScore.toFixed(1)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Composite Score</p>
                </div>
                <span style={scoreLabelStyle(latest.compositeScore)}>
                  {latest.compositeScore >= 70 ? 'Good' : latest.compositeScore >= 50 ? 'Average' : 'Poor'}
                </span>
              </div>
              <div className="space-y-3">
                <KpiBar label="Trip Completion Rate" value={latest.tripCompletionRate} tokenVar="--primary" />
                <KpiBar label="Fuel Efficiency Ratio" value={latest.fuelEfficiencyRatio} tokenVar="--success" />
                <KpiBar label="Feedback Score" value={latest.feedbackScore} tokenVar="--info" />
                <KpiBar
                  label="Infraction Deduction"
                  value={latest.infractionDeduction}
                  max={50}
                  tokenVar="--secondary"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No performance data yet
            </CardContent>
          </Card>
        )}
      </div>
      <Card>
        <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
          <CardTitle className="text-sm font-semibold">History</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-3">
          <div className="space-y-1.5">
            {scores.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border-b border-border py-1.5 last:border-0"
              >
                <span className="text-xs text-muted-foreground">
                  {MONTHS[s.periodMonth]} {s.periodYear}
                </span>
                <span
                  className="tabular-nums text-sm font-semibold"
                  style={{ color: `hsl(var(${scoreTokenVar(s.compositeScore)}))` }}
                >
                  {s.compositeScore.toFixed(1)}
                </span>
              </div>
            ))}
            {scores.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No history yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}