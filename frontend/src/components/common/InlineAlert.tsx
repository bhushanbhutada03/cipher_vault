import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface InlineAlertProps {
  variant?: "error" | "success";
  children: React.ReactNode;
}

export function InlineAlert({ variant = "error", children }: InlineAlertProps) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm",
        isError
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-success/30 bg-success/10 text-success"
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      )}
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
