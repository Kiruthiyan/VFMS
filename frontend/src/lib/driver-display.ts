const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value?: string | null): boolean {
  return Boolean(value && UUID_PATTERN.test(value.trim()));
}

export function getDriverDisplayId(
  employeeId?: string | null,
  fallback = "N/A"
): string {
  const normalized = employeeId?.trim();
  return normalized && !isUuid(normalized) ? normalized : fallback;
}
