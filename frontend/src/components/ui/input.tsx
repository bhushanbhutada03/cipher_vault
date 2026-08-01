import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-faint-foreground transition-colors duration-150",
          "border-border-strong focus-visible:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-danger focus-visible:border-danger focus-visible:ring-danger/25",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
