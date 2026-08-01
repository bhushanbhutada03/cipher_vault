import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tokenService } from "@/services/tokenService";
import { authEvents } from "@/services/authEvents";
import { AuthContext } from "@/context/auth-context-value";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setIsAuthenticated(tokenService.hasToken());
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    return authEvents.on("session-expired", () => {
      setIsAuthenticated(false);
      setSessionExpired(true);
    });
  }, []);

  const setToken = useCallback((token: string) => {
    tokenService.setToken(token);
    setIsAuthenticated(true);
    setSessionExpired(false);
  }, []);

  const logout = useCallback(() => {
    tokenService.clearToken();
    setIsAuthenticated(false);
  }, []);

  const acknowledgeSessionExpiry = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isInitializing,
      sessionExpired,
      setToken,
      logout,
      acknowledgeSessionExpiry,
    }),
    [isAuthenticated, isInitializing, sessionExpired, setToken, logout, acknowledgeSessionExpiry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
