export interface VaultUnlockRequest {
  masterPassword: string;
}

export interface VaultUnlockResponse {
  vaultToken: string;
}

export interface VaultRecoverRequest {
  recoveryKey: string;
  newMasterPassword: string;
}

export interface RegenerateRecoveryKeyRequest {
  masterPassword: string;
}

export interface RegenerateRecoveryKeyResponse {
  recoveryKey: string;
}
