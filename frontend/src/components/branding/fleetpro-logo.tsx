import { cn } from "@/lib/utils";

interface FleetProLogoProps {
  className?: string;
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    mark: "h-9 w-9",
    text: "text-base",
  },
  md: {
    mark: "h-11 w-11",
    text: "text-lg",
  },
  lg: {
    mark: "h-14 w-14",
    text: "text-xl",
  },
} as const;

export function FleetProLogo({
  className,
  theme = "dark",
  size = "md",
}: FleetProLogoProps) {
  const textColor = theme === "dark" ? "text-white" : "text-slate-950";
  const sizing = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/brand/fleetpro-logo.png"
        alt="FleetPro"
        className={cn("rounded-lg object-contain", sizing.mark)}
      />
      <span className={cn("font-black tracking-tight", sizing.text, textColor)}>
        FleetPro
      </span>
    </div>
  );
}
