import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vaultApi } from "@/api/vaultApi";
import { exportApi } from "@/api/exportApi";
import { vaultTokenService } from "@/services/vaultTokenService";
import type { ApiError } from "@/types/api";
import type { 
  VaultUnlockRequest, 
  VaultUnlockResponse,
  VaultRecoverRequest,
  RegenerateRecoveryKeyRequest,
  RegenerateRecoveryKeyResponse
} from "@/types/vault";
import type { RegisterResponse } from "@/types/auth";

export function useUnlockVaultMutation() {
  const queryClient = useQueryClient();

  return useMutation<VaultUnlockResponse, ApiError, VaultUnlockRequest>({
    mutationFn: (payload) => vaultApi.unlockVault(payload),
    onSuccess: (data) => {
      vaultTokenService.setToken(data.vaultToken);
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRegenerateRecoveryKeyMutation() {
  return useMutation<RegenerateRecoveryKeyResponse, ApiError, RegenerateRecoveryKeyRequest>({
    mutationFn: (payload) => vaultApi.regenerateRecoveryKey(payload),
  });
}

export function useRecoverVaultMutation() {
  const queryClient = useQueryClient();
  return useMutation<RegisterResponse, ApiError, VaultRecoverRequest>({
    mutationFn: (payload) => vaultApi.recoverVault(payload),
    onSuccess: () => {
      // Typically user needs to login/unlock again or is logged out.
      vaultTokenService.clearToken();
      queryClient.clear();
    }
  });
}

export function useExportCsvMutation() {
  return useMutation<string, ApiError, void>({
    mutationFn: () => exportApi.exportCsv(),
  });
}
