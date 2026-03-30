import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const styles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    ACTIVE: {
      bg: 'hsl(145 63% 94%)',
      text: 'hsl(145 63% 25%)',
      border: 'hsl(145 63% 70%)',
      label: 'Active',
    },
    INACTIVE: {
      bg: 'hsl(0 0% 96%)',
      text: 'hsl(0 0% 45%)',
      border: 'hsl(0 0% 80%)',
      label: 'Inactive',
    },
    SUSPENDED: {
      bg: 'hsl(360 79% 95%)',
      text: 'hsl(360 79% 30%)',
      border: 'hsl(360 79% 75%)',
      label: 'Suspended',
    },
  };

  const cfg =
    styles[normalized] ?? {
      bg: 'hsl(0 0% 96%)',
      text: 'hsl(0 0% 45%)',
      border: 'hsl(0 0% 80%)',
      label: status.replace(/_/g, ' '),
    };

  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap border', className)}
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}
