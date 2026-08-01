import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

// ── Page title map ───────────────────────────────────────────────────
// Keyed by exact pathname. Extend this map as new pages are added.

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/credentials": "Credentials",
  "/credentials/new": "Add Credential",
  "/credentials/favorites": "Favorites",
  "/categories": "Categories",
  "/password-generator": "Password Generator",
  "/profile": "Profile",
};

function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? "Cipher Vault";
}

// ── Component ────────────────────────────────────────────────────────

interface HeaderProps {
  /** Opens the mobile sidebar slide-over. */
  onMenuClick: () => void;
}

/**
 * Sticky top bar shared across all authenticated pages.
 * On mobile it shows a hamburger button that opens the sidebar.
 * On desktop the sidebar is always visible so the hamburger is hidden.
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface px-4 sm:px-6">
      {/* Left: mobile menu toggle + page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <p className="font-display text-base font-semibold text-foreground sm:text-[17px]">
          {title}
        </p>
      </div>
    </header>
  );
}
