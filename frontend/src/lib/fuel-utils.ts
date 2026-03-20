import type { FuelRecord } from "@/lib/api/fuel";

/**
 * Calculate average km/L for a list of records that already
 * have efficiencyKmPerLitre set.
 */
export function calcAverageEfficiency(records: FuelRecord[]): number | null {
  const withEfficiency = records.filter(
    (r) => r.efficiencyKmPerLitre !== null && r.efficiencyKmPerLitre! > 0
  );
  if (withEfficiency.length === 0) return null;
  const total = withEfficiency.reduce(
    (sum, r) => sum + r.efficiencyKmPerLitre!,
    0
  );
  return Math.round((total / withEfficiency.length) * 100) / 100;
}

/**
 * Total litres used across records.
 */
export function calcTotalLitres(records: FuelRecord[]): number {
  return records.reduce((sum, r) => sum + Number(r.quantity), 0);
}

/**
 * Total cost across records.
 */
export function calcTotalCost(records: FuelRecord[]): number {
  return records.reduce((sum, r) => sum + Number(r.totalCost), 0);
}

/**
 * Count flagged records.
 */
export function countFlagged(records: FuelRecord[]): number {
  return records.filter((r) => r.flaggedForMisuse).length;
}

/**
 * Format currency in LKR.
 */
export function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format km/L efficiency.
 */
export function formatEfficiency(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(2)} km/L`;
}

/**
 * Group records by vehicle for summary view.
 */
export function groupByVehicle(
  records: FuelRecord[]
): Record<string, FuelRecord[]> {
  return records.reduce((acc, record) => {
    const key = record.vehiclePlate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {} as Record<string, FuelRecord[]>);
}

/**
 * Today as YYYY-MM-DD string.
 */
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Date 30 days ago as YYYY-MM-DD string.
 */
export function thirtyDaysAgoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}
