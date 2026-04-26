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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
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
  );
}
