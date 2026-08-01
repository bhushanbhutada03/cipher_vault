import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brass text-brass-foreground hover:bg-brass/90 shadow-sm",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-surface-elevated",
        ghost: "bg-transparent text-foreground hover:bg-surface-elevated",
        link: "text-brass underline-offset-4 hover:underline p-0 h-auto",
        destructive: "bg-danger text-white hover:bg-danger/90",
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
