import type { FuelRecord } from "@/lib/api/fuel";

/**
 * Calculate average km/L for records that already contain efficiency data.
 */
export function calcAverageEfficiency(records: FuelRecord[]): number | null {
  const withEfficiency = records.filter(
    (record) =>
      record.efficiencyKmPerLitre !== null && record.efficiencyKmPerLitre > 0
  );

  if (withEfficiency.length === 0) {
    return null;
  }

  const total = withEfficiency.reduce(
    (sum, record) => sum + record.efficiencyKmPerLitre!,
    0
  );

  return Math.round((total / withEfficiency.length) * 100) / 100;
}

/**
 * Total litres used across records.
 */
export function calcTotalLitres(records: FuelRecord[]): number {
  return records.reduce((sum, record) => sum + Number(record.quantity), 0);
}

/**
 * Total cost across records.
 */
export function calcTotalCost(records: FuelRecord[]): number {
  return records.reduce((sum, record) => sum + Number(record.totalCost), 0);
}

/**
 * Count flagged records.
 */
export function countFlagged(records: FuelRecord[]): number {
  return records.filter((record) => record.flaggedForMisuse).length;
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
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(2)} km/L`;
}

/**
 * Group records by vehicle for summary view.
 */
export function groupByVehicle(
  records: FuelRecord[]
): Record<string, FuelRecord[]> {
  return records.reduce(
    (accumulator, record) => {
      const key = record.vehiclePlate;
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(record);
      return accumulator;
    },
    {} as Record<string, FuelRecord[]>
  );
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
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0];
}
