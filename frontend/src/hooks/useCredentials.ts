import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { credentialApi } from "@/api/credentialApi";
import type { ApiError } from "@/types/api";
import type {
  CredentialDetailResponse,
  CredentialListResponse,
  DeleteCredentialRequest,
  LockStatusResponse,
  RevealCredentialRequest,
  UpdateCredentialRequest,
} from "@/types/credential";

// ── Queries ─────────────────────────────────────────────────────────

export function useCredentials() {
  return useQuery<CredentialListResponse[], ApiError>({
    queryKey: ["credentials"],
    queryFn: () => credentialApi.getAll(),
  });
}

export function useFavorites() {
  return useQuery<CredentialListResponse[], ApiError>({
    queryKey: ["credentials", "favorites"],
    queryFn: () => credentialApi.getFavorites(),
  });
}

export function useSearchCredentials(keyword: string) {
  return useQuery<CredentialListResponse[], ApiError>({
    queryKey: ["credentials", "search", keyword],
    queryFn: () => credentialApi.search(keyword),
    enabled: keyword.length > 0,
  });
}

export function useCredential(id: number) {
  return useQuery<CredentialListResponse, ApiError>({
    queryKey: ["credentials", id],
    queryFn: () => credentialApi.getById(id),
    enabled: !isNaN(id),
  });
}

export function useMasterPasswordLockStatusQuery(enabled: boolean) {
  return useQuery<LockStatusResponse, ApiError>({
    queryKey: ["credentials", "lock-status"],
    queryFn: () => credentialApi.getMasterPasswordLockStatus(),
    enabled,
    refetchOnWindowFocus: false,
  });
}

// ── Mutations ───────────────────────────────────────────────────────

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id) => credentialApi.toggleFavorite(id),
    onSuccess: (_, id) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["credentials", id] });
    },
  });
}

export function useRevealMutation() {
  return useMutation<CredentialDetailResponse, ApiError, { id: number; payload: RevealCredentialRequest }>({
    mutationFn: ({ id, payload }) => credentialApi.reveal(id, payload),
    // The component will use the returned data to update its local state
  });
}

export function useUpdateCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation<CredentialDetailResponse, ApiError, { id: number; payload: UpdateCredentialRequest }>({
    mutationFn: ({ id, payload }) => credentialApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["credentials", id] });
    },
  });
}

export function useDeleteCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: number; payload: DeleteCredentialRequest }>({
    mutationFn: ({ id, payload }) => credentialApi.delete(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
