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
    const token = this.getToken();
    if (!token) return false;
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;
      const payload = JSON.parse(atob(payloadBase64));
      if (!payload.exp) return true;
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
