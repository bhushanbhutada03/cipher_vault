import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "ui-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 hover:[&_svg]:scale-[1.05] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-brass text-brass-foreground shadow-sm hover:bg-brass/90 hover:shadow-md",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:border-brass/40 hover:bg-surface-elevated hover:shadow-sm",
        ghost: "bg-transparent text-foreground hover:bg-surface-elevated hover:shadow-sm",
        link: "text-brass underline-offset-4 hover:underline p-0 h-auto",
        destructive: "bg-danger text-white shadow-sm hover:bg-danger/90 hover:shadow-md",
      },
      size: {
        default: "h-11 px-4 py-2 [&_svg]:size-4",
        sm: "h-9 px-3 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
