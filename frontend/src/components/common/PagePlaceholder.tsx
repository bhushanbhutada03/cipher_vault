import { Link } from "react-router-dom";
import { VaultDial } from "@/components/common/VaultDial";

export function PagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <VaultDial className="size-12" />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">Coming Soon</p>
      <p className="font-display text-lg font-medium text-foreground">{label}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        A secure built-in password generator with customizable options and one-click vault integration is currently in development.
      </p>
      <Link to="/login" className="text-sm font-medium text-brass hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
