import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/dashboard/Dashboard";
import Categories from "@/pages/categories/Categories";
import Credentials from "@/pages/credentials/Credentials";
import Favorites from "@/pages/credentials/Favorites";
import NewCredential from "@/pages/credentials/NewCredential";
import CredentialDetail from "@/pages/credentials/CredentialDetail";
import EditCredential from "@/pages/credentials/EditCredential";
import Profile from "@/pages/dashboard/Profile";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

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

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/**
 * Handles unmatched routes. Authenticated users land on the dashboard;
 * unauthenticated users are sent to the login page. This prevents the
 * double-redirect loop caused by the old hard-coded Navigate to="/login".
 */
function CatchAllRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
}

/**
 * Layout route for all authenticated pages.
 * AppLayout mounts once and remains mounted between navigations;
 * only the Outlet (page content) re-renders on route changes.
 */
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

      {/* ── Protected routes (inside the app shell) ───────────────── */}
      <Route element={<AppShell />}>
        {/* Implemented pages */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        
        {/* Credentials Module */}
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/credentials/favorites" element={<Favorites />} />
        <Route path="/credentials/new" element={<NewCredential />} />
        <Route path="/credentials/:id" element={<CredentialDetail />} />
        <Route path="/credentials/:id/edit" element={<EditCredential />} />

        {/* Placeholder routes for upcoming pages — replaced as each
            feature phase is completed */}
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
        <Toaster richColors position="top-right" theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
