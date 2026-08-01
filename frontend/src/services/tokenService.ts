import { STORAGE_KEYS } from "@/constants/storage";

export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  clearToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  hasToken(): boolean {
    return Boolean(this.getToken());
  },
};
