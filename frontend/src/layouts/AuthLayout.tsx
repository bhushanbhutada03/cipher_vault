import { Link } from "react-router-dom";
import { VaultDial } from "@/components/common/VaultDial";

interface AuthLayoutProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const PRINCIPLES = [
  "AES-encrypted at rest, decrypted only for you",
  "A master password gate on every reveal",
  "Full change history for every credential",
];

export function AuthLayout({ children, eyebrow, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-brass) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 px-12 pt-12">
          <Link to="/login" className="inline-flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-brass text-brass-foreground">
              <VaultDial className="size-5" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Cipher Vault
            </span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 items-center px-12">
          <VaultDial className="size-72 opacity-90" />
        </div>

        <div className="relative z-10 space-y-6 px-12 pb-14">
          <p className="font-display text-2xl font-medium leading-snug text-foreground">
            One master password.
            <br />
            Every credential, accounted for.
          </p>
          <ul className="space-y-3">
            {PRINCIPLES.map((principle) => (
              <li key={principle} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-brass" />
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-md bg-brass text-brass-foreground">
            <VaultDial className="size-5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Cipher Vault
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-brass">
              {eyebrow}
            </p>
            <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
