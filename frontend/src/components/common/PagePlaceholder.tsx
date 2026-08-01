import { Link } from "react-router-dom";
import { VaultDial } from "@/components/common/VaultDial";

export function PagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <VaultDial className="size-12 text-brass opacity-60" />
      <p className="font-display text-lg font-medium text-foreground">{label}</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        This screen is scheduled later in the build sequence.
      </p>
      <Link to="/login" className="text-sm font-medium text-brass hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
