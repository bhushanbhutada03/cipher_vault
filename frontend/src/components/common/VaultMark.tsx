import { cn } from "@/utils/cn";

/** A simplified vault mark designed to remain legible from 16–40px. */
export function VaultMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-brass", className)}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="25" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="5" />
      <circle cx="32" cy="32" r="17" stroke="currentColor" strokeOpacity="0.62" strokeWidth="2.5" />
      <path
        d="M32 18a14 14 0 0 1 8 25.5V50a8 8 0 0 1-16 0v-6.5A14 14 0 0 1 32 18Z"
        fill="currentColor"
      />
    </svg>
  );
}