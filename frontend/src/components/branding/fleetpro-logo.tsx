import { cn } from "@/lib/utils";

interface FleetProLogoProps {
  className?: string;
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    mark: "h-10 w-10 rounded-xl",
    svg: "h-6 w-6",
    text: "text-base",
  },
  md: {
    mark: "h-12 w-12 rounded-2xl",
    svg: "h-7 w-7",
    text: "text-lg",
  },
  lg: {
    mark: "h-14 w-14 rounded-2xl",
    svg: "h-8 w-8",
    text: "text-xl",
  },
} as const;

export function FleetProLogo({
  className,
  theme = "dark",
  size = "md",
}: FleetProLogoProps) {
  const palette =
    theme === "dark"
      ? {
          mark: "border-white/10 bg-slate-900 shadow-black/20",
          text: "text-white",
          icon: "#fcd34d",
          wheel: "#ffffff",
          accent: "rgba(251,191,36,0.14)",
        }
      : {
          mark: "border-amber-200 bg-amber-300 shadow-amber-100",
          text: "text-slate-950",
          icon: "#0f172a",
          wheel: "#ffffff",
          accent: "rgba(255,255,255,0.18)",
        };

  const sizing = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden border shadow-sm",
          sizing.mark,
          palette.mark
        )}
      >
        <span
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 24%, ${palette.accent}, transparent 48%)`,
          }}
        />
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className={cn("relative z-10", sizing.svg)}
        >
          <path
            d="M11 38h6.2a5.9 5.9 0 0 1 11.4 0h7.3a5.9 5.9 0 0 1 11.4 0h4.1a2.6 2.6 0 0 0 2.6-2.6v-3.3a4.4 4.4 0 0 0-1.7-3.5l-6.9-5.3a10 10 0 0 0-6.1-2.1H29.7a8.8 8.8 0 0 0-6 2.4l-5.9 5.2a6.8 6.8 0 0 0-2.3 5.1V35A3 3 0 0 1 12.5 38Z"
            fill="none"
            stroke={palette.icon}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24.3 28.7 28 25.4a5.2 5.2 0 0 1 3.5-1.2h7.5a6.2 6.2 0 0 1 3.9 1.4l4.7 3.7H24.3Z"
            fill={palette.icon}
            fillOpacity="0.16"
          />
          <circle cx="22.5" cy="38.2" r="4.5" fill={palette.wheel} />
          <circle cx="41.7" cy="38.2" r="4.5" fill={palette.wheel} />
          <circle cx="22.5" cy="38.2" r="2.1" fill={palette.icon} />
          <circle cx="41.7" cy="38.2" r="2.1" fill={palette.icon} />
        </svg>
      </span>
      <span className={cn("font-black tracking-tight", sizing.text, palette.text)}>
        FleetPro
      </span>
    </div>
  );
}
