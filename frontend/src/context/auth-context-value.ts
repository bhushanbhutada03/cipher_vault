import { createContext } from "react";

export interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  sessionExpired: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  acknowledgeSessionExpiry: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
