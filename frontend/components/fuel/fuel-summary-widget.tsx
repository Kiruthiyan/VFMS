'use client';

import { useEffect } from 'react';
import { useFuelStore } from '@/store/fuelStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Fuel } from 'lucide-react';

export function FuelSummaryWidget() {
  const { summary, fetchSummary } = useFuelStore();

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fuel Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon =
    summary.fuelUsageTrend === 'up'
      ? TrendingUp
      : summary.fuelUsageTrend === 'down'
      ? TrendingDown
      : Minus;

  const trendColor =
    summary.fuelUsageTrend === 'up'
      ? 'text-destructive'
      : summary.fuelUsageTrend === 'down'
      ? 'text-green-600'
      : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Fuel Summary
        </CardTitle>
        <CardDescription>This month's fuel statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Fuel Cost (This Month)</p>
          <p className="text-2xl font-bold">Rs. {summary.totalCostThisMonth.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Highest Fuel Consuming Vehicle</p>
          <p className="text-lg font-semibold">{summary.highestFuelConsumingVehicle || 'N/A'}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Fuel Usage Trend:</p>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{summary.fuelUsageTrend}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

