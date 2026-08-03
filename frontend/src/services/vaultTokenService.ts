let vaultToken: string | null = null;
const masterPasswordFailures: Record<string, number> = {};

export const vaultTokenService = {
  getToken(): string | null {
    return vaultToken;
  },
  setToken(token: string): void {
    vaultToken = token;
    for (const key in masterPasswordFailures) {
      delete masterPasswordFailures[key];
    }
  },
  clearToken(): void {
    vaultToken = null;
    for (const key in masterPasswordFailures) {
      delete masterPasswordFailures[key];
    }
  },
  hasToken(): boolean {
    return Boolean(vaultToken);
  },
  recordFailure(action: string = "default"): number {
    masterPasswordFailures[action] = (masterPasswordFailures[action] || 0) + 1;
    return masterPasswordFailures[action];
  },
  resetFailures(action: string = "default"): void {
    masterPasswordFailures[action] = 0;
  },
  getFailures(action: string = "default"): number {
    return masterPasswordFailures[action] || 0;
  }
};
