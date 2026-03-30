import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

type BadgeStyle = {
  label: string;
  bg: string;
  text: string;
  border: string;
};

const statusMap: Record<string, BadgeStyle> = {
    ACTIVE: {
      label: 'Active',
      bg: 'hsl(145 63% 94%)',
      text: 'hsl(145 63% 25%)',
      border: 'hsl(145 63% 70%)',
    },
    INACTIVE: {
      label: 'Inactive',
      bg: 'hsl(0 0% 96%)',
      text: 'hsl(0 0% 45%)',
      border: 'hsl(0 0% 80%)',
    },
    SUSPENDED: {
      label: 'Suspended',
      bg: 'hsl(360 79% 95%)',
      text: 'hsl(360 79% 30%)',
      border: 'hsl(360 79% 75%)',
    },
  APPROVER: {
    label: 'Approver',
    bg: 'hsl(19 97% 93%)',
    text: 'hsl(19 97% 20%)',
    border: 'hsl(19 97% 60%)',
  },
  SYSTEM_USER: {
    label: 'System User',
    bg: 'hsl(0 0% 96%)',
    text: 'hsl(0 0% 45%)',
    border: 'hsl(0 0% 80%)',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const cfg =
    statusMap[normalized] ?? {
      label: status.replace(/_/g, ' '),
      bg: 'hsl(0 0% 96%)',
      text: 'hsl(0 0% 45%)',
      border: 'hsl(0 0% 80%)',
    };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        className
      )}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
      }}
    >
      {cfg.label}
    </span>
  );
}
