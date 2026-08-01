import { useEffect, useState } from "react";
import { Sidebar } from "@/layouts/Sidebar";
import { Header } from "@/layouts/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Root shell for all authenticated pages.
 * Renders the sidebar and top header; the children prop fills the
 * scrollable content area to the right of the sidebar.
 *
 * On desktop (lg+) the sidebar is always visible as a static flex
 * sibling. On mobile it slides in as a fixed overlay and the backdrop
 * dismisses it.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Collapse the mobile sidebar automatically when the viewport
  // grows to the desktop breakpoint.
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Mobile backdrop ───────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main area ─────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content — scrolls independently of the sidebar */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
