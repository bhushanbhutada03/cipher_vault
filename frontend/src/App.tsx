import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import * as React from "react";
import { AuthProvider } from "@/context/AuthContext";
// @ts-ignore
window.toast = toast;
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import UnlockVault from "@/pages/auth/UnlockVault";
import RecoverVault from "@/pages/auth/RecoverVault";
import Dashboard from "@/pages/dashboard/Dashboard";
import Categories from "@/pages/categories/Categories";
import Credentials from "@/pages/credentials/Credentials";
import Favorites from "@/pages/credentials/Favorites";
import NewCredential from "@/pages/credentials/NewCredential";
import CredentialDetail from "@/pages/credentials/CredentialDetail";
import EditCredential from "@/pages/credentials/EditCredential";
import Profile from "@/pages/dashboard/Profile";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";
import { vaultTokenService } from "@/services/vaultTokenService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function VaultProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!vaultTokenService.hasToken()) {
    return <Navigate to="/unlock" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function CatchAllRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
}

function AppShell() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route
        path="/forgot-password"
        element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>}
      />
      <Route
        path="/verify-email"
        element={<PublicOnlyRoute><VerifyEmail /></PublicOnlyRoute>}
      />

      {/* ── Protected Vault Unlock route ──────────────────────────── */}
      <Route
        path="/unlock"
        element={
          <ProtectedRoute>
            <UnlockVault />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recover"
        element={
          <ProtectedRoute>
            <RecoverVault />
          </ProtectedRoute>
        }
      />

      {/* ── Protected routes (inside the app shell) ───────────────── */}
      <Route element={<AppShell />}>
        {/* Vault-Protected routes (require decryption) */}
        <Route element={<VaultProtectedRoute><Outlet /></VaultProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/credentials/favorites" element={<Favorites />} />
          <Route path="/credentials/new" element={<NewCredential />} />
          <Route path="/credentials/:id" element={<CredentialDetail />} />
          <Route path="/credentials/:id/edit" element={<EditCredential />} />
        </Route>

        {/* Standard Protected routes (do NOT require decryption) */}
        <Route
          path="/password-generator"
          element={<PagePlaceholder label="Password Generator" />}
        />
        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>

      {/* ── Catch-all ─────────────────────────────────────────────── */}
      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-right" theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
