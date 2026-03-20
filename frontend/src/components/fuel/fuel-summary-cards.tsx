import { Fuel, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import type { FuelRecord } from "@/lib/api/fuel";
import {
  calcTotalLitres,
  calcTotalCost,
  calcAverageEfficiency,
  countFlagged,
  formatLKR,
  formatEfficiency,
} from "@/lib/fuel-utils";

interface FuelSummaryCardsProps {
  records: FuelRecord[];
}

export function FuelSummaryCards({ records }: FuelSummaryCardsProps) {
  const totalLitres = calcTotalLitres(records);
  const totalCost = calcTotalCost(records);
  const avgEfficiency = calcAverageEfficiency(records);
  const flaggedCount = countFlagged(records);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Litres"
        value={`${totalLitres.toFixed(1)} L`}
        subtitle="Fuel consumed"
        icon={Fuel}
        iconColor="text-blue-400"
      />
      <StatsCard
        title="Total Cost"
        value={formatLKR(totalCost)}
        subtitle="Fuel expenditure"
        icon={DollarSign}
        iconColor="text-green-400"
      />
      <StatsCard
        title="Avg Efficiency"
        value={formatEfficiency(avgEfficiency)}
        subtitle="Fleet average"
        icon={TrendingUp}
        iconColor="text-amber-400"
      />
      <StatsCard
        title="Flagged"
        value={flaggedCount}
        subtitle="Needs review"
        icon={AlertTriangle}
        iconColor={flaggedCount > 0 ? "text-red-400" : "text-slate-500"}
      />
    </div>
  );
}
