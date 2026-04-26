<<<<<<< HEAD
<<<<<<< HEAD
=======
import { Loader2 } from "lucide-react";

>>>>>>> origin/feature/user-auth
interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

<<<<<<< HEAD
export function LoadingSpinner({ size = 24, className = "" }: LoadingSpinnerProps) {
=======
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
>>>>>>> origin/feature/user-management
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
<<<<<<< HEAD
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
=======
export function LoadingSpinner({ size = 16, className = "" }: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      className={`animate-spin ${className}`}
    />
>>>>>>> origin/feature/user-auth
=======
      xmlns="http://www.w3.org/2000/svg"
      className={cn("animate-spin", className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
>>>>>>> origin/feature/user-management
  );
}
