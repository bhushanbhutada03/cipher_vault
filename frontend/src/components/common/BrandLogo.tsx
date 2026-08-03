import { cn } from "@/utils/cn";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      className={cn("block shrink-0 object-contain", className)}
      draggable={false}
    />
  );
}