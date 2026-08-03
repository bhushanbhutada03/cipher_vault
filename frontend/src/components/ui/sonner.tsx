import * as React from "react";
import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      offset="24px"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans w-[340px] flex gap-3 p-4 items-start",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[13px] leading-relaxed mt-1",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-brass group-[.toast]:text-brass-foreground font-medium rounded-md",
          cancelButton:
            "group-[.toast]:bg-surface-elevated group-[.toast]:text-muted-foreground font-medium rounded-md border border-border",
          success: "group-[.toaster]:border-l-[4px] group-[.toaster]:border-l-success",
          error: "group-[.toaster]:border-l-[4px] group-[.toaster]:border-l-danger",
          warning: "group-[.toaster]:border-l-[4px] group-[.toaster]:border-l-brass",
          info: "group-[.toaster]:border-l-[4px] group-[.toaster]:border-l-info",
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-5 text-success shrink-0" />,
        error: <AlertCircle className="size-5 text-danger shrink-0" />,
        warning: <AlertTriangle className="size-5 text-brass shrink-0" />,
        info: <Info className="size-5 text-info shrink-0" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
