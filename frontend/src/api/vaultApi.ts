import { axiosInstance } from "./axiosInstance";
import type { 
  VaultUnlockRequest, 
  VaultUnlockResponse,
  VaultRecoverRequest,
  RegenerateRecoveryKeyRequest,
  RegenerateRecoveryKeyResponse 
} from "@/types/vault";
import type { RegisterResponse } from "@/types/auth";

export const vaultApi = {
  async unlockVault(payload: VaultUnlockRequest): Promise<VaultUnlockResponse> {
    const { data } = await axiosInstance.post<VaultUnlockResponse>(
      "/api/vault/unlock",
      payload
    );
    return data;
  },

  async recoverVault(payload: VaultRecoverRequest): Promise<RegisterResponse> {
    const { data } = await axiosInstance.post<RegisterResponse>(
      "/api/vault/recover",
      payload
    );
    return data;
  },

  async regenerateRecoveryKey(payload: RegenerateRecoveryKeyRequest): Promise<RegenerateRecoveryKeyResponse> {
    const { data } = await axiosInstance.post<RegenerateRecoveryKeyResponse>(
      "/api/vault/recovery-key/regenerate",
      payload
    );
    return data;
  }
};
