import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Plus,
  Star,
  User,
  Wand2,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

// ── Navigation items ────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** Use exact matching for the active state check. */
  end: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, end: true },
  { label: "Credentials", href: "/credentials", icon: KeyRound, end: true },
  { label: "Favorites", href: "/credentials/favorites", icon: Star, end: true },
  { label: "Categories", href: "/categories", icon: FolderOpen, end: true },
  { label: "Password Generator", href: "/password-generator", icon: Wand2, end: true },
];

// ── Shared nav link class helper ────────────────────────────────────

function navLinkClass(isActive: boolean) {
  return cn(
    "relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ease-out before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-center before:bg-brass before:transition-transform before:duration-200 before:ease-out",
    isActive
      ? "bg-brass-soft font-medium text-brass before:scale-y-100"
      : "text-muted-foreground before:scale-y-0 hover:bg-background hover:text-foreground"
  );
}

// ── Component ───────────────────────────────────────────────────────

interface SidebarProps {
  /** Whether the mobile slide-over is open. Ignored on desktop. */
  open: boolean;
  /** Called when the sidebar should close (mobile close button or overlay click). */
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside
      aria-label="Application navigation"
      className={cn(
        // Mobile: fixed overlay that slides in from the left
        "fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col border-r border-border bg-surface",
        "transition-transform duration-200 ease-in-out",
        // Desktop: static flex sibling — always visible, no transition needed
        "lg:static lg:z-auto lg:translate-x-0 lg:transition-none",
        // Mobile visibility driven by the open prop
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brass"
        >
          <BrandLogo className="size-7" />
          <span className="font-display text-base font-semibold tracking-tight text-foreground">
            Cipher Vault
          </span>
        </Link>

        {/* Close button — visible on mobile only */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground lg:hidden"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* ── Primary action ────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pt-4">
        <Button asChild className="w-full">
          <Link to="/credentials/new" onClick={onClose}>
            <Plus className="size-4" aria-hidden="true" />
            Add Credential
          </Link>
        </Button>
      </div>

      {/* ── Navigation links ──────────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom: profile + sign-out ────────────────────────────── */}
      <div className="shrink-0 space-y-0.5 border-t border-border px-3 py-3">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) => navLinkClass(isActive)}
        >
          <User className="size-4 shrink-0" aria-hidden="true" />
          Profile
        </NavLink>

        <button
          type="button"
          onClick={logout}
          className={cn(
            navLinkClass(false),
            "hover:text-danger"
          )}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
